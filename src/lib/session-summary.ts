import type { SessionResponse, SessionStatus } from "@/lib/types";

export interface SessionSummary {
  totalTransacted: number;
  outstanding: number;
  sessionsLifetime: number;
  totalCompleted: number;
  byStatus: Record<SessionStatus, number>;
}

const OUTSTANDING_STATUSES: SessionStatus[] = ["ACTIVE", "UNCONFIRMED", "OVERDUE", "LATE"];

/**
 * Aggregates a raw session list client-side — used only where the backend
 * has no analytics endpoint to compute this server-side (viewing another
 * user's session history). For your own profile, prefer the real
 * /analytics/consumer aggregate instead of this.
 */
export function summarizeSessions(sessions: SessionResponse[]): SessionSummary {
  const byStatus: Record<SessionStatus, number> = {
    PENDING: 0,
    ACTIVE: 0,
    UNCONFIRMED: 0,
    OVERDUE: 0,
    COMPLETED: 0,
    LATE: 0,
    DEFAULTED: 0,
    DISPUTED: 0,
    DECLINED: 0,
  };

  let totalTransacted = 0;
  let outstanding = 0;

  for (const session of sessions) {
    byStatus[session.status]++;
    totalTransacted += session.amount;
    if (OUTSTANDING_STATUSES.includes(session.status)) outstanding += session.amount;
  }

  return {
    totalTransacted,
    outstanding,
    sessionsLifetime: sessions.length,
    totalCompleted: byStatus.COMPLETED,
    byStatus,
  };
}
