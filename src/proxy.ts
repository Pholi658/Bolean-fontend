import { NextResponse, type NextRequest } from "next/server";

/**
 * IMPORTANT — this middleware is NOT the security boundary.
 *
 * The JWT is intentionally kept in memory only (never in a cookie or
 * storage), per the security requirements, which means it never reaches
 * this edge middleware to be validated. The real enforcement is the
 * backend: every API call carries the token via the axios interceptor
 * (src/lib/api/client.ts), and the backend rejects anything without a
 * valid one with a 401, which the client-side interceptor turns into a
 * redirect to /login.
 *
 * What this middleware DOES do is read a small, non-sensitive
 * `has_session` cookie (no token in it — see src/lib/session-hint.ts) set
 * at login/register and cleared at logout or on a 401, purely so an
 * obviously logged-out visitor is bounced before the client-side AuthGuard
 * (src/app/(dashboard)/layout.tsx) has a chance to flash protected UI.
 *
 * Deliberately ONE-DIRECTIONAL: it only ever redirects a protected path
 * towards /login when the cookie is missing. It must never also redirect
 * public paths (/login, /register/*) away when the cookie IS present —
 * that reverse rule previously existed and caused real outages: the
 * cookie can easily end up stale (any hard page reload wipes the
 * in-memory token but a plain cookie survives reload, a raw `<a href>`
 * internal link triggers exactly that hard reload, and a 401 clears the
 * token slightly before it clears the cookie). Whenever the cookie says
 * "logged in" but the real token is gone, the dashboard's client-side
 * guard tries to send the visitor to /login while a reverse edge rule
 * tries to send them back to "/" — an unwinnable, completely blank
 * redirect loop. Being one-directional makes that class of bug
 * structurally impossible: this file can only ever push towards /login,
 * so it can't ping-pong with a client guard that does the same.
 */
const PROTECTED_PATH_PREFIXES = ["/sessions", "/profile", "/lender"];

function isProtectedPath(pathname: string): boolean {
  if (pathname === "/") return true;
  return PROTECTED_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSessionHint = request.cookies.has("has_session");

  if (isProtectedPath(pathname) && !hasSessionHint) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
