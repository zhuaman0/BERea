"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Check, ImageIcon, Loader2, Plus, Sparkles, Trash2, Upload, X } from "lucide-react";
import { Button, Input } from "@berea/ui-kit";
import { isApiError } from "@/features/auth/utils";
import { bookCoverSrc, readingBookApi } from "@berea/api";
import { resizeImage } from "@/features/reading/lib/resizeImage";
import type { BookPartWrite, ReadingBookEditor } from "@berea/api";

const textareaBase =
  "h-12 w-full rounded-xl border border-[var(--rd-border)] bg-[var(--rd-panel)] px-3.5 py-3 text-sm text-[var(--rd-text)] placeholder:text-[var(--rd-text-muted)] outline-none transition-colors focus:border-[var(--rd-accent-from)] resize-none";

function isUploadedCover(coverUrl: string | null): boolean {
  return coverUrl?.startsWith("/") ?? false;
}

interface BookFormProps {
  initialBook?: ReadingBookEditor;
}

type DraftQuestion = BookPartWrite["questions"][number] & { key: string };
type DraftPart = Omit<BookPartWrite, "questions"> & { key: string; questions: DraftQuestion[] };

let draftKey = 0;
function nextKey(prefix: string) {
  draftKey += 1;
  return `${prefix}-${draftKey}`;
}

function emptyQuestion(): DraftQuestion {
  return {
    key: nextKey("question"),
    text: "",
    answers: Array.from({ length: 4 }, (_, index) => ({ text: "", is_correct: index === 0 })),
  };
}

function emptyPart(position: number): DraftPart {
  return { key: nextKey("part"), title: `Part ${position}`, points_reward: 100, questions: [emptyQuestion()] };
}

