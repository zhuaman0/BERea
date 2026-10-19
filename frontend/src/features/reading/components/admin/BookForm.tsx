"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ImageIcon, Loader2, Upload, X } from "lucide-react";
import { Button, Input } from "@berea/ui-kit";
import { isApiError } from "@/features/auth/utils";
import { bookCoverSrc, readingBookApi } from "@berea/api";
import { resizeImage } from "@/features/reading/lib/resizeImage";
import type { ReadingBook } from "@berea/api";

const textareaBase =
  "h-12 w-full rounded-xl border border-[var(--rd-border)] bg-[var(--rd-panel)] px-3.5 py-3 text-sm text-[var(--rd-text)] placeholder:text-[var(--rd-text-muted)] outline-none transition-colors focus:border-[var(--rd-accent-from)] resize-none";

function isUploadedCover(coverUrl: string | null): boolean {
  return coverUrl?.startsWith("/") ?? false;
}

interface BookFormProps {
  initialBook?: ReadingBook;
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

  return (
    <div className="w-full max-w-3xl px-4 py-6 sm:px-8 sm:py-10 lg:px-12">
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
    </div>
  );
}
