# Quiz Night: new game format (spec)

Status: **built** (backend `service_quiz_night.py`, frontend `components/quizNight/`). Section 6
lists the defaults used where a rule wasn't decided yet; change any of them and the build follows.

This copies the Keynote deck the organisers use today and turns it into a live, multi-screen
game in the app. One device acts as the **host / projector**; every team plays on its phones.

---

## 1. The real quiz night (Keynote deck), slide by slide

The example deck is for *Around the World in Eighty Days*.

### 1.1 Structure of the night

```
Round board ──► Round card ──► Join QR ──► Round board
     │
     └─► 5 × [ number ─► question (30 s) ─► number ]
             └─► "ANSWERS"
                   └─► 5 × [ number ─► question ─► answer ─► number ]
                         └─► Round board (this round now "done") ──► next round …
```

A night has **4 rounds** (I–IV) of **5 questions**. Each round runs questions first, then all of
its answers, then goes back to the board.

### 1.2 Slides seen in the deck

| Slides | Slide | What's on it |
|---|---|---|
| 86 | **Round board** | A 4 × 6 grid: a wide "Round I…IV" pill and five numbered tiles per row. Rounds not yet played are **filled** with their colour; finished rounds are **outlined** (black inside, coloured border). Here Round I is outlined. |
| 87–88 | Round board | Round II has turned outlined too. The board is repeated, so Keynote can animate from it. |
| 89 | **Round card** | The "Round III" pill alone, grown into a big centred rounded square in the round's colour |
| 90 | **QR code** | A QR code inside a white card with a coral border, used to join and answer |
| 91 | Round board | Shown again just before the round starts |
| 92 | **Number card "1"** | Round III's number cards are **coral**, the round's colour, not orange |
| 93 | **Question** | The question in a frame with a 30 s countdown dial |
| 94 | Number card "1" | Closes question 1 |
| … | … | Same as Round II below |
| 50–64 | Round II questions | Number → question (30 s) → number, × 5. Round II's colour is **orange**. |
| 65 | **"ANSWERS"** | A wide orange banner, with a small countdown graphic top-right |
| 66–85 | Round II answers | Number → question again (no timer) → **answer card** → number, × 5. Answers seen: "Seventy-nine days", "Allahabad", "By the Treaty of Nankin" |

### 1.3 Visual language

- **Round colours**, sampled from the deck:

  | Round | Colour | Token to add |
  |---|---|---|
  | I | Amber `#E8A23B` | `--rd-round-1` |
  | II | Orange `#E07F42` | `--rd-round-2` |
  | III | Coral `#DC6150` | `--rd-round-3` |
  | IV | Indigo `#4A4A82` | `--rd-round-4` |

  Every number card, frame border and banner in a round uses that round's colour.
- **Black background, white bold sans-serif text, rounded corners** (~16 px on tiles, ~28 px
  on frames). It matches `reading-design`, plus the four round colours.
- **Filled means "to play", outlined means "done"** on the round board.
- **Answer = a clipping from the book**: a white box with black **serif** text, the book's
  italics kept, and the answering words marked with a **yellow highlighter** (`#FFE15A`).
- **No answer options**: every question is open-ended; teams write their own answer.
- The three dots and blue corner triangles on thumbnails are Keynote's own indicators, not
  design.

---

## 2. How the app works today (and what changes)

| | Current live quiz (Kahoot-style) | New quiz night |
|---|---|---|
| Structure | One flat list of questions | **4 rounds × 5 questions**, with a round board |
| Answers | 4 multiple-choice tiles | **Typed open answer, one per team** |
| Reveal | After each question | **After each round**, in an "ANSWERS" section |
| Scoring | Automatic, with a speed bonus | ✓/✗ per answer: auto-suggested, host confirms; no speed bonus |
| Explanation | None | Book quote with a highlight |

The Kahoot mode stays: a quiz picks its **format**.

Code today:
- Models: `ReadingQuiz`, `ReadingQuizQuestion`, `ReadingQuizAnswer`, `ReadingQuizSession` and
  `ReadingQuizSubmission` in `backend/app/domains/reading/model_reading.py`.
- Phase logic: `_live_phase` and `_visible_scores` in `service_reading.py`.
- Screens: the host is `app/reading/admin/live/[sessionId]/page.tsx`; the player is
  `app/reading/(dashboard)/quiz/page.tsx`.

---

## 3. The game in the app

### 3.1 Phases (server-computed; every screen shows the same one)

