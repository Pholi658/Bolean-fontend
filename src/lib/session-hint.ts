/**
 * The `has_session` cookie is a non-sensitive hint for proxy.ts only — it
 * carries no token and is never the security boundary (see proxy.ts). It
 * must be kept in sync with the real in-memory auth state on every path
 * that clears that state, or proxy.ts's redirect and the client-side
 * AuthGuard's redirect can disagree and bounce forever.
 */
export function setSessionHintCookie() {
  document.cookie = "has_session=1; path=/; samesite=lax";
}

export function clearSessionHintCookie() {
  document.cookie = "has_session=; path=/; max-age=0; samesite=lax";
}
