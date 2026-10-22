#!/usr/bin/env bash
# Creates two LOCAL development accounts for the 451° reading app (localhost only, never production):
#   - an admin, for /reading/admin
#   - a tester in a team, who sees every student section even before the season starts
# Safe to re-run: existing accounts are left alone and only re-promoted / re-joined.
set -euo pipefail

API="${API:-http://localhost/api/v1/reading}"

ADMIN_NAME="Dev Admin"
ADMIN_EMAIL="admin@nats-spirea.dev"
ADMIN_PASSWORD="admin451dev"

STUDENT_NAME="Dev Student"
STUDENT_EMAIL="student@nats-spirea.dev"
STUDENT_PASSWORD="student451dev"
STUDENT_TEAM="Dev Readers"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

register_or_login() {
  local name="$1" email="$2" password="$3"
  curl -s -X POST "$API/auth/register" -H "Content-Type: application/json" \
    -d "{\"full_name\":\"$name\",\"email\":\"$email\",\"password\":\"$password\"}" >/dev/null
  # The backend can still be warming up right after `docker compose up`, so retry the login briefly.
  for _ in 1 2 3 4 5; do
    local token
    token="$(curl -s -X POST "$API/auth/login" -H "Content-Type: application/json" \
      -d "{\"email\":\"$email\",\"password\":\"$password\"}" \
      | python3 -c "import sys, json; print(json.load(sys.stdin).get('access_token', ''))" 2>/dev/null || true)"
    if [ -n "$token" ]; then echo "$token"; return 0; fi
    sleep 3
  done
  echo "ERROR: could not sign in as $email" >&2
  return 1
}

echo "→ Admin account"
register_or_login "$ADMIN_NAME" "$ADMIN_EMAIL" "$ADMIN_PASSWORD" >/dev/null
docker compose exec -T db psql -U berea -d berea_db -qc \
  "UPDATE reading_users SET is_admin = true WHERE email = '$ADMIN_EMAIL';"

echo "→ Tester account"
STUDENT_TOKEN="$(register_or_login "$STUDENT_NAME" "$STUDENT_EMAIL" "$STUDENT_PASSWORD")"
curl -s -X POST "$API/teams" -H "Authorization: Bearer $STUDENT_TOKEN" -H "Content-Type: application/json" \
  -d "{\"team_name\":\"$STUDENT_TEAM\"}" >/dev/null
docker compose exec -T db psql -U berea -d berea_db -qc \
  "UPDATE reading_users SET is_tester = true WHERE email = '$STUDENT_EMAIL';"

echo "✓ Done. Sign in at http://localhost/reading/login with the emails and passwords at the top of this script."
