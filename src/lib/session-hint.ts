/**
 * The `has_session` cookie is a non-sensitive hint for proxy.ts and the auth
 * pages' already-logged-in check — it carries no token and is never the
 * security boundary (see proxy.ts). It must be kept in sync with the real
 * session (the httpOnly access_token cookie) on every path that clears it,
 * or proxy.ts's redirect and the client-side guard can disagree and bounce.
 */
export function setSessionHintCookie() {
  document.cookie = "has_session=1; path=/; samesite=lax";
}

export function clearSessionHintCookie() {
  document.cookie = "has_session=; path=/; max-age=0; samesite=lax";
}

export function hasSessionHint(): boolean {
  return typeof document !== "undefined" && document.cookie.split("; ").some((c) => c.startsWith("has_session="));
}
