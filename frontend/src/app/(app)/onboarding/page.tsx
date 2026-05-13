"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

// ─── Data ─────────────────────────────────────────────────────────────────────

const ROLES = [
  { id: "high_school",  emoji: "🎓", label: "High School Student"  },
  { id: "university",   emoji: "🏫", label: "University Student"    },
  { id: "professional", emoji: "💼", label: "Working Professional"  },
  { id: "teacher",      emoji: "👨‍🏫", label: "Teacher / Educator"   },
  { id: "lifelong",     emoji: "🌱", label: "Lifelong Learner"      },
] as const;

const GOALS = [
  { id: "deep_focus", emoji: "🎯", label: "Deep Focus",            sub: "Pomodoro technique"             },
  { id: "memory",     emoji: "🧠", label: "Memory Retention",      sub: "Flashcards & spaced repetition" },
  { id: "exam_prep",  emoji: "📝", label: "Exam Prep",             sub: "Quizzes & practice tests"       },
  { id: "reading",    emoji: "📖", label: "Reading Comprehension", sub: "Active reading strategies"      },
  { id: "burnout",    emoji: "🌿", label: "Burnout Recovery",      sub: "Sustainable study habits"       },
] as const;

const DURATIONS = [25, 45, 60, 90] as const;

const AUDIO_OPTIONS = [
  { id: "lofi",    emoji: "🎧", label: "Lo-Fi Beats"     },
  { id: "ambient", emoji: "🌧️", label: "Ambient / Nature" },
  { id: "silence", emoji: "🤫", label: "Pure Silence"    },
] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  role:             string | null;
  goals:            string[];
  focusDuration:    number;
  audioPreference:  string | null;
}

// ─── Animation variants ───────────────────────────────────────────────────────

const stepVariants = {
  enter:  (dir: number) => ({ x: dir > 0 ? 28 : -28, opacity: 0 }),
  center:              () => ({ x: 0,                 opacity: 1 }),
  exit:   (dir: number) => ({ x: dir > 0 ? -28 : 28, opacity: 0 }),
};

const stepTransition = {
  type: "spring" as const,
  stiffness: 380,
  damping: 34,
  mass: 0.9,
  opacity: { duration: 0.16 },
};

// ─── Selectable card ──────────────────────────────────────────────────────────

interface CardProps {
  emoji:       string;
  label:       string;
  sub?:        string;
  selected:    boolean;
  onClick:     () => void;
  multiSelect?: boolean;
}

function SelectableCard({ emoji, label, sub, selected, onClick, multiSelect }: CardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-start gap-2.5 p-4 rounded-2xl border-2 text-left w-full",
        "transition-all duration-150 focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        selected
          ? "border-blue-500 bg-blue-50 shadow-sm shadow-blue-100/60"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80"
      )}
    >
      {multiSelect && (
        <span
          className={cn(
            "absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center",
            "transition-all duration-150 shrink-0",
            selected ? "border-blue-500 bg-blue-500" : "border-slate-300 bg-white"
          )}
        >
          {selected && <Check size={10} strokeWidth={4} className="text-white" />}
        </span>
      )}

      <span className="text-2xl leading-none select-none">{emoji}</span>

      <span className={cn(
        "text-sm font-semibold leading-snug pr-5",
        selected ? "text-blue-700" : "text-slate-800"
      )}>
        {label}
      </span>

      {sub && (
        <span className="text-xs text-slate-400 leading-snug">{sub}</span>
      )}
    </button>
  );
}

// ─── Steps ────────────────────────────────────────────────────────────────────

function StepRole({ formData, setFormData }: {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}) {
  return (
    <div className="flex flex-col gap-7">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-snug">
          Welcome to BERea.
        </h1>
        <p className="mt-1.5 text-slate-500 text-base">
          Tell us a bit about yourself.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ROLES.map((role) => (
          <SelectableCard
            key={role.id}
            emoji={role.emoji}
            label={role.label}
            selected={formData.role === role.id}
            onClick={() => setFormData((d) => ({ ...d, role: role.id }))}
          />
        ))}
      </div>
    </div>
  );
}

function StepGoals({ formData, setFormData }: {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}) {
  function toggleGoal(id: string) {
    setFormData((d) => ({
      ...d,
      goals: d.goals.includes(id)
        ? d.goals.filter((g) => g !== id)
        : [...d.goals, id],
    }));
  }

  return (
    <div className="flex flex-col gap-7">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          What are you trying to improve?
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">Choose all that apply.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {GOALS.map((goal) => (
          <SelectableCard
            key={goal.id}
            emoji={goal.emoji}
            label={goal.label}
            sub={goal.sub}
            selected={formData.goals.includes(goal.id)}
            onClick={() => toggleGoal(goal.id)}
            multiSelect
          />
        ))}
      </div>
    </div>
  );
}

