---
name: cleanup-review
description: Check a git diff against THIS repo's specific CLAUDE.md conventions before opening a PR — strict typing (no `any`, full Python type hints), Pydantic v2 at API boundaries, SQLAlchemy 2.x mapped-column style, thin routers (logic in service_<domain>.py / repo_<domain>.py), the router_/schema_/model_/service_/repo_<domain>.py and <domain>Api.ts naming conventions, no dead code left from the task, Tailwind-only styling (no inline styles), named component exports, react-hook-form+zod forms. This is narrower than and complementary to the built-in /code-review and /simplify skills — run this IN ADDITION to those, never instead of them. Use whenever the user asks to "clean up before a PR", "check conventions", "run cleanup-review", mentions BERea's CLAUDE.md compliance, or as the last step of this repo's pre-PR checklist (see CLAUDE.md's Git Workflow section).
---

# Cleanup Review

A narrow, repo-specific convention check for BERea (the furniture-studio + "451°" reading-league
monorepo). It exists because `/code-review` and `/simplify` are general-purpose — they won't know
that this repo wants `router_<domain>.py` instead of `<domain>_router.py`, or that this codebase
specifically bans raw dicts at API boundaries. This skill knows the repo's own rules; it does not
re-hunt for generic bugs or generic simplification opportunities.

## Scope: what to diff

Default to the current branch vs `main`:

```
git diff main...HEAD --name-only
```

If the user gives an argument (a branch name, a PR number, or a path), review that instead:
- A branch name or `main...<branch>` → diff against that ref.
- A PR number → `gh pr diff <number>` to get the diff, `gh pr view <number> --json files` for the file list.
- A path → just review that file or directory as-is (no diffing), useful for "check this file against our conventions."

Only look at files actually touched by the diff — this is a pre-PR check on what changed, not a
repo-wide audit. If the diff is empty (already on `main`, or no changes), say so and stop.

## What to check

Read each changed file and check only the items below. Skip anything not on this list — that's
`/code-review` and `/simplify`'s job, and duplicating them just adds noise when someone runs all
three before a PR.

### TypeScript / React (changed `.ts` / `.tsx` files)
1. **No `any`** — explicit `: any`, untyped `as any`, or a function/variable whose inferred type
   collapsed to `any` because a narrower type was skipped. If a type is genuinely unknown, it
   should be modeled (a union, a generic, `unknown` + a narrowing check) — not escaped.
2. **API calls only in `src/features/<domain>/api.ts`** — a component or page calling `fetch(...)`
   or a bare API client directly, instead of going through its domain's `*Api.ts`.
3. **Naming**: components as `<Name>.tsx` with the component itself as a **named export** (default
   exports are reserved for `page.tsx` route files); zustand stores as `use<Name>Store.ts`; API
   clients as `<domain>Api.ts`.
4. **No inline styles** — a `style={{ ... }}` prop where a Tailwind utility class would do. (An
   inline `style` is fine when the value is genuinely dynamic/computed, e.g. a progress-bar width
   or a hex color from data — flag it only when it's hardcoding something Tailwind already covers.)
5. **Forms**: a new form built with raw `useState` per field instead of `react-hook-form` + `zod`,
   or an input whose value isn't wired through the form state (uncontrolled).
6. **Props interfaces** declared above the component that uses them, not in a separate types file
   (unless the type is genuinely shared across multiple components).

### Python / FastAPI (changed `.py` files)
7. **`from __future__ import annotations`** present at the top of every changed `.py` file.
8. **Full type hints** on every changed function signature, including the return type — no bare
   `def foo(x):`.
9. **Pydantic v2 at every API boundary** — a router or service function that accepts or returns a
   raw `dict` instead of a typed Pydantic model; a response that returns a bare SQLAlchemy ORM
   object instead of a Pydantic response model.
10. **SQLAlchemy 2.x style only** — flag any legacy `Column(...)` usage; it must be
    `Mapped[T]` + `mapped_column()`.
11. **Thin routers** — business logic (branching, validation beyond basic shape, orchestrating
    multiple calls) written inline in a `router_<domain>.py` instead of delegated to
    `service_<domain>.py`; direct DB queries (`select(...)`, `db.execute(...)`) in a router or
    service instead of living in `repo_<domain>.py`.
12. **Naming**: `router_<domain>.py`, `schema_<domain>.py`, `model_<domain>.py`,
    `service_<domain>.py`, `repo_<domain>.py` — a new backend file that does one of these jobs but
    doesn't follow the pattern.
13. **No direct `os.environ`** — config must go through the `pydantic-settings` `Settings` class.

### Both languages
14. **No dead code left from this task** — an import, export, helper, or whole file that the diff
    made unreachable (e.g. a component swapped out but its old version left in the tree, a type
    that nothing references anymore after a refactor). This is about debris from *this* change,
    not a general dead-code sweep of the whole repo.
15. **No placeholder TODOs** unless they reference a GitHub issue number.

## Report format

Keep it short — a senior engineer skimming this before pushing, not a wall of text. Group by
file, cite `file:line`, and give a one-line fix for each. If a changed file has no issues, don't
mention it.

```markdown
## Cleanup review — <N> issue(s)

### backend/app/domains/reading/router_reading.py
- **L42** — inline DB query (`select(...)`) in the router; move it into `repo_reading.py` and call
  that from here instead.

### frontend/src/features/reading/components/VoteCard.tsx
- **L8** — `options: any[]` — type it as `VoteOptionResult[]` (already defined in `types.ts`).
- **L31** — inline `style={{ color: "#ff6b2c" }}` — use the existing `text-[var(--rd-accent-from)]`
  utility instead.

No other issues found in the remaining N changed files.
```

If nothing is found at all:

```markdown
## Cleanup review

No convention issues found in the N changed file(s). Clear to run /code-review and /simplify
(if not already done) and open the PR.
```

Don't flag something that's merely *pre-existing* in a file the diff only touches incidentally —
scope findings to lines the diff actually introduced or changed, same convention `/code-review`
already follows.
