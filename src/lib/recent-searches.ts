import type { UserResponse } from "@/lib/types";

const STORAGE_KEY = "bolean:recent-user-searches";
const MAX_ENTRIES = 10;

export interface RecentSearchEntry {
  user: UserResponse;
  searched_at: string;
}

/**
 * An earlier version of this feature stored entries as plain UserResponse
 * objects (no `{user, searched_at}` wrapper). Anyone who used that version
 * still has entries in that shape sitting in their browser's localStorage —
 * this filters those (and anything else malformed) out instead of letting
 * them crash the page the moment the new code tries to read `.user.full_name`
 * off something that isn't actually a wrapped entry.
 */
function isValidEntry(value: unknown): value is RecentSearchEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Record<string, unknown>;
  if (typeof entry.searched_at !== "string") return false;
  const user = entry.user as Record<string, unknown> | undefined;
  return !!user && typeof user === "object" && typeof user.id === "string" && typeof user.full_name === "string";
}

/**
 * Pure client-side, localStorage-only — there's no backend concept of
 * "recent searches" and none is needed; this is a per-browser convenience,
 * not data that needs to sync across devices.
 */
export function getRecentSearches(): RecentSearchEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidEntry);
  } catch {
    return [];
  }
}

export function addRecentSearch(user: UserResponse): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getRecentSearches().filter((entry) => entry.user.id !== user.id);
    const next = [{ user, searched_at: new Date().toISOString() }, ...existing].slice(0, MAX_ENTRIES);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage disabled/full/private-mode — recents are a convenience, never
    // worth failing the actual search flow over.
  }
}

export function clearRecentSearches(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
