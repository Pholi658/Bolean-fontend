import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approvePermission,
  fetchIncomingPermissions,
  rejectPermission,
  requestPermission,
} from "@/lib/api/permissions";

const PERMISSIONS_KEY = ["permissions", "incoming"] as const;

export function useIncomingPermissions(enabled = true) {
  return useQuery({
    queryKey: PERMISSIONS_KEY,
    queryFn: fetchIncomingPermissions,
    staleTime: 30_000,
    enabled,
  });
}

export function useApprovePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approvePermission,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PERMISSIONS_KEY }),
  });
}

export function useRequestPermission() {
  return useMutation({ mutationFn: requestPermission });
}

export function useRejectPermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rejectPermission,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PERMISSIONS_KEY }),
  });
}
