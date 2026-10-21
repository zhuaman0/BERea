"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { readingAuthApi } from "@berea/api";
import { initials } from "@berea/core";
import { cn } from "@/shared/lib/utils";

// One download per photo version for the whole tab; the object URLs live as long as the page does.
const photoUrls = new Map<string, Promise<string>>();

function loadPhoto(userId: string, version: number): Promise<string> {
  const key = `${userId}:${version}`;
  let url = photoUrls.get(key);
  if (!url) {
    url = readingAuthApi.avatar(userId, version).then((blob) => URL.createObjectURL(blob));
    url.catch(() => photoUrls.delete(key));
    photoUrls.set(key, url);
  }
  return url;
}

interface ReaderAvatarProps {
  userId:    string | null;
  name:      string | null;
  /** From the API's `avatar_version`; null shows the initials. */
  version:   number | null;
  /** Size, shape colours and initials text style, e.g. "h-8 w-8 bg-… text-[11px]". */
  className?: string;
}

/** A reader's profile photo, falling back to their initials. */
export function ReaderAvatar({ userId, name, version, className }: ReaderAvatarProps) {
  const key = userId && version !== null ? `${userId}:${version}` : null;
  const [photo, setPhoto] = useState<{ key: string; url: string } | null>(null);

  useEffect(() => {
    if (!userId || version === null) return;
    let cancelled = false;
    loadPhoto(userId, version)
      .then((url) => { if (!cancelled) setPhoto({ key: `${userId}:${version}`, url }); })
      .catch(() => { /* initials stay */ });
    return () => { cancelled = true; };
  }, [userId, version]);

  const url = photo && photo.key === key ? photo.url : null;

  return (
    <span className={cn("relative flex shrink-0 items-center justify-center overflow-hidden rounded-full", className)}>
      {url ? (
        <Image src={url} alt={name ?? ""} fill unoptimized sizes="160px" className="object-cover" />
      ) : (
        name ? initials(name) : ""
      )}
    </span>
  );
}
