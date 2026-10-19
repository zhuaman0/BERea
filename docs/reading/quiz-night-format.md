# Quiz Night: new game format (spec, not built yet)

Status: **draft for review**. Nothing here is implemented. When the open questions at the end
are answered, this becomes the plan for the build.

## 1. What the real quiz night looks like today (the Keynote deck)

The organisers already run quiz nights from a Keynote deck. The book in the example is *Around
the World in Eighty Days*. One round has 5 questions and runs in two halves: first all the
questions, then all the answers.

### Slide sequence (slides 50–68 of the deck)

| # | Slide | What's on it |
|---|---|---|
| 50 | **Number card "1"** | An orange rounded square with a big white "1", centred on black |
| 51 | **Question 1** | The question in big white text, in an orange rounded frame, with a **30-second countdown dial** in the top-right corner |
| 52 | Number card "1" | Same card again: question 1 is closed |
| 53 | Number card "2" | Next question starts |
| 54 | Question 2 | Same layout and 30 s timer |
| 55–64 | … | The pattern repeats: number → question (30 s) → number, for questions 3, 4 and 5 |
| 65 | **"ANSWERS"** | A wide orange banner saying ANSWERS, with a small timer graphic top-right: the break between the halves |
| 66 | Number card "1" | The answer review starts again from question 1 |
| 67 | Question 1 (again) | The same question, now **without the timer** |
| 68 | **Answer 1** | The correct answer as the title (e.g. "Seventy-nine days"), with **the passage from the book that proves it** underneath and the key phrase **highlighted** |
| … | … | Number → question → answer, for every question |

### What the design does

- **The orange square turns into the question frame.** The number card's orange square and the
  question's orange border are the same shape at two sizes (a Keynote Magic Move). The number
  grows into the frame, the question appears inside it, and it shrinks back into a number when
  time is up. This is the signature animation and the app should copy it.
- **Black background, one orange accent, white bold text.** These are our `reading-design`
  tokens already: `--rd-ink`, `--rd-accent-from`, `--rd-text`.
- **The timer is a ring of tick marks that counts down from 30**, not a progress bar.
- **There are no answer options.** Every question is open-ended ("In how many days…", "What was
  the name of the steamer…", "By what treaty…"), so teams write the answer themselves.
- **The answer slide teaches**: it gives the answer plus the line from the book, so the review
  half doubles as discussion of the book.
- The three dots and blue corner triangles on the thumbnails are Keynote's own indicators
  (builds and transitions), not part of the design.

## 2. How our app's live quiz works today

This is the Kahoot-style mode from PR #17/#18:

| | Current app | Keynote format |
|---|---|---|
| Answers | 4 multiple-choice tiles | **Typed open answer** |
| When answers are shown | After **each** question | **All at the end**, after an "ANSWERS" break |
| Scoring | Automatic: correct + speed bonus (50 % + 50 %) | Correct or not, then points; speed doesn't matter |
| Who answers | Each player separately; team score = sum | **One answer per team** |
| Phases | `lobby → question → reveal → … → finished` | `lobby → (number → question)×N → answers break → (number → question → answer)×N → finished` |
| Explanation | None | Book quote with a highlighted phrase |

Relevant code: `ReadingQuizQuestion` / `ReadingQuizAnswer` / `ReadingQuizSession` /
`ReadingQuizSubmission` in `backend/app/domains/reading/model_reading.py`, and `_live_phase` /
`_visible_scores` in `service_reading.py`. On the frontend, the host screen is
`app/reading/admin/live/[sessionId]/page.tsx` and the player screen is
`app/reading/(dashboard)/quiz/page.tsx`.

## 3. The new format in the app

Requested change: **under each question, teams get a box to type their answer.** That goes on
for every question until the ANSWERS part, where the correct answers are revealed one by one.

### 3.1 Flow

**Part 1: Questions**

For each question *i*:
1. **Number card** (≈3 s, automatic): a big orange "*i*" on everyone's screen.
2. **Question** (30 s): the question shows with the countdown ring. Underneath it, each team
   has **one answer box**.
   - Any team member can type; the team's latest text counts (they're sitting together).
   - The box saves as you type, and the team sees "Saved ✓".
   - Teammates see each other's edits live.
   - When the timer hits 0 the box locks. Nobody sees whether the answer is right.
3. **Number card again** (≈2 s): "time's up" before the next number.

**Break: "ANSWERS"**

4. The ANSWERS banner. The host uses this pause to **mark the answers**; the host has a
   "Start answers" button.

**Part 2: Answers**

For each question *i*:
5. **Number card "*i*"**, then the **question again** (no timer).
6. **Answer card**: the correct answer, the book quote with its highlighted phrase, and
   optionally the chapter or page.
   - Each team also sees **its own answer** with ✓ or ✗ and the points it got.
   - The host screen can show a list of how many teams got it right.
7. After the last answer: **final scores**, which are added to the leaderboard.

The host moves through everything with **Next**. The questions half can also auto-advance on
the timer, as it does now.

### 3.2 Marking open answers

Typed answers can't be marked only by exact match ("79", "79 days", "seventy-nine days"):
1. **Auto-suggest**: each question stores a list of **accepted answers**. The server lowercases
   the team's answer and strips punctuation, articles and extra spaces, then compares it with
   that list. Numbers written as words count too.
   - A match is pre-marked ✓.
   - Anything else is marked **"needs review"**.
2. **Host review** during the ANSWERS break: the host sees every team's answer per question and
   taps ✓ / ✗. A "half point" option is still an open question (Q4 below).
