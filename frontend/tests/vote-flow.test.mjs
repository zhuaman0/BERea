import assert from "node:assert/strict";
import { test } from "node:test";
import { currentSelection, nextVoteRound, voteStatus } from "../src/features/reading/lib/voteRounds.ts";

const opened = "2026-10-15T10:00:00Z";
const closes = "2026-10-15T16:00:00Z";
const now = Date.parse(opened) + 1000;

function round(stage, voted = false) {
  return {
    id: stage,
    stage,
    opens_at: opened,
    closes_at: closes,
    status: "open",
    is_open: true,
    is_tied: false,
    total_votes: voted ? 1 : 0,
    your_vote_option_id: voted ? `${stage}-choice` : null,
    winner_option_id: null,
    options: [],
  };
}

test("simultaneous rounds stay together with language first regardless of API order", () => {
  const language = round("language");
  const genre = round("genre");
  assert.deepEqual(currentSelection([genre, language]), [language, genre]);
});

test("saving language immediately advances the student to genre", () => {
  const language = round("language");
  const genre = round("genre");
  assert.equal(nextVoteRound([language, genre], now).stage, "language");
  language.your_vote_option_id = "language-choice";
  assert.equal(nextVoteRound([language, genre], now).stage, "genre");
  assert.equal(voteStatus(genre, now), "open");
});

test("both choices keep the same deadline even for a late student", () => {
  const selection = [round("language", true), round("genre", true)];
  for (const item of selection) {
    assert.equal(voteStatus(item, Date.parse(closes) - 1), "open");
    assert.equal(voteStatus(item, Date.parse(closes)), "closed");
    assert.equal(item.closes_at, closes);
  }
});

test("new selection starts with language regardless of previous votes", () => {
  const old = [round("language", true), round("genre", true)].map((item) => ({ ...item, opens_at: "2026-09-15T10:00:00Z" }));
  const selection = currentSelection([...old, round("genre"), round("language")]);
  assert.equal(selection.length, 2);
  assert.equal(nextVoteRound(selection, now).stage, "language");
});
