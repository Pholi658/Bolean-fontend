import { useQuery } from "@tanstack/react-query";
import { fetchConsumerAnalytics, fetchLenderAnalytics, fetchUserAnalytics } from "@/lib/api/analytics";

export function useConsumerAnalytics(enabled = true) {
  return useQuery({
    queryKey: ["analytics", "consumer"],
    queryFn: fetchConsumerAnalytics,
    staleTime: 60_000,
    enabled,
  });
}

export function useLenderAnalytics() {
  return useQuery({
    queryKey: ["analytics", "lender"],
    queryFn: fetchLenderAnalytics,
    staleTime: 60_000,
  });
}

/** Profile stats for any user, yourself included — 403 means no approved permission to view them. */
export function useUserAnalytics(userId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ["analytics", "user", userId],
    queryFn: () => fetchUserAnalytics(userId as string),
    enabled: enabled && !!userId,
    retry: false,
    staleTime: 60_000,
  });
}
