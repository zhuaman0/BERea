"use client";

import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { Modal } from "@berea/ui-kit";
import { readingAuthApi } from "@berea/api";
import { isApiError } from "@/features/auth/utils";
import { cn } from "@/shared/lib/utils";
import type { CoverColor, CoverEmblem, ReadingTeam, TeamCover } from "@berea/api";
import { COVER_ANIMATIONS, COVER_COLORS, COVER_EMBLEMS, COVER_PATTERNS, COVER_TITLE_MAX } from "./coverOptions";
import { CoverShowcase } from "./CoverShowcase";

const COLOR_KEYS = Object.keys(COVER_COLORS) as [CoverColor, ...CoverColor[]];
const EMBLEM_KEYS = Object.keys(COVER_EMBLEMS) as [CoverEmblem, ...CoverEmblem[]];

const coverSchema = z.object({
  title:     z.string().max(COVER_TITLE_MAX),
  color:     z.enum(COLOR_KEYS),
  pattern:   z.enum(COVER_PATTERNS),
  emblem:    z.enum(EMBLEM_KEYS),
  animation: z.enum(COVER_ANIMATIONS),
});

type CoverFormValues = z.infer<typeof coverSchema>;

const chipBase =
  "rounded-lg border px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rd-accent-from)]";

function chipClass(isSelected: boolean): string {
  return cn(
    chipBase,
    isSelected
      ? "border-[var(--rd-accent-from)] bg-[var(--rd-accent-from)]/10 text-[var(--rd-text)]"
      : "border-[var(--rd-border)] text-[var(--rd-text-muted)] hover:text-[var(--rd-text)]"
  );
}

interface FieldLabelProps {
  children: React.ReactNode;
}

function FieldLabel({ children }: FieldLabelProps) {
  return <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--rd-text-muted)]">{children}</p>;
}

interface CoverBuilderModalProps {
  team:    ReadingTeam;
  onClose: () => void;
  onSaved: (team: ReadingTeam) => void;
}

export function CoverBuilderModal({ team, onClose, onSaved }: CoverBuilderModalProps) {
  const t = useTranslations("reading.team.cover");
  const [saveError, setSaveError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CoverFormValues>({
    resolver: zodResolver(coverSchema),
    defaultValues: { ...team.cover, title: team.cover.title ?? "" },
  });

  const values = useWatch({ control });
  const previewCover: TeamCover = {
    title:     values.title?.trim() || null,
    color:     values.color ?? team.cover.color,
    pattern:   values.pattern ?? team.cover.pattern,
    emblem:    values.emblem ?? team.cover.emblem,
    animation: values.animation ?? team.cover.animation,
  };

  async function onSubmit(data: CoverFormValues) {
    setSaveError(null);
    try {
      const updated = await readingAuthApi.updateTeamCover({ ...data, title: data.title.trim() || null });
      onSaved(updated);
      onClose();
    } catch (err) {
      setSaveError(isApiError(err) ? err.detail : t("saveError"));
    }
  }

  return (
    <Modal title={t("modalTitle")} onClose={onClose} size="xl">
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 md:grid-cols-[220px_minmax(0,1fr)]">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-ink)] p-5 md:sticky md:top-0 md:self-start">
          <CoverShowcase cover={previewCover} teamName={team.name} className="w-40" />
          <p className="text-center text-[11px] text-[var(--rd-text-muted)]">
            {t("previewHint")}
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <label htmlFor="cover-title">
              <FieldLabel>{t("titleLabel")}</FieldLabel>
            </label>
            <input
              id="cover-title"
              {...register("title")}
              placeholder={team.name}
              maxLength={COVER_TITLE_MAX}
              className="h-11 w-full rounded-lg border border-[var(--rd-border)] bg-[var(--rd-ink)] px-3 text-sm text-[var(--rd-text)] placeholder:text-[var(--rd-text-muted)] focus:border-[var(--rd-accent-from)] focus:outline-none"
            />
            <p className="mt-1.5 text-[11px] text-[var(--rd-text-muted)]">
              {errors.title ? t("titleTooLong", { max: COVER_TITLE_MAX }) : t("titleHint")}
            </p>
          </div>

          <Controller
            control={control}
            name="color"
            render={({ field }) => (
              <div>
                <FieldLabel>{t("colorLabel", { name: t(`colors.${field.value}`) })}</FieldLabel>
                <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label={t("colorGroup")}>
                  {COLOR_KEYS.map((key) => (
                    <button
                      key={key}
                      type="button"
                      role="radio"
                      aria-checked={field.value === key}
                      aria-label={t(`colors.${key}`)}
                      onClick={() => field.onChange(key)}
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full ring-offset-2 ring-offset-[var(--rd-panel)] transition-transform hover:scale-110 focus-visible:outline-none",
                        COVER_COLORS[key].swatch,
                        field.value === key ? "ring-2 ring-[var(--rd-text)]" : "focus-visible:ring-2 focus-visible:ring-[var(--rd-accent-from)]"
                      )}
                    >
                      {field.value === key && <Check size={16} className="text-white mix-blend-difference" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          />

          <Controller
            control={control}
            name="emblem"
            render={({ field }) => (
              <div>
                <FieldLabel>{t("emblemLabel")}</FieldLabel>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t("emblemGroup")}>
                  {EMBLEM_KEYS.map((key) => {
                    const Icon = COVER_EMBLEMS[key];
                    return (
                      <button
                        key={key}
                        type="button"
                        role="radio"
                        aria-checked={field.value === key}
                        onClick={() => field.onChange(key)}
                        className={cn(chipClass(field.value === key), "inline-flex items-center gap-1.5")}
                      >
                        <Icon size={14} />
                        {t(`emblems.${key}`)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          />

          <Controller
            control={control}
            name="pattern"
            render={({ field }) => (
              <div>
                <FieldLabel>{t("patternLabel")}</FieldLabel>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t("patternGroup")}>
                  {COVER_PATTERNS.map((key) => (
                    <button
                      key={key}
                      type="button"
                      role="radio"
                      aria-checked={field.value === key}
                      onClick={() => field.onChange(key)}
                      className={chipClass(field.value === key)}
                    >
                      {t(`patterns.${key}`)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          />

          <Controller
            control={control}
            name="animation"
            render={({ field }) => (
              <div>
                <FieldLabel>{t("animationLabel")}</FieldLabel>
                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={t("animationGroup")}>
                  {COVER_ANIMATIONS.map((key) => (
                    <button
                      key={key}
                      type="button"
                      role="radio"
                      aria-checked={field.value === key}
                      onClick={() => field.onChange(key)}
                      className={cn(chipClass(field.value === key), "flex flex-col items-start gap-0.5 text-left")}
                    >
                      <span>{t(`animations.${key}.label`)}</span>
                      <span className="text-[10px] font-normal text-[var(--rd-text-muted)]">{t(`animations.${key}.hint`)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          />

          {saveError && <p className="text-sm text-red-400">{saveError}</p>}

          <div className="flex gap-2 border-t border-[var(--rd-border)] pt-5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-[var(--rd-border)] px-4 py-3 text-sm font-medium text-[var(--rd-text)] transition-colors hover:border-[var(--rd-accent-from)]"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rd-accent-gradient flex-[2] rounded-xl px-4 py-3 text-sm font-semibold text-black/85 transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting ? t("saving") : t("save")}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
