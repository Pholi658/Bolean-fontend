import { apiClient } from "@/lib/api/client";
import type { PermissionItem } from "@/lib/types";

export async function fetchIncomingPermissions(): Promise<PermissionItem[]> {
  const { data } = await apiClient.get<PermissionItem[]>("/permissions");
  return data;
}

export async function requestPermission(userId: string): Promise<{ message: string }> {
  const { data } = await apiClient.post(`/permissions/${userId}`);
  return data;
}

export async function approvePermission(permissionId: string): Promise<{ message: string }> {
  const { data } = await apiClient.patch(`/permissions/${permissionId}/approve`);
  return data;
}

export async function rejectPermission(permissionId: string): Promise<{ message: string }> {
  const { data } = await apiClient.patch(`/permissions/${permissionId}/reject`);
  return data;
}
