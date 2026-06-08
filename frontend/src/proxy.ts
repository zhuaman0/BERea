import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
