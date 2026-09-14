import { apiClient } from "@/lib/api/client";
import type {
  PaginatedLenderSessions,
  SessionDetailResponse,
  SessionResponse,
  TransactionType,
} from "@/lib/types";

export interface CreateSessionPayload {
  transaction_type: TransactionType;
  amount: number;
  /** Must be an ISO datetime string that includes a timezone offset. */
  due_date: string;
  description: string;
  borrower_id: string;
}

export async function createSession(payload: CreateSessionPayload): Promise<{ message: string }> {
  const { data } = await apiClient.post("/sessions", payload);
  return data;
}

export async function fetchMySessionsAsBorrower(): Promise<SessionResponse[]> {
  const { data } = await apiClient.get<{ sessions_as_borrower: SessionResponse[] }>(
    "/sessions/my_sessions",
    { params: { role: "borrower" } },
  );
  return data.sessions_as_borrower;
}

export async function fetchMySessionsAsLender(
  page: number,
  limit: number,
): Promise<PaginatedLenderSessions> {
  const { data } = await apiClient.get<PaginatedLenderSessions>("/sessions/my_sessions", {
    params: { role: "lender", page, limit },
  });
  return data;
}

export async function fetchSessionDetail(sessionId: string): Promise<SessionDetailResponse> {
  const { data } = await apiClient.get<SessionDetailResponse>(`/sessions/detail/${sessionId}`);
  return data;
}

/**
 * Session history for another user (as borrower) — gated by an APPROVED
 * Permission row. Throws a 403 AxiosError when access hasn't been granted;
 * callers should treat that as "no permission yet", not a generic error.
 */
export async function fetchUserSessionHistory(userId: string): Promise<SessionResponse[]> {
  const { data } = await apiClient.get<{ sessions_as_borrower: SessionResponse[] }>(
    `/sessions/${userId}`,
  );
  return data.sessions_as_borrower;
}

export async function approveSession(sessionId: string): Promise<{ message: string }> {
  const { data } = await apiClient.patch(`/sessions/${sessionId}/approve`);
  return data;
}

export async function rejectSession(sessionId: string): Promise<{ message: string }> {
  const { data } = await apiClient.patch(`/sessions/${sessionId}/reject`);
  return data;
}

export async function markSessionLate(sessionId: string): Promise<{ message: string }> {
  const { data } = await apiClient.patch(`/sessions/${sessionId}/late`);
  return data;
}

/** Only valid from UNCONFIRMED — the backend rejects it from any other status. */
export async function markSessionOverdue(sessionId: string): Promise<{ message: string }> {
  const { data } = await apiClient.patch(`/sessions/${sessionId}/overdue`);
  return data;
}

export async function markSessionCompleted(sessionId: string): Promise<void> {
  // The backend returns no body on success for this endpoint.
  await apiClient.patch(`/sessions/${sessionId}/completed`);
}