| Phase | Host / projector | Player phone | Advances |
|---|---|---|---|
| `lobby` | Title, **join QR + PIN**, teams joined | "You're in · {team}" | Host: Start |
| `board` | **Round board** (done rounds outlined, the next one pulsing) | Mini board + "Round {n} is next" | Host: Next |
| `round_intro` | **Round card** ("Round III", big square in its colour) | Same card | Auto after 3 s |
| `number` | **Number card** *i* | Same | Auto after 3 s |
| `question` | Question + **countdown ring** + "7/12 teams answered" | Question + ring + **team answer box** | Auto at 0 s |
| `locked` | Number card *i* again | "Answer locked ✓" | Auto after 2 s → next `number`, or `answers_intro` after question 5 |
| `answers_intro` | **"ANSWERS" banner** + a hidden **marking panel** on the host device | "Answers coming up…" | Host: Start answers |
| `review_number` | Number card *i* | Same | Auto after 2 s |
| `review_question` | Question (no timer) | Same | Host: Next |
| `review_answer` | **Answer card**: answer title + book clipping + "8 teams got it" | Answer card + **your team's answer ✓/✗ and points** | Host: Next |
| `review_close` | Number card *i* | Same | Auto after 1.5 s → next `review_number`, or `board` |
| `finished` | **Final podium** | Team place and points | n/a |

The host can always press **Next** to skip an auto-advance. Pausing a running timer isn't built
yet.

### 3.2 Team answers

- **One answer per team per question.** Any member can type, and the latest text counts. A save
  that arrives up to 1.5 s after the timer hits 0 still counts, so the last debounced keystrokes
  of a slow phone aren't lost.
  - It saves 400 ms after the last keystroke.
  - The box shows "Saved ✓", and teammates see the latest text within about a second.
- The box locks when the timer reaches 0. The server ignores later writes.
- Players see nothing about correctness until that question's `review_answer`.

### 3.3 Marking

- Each question has a list of **accepted answers**.
- When the box locks, the server normalises the team's text and compares it with that list:
  lowercase, strip punctuation, articles ("the", "a", "an") and extra spaces, and turn number
  words into digits ("seventy-nine" → "79").
  - A match means `correct`; anything else means `needs_review`.
- During `answers_intro`, the host's **marking panel** lists every team answer for each of the 5
  questions, with ✓ / ✗ buttons (auto-matches are pre-ticked). The host fixes what's wrong, then
  presses Start answers.
- A correct answer earns the question's **points** (default 1). Round and night totals go to the
  team; at `finished`, the night total is added to `ReadingTeam.points` (the leaderboard).

### 3.4 Admin builder

