"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, Upload, X } from "lucide-react";
import { useReadingBookStore } from "@/features/reading/store/useReadingBookStore";
import type { AdminBook } from "@/features/reading/bookTypes";

function genId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

const inputBase =
  "w-full rounded-lg border border-[var(--rd-border)] bg-[var(--rd-ink)] px-3 py-2.5 text-sm text-[var(--rd-text)] placeholder:text-[var(--rd-text-muted)] transition-colors focus:outline-none focus:border-[var(--rd-accent-from)]";

interface BookFormProps {
  initialBook?: AdminBook;
}

export function BookForm({ initialBook }: BookFormProps) {
  const router = useRouter();
  const upsertBook = useReadingBookStore((s) => s.upsertBook);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initialBook?.title ?? "");
  const [description, setDescription] = useState(initialBook?.description ?? "");
  const [coverUrl, setCoverUrl] = useState<string | null>(initialBook?.coverUrl ?? null);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("That file isn't an image.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setCoverUrl(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  }

  function handleSave() {
    if (!title.trim()) {
      setError("Give the book a title.");
      return;
    }
    setError(null);

    const book: AdminBook = {
      id:          initialBook?.id ?? genId(),
      title:       title.trim(),
      description: description.trim(),
      coverUrl,
    };
    upsertBook(book);
    router.push("/reading/admin/books");
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-8 py-10 lg:px-12">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-[var(--rd-text)]">
          {initialBook ? "Edit book" : "Add a book"}
        </h1>
        <button
          onClick={handleSave}
          className="rd-accent-gradient rounded-lg px-5 py-2.5 text-sm font-semibold text-black/85 transition-opacity hover:opacity-90"
        >
          Save book
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-6 sm:flex-row">
        <div className="shrink-0">
          <p className="mb-2 text-xs text-[var(--rd-text-muted)]">Cover</p>
          <div className="relative flex h-48 w-36 items-center justify-center overflow-hidden rounded-xl border border-[var(--rd-border)] bg-[var(--rd-ink)]">
            {coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-supplied cover (data URL or external URL), not a static asset
              <img src={coverUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <ImageIcon size={28} className="text-[var(--rd-text-muted)]" />
            )}
            {coverUrl && (
              <button
                type="button"
                onClick={() => setCoverUrl(null)}
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
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 flex w-36 items-center justify-center gap-1.5 rounded-lg border border-[var(--rd-border)] px-3 py-1.5 text-xs font-medium text-[var(--rd-text)] transition-colors hover:border-[var(--rd-accent-from)]"
          >
            <Upload size={12} />
            Upload
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="book-title" className="text-xs text-[var(--rd-text-muted)]">
              Title
            </label>
            <input
              id="book-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Шоко әлем 2"
              className={inputBase}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="book-cover-url" className="text-xs text-[var(--rd-text-muted)]">
              Or paste a cover image URL
            </label>
            <input
              id="book-cover-url"
              value={coverUrl && !coverUrl.startsWith("data:") ? coverUrl : ""}
              onChange={(e) => setCoverUrl(e.target.value || null)}
              placeholder="https://example.com/cover.jpg"
              className={inputBase}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="book-description" className="text-xs text-[var(--rd-text-muted)]">
              Description
            </label>
            <textarea
              id="book-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this book about?"
              rows={6}
              className={`${inputBase} resize-none`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
