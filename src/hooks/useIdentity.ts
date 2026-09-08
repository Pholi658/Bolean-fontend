import { useQuery } from "@tanstack/react-query";
import { fetchIdentityImages } from "@/lib/api/identity";

/**
 * Only fetches while `enabled` (the confirmation modal is open) — never
 * prefetched, never cached across opens (staleTime/gcTime 0), since each
 * viewing is meant to be its own deliberate, time-boxed session rather than
 * something that can be silently reused from cache.
 */
export function useIdentityImages(userId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ["identity-images", userId],
    queryFn: () => fetchIdentityImages(userId as string),
    enabled: enabled && !!userId,
    retry: false,
    staleTime: 0,
    gcTime: 0,
  });
}