export function BookForm({ initialBook }: BookFormProps) {
  const router = useRouter();
  const t = useTranslations("reading.admin.bookForm");
  const tCommon = useTranslations("reading.admin.common");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewObjectUrl = useRef<string | null>(null);

  const initialCover = initialBook?.cover_url ?? null;
  const [title, setTitle] = useState(initialBook?.title ?? "");
  const [description, setDescription] = useState(initialBook?.description ?? "");
  const [language, setLanguage] = useState(initialBook?.language ?? "");
  const [genre, setGenre] = useState(initialBook?.genre ?? "");
  const [pageCount, setPageCount] = useState(initialBook?.page_count ? String(initialBook.page_count) : "");
  const [externalUrl, setExternalUrl] = useState(initialCover && !isUploadedCover(initialCover) ? initialCover : "");
  const [previewSrc, setPreviewSrc] = useState<string | null>(bookCoverSrc(initialCover));
  const [pendingImage, setPendingImage] = useState<Blob | null>(null);
  const [coverCleared, setCoverCleared] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parts, setParts] = useState<DraftPart[]>(() =>
    initialBook?.parts.map((part) => ({
      key: part.id,
      title: part.title,
      points_reward: part.points_reward,
      questions: part.questions.map((question) => ({
        key: question.id,
        text: question.text,
        answers: question.answers.map(({ text, is_correct }) => ({ text, is_correct })),
      })),
    })) ?? []
  );

  function showPreview(src: string | null) {
    if (previewObjectUrl.current) URL.revokeObjectURL(previewObjectUrl.current);
    previewObjectUrl.current = src?.startsWith("blob:") ? src : null;
    setPreviewSrc(src);
    setPreviewFailed(false);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError(t("errors.notImage"));
      return;
    }
    setError(null);
    setIsProcessing(true);
    try {
      const resized = await resizeImage(file);
      setPendingImage(resized);
      setExternalUrl("");
      setCoverCleared(false);
      showPreview(URL.createObjectURL(resized));
    } catch {
      setError(t("errors.readImage"));
    } finally {
      setIsProcessing(false);
    }
  }

  function handleUrlChange(value: string) {
    setExternalUrl(value);
    setPendingImage(null);
    setCoverCleared(!value.trim());
    showPreview(value.trim() || null);
  }

  function handleRemoveCover() {
    setExternalUrl("");
    setPendingImage(null);
    setCoverCleared(true);
    showPreview(null);
  }

  async function handleSave() {
    if (!title.trim()) {
      setError(t("errors.titleRequired"));
      return;
    }
    if (pageCount.trim() && !(Number.isInteger(Number(pageCount)) && Number(pageCount) > 0)) {
      setError(t("errors.pagesInvalid"));
      return;
    }
    if (externalUrl.trim() && previewFailed) {
      setError(t("errors.coverUrlInvalid"));
      return;
    }
    for (let partIndex = 0; partIndex < parts.length; partIndex += 1) {
      const part = parts[partIndex];
      if (!part.title.trim() || part.questions.length === 0) {
        setError(t("errors.partInvalid", { number: partIndex + 1 }));
        return;
      }
      for (let questionIndex = 0; questionIndex < part.questions.length; questionIndex += 1) {
        const question = part.questions[questionIndex];
        const filledAnswers = question.answers.filter((answer) => answer.text.trim());
        if (!question.text.trim() || filledAnswers.length < 2 || filledAnswers.filter((answer) => answer.is_correct).length !== 1) {
          setError(t("errors.questionInvalid", { part: partIndex + 1, question: questionIndex + 1 }));
          return;
        }
      }
    }
    setError(null);
    setIsSaving(true);
    try {
      const pages = pageCount.trim() ? Number(pageCount) : null;
      const body = {
        title:       title.trim(),
        description: description.trim(),
        cover_url:   externalUrl.trim() || null,
        language:    language.trim() || null,
        genre:       genre.trim() || null,
        page_count:  pages,
        parts: parts.map((part) => ({
          title: part.title.trim(),
          points_reward: part.points_reward,
          questions: part.questions.map((question) => ({
            text: question.text.trim(),
            answers: question.answers
              .filter((answer) => answer.text.trim())
              .map((answer) => ({ text: answer.text.trim(), is_correct: answer.is_correct })),
          })),
        })),
      };
      const saved = initialBook ? await readingBookApi.update(initialBook.id, body) : await readingBookApi.create(body);

      if (pendingImage) {
        await readingBookApi.uploadCover(saved.id, pendingImage);
      } else if (coverCleared && initialCover) {
        await readingBookApi.removeCover(saved.id);
      }
      router.push("/reading/admin/books");
    } catch (err) {
      setError(isApiError(err) ? err.detail : t("errors.save"));
      setIsSaving(false);
    }
  }

  const isBusy = isProcessing || isSaving;

  function updatePart(index: number, patch: Partial<DraftPart>) {
    setParts((current) => current.map((part, partIndex) => partIndex === index ? { ...part, ...patch } : part));
  }

  function updateQuestion(partIndex: number, questionIndex: number, patch: Partial<DraftQuestion>) {
    setParts((current) => current.map((part, index) => index !== partIndex ? part : {
      ...part,
      questions: part.questions.map((question, qIndex) => qIndex === questionIndex ? { ...question, ...patch } : question),
    }));
  }

  function updateAnswer(partIndex: number, questionIndex: number, answerIndex: number, text: string) {
    const question = parts[partIndex].questions[questionIndex];
    updateQuestion(partIndex, questionIndex, {
      answers: question.answers.map((answer, index) => index === answerIndex ? { ...answer, text } : answer),
    });
  }

  function setCorrectAnswer(partIndex: number, questionIndex: number, answerIndex: number) {
    const question = parts[partIndex].questions[questionIndex];
    updateQuestion(partIndex, questionIndex, {
      answers: question.answers.map((answer, index) => ({ ...answer, is_correct: index === answerIndex })),
    });
  }

  return (
    <div className="w-full max-w-5xl px-4 py-6 sm:px-8 sm:py-10 lg:px-12">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-[var(--rd-text)]">
          {initialBook ? t("editTitle") : t("addTitle")}
        </h1>
        <Button onClick={handleSave} disabled={isBusy} loading={isSaving}>
          {isSaving ? tCommon("saving") : t("save")}
        </Button>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-6 sm:flex-row">
        <div className="shrink-0">
          <p className="mb-2 text-xs text-[var(--rd-text-muted)]">{t("cover")}</p>
          <div className="relative flex h-48 w-36 items-center justify-center overflow-hidden rounded-xl border border-[var(--rd-border)] bg-[var(--rd-ink)]">
            {isProcessing ? (
              <Loader2 size={24} className="animate-spin text-[var(--rd-text-muted)]" />
            ) : previewSrc && !previewFailed ? (
              // eslint-disable-next-line @next/next/no-img-element -- admin-supplied cover from our API, a blob preview, or an external URL
              <img src={previewSrc} alt="" onError={() => setPreviewFailed(true)} className="h-full w-full object-cover" />
            ) : previewFailed ? (
              <p className="px-3 text-center text-[11px] leading-snug text-red-400">{t("coverLoadError")}</p>
            ) : (
              <ImageIcon size={28} className="text-[var(--rd-text-muted)]" />
            )}
            {previewSrc && !isProcessing && (
              <button
                type="button"
                onClick={handleRemoveCover}
                aria-label={t("removeCover")}
                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isBusy}
            className="mt-2 w-36 text-xs"
          >
            <Upload size={12} />
            {t("upload")}
          </Button>
          <p className="mt-1.5 w-36 text-[10px] leading-snug text-[var(--rd-text-muted)]">
            {t("uploadHint")}
          </p>
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <Input
            label={t("fields.title")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("fields.titlePlaceholder")}
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_120px]">
            <Input
              label={t("fields.language")}
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder={t("fields.languagePlaceholder")}
            />
            <Input
              label={t("fields.genre")}
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder={t("fields.genrePlaceholder")}
            />
            <Input
              label={t("fields.pages")}
              type="number"
              min={1}
              inputMode="numeric"
              value={pageCount}
              onChange={(e) => setPageCount(e.target.value)}
              placeholder="312"
            />
          </div>
          <p className="-mt-2 text-[11px] text-[var(--rd-text-muted)]">
            {t("matchHint")}
          </p>

          <Input
            label={t("fields.coverUrl")}
            value={externalUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://example.com/cover.jpg"
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="book-description" className="text-sm font-medium text-[var(--rd-text)]">
              {t("fields.description")}
            </label>
            <textarea
              id="book-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("fields.descriptionPlaceholder")}
              rows={6}
              className={textareaBase}
            />
          </div>
        </div>
      </div>

      <section className="mt-10 border-t border-[var(--rd-border)] pt-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--rd-accent-from)]">
              <Sparkles size={14} /> {t("path.eyebrow")}
            </p>
            <h2 className="font-display mt-2 text-2xl font-semibold text-[var(--rd-text)]">{t("path.title")}</h2>
            <p className="mt-1 max-w-2xl text-sm text-[var(--rd-text-muted)]">{t("path.description")}</p>
          </div>
          <Button type="button" variant="secondary" onClick={() => setParts((current) => [...current, emptyPart(current.length + 1)])}>
            <Plus size={15} /> {t("path.addPart")}
          </Button>
        </div>

        {parts.length === 0 ? (
          <button
            type="button"
            onClick={() => setParts([emptyPart(1)])}
            className="mt-6 flex w-full flex-col items-center rounded-2xl border border-dashed border-[var(--rd-border)] px-6 py-10 text-center transition-colors hover:border-[var(--rd-accent-from)]"
          >
            <Plus size={24} className="text-[var(--rd-accent-from)]" />
            <span className="mt-3 font-medium text-[var(--rd-text)]">{t("path.emptyTitle")}</span>
            <span className="mt-1 text-sm text-[var(--rd-text-muted)]">{t("path.emptyBody")}</span>
          </button>
        ) : (
          <div className="mt-6 space-y-5">
            {parts.map((part, partIndex) => (
              <article key={part.key} className="rounded-2xl border border-[var(--rd-border)] bg-[var(--rd-panel)] p-5 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <label className="text-xs font-medium text-[var(--rd-text-muted)]">{t("path.partLabel", { number: partIndex + 1 })}</label>
                    <input
                      value={part.title}
                      onChange={(event) => updatePart(partIndex, { title: event.target.value })}
                      placeholder={t("path.partPlaceholder")}
                      className="mt-1.5 w-full rounded-xl border border-[var(--rd-border)] bg-[var(--rd-ink)] px-3.5 py-3 text-sm text-[var(--rd-text)] outline-none focus:border-[var(--rd-accent-from)]"
                    />
                  </div>
                  <div className="w-full sm:w-36">
                    <label className="text-xs font-medium text-[var(--rd-text-muted)]">{t("path.reward")}</label>
                    <input
                      type="number"
                      min={1}
                      max={5000}
                      value={part.points_reward}
                      onChange={(event) => updatePart(partIndex, { points_reward: Math.max(1, Number(event.target.value) || 1) })}
                      className="mt-1.5 w-full rounded-xl border border-[var(--rd-border)] bg-[var(--rd-ink)] px-3.5 py-3 text-sm text-[var(--rd-text)] outline-none focus:border-[var(--rd-accent-from)]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setParts((current) => current.filter((_, index) => index !== partIndex))}
                    aria-label={t("path.deletePart", { number: partIndex + 1 })}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-500/20 text-red-400 transition-colors hover:bg-red-500/10"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="mt-5 space-y-4">
                  {part.questions.map((question, questionIndex) => (
                    <div key={question.key} className="rounded-xl border border-[var(--rd-border)] bg-[var(--rd-ink)] p-4">
                      <div className="flex items-start gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--rd-accent-from)]/15 text-xs font-bold text-[var(--rd-accent-from)]">{questionIndex + 1}</span>
                        <textarea
                          value={question.text}
                          onChange={(event) => updateQuestion(partIndex, questionIndex, { text: event.target.value })}
                          placeholder={t("path.questionPlaceholder")}
                          rows={2}
                          className="min-h-16 flex-1 resize-none bg-transparent text-sm text-[var(--rd-text)] outline-none placeholder:text-[var(--rd-text-muted)]"
                        />
                        <button
                          type="button"
                          onClick={() => updatePart(partIndex, { questions: part.questions.filter((_, index) => index !== questionIndex) })}
                          aria-label={t("path.deleteQuestion", { number: questionIndex + 1 })}
                          className="text-[var(--rd-text-muted)] transition-colors hover:text-red-400"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <p className="mb-2 mt-4 text-xs text-[var(--rd-text-muted)]">{t("path.answerHint")}</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {question.answers.map((answer, answerIndex) => (
                          <div key={answerIndex} className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 ${answer.is_correct ? "border-emerald-400/60 bg-emerald-400/5" : "border-[var(--rd-border)]"}`}>
                            <button
                              type="button"
                              onClick={() => setCorrectAnswer(partIndex, questionIndex, answerIndex)}
                              aria-label={t("path.markCorrect", { number: answerIndex + 1 })}
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${answer.is_correct ? "bg-emerald-400 text-black" : "border border-[var(--rd-border)] text-transparent"}`}
                            >
                              <Check size={14} />
                            </button>
                            <input
                              value={answer.text}
                              onChange={(event) => updateAnswer(partIndex, questionIndex, answerIndex, event.target.value)}
                              placeholder={t("path.answerPlaceholder", { number: answerIndex + 1 })}
                              className="min-w-0 flex-1 bg-transparent text-sm text-[var(--rd-text)] outline-none placeholder:text-[var(--rd-text-muted)]"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => updatePart(partIndex, { questions: [...part.questions, emptyQuestion()] })}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--rd-accent-from)] hover:underline"
                >
                  <Plus size={14} /> {t("path.addQuestion")}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
