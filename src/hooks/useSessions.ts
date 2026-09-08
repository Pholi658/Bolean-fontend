import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveSession,
  createSession,
  fetchMySessionsAsBorrower,
  fetchMySessionsAsLender,
  fetchSessionDetail,
  fetchUserSessionHistory,
  markSessionCompleted,
  markSessionLate,
  markSessionOverdue,
  rejectSession,
  type CreateSessionPayload,
} from "@/lib/api/sessions";

export function useMySessionsAsBorrower(enabled = true) {
  return useQuery({
    queryKey: ["sessions", "borrower"],
    queryFn: fetchMySessionsAsBorrower,
    staleTime: 30_000,
    enabled,
  });
}

export function useMySessionsAsLender(page: number, limit = 20) {
  return useQuery({
    queryKey: ["sessions", "lender", page, limit],
    queryFn: () => fetchMySessionsAsLender(page, limit),
    staleTime: 30_000,
  });
}

/**
 * The backend's lender session list has no status filter, only pagination —
 * so the "unconfirmed sessions" reminder and the full session management
 * view both need every session at once to filter/count client-side. 100 is
 * a pragmatic ceiling for a peer-to-peer lender's session volume, not a
 * hard backend limit.
 */
export function useAllMySessionsAsLender(limit = 100) {
  return useQuery({
    queryKey: ["sessions", "lender", "all", limit],
    queryFn: () => fetchMySessionsAsLender(1, limit),
    staleTime: 30_000,
  });
}

export function useSessionDetail(sessionId: string | undefined) {
  return useQuery({
    queryKey: ["sessions", "detail", sessionId],
    queryFn: () => fetchSessionDetail(sessionId as string),
    enabled: !!sessionId,
  });
}

/** 403 here means "no permission yet" — callers branch on that, not a generic error. */
export function useUserSessionHistory(userId: string | undefined) {
  return useQuery({
    queryKey: ["sessions", "history", userId],
    queryFn: () => fetchUserSessionHistory(userId as string),
    enabled: !!userId,
    retry: false,
  });
}

function useInvalidateSessions() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["sessions"] });
}

export function useCreateSession() {
  const invalidate = useInvalidateSessions();
  return useMutation({
    mutationFn: (payload: CreateSessionPayload) => createSession(payload),
    onSuccess: invalidate,
  });
}

export function useApproveSession() {
  const invalidate = useInvalidateSessions();
  return useMutation({ mutationFn: approveSession, onSuccess: invalidate });
}

export function useRejectSession() {
  const invalidate = useInvalidateSessions();
  return useMutation({ mutationFn: rejectSession, onSuccess: invalidate });
}

export function useMarkSessionLate() {
  const invalidate = useInvalidateSessions();
  return useMutation({ mutationFn: markSessionLate, onSuccess: invalidate });
}

export function useMarkSessionCompleted() {
  const invalidate = useInvalidateSessions();
  return useMutation({ mutationFn: markSessionCompleted, onSuccess: invalidate });
}

export function useMarkSessionOverdue() {
  const invalidate = useInvalidateSessions();
  return useMutation({ mutationFn: markSessionOverdue, onSuccess: invalidate });
}
