import type { TransactionType } from "@/lib/types";

const STORAGE_KEY = "bolean:pending-created-sessions";
const MAX_ENTRIES = 10;

export interface PendingSessionEntry {
  borrowerName: string;
  borrowerPhone: string;
  amount: number;
  transactionType: TransactionType;
  createdAt: string;
}

function isValidEntry(value: unknown): value is PendingSessionEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.borrowerName === "string" &&
    typeof entry.borrowerPhone === "string" &&
    typeof entry.amount === "number" &&
    typeof entry.transactionType === "string" &&
    typeof entry.createdAt === "string"
  );
}

/**
 * Pure client-side confirmation feed — "sessions I just sent out" for this
 * browser. The backend doesn't return a session id on creation (just a
 * message), so this can't deep-link anywhere; it exists purely to reassure
 * the lender that their recent submissions actually went through.
 */
export function getPendingSessions(): PendingSessionEntry[] {
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

export function addPendingSession(entry: Omit<PendingSessionEntry, "createdAt">): void {
  if (typeof window === "undefined") return;
  try {
    const next = [{ ...entry, createdAt: new Date().toISOString() }, ...getPendingSessions()].slice(
      0,
      MAX_ENTRIES,
    );
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage disabled/full/private-mode — never worth failing session
    // creation itself over.
  }
}

export function clearPendingSessions(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
