---
name: ship-pr
description: Take finished work in BERea from working tree to an open pull request the repo's way — correct branch name, conventional commits that pass the Husky hooks, checks green, PR with summary and test plan. Use when the user says "push it", "open a PR", "ship this", "commit and push", or a task is done and verified.
---

# Ship a PR (BERea)

## 1. Branch
- One branch per task, off an up-to-date `main`: `git checkout main && git pull --ff-only && git checkout -b <branch>`.
- Name: `<product>/<type>/<kebab-slug>` — `rd` = 451°/NATS Spirea, `fs` = Furniture Studio,
  no product prefix for repo-wide tooling (`chore/husky-ci`). Types match commit types.
- **Before branching, check open PRs** (`gh pr list`). If an unmerged PR touches the same files,
  branch from *that* branch instead of `main` and say so in the PR body ("stacked on #N").

## 2. Commit
- Stash or commit anything already in the tree before switching branches (`git status` first).
- Split commits where the diff splits naturally: backend (model + migration + schema/service/router)
  in one, frontend in another.
- Message: `<type>(<scope>): <description>` ≤ 72 chars, types `feat|fix|refactor|chore|docs|test|style`.
  The `commit-msg` hook rejects anything else; `pre-commit` runs ESLint (frontend) and ruff (backend)
  on staged files and may auto-fix them.
- End with the `Co-Authored-By` trailer the session specifies. Never `--no-verify`.

## 3. Check before pushing
- `npm run lint`, `npm run typecheck` (also run by the `pre-push` hook),
  `ruff check backend`, `docker exec berea_backend python -c "import app.main"`.
- UI change → **verify-in-browser** skill. Conventions → **cleanup-review** skill.

## 4. Push and open the PR
```bash
git push -u origin <branch>
gh pr create --base main --title "<type>(<scope>): ..." --body "..."
```
Body: `## Summary` (what and why, bullets) and `## Test plan` (checkboxes of what was actually
verified). CI (`.github/workflows/ci.yml`) then runs lint, typecheck, ruff, an import check and a
commit-message check.

## 5. Report
Give the user the PR link, one line on what changed, and anything they must do (merge order for
stacked PRs, re-login, etc.).