3. Points: a fixed **N points per correct answer** (default 1, set per question). There is no
   speed bonus in this format.

### 3.3 What each screen shows

| Phase | Player (phone) | Host (projector) |
|---|---|---|
| Lobby | "You're in", team name, waiting | PIN, teams that joined, Start |
| Number card | Big number | Big number |
| Question | Question + timer ring + **team answer box** + "Saved ✓" | Question + timer ring + "7 / 12 teams answered" (no answer text) |
| Number (time's up) | "Answer locked" | Big number |
| ANSWERS break | "Waiting for the answers…" | Banner + the **marking panel** (all answers, ✓/✗, auto-suggestions) + "Start answers" |
| Answer | Correct answer + book quote + **your team's answer ✓/✗ and points** | Correct answer + book quote + "8 teams got it" |
| Finished | Team place and points | Final ranking (podium) |

### 3.4 Admin quiz builder

Each question gets a **type** setting:
- **Multiple choice**: today's builder, unchanged.
- **Open answer** (new). For these questions the admin fills in:
  - Question text
  - **Correct answer** (shown on the answer card, e.g. "Seventy-nine days")
  - **Accepted answers** (chips, e.g. `79`, `79 days`, `seventy nine`)
  - **Book quote** (the passage) and the **phrase to highlight** in it
  - Chapter or page (optional)
  - Time limit (default 30 s) and points (default 1)

The whole quiz also gets a **format** setting: "Kahoot (instant reveal)" or **"Quiz night (answers
at the end)"**.

## 4. Technical design (when we build it)

### 4.1 Database (one migration)

- `reading_quizzes.format`: `instant` | `answers_at_end`. Default `instant`, so existing quizzes
  keep working.
- `reading_quiz_questions` gets:
  - `kind`: `choice` | `open`, default `choice`
  - `correct_text`, `accepted_answers` (JSON list), `explanation`, `explanation_highlight` and
    `source_ref`, all nullable
- New table `reading_quiz_team_answers`:
  - Columns: `session_id`, `question_id`, `team_id`, `text`, `last_edited_by`, `updated_at`,
    `grade` (`pending` | `correct` | `wrong`), `points` and `graded_by`.
  - It's unique on `(session_id, question_id, team_id)`, so each team has exactly one answer per
    question.
- The session's `status` gets new values: `number`, `question`, `locked`, `answers_break`,
  `review_number`, `review_question`, `review_answer` and `finished`, plus `current_index` as
  today.

### 4.2 Backend

- **Phases stay server-computed** (as in `_live_phase`), so every screen agrees: a question
  turns into `locked` on its own once its 30 s pass.
- `PUT /quiz-sessions/{id}/team-answer`: save or replace the team's text, only while that
  question is running. The team comes from the user, never from the request body.
- `GET /quiz-sessions/{id}/grading` and `PATCH …/team-answers/{id}`: the host's marking panel.
  Admin only, via `_require_admin`.
- `POST /quiz-sessions/{id}/advance` already exists and gets the new phase order.
- **Nothing leaks early**: until `review_answer` for that question, players never receive
  `correct_text`, the quote, grades or other teams' answers. This follows the `_visible_scores`
  rule we have now.
- Team points go into `ReadingTeam.points` once, when the session finishes, so the leaderboard
  updates.

### 4.3 Frontend

- **Shared pieces:**
  - `QuizNumberCard`: the orange square, with a framer-motion `layoutId` shared with
    `QuizQuestionFrame` to recreate the Magic Move
  - `CountdownRing`: the 30 tick marks
  - `AnswerCard`: the answer plus the book quote with a highlighted `<mark>`
- **Player:** `TeamAnswerBox`, a textarea that auto-saves with a short debounce, shows "Saved ✓"
  and locks at 0 s.
- **Host:**
  - The fullscreen projector view with the phases above
  - `GradingPanel` for the ANSWERS break
- Polling stays at 1 s, which is fast enough for typing sync. WebSockets can come later.
- All text goes through next-intl (EN/RU/KZ); add it to `messages/en.json` and run
  `npm run translate`.
- Design follows `.claude/skills/reading-design`.

### 4.4 Build order (one PR per step)

1. Migration, models and schemas, keeping `instant` quizzes unchanged.
2. Backend phase machine for `answers_at_end`, the team-answer endpoint and marking endpoints,
   with tests.
3. Admin builder: the quiz format setting and the open-answer question fields.
4. Player screen: number card, question, answer box, waiting, answer card.
5. Host screen: projector view and marking panel.
6. Full rehearsal with short timers (5 s) and throwaway QA teams, then clean up.

## 5. Open questions (to decide before building)

1. **One answer per team, or per player?** The proposal is per team, matching the paper format.
2. **Who marks:** the host by hand with auto-suggestions (proposed), or fully automatic?
3. **Points per correct answer:** 1 for every question, or set per question?
4. **Half points** for partly right answers (e.g. "80 days" for 79)?
5. **Show team answers on the projector** during the answers half (fun, but some teams may not
   want that)?
6. **How many questions per round, and how many rounds per night?** The deck shows rounds of 5.
7. **Keep the Kahoot mode** for some nights, or replace it completely?
8. **Timer**: always 30 s, or set per question?
9. **Language**: are the questions and quotes entered in one language, or in EN/RU/KZ separately?
10. Can a team **change its answer** until the timer ends (proposed: yes), or is the first
    answer final?