function StepEnvironment({ formData, setFormData }: {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Set your default study environment.
        </h1>
      </div>

      {/* Focus duration */}
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-slate-700">
          How long is your ideal focus block?
        </p>
        <div className="flex flex-wrap gap-2.5">
          {DURATIONS.map((mins) => (
            <button
              key={mins}
              type="button"
              onClick={() => setFormData((d) => ({ ...d, focusDuration: mins }))}
              className={cn(
                "px-5 py-2.5 rounded-xl border-2 text-sm font-semibold",
                "transition-all duration-150 focus-visible:outline-none",
                "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                formData.focusDuration === mins
                  ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm shadow-blue-100/60"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              {mins} min
            </button>
          ))}
        </div>
      </div>

      {/* Audio preference */}
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-slate-700">
          What helps you focus?
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {AUDIO_OPTIONS.map((opt) => (
            <SelectableCard
              key={opt.id}
              emoji={opt.emoji}
              label={opt.label}
              selected={formData.audioPreference === opt.id}
              onClick={() => setFormData((d) => ({ ...d, audioPreference: opt.id }))}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 3;

const STEPS = [StepRole, StepGoals, StepEnvironment];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [step, setStep]           = useState(0);
  const [direction, setDirection] = useState(1);
  const [formData, setFormData]   = useState<FormData>({
    role:            null,
    goals:           [],
    focusDuration:   25,
    audioPreference: null,
  });

  const firstName   = user?.full_name?.split(" ")[0] ?? "there";
  const progressPct = ((step + 1) / TOTAL_STEPS) * 100;
  const isLastStep  = step === TOTAL_STEPS - 1;
  const canContinue = step === 0 ? formData.role !== null : true;

  function goTo(next: number) {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  }

  function handleContinue() {
    if (!isLastStep) {
      goTo(step + 1);
    } else {
      router.push("/profile");
    }
  }

  const StepComponent = STEPS[step];

  return (
    // Fixed overlay — renders above the app shell sidebar
    <div className="fixed inset-0 z-50 bg-slate-50 flex items-center justify-center p-4 sm:p-8 overflow-y-auto">
      <div className="relative bg-white rounded-3xl shadow-xl shadow-slate-200/50 max-w-2xl w-full px-7 sm:px-10 py-9 sm:py-10 my-auto">

        {/* ── Progress bar + Skip ──────────────────────────────────────── */}
        <div className="flex items-center gap-4 mb-2">
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-500 rounded-full"
              animate={{ width: `${progressPct}%` }}
              transition={{ type: "spring", stiffness: 180, damping: 26 }}
            />
          </div>

          <button
            type="button"
            onClick={() => router.push("/profile")}
            className="shrink-0 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors whitespace-nowrap"
          >
            Skip for now
          </button>
        </div>

        {/* ── Step label ───────────────────────────────────────────────── */}
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-8">
          Step {step + 1} of {TOTAL_STEPS}
        </p>

        {/* ── Animated step content ────────────────────────────────────── */}
        <div className="overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={stepTransition}
            >
              <StepComponent formData={formData} setFormData={setFormData} />

              {/* Personalised greeting on first step */}
              {step === 0 && user?.full_name && (
                <p className="mt-5 text-sm text-slate-400">
                  Signed in as <span className="font-medium text-slate-600">{firstName}</span>
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Bottom navigation ────────────────────────────────────────── */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-100">

          {step > 0 ? (
            <button
              type="button"
              onClick={() => goTo(step - 1)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2.5 rounded-xl",
                "text-sm font-medium text-slate-500",
                "hover:bg-slate-100 hover:text-slate-700 transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
              )}
            >
              <ChevronLeft size={16} strokeWidth={2.5} />
              Back
            </button>
          ) : (
            <div aria-hidden />
          )}

          <button
            type="button"
            onClick={handleContinue}
            disabled={!canContinue}
            className={cn(
              "inline-flex items-center gap-2 px-6 py-2.5 rounded-xl",
              "bg-blue-500 text-white text-sm font-semibold",
              "hover:bg-blue-600 active:bg-blue-700 transition-colors",
              "shadow-md shadow-blue-200/60",
              "disabled:opacity-40 disabled:pointer-events-none",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            )}
          >
            {isLastStep ? "Go to my Dashboard" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
