import { useQuery } from "@tanstack/react-query";
import { fetchConsumerAnalytics, fetchLenderAnalytics } from "@/lib/api/analytics";

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
