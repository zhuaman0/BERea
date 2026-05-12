from __future__ import annotations

import enum


class StudyMethod(str, enum.Enum):
    pomodoro = "pomodoro"
    spaced_repetition = "spaced_repetition"
    active_recall = "active_recall"
    flashcard = "flashcard"
    practice_test = "practice_test"
    reading = "reading"
    youtube = "youtube"


class MaterialType(str, enum.Enum):
    flashcard_deck = "flashcard_deck"
    practice_test = "practice_test"
    youtube_summary = "youtube_summary"
    document = "document"
    note = "note"


class PersonaTone(str, enum.Enum):
    kind = "kind"
    tough = "tough"
    intense = "intense"


class GoalCategory(str, enum.Enum):
    ielts = "ielts"
    university_exam = "university_exam"
    professional_cert = "professional_cert"
    language = "language"
    custom = "custom"
