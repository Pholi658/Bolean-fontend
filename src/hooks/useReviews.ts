import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchMyReviews, fetchReviewsForUser, submitReview } from "@/lib/api/reviews";

export function useMyReviews(enabled = true) {
  return useQuery({
    queryKey: ["reviews", "me"],
    queryFn: fetchMyReviews,
    staleTime: 60_000,
    enabled,
  });
}

/**
 * Gated by the same approved-Permission row as session history — 403 means
 * "no permission yet", not a generic error. `enabled` lets callers wait
 * until that permission is confirmed before firing this request too.
 */
export function useReviewsForUser(userId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ["reviews", "user", userId],
    queryFn: () => fetchReviewsForUser(userId as string),
    enabled: enabled && !!userId,
    retry: false,
    staleTime: 60_000,
  });
}

export function useSubmitReview(sessionId: string) {
  return useMutation({
    mutationFn: (payload: { rating: number; msg: string }) => submitReview(sessionId, payload),
  });
}
