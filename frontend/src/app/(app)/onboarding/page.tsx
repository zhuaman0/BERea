"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

// ─── Static data (non-translated fields only) ─────────────────────────────────

const ABSORPTION_IDS = [
  { id: "reading",     emoji: "📖" },
  { id: "listening",   emoji: "🎧" },
  { id: "watching",    emoji: "📺" },
  { id: "interactive", emoji: "🗣️" },
  { id: "kinesthetic", emoji: "✍️" },
] as const;

const AUDIO_IDS = [
  { id: "lofi",      emoji: "🎧" },
  { id: "ambient",   emoji: "🌧️" },
  { id: "classical", emoji: "🎻" },
  { id: "silence",   emoji: "🤫" },
] as const;

const COACH_STATIC = [
  { id: "gentle",   emoji: "😇", dot: "bg-emerald-400", ring: "bg-emerald-50" },
  { id: "analyst",  emoji: "🤖", dot: "bg-violet-400",  ring: "bg-violet-50"  },
  { id: "sergeant", emoji: "😤", dot: "bg-red-400",     ring: "bg-red-50"     },
] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  absorptionModes: string[];
  audioPreference: string | null;
  coachPersona:    string | null;
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
  emoji:        string;
  label:        string;
  sub?:         string;
  selected:     boolean;
  onClick:      () => void;
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

// ─── Coach card ───────────────────────────────────────────────────────────────

interface CoachCardProps {
  persona:  {
    id: string;
    emoji: string;
    dot: string;
    ring: string;
    name: string;
    tagline: string;
    quote: string;
  };
  selected: boolean;
  onClick:  () => void;
}

function CoachCard({ persona, selected, onClick }: CoachCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-start gap-4 p-5 rounded-2xl border-2 text-left w-full",
        "transition-all duration-150 focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        selected
          ? "border-blue-500 bg-blue-50 shadow-sm shadow-blue-100/60"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80"
      )}
    >
      <div className={cn(
        "shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl select-none",
        selected ? "bg-blue-100" : persona.ring
      )}>
        {persona.emoji}
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className={cn(
              "text-sm font-bold leading-snug",
              selected ? "text-blue-700" : "text-slate-800"
            )}>
              {persona.name}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", persona.dot)} />
              <p className="text-xs text-slate-400">{persona.tagline}</p>
            </div>
          </div>

          {selected && (
            <span className="shrink-0 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center mt-0.5">
              <Check size={10} strokeWidth={4} className="text-white" />
            </span>
          )}
        </div>

        <p className="text-xs text-slate-500 italic leading-relaxed">
          "{persona.quote}"
        </p>
      </div>
    </button>
  );
}

// ─── Steps ────────────────────────────────────────────────────────────────────

function StepAbsorption({ formData, setFormData }: {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}) {
  const t = useTranslations("onboarding");

  const modes = ABSORPTION_IDS.map((m) => ({
    ...m,
    label: t(m.id as "reading" | "listening" | "watching" | "interactive" | "kinesthetic"),
    sub:   t(`${m.id}Sub` as "readingSub" | "listeningSub" | "watchingSub" | "interactiveSub" | "kinestheticSub"),
  }));

  function toggle(id: string) {
    setFormData((d) => ({
      ...d,
      absorptionModes: d.absorptionModes.includes(id)
        ? d.absorptionModes.filter((m) => m !== id)
        : [...d.absorptionModes, id],
    }));
  }

  return (
    <div className="flex flex-col gap-7">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-snug">
          {t("absorptionTitle")}
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">{t("absorptionSubtitle")}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {modes.map((mode) => (
          <SelectableCard
            key={mode.id}
            emoji={mode.emoji}
            label={mode.label}
            sub={mode.sub}
            selected={formData.absorptionModes.includes(mode.id)}
            onClick={() => toggle(mode.id)}
            multiSelect
          />
        ))}
      </div>
    </div>
  );
}

function StepAudio({ formData, setFormData }: {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}) {
  const t = useTranslations("onboarding");

  const options = AUDIO_IDS.map((o) => ({
    ...o,
    label: t(o.id as "lofi" | "ambient" | "classical" | "silence"),
  }));

  return (
    <div className="flex flex-col gap-7">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-snug">
          {t("audioTitle")}
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">{t("audioSubtitle")}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((opt) => (
          <SelectableCard
            key={opt.id}
            emoji={opt.emoji}
            label={opt.label}
            selected={formData.audioPreference === opt.id}
            onClick={() => setFormData((d) => ({
              ...d,
              audioPreference: d.audioPreference === opt.id ? null : opt.id,
            }))}
          />
        ))}
      </div>
    </div>
  );
}

function StepCoach({ formData, setFormData }: {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}) {
  const t = useTranslations("onboarding");

  const personas = COACH_STATIC.map((p) => ({
    ...p,
    name:    t(`${p.id}Name`    as "gentleName"    | "analystName"    | "sergeantName"),
    tagline: t(`${p.id}Tagline` as "gentleTagline" | "analystTagline" | "sergeantTagline"),
    quote:   t(`${p.id}Quote`   as "gentleQuote"   | "analystQuote"   | "sergeantQuote"),
  }));

  return (
    <div className="flex flex-col gap-7">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-snug">
          {t("coachTitle")}
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">{t("coachSubtitle")}</p>
      </div>

      <div className="flex flex-col gap-3">
        {personas.map((persona) => (
          <CoachCard
            key={persona.id}
            persona={persona}
            selected={formData.coachPersona === persona.id}
            onClick={() => setFormData((d) => ({ ...d, coachPersona: persona.id }))}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 3;
const STEPS = [StepAbsorption, StepAudio, StepCoach];

export default function OnboardingPage() {
  const router    = useRouter();
  const t         = useTranslations("onboarding");
  const { user }  = useAuthStore();

  const [step, setStep]           = useState(0);
  const [direction, setDirection] = useState(1);
  const [formData, setFormData]   = useState<FormData>({
    absorptionModes: [],
    audioPreference: null,
    coachPersona:    null,
  });

  const firstName   = user?.full_name?.split(" ")[0] ?? "there";
  const progressPct = ((step + 1) / TOTAL_STEPS) * 100;
  const isLastStep  = step === TOTAL_STEPS - 1;

  const canContinue =
    step === 0 ? formData.absorptionModes.length > 0 :
    step === 1 ? true :
    formData.coachPersona !== null;

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
            {t("skipForNow")}
          </button>
        </div>

        {/* ── Step label ───────────────────────────────────────────────── */}
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-8">
          {t("stepOf", { step: step + 1, total: TOTAL_STEPS })}
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

              {step === 0 && user?.full_name && (
                <p className="mt-5 text-sm text-slate-400">
                  {t("settingUpFor", { name: firstName })}
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
              {t("back")}
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
            {isLastStep ? t("letsStart") : t("continue")}
          </button>
        </div>
      </div>
    </div>
  );
}
