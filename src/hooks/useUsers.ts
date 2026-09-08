import { useQuery } from "@tanstack/react-query";
import { fetchUserProfile, searchUsers } from "@/lib/api/users";

export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: ["users", "search", query],
    queryFn: () => searchUsers(query),
    enabled: query.trim().length > 0,
    staleTime: 15_000,
  });
}

export function useUserProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ["users", "profile", userId],
    queryFn: () => fetchUserProfile(userId as string),
    enabled: !!userId,
  });
}
