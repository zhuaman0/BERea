"use server";

import { cookies } from "next/headers";
import { routing } from "./routing";

export async function setLocale(locale: string): Promise<void> {
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) return;

  const cookieStore = await cookies();
  cookieStore.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
