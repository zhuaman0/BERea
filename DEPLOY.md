# Deploying 451° (NATS Spirea)

Production runs on two managed platforms:

| Piece | Where | Free address you get |
|---|---|---|
| Frontend (Next.js) | **Vercel** | `https://<project>.vercel.app` |
| Backend (FastAPI) + Postgres + receipt storage | **Railway** | `https://<service>.up.railway.app` |

The repo already contains the config both platforms read: `railway.json` (root) and
`frontend/vercel.json`. Migrations run automatically every time the backend deploys.

Expected cost: Railway Hobby is $5/month (covers this app's usage). Vercel Hobby is free, but its
terms are for non-commercial projects. Since teams pay an entry fee, plan to move to Vercel Pro
($20/month) or ask Vercel whether a student competition qualifies.

---

## 0. Before you start

- Merge the open PRs you want live into `main`; both platforms deploy from `main`.
- You need a GitHub account with access to `zhuaman0/BERea`. Create the Railway and Vercel
  accounts yourself (sign in with GitHub on both).

## 1. Backend + database on Railway

1. railway.com → **New Project** → **Deploy from GitHub repo** → pick `BERea`.
   Railway reads `railway.json` and builds `docker/Dockerfile.backend` (production stage).
2. In the same project: **+ New** → **Database** → **PostgreSQL**.
3. Open the backend service → **Variables**, add:

   | Variable | Value |
   |---|---|
   | `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (Railway fills it in; the app converts it to asyncpg) |
   | `SECRET_KEY` | a long random string — generate with `openssl rand -hex 32` |
   | `BACKEND_CORS_ORIGINS` | `["https://placeholder.vercel.app"]` for now — replaced in step 3 |
   | `FRONTEND_URL` | same Vercel URL as above (placeholder for now) |
   | `SMTP_HOST` | `smtp.gmail.com` — sends the email verification codes |
   | `SMTP_PORT` | `587` |
   | `SMTP_USER` | the Gmail address that sends the codes |
   | `SMTP_PASSWORD` | a Gmail app password for that address (myaccount.google.com/apppasswords) |
   | `SMTP_FROM` | e.g. `NATS Spirea <that-address@gmail.com>` |

   Without the `SMTP_*` variables nobody can finish registering: codes only go to the server log.

4. Backend service → **Settings** → **Volumes** → **Add volume**, mount path **`/app/uploads`**.
   Payment receipts are saved there; without a volume they disappear on every redeploy.
5. Backend service → **Settings** → **Networking** → **Generate domain**.
   Open `https://<that-domain>/health` — it should return `{"status": "ok"}`.

## 2. Frontend on Vercel

1. vercel.com → **Add New… → Project** → import `BERea`.
2. **Root Directory**: `frontend`. Keep "Include files outside the root directory" **on** (the
   app uses the shared `packages/` folder). Framework is detected as Next.js.
3. **Environment Variables**:

   | Variable | Value |
   |---|---|
   | `NEXT_PUBLIC_API_BASE_URL` | `https://<railway-domain>/api` |
   | `HUSKY` | `0` |

4. **Deploy**. Note the URL Vercel gives you, e.g. `https://berea-451.vercel.app`.

`NEXT_PUBLIC_API_BASE_URL` is baked in at build time — if you change it, redeploy the frontend.

## 3. Connect them

Back in Railway → backend **Variables**:

- `BACKEND_CORS_ORIGINS` = `["https://berea-451.vercel.app"]` (your real Vercel URL, JSON list)
- `FRONTEND_URL` = `https://berea-451.vercel.app`

Railway redeploys automatically. Open the Vercel URL, register a test account, and create a team —
if that works, the two halves are talking.

## 4. Set up the season (one time)

The production database starts empty — none of the local test teams, rounds or quiz scores come
along.

1. **Make yourself admin.** Register on the live site with your real account, then in Railway →
   Postgres → **Data** → **Query**:
   ```sql
   UPDATE reading_users SET is_admin = true WHERE email = 'you@example.com';
   ```
   Sign out and back in; `/reading/admin` now works.
2. **Leave "Season started" off** (Admin → Settings). While it's off, students only see team
   registration, payment, My team and Rules; nothing shows round progress.
3. **Create the four rounds with the real dates.** There's no admin screen for this yet — use the
   API docs at `https://<railway-domain>/docs`: run `POST /api/v1/reading/auth/login` with your admin
   email and password, copy the `access_token` from the response, click **Authorize** and paste it,
   then run `POST /api/v1/reading/semester-rounds` once per round:
   ```json
   { "index": 1, "label": "Round 1", "starts_at": "2026-11-01T00:00:00+05:00", "ends_at": "2026-11-30T23:59:59+05:00" }
   ```
4. Add the books (Admin → Books) and review incoming payment receipts (Admin → Payments).
5. **Kickoff day:** Admin → Settings → turn **Season started** on. Home, Games, Leaderboard and
   Profile unlock for everyone at once.

## 5. After launch

- **Every merge to `main` deploys both apps automatically.** New migrations run on backend start.
- **Backups:** Railway → Postgres → **Backups** — enable scheduled backups before real payments
  start coming in.
- **Logs:** Railway → backend → **Deployments** → *View logs*; Vercel → project → **Logs**.
- **Custom domain later:** add it in Vercel (frontend) and optionally Railway (e.g. `api.` subdomain),
  then update `NEXT_PUBLIC_API_BASE_URL`, `BACKEND_CORS_ORIGINS` and `FRONTEND_URL` and redeploy.
