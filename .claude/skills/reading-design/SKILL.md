---
name: reading-design
description: Design system for the 451° / NATS Spirea reading app — colors, typography, page layout, the shared page hero, cards, buttons and motion. Use whenever you build, restyle or review ANY page or component under frontend/src/app/reading or frontend/src/features/reading (student dashboard, admin panel, auth pages), when the user says a page "looks plain", "doesn't match", "make it like the leaderboard", or asks about colors/fonts/spacing for the reading app. Not for Furniture Studio.
---

# 451° reading app — design system

The leaderboard page (`/reading/leaderboard`) is the reference. Every other page should
look like it belongs to the same product: a dark ink canvas, one warm fire-gradient accent,
big display headings, and quiet bordered panels. If a page you touch still opens with a small
plain `<h1>`, it's out of date: move it onto the shared hero.

## 1. Colors (tokens only)

All colors come from the CSS variables in `frontend/src/app/reading/reading.css`
(scoped to `.reading-theme`). Use them through Tailwind arbitrary values, e.g.
`bg-[var(--rd-panel)]`. Don't hardcode new hex values in components.

| Token | Value | Use for |
|---|---|---|
| `--rd-ink` | `#0b0b0c` | Page background (set by the theme; never repaint it) |
| `--rd-panel` | `#141416` | Cards, panels, the hero |
| `--rd-border` | `#232326` | Borders, dividers, skeletons |
| `--rd-text` | `#f5f3f0` | Headings, primary text |
| `--rd-text-muted` | `#9a9a9e` | Body copy, hints, labels |
| `--rd-accent-from` | `#ff6b2c` | Accent: eyebrows, active borders, icons |
| `--rd-accent-to` | `#ffc24d` | End of the gradient, highlighted numbers |
| `--rd-mate-1..4` | blue/green/pink/violet | Only for telling teammates apart in charts |

Gradient accent:
- Filled: the `rd-accent-gradient` class, with **dark text** on it (`text-black/80` or `text-black/85`), never white.
- Text: `bg-gradient-to-r from-[var(--rd-accent-from)] to-[var(--rd-accent-to)] bg-clip-text text-transparent`.
- Soft tint: `border-[var(--rd-accent-from)]/25 bg-[var(--rd-accent-from)]/[0.08]`.

Status colors: success is `emerald-400` (text) or `emerald-400/10` (background); errors are
`red-400` text on `red-500/10` with a `red-500/30` border. No purple or pink brand colors: the
fire gradient is the only accent.

## 2. Typography

- `font-display` (Space Grotesk): every heading, big number and badge number.
- Body text uses the default IBM Plex Sans. `font-mono` + `tabular-nums` for points, timers and counts.
- **Eyebrow labels** sit above every section title: `text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--rd-accent-from)]`.
- Small stat labels: `text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--rd-text-muted)]`.
- Body copy: `text-sm leading-6 text-[var(--rd-text-muted)]`, capped with `max-w-xl`/`max-w-2xl` so lines stay readable.

## 3. Page layout: full width, same gutters everywhere

- Wrap every page in `READING_PAGE_CONTAINER` (`frontend/src/features/reading/lib/pageContainer.ts`):
  `w-full px-4 py-6 sm:px-8 sm:py-10 lg:px-12`.
- **Don't** center pages in a narrow column (`mx-auto max-w-[…]` on the page wrapper). Pages use
  the full width next to the sidebar, so wide screens don't show empty side bands and all pages
  line up. Only cap the width of *text* (paragraph `max-w-*`), and of focused single-task screens
  like the quiz PIN entry.
- The dashboard `<main>` has `min-w-0` so wide content can't push the page past the viewport.
  Grids and flex children holding long text also need `min-w-0`/`break-words`.
- Vertical rhythm: `mt-8`–`mt-10` between major sections, `mt-4`–`mt-6` inside a section.
- Responsive grids: `grid-cols-1 sm:grid-cols-2 xl:grid-cols-3` (cards) or `sm:grid-cols-3` (steps).
  Check at 375px: nothing may scroll horizontally.

## 4. Shared building blocks

Use these instead of rebuilding them by hand:

