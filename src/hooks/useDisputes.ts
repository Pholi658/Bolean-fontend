import { useMutation, useQueryClient } from "@tanstack/react-query";
import { raiseDispute } from "@/lib/api/disputes";
import type { SessionDetailResponse } from "@/lib/types";

/**
 * The backend's session detail endpoint only ever surfaces a dispute once
 * it's PUBLISHED (app/services/session_service.py filters on that status),
 * so refetching session detail right after filing one would just show
 * `dispute: null` again — as if nothing happened. Writing the real response
 * straight into the cache instead means the borrower sees their pending
 * dispute immediately and for the rest of this session, even though the
 * backend itself won't hand it back until an admin publishes it.
 */
export function useRaiseDispute(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (issue: string) => raiseDispute(sessionId, issue),
    onSuccess: (dispute) => {
      queryClient.setQueryData<SessionDetailResponse | undefined>(
        ["sessions", "detail", sessionId],
        (old) => (old ? { ...old, dispute } : old),
      );
    },
  });
}
