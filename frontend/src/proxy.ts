import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/profile", "/onboarding", "/study", "/methods", "/materials", "/analytics", "/personas", "/settings", "/dashboard"];
const AUTH_PATHS = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin routes ────────────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    const hasAdminSession = request.cookies.has("berea-admin-session");
    if (pathname === "/admin/login") {
      if (hasAdminSession) return NextResponse.redirect(new URL("/admin", request.url));
      return NextResponse.next();
    }
    if (!hasAdminSession) return NextResponse.redirect(new URL("/admin/login", request.url));
    return NextResponse.next();
  }

  // ── User routes ─────────────────────────────────────────────────────────────
  const hasToken    = request.cookies.has("berea-session");
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthRoute = AUTH_PATHS.some((p) => pathname.startsWith(p));

  if (isProtected && !hasToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && hasToken) {
    return NextResponse.redirect(new URL("/profile", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
