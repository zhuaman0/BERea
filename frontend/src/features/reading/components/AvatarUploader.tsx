"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { readingAuthApi, type ReadingUser } from "@berea/api";
import { isApiError } from "@/features/auth/utils";
import { resizeImage } from "@/features/reading/lib/resizeImage";
import { ReaderAvatar } from "./ReaderAvatar";

// Square-ish photos look sharp at the largest avatar (80px, 2–3× on retina) and stay ~40 KB.
const PHOTO_MAX_SIDE = 480;
const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp";

interface AvatarUploaderProps {
  user:     ReadingUser;
  onChange: (user: ReadingUser) => void;
}

/** The profile avatar, clickable to upload a new photo; shrunk in the browser before upload. */
export function AvatarUploader({ user, onChange }: AvatarUploaderProps) {
  const t = useTranslations("reading.profile.photo");
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<"upload" | "remove" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!ACCEPTED_TYPES.split(",").includes(file.type)) {
      setError(t("wrongType"));
      return;
    }
    setBusy("upload");
    setError(null);
    try {
      const photo = await resizeImage(file, PHOTO_MAX_SIDE);
      onChange(await readingAuthApi.uploadAvatar(photo));
    } catch (err) {
      setError(isApiError(err) ? err.detail : t("uploadError"));
    } finally {
      setBusy(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove() {
    setBusy("remove");
    setError(null);
    try {
      onChange(await readingAuthApi.removeAvatar());
    } catch (err) {
      setError(isApiError(err) ? err.detail : t("removeError"));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy !== null}
        aria-label={user.avatar_version ? t("change") : t("upload")}
        title={user.avatar_version ? t("change") : t("upload")}
        className="group relative rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--rd-accent-from)]"
      >
        <ReaderAvatar
          userId={user.id}
          name={user.full_name}
          version={user.avatar_version}
          className="rd-accent-gradient font-display h-20 w-20 text-2xl font-bold text-black/80"
        />
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          <Camera size={22} aria-hidden="true" />
        </span>
        <span className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--rd-panel)] bg-[var(--rd-text)] text-black">
          {busy === "upload" ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} aria-hidden="true" />}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
      {user.avatar_version !== null && (
        <button
          type="button"
          onClick={() => void handleRemove()}
          disabled={busy !== null}
          className="flex items-center gap-1 text-[11px] text-[var(--rd-text-muted)] transition-colors hover:text-red-400 disabled:opacity-50"
        >
          {busy === "remove" ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />} {t("remove")}
        </button>
      )}
      <AnimatePresence>
        {error && (
          <motion.p
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="max-w-48 text-[11px] text-red-400"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