The quiz gets a **format** setting: `Kahoot` or `Quiz night (4 rounds)`. In quiz-night format
the builder shows **4 round sections × 5 question slots**, and each question has:
- Question text
- **Correct answer** (the answer card's title)
- **Accepted answers** (chips)
- **Book quote**, with `*italic*` and `==highlight==` markup. A live preview shows the
  clipping exactly as the projector will.
- **Chapter or page** (optional)
- Time limit (30 s) and points (1)

---

## 4. Animations: every one, and how to build it

All of them use **framer-motion** (already in the app).
- Shared easing is `EASE = [0.16, 1, 0.3, 1]`, the same as the rest of the app.
- Springs use `{ type: "spring", stiffness: 260, damping: 28 }`.
- Wrap the game screens in `<MotionConfig reducedMotion="user">`. With reduced motion, every
  movement below becomes a 200 ms crossfade.

The Keynote deck uses **Magic Move** (one shape morphing into the next slide's shape). In React
the same effect is a **shared `layoutId`**: two components in different phases carry the same
`layoutId`, and framer-motion animates position, size and corner radius between them. That's
why these pieces must render inside **one `<LayoutGroup>`** on a stage that stays mounted, with
`<AnimatePresence mode="popLayout">` swapping the phase contents.

| # | Animation | Where | How |
|---|---|---|---|
| A1 | **Board tiles appear** | `board` | The grid fades in, rows stagger by 0.08 s and tiles within a row by 0.04 s. Each tile goes `initial={{opacity:0, scale:0.85}}` → `animate={{opacity:1, scale:1}}`, 0.35 s. |
| A2 | **Round turns done** (filled → outlined) | `board`, after a round's answers | The just-finished row animates `backgroundColor` from the round colour to `transparent`; its border stays. Tiles stagger left to right by 0.06 s, 0.4 s each. Text stays white. |
| A3 | **Next round pulses** | `board` | The next round's pill gets a soft glow pulse: a `box-shadow` keyframe in `reading.css` (`rd-round-pulse`, 1.8 s, infinite). Off with reduced motion. |
| A4 | **Pill → round card** (Magic Move) | `board` → `round_intro` | The board's round pill and the big round card share `layoutId={"round-" + n}`. The pill grows into the centred square (spring) while the other board tiles fade out (`exit={{opacity:0}}`, 0.25 s). The label text scales with it: render the text inside the morphing element and use `layout="position"` on the text so it doesn't stretch. |
| A5 | **Round card → number 1** | `round_intro` → `number` | The card shrinks (scale 1 → 0.6, fade out, 0.3 s), then number card 1 springs in from scale 0.6. |
| A6 | **Number card enters** | `number` | `initial={{scale:0.6, opacity:0}}` → `animate={{scale:1, opacity:1}}` with the spring. The digit counts in with a small y-slide (12 px → 0, 0.3 s, 0.1 s delay). |
| A7 | **Number → question frame** (the signature Magic Move) | `number` → `question` | The number card's square and the question's frame share `layoutId={"q-" + round + "-" + i}`. The square (filled, ~380 px) **grows to the full frame** (~90 % width, 16:9) while its fill fades out and a 14 px border in the round colour fades in. Do it with two layered elements inside the shared box: a fill layer animating `opacity: 1 → 0` and a border layer animating `0 → 1`, both 0.45 s. The digit fades out in the first 0.15 s. The question text fades up afterwards (`delay: 0.35`, y 16 → 0). |
| A8 | **Countdown ring** | `question` | An SVG ring of **60 ticks** around the seconds number. Each tick is a `<line>` rotated `i × 6°`. Ticks are lit (white) for the remaining fraction, so one tick goes dim every half-second. Time comes from the server's `time_left_ms` and is re-synced on every poll; between polls, `requestAnimationFrame` interpolates so it never jumps. In the **last 5 s** the number and the lit ticks turn the round colour and the number pulses (scale 1 → 1.12 → 1, 0.5 s per second). |
| A9 | **Answer box** | `question` (player) | It slides up under the question (y 24 → 0, 0.35 s, delay 0.45 s). "Saved ✓" fades in for 1.2 s after each save. When it locks: the border animates to `--rd-border`, the text dims to 60 %, a lock icon pops in (scale 0 → 1 spring) and the box does one small shake (x `[0,-4,4,-2,2,0]`, 0.35 s). |
| A10 | **Question → number** (reverse Magic Move) | `question` → `locked` / `review_close` | The same `layoutId` played backwards: the frame shrinks into the filled square and the fill fades back in. |
| A11 | **"ANSWERS" banner** | `locked` (Q5) → `answers_intro` | Number card 5 and the banner share `layoutId={"q-" + round + "-5"}`, so the square **stretches sideways** into the wide banner. The word "ANSWERS" types in letter by letter (stagger 0.04 s, each letter y 20 → 0 plus opacity). |
| A12 | **Answer card reveal** | `review_question` → `review_answer` | The frame stays (same `layoutId`) and the question text crossfades out (0.2 s). The **answer title** springs in (scale 0.9 → 1, opacity). The **book clipping** slides up (y 30 → 0, 0.45 s, delay 0.25 s) with a slight paper tilt settling (rotate −1° → 0°). |
| A13 | **Highlighter sweep** | `review_answer` | The highlighted phrase is a `<mark>` with `background-image: linear-gradient(#FFE15A, #FFE15A)`, `background-repeat: no-repeat` and `background-size` animated from `0% 100%` to `100% 100%` (0.6 s, delay 0.7 s), so it looks hand-highlighted left to right. Pure CSS (`rd-highlight-sweep` in `reading.css`), triggered by a `data-revealed` attribute. |
| A14 | **Your team's result** | `review_answer` (player) | A ✓ (emerald) or ✗ (red) badge pops (scale 0 → 1.15 → 1, 0.4 s) after the highlight finishes (delay 1.2 s). "+1" floats up and fades (y 0 → −24, 0.8 s) on correct answers. The host shows "8 teams got it" counting up from 0 (the existing `AnimatedNumber`). |
| A15 | **Final podium** | `finished` | Reuse `LeaderboardPodium` motion: podium blocks rise from below (y 60 → 0, staggered 3rd → 2nd → 1st, 0.15 s apart), then a burst of ember particles behind 1st place (reuse `.rd-ember` from `reading.css`). |
| A16 | **Phase change safety** | everywhere | Polling can skip a phase (e.g. a slow phone misses `locked`). Every component must animate from **whatever is on screen** to the new phase. Shared `layoutId`s and `AnimatePresence` handle this, so don't chain animations with timeouts. |

### 4.1 Component map

```
features/reading/components/quizNight/
  QuizNightStage.tsx       LayoutGroup + AnimatePresence; picks the phase view
  RoundBoard.tsx           A1–A3; pills and tiles carry layoutIds
  RoundCard.tsx            A4–A5
  NumberCard.tsx           A6, A7/A10 (shared layoutId), A11
  QuestionFrame.tsx        A7, A10, A12 (fill + border layers)
  CountdownRing.tsx        A8
  TeamAnswerBox.tsx        A9
  AnswersBanner.tsx        A11
  AnswerCard.tsx           A12
  BookExcerpt.tsx          A13 (parses *italic* and ==highlight== safely, no HTML injection)
  TeamResultBadge.tsx      A14
  MarkingPanel.tsx         host-only grading list
  roundTheme.ts            round → colour class strings (full literals for Tailwind)
```

The host page and the player page both render `QuizNightStage`; a `role` prop adds the
host-only and player-only parts.

---

## 5. Technical design

### 5.1 Database (one migration)

- `reading_quizzes.format`: `instant` | `rounds`. Default `instant`, so existing quizzes are
  unchanged.
- `reading_quiz_questions` gains:
  - `round_number`: 1–4, nullable for `instant` quizzes
  - `kind`: `choice` | `open`, default `choice`
  - `correct_text`, `accepted_answers` (JSON), `quote`, `source_ref`: nullable
- `reading_quiz_sessions` gains `phase_started_at`, plus `round_number` and `question_number`
  (the existing `current_index` is kept for `instant`).
- New table `reading_quiz_team_answers`:
  - Columns: `id`, `session_id`, `question_id`, `team_id`, `text`, `last_edited_by`,
    `updated_at`, `grade` (`pending` | `correct` | `wrong`) and `points`.
  - Unique on `(session_id, question_id, team_id)`.

### 5.2 Backend

- **A phase machine** in `service_reading.py`. Timed phases (`round_intro`, `number`,
  `question`, `locked`, `review_number`, `review_close`) turn over on their own from
  `phase_started_at` and their duration, computed on read just as `_live_phase` does today.
  Host-gated phases wait for `POST …/advance`.
- New endpoints:
  - `PUT /quiz-sessions/{id}/team-answer` saves the team's text. It's only accepted during
    `question` for the current question, and the team comes from the user.
  - `GET /quiz-sessions/{id}/marking` (admin) lists the round's answers with auto grades.
  - `PATCH /quiz-sessions/{id}/team-answers/{answer_id}` (admin) sets the ✓ / ✗ grade.
- **Nothing leaks early**: until a question reaches `review_answer`, players get no
  `correct_text`, `quote`, grades or other teams' answers.
- When the session reaches `finished`, team totals are added to `ReadingTeam.points` exactly
  once.
- pytest covers the phase timing, the answer lock, normalised matching, the no-leak rule and
  one-time scoring.

### 5.3 Frontend

- Player and host keep 1 s polling (`usePolling`).
- All text is in `messages/en.json` under `reading.quizNight`, with RU/KZ filled in
  (`npm run translate` for later edits).
- The round colours become tokens in `reading.css`, documented in the `reading-design` skill.

### 5.4 Build order

1. Migration, models, schemas and the phase machine, with tests.
2. Team answers, marking and scoring endpoints, with tests.
3. Admin builder: format, rounds and open-answer fields, with the book-clipping preview.
4. `QuizNightStage` and all animations A1–A16.
5. Host and player pages wired up.
6. Full rehearsal with 5 s timers, two QA teams and the browser, then clean up.

---

## 6. Defaults used (change any of them and the build follows)

| Question | Default |
|---|---|
| Answer per team or per player? | **Per team** |
| Who marks? | **Auto-suggest, host confirms** |
| Points per correct answer | **1**, editable per question |
| Half points? | **No** (✓ or ✗) |
| Show team answers on the projector? | **No**, only "N teams got it" |
| Rounds × questions | **4 × 5**, but the builder allows any count from 1 to 6 for both |
| Keep the Kahoot mode? | **Yes**, chosen per quiz |
| Timer | **30 s**, editable per question |
| Question language | **One language per quiz**, entered by the admin |
| Change an answer before time's up? | **Yes**, the last save counts |
