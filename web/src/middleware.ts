import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/", "/sign-in", "/sign-up"];
const AUTH_REQUIRED_PREFIXES = ["/journey", "/library", "/events", "/leaderboard", "/rewards", "/profile", "/play", "/challenge", "/arena", "/onboarding"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // API routes handle their own auth
  if (pathname.startsWith("/api/")) return NextResponse.next();

  // Admin routes — require isAdmin
  if (pathname.startsWith("/admin")) {
    if (!req.auth) return NextResponse.redirect(new URL("/sign-in", req.url));
    if (!(req.auth.user as any)?.isAdmin) return NextResponse.redirect(new URL("/", req.url));
    return NextResponse.next();
  }

  // Protected user routes
  const needsAuth = AUTH_REQUIRED_PREFIXES.some((p) => pathname.startsWith(p));
  if (needsAuth && !req.auth) return NextResponse.redirect(new URL("/sign-in", req.url));

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
