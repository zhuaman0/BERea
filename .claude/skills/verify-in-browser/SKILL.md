---
name: verify-in-browser
description: Verify a 451°/NATS Spirea reading-app UI change in a real browser with a throwaway account, then clean up. Use after any frontend change to /reading pages before calling it done, when the user asks to "check it", "test it in the browser", "take a screenshot", or when a page looks broken. Covers this app's auth quirk (tokens live in per-tab sessionStorage) and the cleanup rules that protect real accounts.
---

# Verify in browser (reading app)

Type-check and lint prove the code compiles, not that the page works. Look at it.

## 1. Seed a throwaway account (curl, through nginx)

```bash
R=$(curl -s -X POST http://localhost/api/v1/reading/auth/register -H "Content-Type: application/json" \
  -d '{"full_name":"Aruzhan Tulegenova","email":"qa-aruzhan-verify@gmail.com","password":"testpass123"}')
T=$(echo "$R" | python3 -c "import sys,json;print(json.load(sys.stdin)['access_token'])")
curl -s -X POST http://localhost/api/v1/reading/teams/join -H "Authorization: Bearer $T" \
  -H "Content-Type: application/json" -d '{"team_name":"QA Night Owls"}'
```
- Emails **must** match `qa-*-verify@gmail.com` (cleanup relies on it; `@example.*` is rejected).
- Team names **must** start with `QA `.
- Add teammates with `POST /teams/members`; fake streak/check-in states with
  `docker exec berea_db psql -U berea -d berea_db -c "UPDATE reading_users SET current_streak=4, last_active_date=CURRENT_DATE-1 WHERE email='...';"`

## 2. Sign the browser in

Tokens live in **sessionStorage, which is per tab**. Open the tab first, then inject into *that* tab:

```js
sessionStorage.setItem("nats-auth", JSON.stringify({ state: {
  user: { id, email, full_name, team_name, token_balance: 0, current_streak: 0, created_at },
  accessToken, refreshToken, isAuthenticated: true }, version: 0 }));
document.cookie = "nats-session=1; path=/; SameSite=Lax";
```
- `user.id` must be the real id (from `GET /users/me`) or "you"-specific UI won't render.
- Include a real `refreshToken` — without one the client redirects to login.
- A new tab has empty sessionStorage → you'll land on login. That's expected, not a bug.

## 3. Check
- Screenshot at desktop (1440) and phone (390) widths. `<main>` scrolls internally, so full-page
  screenshots stop at the viewport — scroll `document.querySelector("main")` instead.
- Read console errors/warnings (hydration mismatches show up here).
- Exercise the change (open the modal, submit the form, confirm the data persisted via curl/psql).

## 4. Clean up — every time

```bash
docker exec berea_db psql -U berea -d berea_db -c "
DELETE FROM reading_refresh_tokens WHERE user_id IN (SELECT id FROM reading_users WHERE email LIKE 'qa-%-verify@gmail.com');
DELETE FROM reading_users WHERE email LIKE 'qa-%-verify@gmail.com';
DELETE FROM reading_teams WHERE name LIKE 'QA %';"
```
**Never delete anything that doesn't match those patterns** — the dev DB contains the owner's real
account and team. Run a `SELECT` first if unsure.
