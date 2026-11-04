# BERea frontend

Next.js app for both products in this repo: **Furniture Studio** and **451° / NATS Spirea**. Full-stack
setup (Docker, database, Nginx) is in the [root README](../README.md); project conventions are in
[CLAUDE.md](../CLAUDE.md).

## Running

```bash
npm run dev          # dev server on http://localhost:3003
```

Use `http://localhost` (through Nginx) for normal work — that is where `/api` requests reach the backend.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` / `npm run start` | Dev / production server on port 3003 |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` (also runs on `git push`) |
| `npm test` | Node test runner over `tests/*.test.mjs` |
| `npm run i18n:check` | List message keys missing from `ru` / `kk` |
| `npm run translate` | Machine-translate missing keys from `en` with DeepL (needs `DEEPL_API_KEY`) |

## Layout

```
src/app/            routes — (app), (admin), (auth), furniture/ (Furniture Studio), reading/ (451°)
src/features/       per-domain API clients, components and stores
src/shared/         shared components, hooks and lib helpers
src/i18n/           next-intl setup
messages/           en.json (source), ru.json, kk.json
```
