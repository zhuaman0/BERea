"use client";

import { useState } from "react";
import { X, ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";

// ─── Data ─────────────────────────────────────────────────────────────────────

interface StudyMethod {
  id:               string;
  icon:             string;
  title:            string;
  tag:              string;
  shortDescription: string;
  fullDescription:  string;
  steps:            string[];
  bereaIntegration: string;
}

const METHODS: StudyMethod[] = [
  {
    id:   "pomodoro",
    icon: "🍅",
    title: "Pomodoro Technique",
    tag:  "Focus",
    shortDescription: "Work in focused 25-minute bursts separated by short breaks to beat procrastination and sustain energy.",
    fullDescription:
      "The Pomodoro Technique, developed by Francesco Cirillo in the late 1980s, uses a timer to break work into focused intervals — traditionally 25 minutes — separated by short rests. The core idea is that frequent breaks improve mental agility and prevent the burnout that comes from marathon study sessions. By treating each interval as a contained commitment, you eliminate the anxiety of an open-ended task.",
    steps: [
      "Choose a single task you want to work on.",
      "Set a timer for 25 minutes and work with full focus — no distractions.",
      "When the timer rings, take a 5-minute break. Stand, stretch, breathe.",
      "Every 4 Pomodoros, take a longer 15–30 minute break to recharge.",
      "Track how many Pomodoros a task takes to build better time estimates.",
    ],
    bereaIntegration:
      "BERea's built-in Pomodoro timer handles all the counting for you. Start a session, pick your block length, and the app auto-schedules your breaks, logs each interval, and feeds your focus score.",
  },
  {
    id:   "feynman",
    icon: "🧠",
    title: "Feynman Technique",
    tag:  "Deep Understanding",
    shortDescription: "Explain any concept in plain language as if teaching a child — gaps in your explanation reveal gaps in your knowledge.",
    fullDescription:
      "Named after Nobel-winning physicist Richard Feynman, this technique exploits a powerful truth: you only truly understand something when you can explain it simply. By forcing yourself to articulate ideas without jargon, you surface the exact points where your understanding is fuzzy. Those gaps become your study targets, making revision laser-focused rather than scattered.",
    steps: [
      "Write the concept name at the top of a blank page.",
      "Explain it in your own words as if teaching a 12-year-old — simple, clear, no textbook language.",
      "Identify the parts where you hesitated, got vague, or used jargon you can't define.",
      "Go back to your source material and study only those gaps.",
      "Rewrite your explanation, even simpler. Repeat until no gaps remain.",
    ],
    bereaIntegration:
      "Use BERea's AI Persona as your 'student'. Type your explanation and the persona will ask clarifying questions, highlight weak spots, and confirm when your understanding is solid — all without judgement.",
  },
  {
    id:   "active-recall",
    icon: "⚡",
    title: "Active Recall",
    tag:  "Memory",
    shortDescription: "Test yourself repeatedly instead of re-reading. Retrieval practice strengthens memory far more than passive review.",
    fullDescription:
      "Decades of cognitive science confirm that retrieving information from memory is far more effective than re-reading it. Every time you successfully recall a fact, the neural pathway for that memory strengthens. Passive re-reading creates an illusion of knowing — active recall creates durable knowledge. Combined with spaced repetition, it is the gold standard for long-term retention.",
    steps: [
      "After studying a topic, close your notes completely.",
      "Write down everything you can remember — don't peek.",
      "Check your notes and mark anything you missed or got wrong.",
      "Focus your next study block only on the items you couldn't recall.",
      "Repeat the recall test after increasing intervals: 1 day, 3 days, 1 week, 2 weeks.",
    ],
    bereaIntegration:
      "BERea's flashcard engine uses an SM-2 spaced repetition algorithm. Cards you struggle with appear more often; cards you ace are scheduled further apart — maximising retention with minimum review time.",
  },
  {
    id:   "spaced-repetition",
    icon: "📅",
    title: "Spaced Repetition",
    tag:  "Retention",
    shortDescription: "Review material at scientifically calculated intervals that hit just as memory starts to fade, locking it in long-term.",
    fullDescription:
      "Hermann Ebbinghaus discovered the 'forgetting curve' in the 1880s — memory decays predictably over time unless reinforced. Spaced repetition exploits this by scheduling reviews at the precise moment before you forget, each successful review pushing the next interval further out. It sounds mechanical, but the results are extraordinary: learners retain up to 95% of material with a fraction of the review time.",
    steps: [
      "Create a card or note for each discrete fact or concept.",
      "Review new cards on day 1, then again on day 3 if recalled correctly.",
      "Each successful recall doubles (roughly) the interval before the next review.",
      "Missed or difficult recalls reset the interval back to short — that's the system working.",
      "Commit to a daily review session, even if brief. Consistency beats marathon cramming.",
    ],
    bereaIntegration:
      "Every flashcard deck in BERea is managed by a spaced repetition scheduler. Your daily review queue is auto-generated — just open the app and follow the cards it surfaces. No planning required.",
  },
  {
    id:   "mind-mapping",
    icon: "🗺️",
    title: "Mind Mapping",
    tag:  "Organisation",
    shortDescription: "Visualise connections between ideas in a radial diagram that mirrors how your brain actually stores information.",
    fullDescription:
      "Linear notes force ideas into a sequence that doesn't reflect how the brain organises knowledge. Mind maps start with a central concept and branch outward, showing relationships between ideas visually. This format activates both verbal and spatial cognition, makes structure visible at a glance, and is especially powerful for brainstorming, essay planning, and linking concepts across a subject.",
    steps: [
      "Write your main topic in the centre of a blank page and circle it.",
      "Draw branches for each major sub-topic or chapter, labelled with a single keyword.",
      "Add smaller branches from each sub-topic for details, examples, or related ideas.",
      "Use colours and simple icons to make categories visually distinct.",
      "Review the map periodically and redraw it from memory to reinforce connections.",
    ],
    bereaIntegration:
      "BERea's Materials section lets you attach a mind map to any topic. After uploading notes or a YouTube summary, use the AI to extract key branches automatically — then edit and personalise the map.",
  },
  {
    id:   "interleaving",
    icon: "🔀",
    title: "Interleaving",
    tag:  "Problem Solving",
    shortDescription: "Mix different subjects or problem types within one session to force your brain to discriminate and apply knowledge flexibly.",
    fullDescription:
      "Most students study one topic at a time (blocked practice) because it feels productive. But research shows that deliberately mixing topics — interleaving — produces far better long-term learning, even though it feels harder. The struggle to switch contexts forces your brain to identify what type of problem this is and which strategy applies, building flexible, transferable knowledge rather than narrow pattern matching.",
    steps: [
      "Plan a session with two or three distinct topics instead of one.",
      "Work on topic A for 15–20 minutes, then switch to topic B without finishing A.",
      "Return to topic A later in the same session after some time on B or C.",
      "When reviewing practice problems, shuffle them rather than grouping by type.",
      "Embrace the feeling of difficulty — that's the sign interleaving is working.",
    ],
    bereaIntegration:
      "In BERea's session planner, enable 'Interleaved Mode' to automatically rotate between the materials you select. The AI Persona tracks your progress across topics and adjusts rotation timing based on how you perform.",
  },
];

// ─── Detail Pane ──────────────────────────────────────────────────────────────

interface DetailPaneProps {
  method:   StudyMethod;
  onClose?: () => void;
}

function DetailPane({ method, onClose }: DetailPaneProps) {
  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 flex flex-col gap-7">

      {/* Close — mobile only */}
      {onClose && (
        <div className="flex justify-end lg:hidden">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-2">
        <span className="text-5xl leading-none select-none">{method.icon}</span>
        <div className="mt-2">
          <span className="inline-block text-[11px] font-semibold uppercase tracking-widest text-blue-500 bg-blue-50 px-2.5 py-1 rounded-full mb-2">
            {method.tag}
          </span>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-snug">
            {method.title}
          </h2>
        </div>
      </div>

      {/* About */}
      <div className="flex flex-col gap-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
          About
        </h3>
        <p className="text-sm text-slate-500 leading-relaxed">
          {method.fullDescription}
        </p>
      </div>

      {/* How it works */}
      <div className="flex flex-col gap-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
          How it works
        </h3>
        <ol className="flex flex-col gap-3">
          {method.steps.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-[11px] font-bold mt-0.5">
                {i + 1}
              </span>
              <p className="text-sm text-slate-600 leading-snug">{step}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* In BERea */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 flex gap-3">
        <CheckCircle2 size={18} className="text-blue-500 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-400">
            In BERea
          </p>
          <p className="text-sm text-blue-700 leading-snug">
            {method.bereaIntegration}
          </p>
        </div>
      </div>

      {/* CTA */}
      <button
        type="button"
        className="inline-flex items-center justify-center gap-2 h-12 w-full rounded-2xl bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-200/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      >
        Start using {method.title}
        <ArrowRight size={16} strokeWidth={2.5} />
      </button>
    </div>
  );
}

// ─── Method Card ──────────────────────────────────────────────────────────────

interface MethodCardProps {
  method:   StudyMethod;
  selected: boolean;
  onClick:  () => void;
}

function MethodCard({ method, selected, onClick }: MethodCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-3 p-5 rounded-2xl border-2 text-left w-full",
        "transition-all duration-150 focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        selected
          ? "border-blue-500 bg-blue-50/70 shadow-sm shadow-blue-100/60"
          : "border-transparent bg-white shadow-sm shadow-slate-200/60 hover:border-slate-200 hover:shadow-slate-200/80"
      )}
    >
      <div className="flex items-start justify-between w-full gap-2">
        <span className="text-3xl leading-none select-none">{method.icon}</span>
        <span className={cn(
          "text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0 mt-1",
          selected
            ? "bg-blue-100 text-blue-600"
            : "bg-slate-100 text-slate-400"
        )}>
          {method.tag}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <p className={cn(
          "text-sm font-bold leading-snug",
          selected ? "text-blue-700" : "text-slate-800"
        )}>
          {method.title}
        </p>
        <p className="text-xs text-slate-400 leading-snug line-clamp-2">
          {method.shortDescription}
        </p>
      </div>
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MethodsPage() {
  const [selectedId,    setSelectedId]    = useState<string>(METHODS[0].id);
  const [mobileOpen,    setMobileOpen]    = useState(false);

  const selected = METHODS.find((m) => m.id === selectedId) ?? METHODS[0];

  function selectMethod(id: string) {
    setSelectedId(id);
    setMobileOpen(true);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">

        {/* ── Page header ────────────────────────────────────────────────── */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Study Methods Library
          </h1>
          <p className="mt-1.5 text-slate-500 text-base">
            Find the framework that fits your brain.
          </p>
        </div>

        {/* ── Two-column layout ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* ── Left: method grid ──────────────────────────────────────── */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {METHODS.map((method) => (
                <MethodCard
                  key={method.id}
                  method={method}
                  selected={selectedId === method.id}
                  onClick={() => selectMethod(method.id)}
                />
              ))}
            </div>
          </div>

          {/* ── Right: sticky detail pane (desktop) ────────────────────── */}
          <div className="hidden lg:block lg:col-span-1 sticky top-8">
            <DetailPane key={selected.id} method={selected} />
          </div>
        </div>
      </div>

      {/* ── Mobile bottom sheet ────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">

          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          {/* Sheet */}
          <div className="relative bg-slate-50 rounded-t-3xl max-h-[88vh] overflow-y-auto shadow-2xl">
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-slate-50 z-10">
              <div className="w-10 h-1 rounded-full bg-slate-300" />
            </div>

            <div className="px-4 pb-8 pt-2">
              <DetailPane
                method={selected}
                onClose={() => setMobileOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