| Component | Path | When |
|---|---|---|
| `ReadingPageHero` | `features/reading/components/layout/ReadingPageHero.tsx` | The first thing on **every** page (student and admin) |
| `ReadingSectionHeading` | `features/reading/components/layout/ReadingSectionHeading.tsx` | Eyebrow + title above each section below the hero |

`ReadingPageHero` props: `eyebrow` (short uppercase label), `eyebrowIcon` (a lucide icon),
`title`, optional `accent` (second line in gradient text), `description`, `leading` (avatar etc.),
`aside` (a right column for stats, the main CTA or a countdown) and `footer` (small meta row).

```tsx
<div className={READING_PAGE_CONTAINER}>
  <ReadingPageHero
    eyebrow="Book of the month"
    eyebrowIcon={Vote}
    title="Choose the book"
    accent="you read next."
    description="Choose a language, then a genre…"
    aside={<CountdownPill />}
  />
  <section className="mt-10">
    <ReadingSectionHeading eyebrow="Round 1" title="Language" />
    …
  </section>
</div>
```

Admin pages use `eyebrow="Admin"`, with the page's primary action (e.g. "Add a book") in `aside`.

## 5. Surfaces

- **Card/panel**: `rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-4 sm:p-6`.
- **Feature panel** (hero, podium cards): `rounded-[28px] border border-white/[0.08]` with the
  `rd-hero-glow` + `rd-hero-grid` background layers (see `ReadingPageHero`).
- **Inset inside a panel** (stat tiles, "your team" chip): `rounded-2xl bg-black/20 border border-white/[0.08]`,
  not another `bg-[var(--rd-panel)]` (it would disappear into its parent).
- **Active/selected**: border goes `border-[var(--rd-accent-from)]` (or `/55` on hover).
- **Empty state**: `rounded-2xl border border-dashed border-[var(--rd-border)] p-8 text-sm text-[var(--rd-text-muted)]`.
- **Loading**: a skeleton with `animate-pulse bg-[var(--rd-panel)]` in the final layout's shape, with `role="status"`.

## 6. Buttons and controls

- Primary: `rd-accent-gradient rounded-lg px-4 py-2 text-sm font-semibold text-black/85 hover:opacity-90`.
- Secondary: `rounded-lg border border-[var(--rd-border)] px-4 py-2 text-sm font-semibold text-[var(--rd-text)] hover:border-[var(--rd-accent-from)]/55`.
- Destructive: secondary, plus `hover:border-red-400 hover:text-red-400`.
- Pills (countdown, status): `rounded-full px-4 py-2`, gradient for live, tinted for neutral.
- Inputs: `h-11 rounded-xl border border-[var(--rd-border)] bg-[var(--rd-panel)] px-4 focus-within:border-[var(--rd-accent-from)]`.
- Every interactive element gets a visible focus ring: `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rd-accent-from)]`.

## 7. Motion

- framer-motion, wrapped in `<MotionConfig reducedMotion="user">` on animated pages; CSS keyframes need a `prefers-reduced-motion` override in `reading.css`.
- Entrances: `initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}`, ease `[0.16, 1, 0.3, 1]`, 0.4–0.6s, stagger lists by about 0.05s.
- Hover lift on clickable cards: `hover:-translate-y-0.5` + an accent border. Keep it subtle; no bouncing.
- The book theme carries the identity (book covers, bookshelf semester map, ember/flame details). Don't use generic sports or "chapter" metaphors.

## 8. Project rules this design must still follow

- Tailwind utilities only, no `style={{…}}`. If you need a complex background, add an `.rd-*` class to `reading.css`.
- Write class strings out in full (no `"bg-" + color` concatenation), or Tailwind won't generate them.
- User-facing text on i18n'd pages goes through next-intl (`messages/{en,ru,kk}.json`), with all three locales updated together.

## Checklist before calling a page done

1. Does it open with `ReadingPageHero` inside `READING_PAGE_CONTAINER`?
2. Are only `--rd-*` tokens and the fire gradient used, with dark text on gradient fills?
3. Do section titles have orange eyebrows?
4. Is there no horizontal scroll at 375px, and does it fill the width at 1440px+ without a narrow centered column?
5. Do loading, empty and error states use the surfaces above?
6. Verify it in the browser (`verify-in-browser` skill).
