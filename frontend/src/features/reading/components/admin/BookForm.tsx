"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
      setError("That file isn't an image.");
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
      setError("Couldn't read that image. Try a JPEG or PNG.");
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
      setError("Give the book a title.");
      return;
    }
    if (pageCount.trim() && !(Number.isInteger(Number(pageCount)) && Number(pageCount) > 0)) {
      setError("Pages must be a whole number above 0.");
      return;
    }
    if (externalUrl.trim() && previewFailed) {
      setError("That cover URL doesn't load an image. Paste a direct image link or upload a file.");
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
      setError(isApiError(err) ? err.detail : "Couldn't save the book. Please try again.");
      setIsSaving(false);
    }
  }

  const isBusy = isProcessing || isSaving;

  return (
    <div className="w-full max-w-3xl px-4 py-6 sm:px-8 sm:py-10 lg:px-12">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-[var(--rd-text)]">
          {initialBook ? "Edit book" : "Add a book"}
        </h1>
        <Button onClick={handleSave} disabled={isBusy} loading={isSaving}>
          {isSaving ? "Saving…" : "Save book"}
        </Button>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-6 sm:flex-row">
        <div className="shrink-0">
          <p className="mb-2 text-xs text-[var(--rd-text-muted)]">Cover</p>
          <div className="relative flex h-48 w-36 items-center justify-center overflow-hidden rounded-xl border border-[var(--rd-border)] bg-[var(--rd-ink)]">
            {isProcessing ? (
              <Loader2 size={24} className="animate-spin text-[var(--rd-text-muted)]" />
            ) : previewSrc && !previewFailed ? (
              // eslint-disable-next-line @next/next/no-img-element -- admin-supplied cover from our API, a blob preview, or an external URL
              <img src={previewSrc} alt="" onError={() => setPreviewFailed(true)} className="h-full w-full object-cover" />
            ) : previewFailed ? (
              <p className="px-3 text-center text-[11px] leading-snug text-red-400">Couldn&apos;t load that image</p>
            ) : (
              <ImageIcon size={28} className="text-[var(--rd-text-muted)]" />
            )}
            {previewSrc && !isProcessing && (
              <button
                type="button"
                onClick={handleRemoveCover}
                aria-label="Remove cover"
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
            Upload
          </Button>
          <p className="mt-1.5 w-36 text-[10px] leading-snug text-[var(--rd-text-muted)]">
            Any size — it&apos;s shrunk automatically before saving.
          </p>
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Шоко әлем 2"
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_120px]">
            <Input
              label="Language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder="e.g. Kazakh"
            />
            <Input
              label="Genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="e.g. Classic"
            />
            <Input
              label="Pages"
              type="number"
              min={1}
              inputMode="numeric"
              value={pageCount}
              onChange={(e) => setPageCount(e.target.value)}
              placeholder="312"
            />
          </div>
          <p className="-mt-2 text-[11px] text-[var(--rd-text-muted)]">
            Language and genre should match the vote options exactly, so this book shows up in the right book round.
          </p>

          <Input
            label="Or paste a direct cover image URL"
            value={externalUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://example.com/cover.jpg"
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="book-description" className="text-sm font-medium text-[var(--rd-text)]">
              Description
            </label>
            <textarea
              id="book-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this book about?"
              rows={6}
              className={textareaBase}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
