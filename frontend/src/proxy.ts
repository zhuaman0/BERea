import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const USER_PROTECTED = ["/dashboard", "/catalog", "/configurator", "/my-designs", "/profile"];
const AUTH_PAGES     = ["/login", "/register", "/forgot-password"];

const READING_AUTH_PAGES = ["/reading/login", "/reading/register"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin routes ──────────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    const hasAdmin = request.cookies.has("berea-admin-session");
    if (pathname === "/admin/login") {
      if (hasAdmin) return NextResponse.redirect(new URL("/admin", request.url));
      return NextResponse.next();
    }
    if (!hasAdmin) return NextResponse.redirect(new URL("/admin/login", request.url));
    return NextResponse.next();
  }

  // ── 451° landing page ──────────────────────────────────────────────────────
  // Returning signed-in visitors skip the marketing page and land straight in the app.
  if (pathname === "/" && request.cookies.has("nats-session")) {
    return NextResponse.redirect(new URL("/reading", request.url));
  }

  // ── Reading (NATS Spirea) auth guard ──────────────────────────────────────
  if (pathname.startsWith("/reading")) {
    const hasReadingSession = request.cookies.has("nats-session");
    const isReadingAuthPage = READING_AUTH_PAGES.some((p) => pathname.startsWith(p));

    if (isReadingAuthPage) {
      if (hasReadingSession) return NextResponse.redirect(new URL("/reading", request.url));
      return NextResponse.next();
    }
    if (!hasReadingSession) return NextResponse.redirect(new URL("/reading/login", request.url));
    return NextResponse.next();
  }

  // ── User auth guard ───────────────────────────────────────────────────────
  const hasSession = request.cookies.has("berea-session");

  if (USER_PROTECTED.some((p) => pathname.startsWith(p))) {
    if (!hasSession) return NextResponse.redirect(new URL("/login", request.url));
  }

  if (AUTH_PAGES.some((p) => pathname.startsWith(p))) {
    if (hasSession) return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo_451.png|api/).*)"],
};
