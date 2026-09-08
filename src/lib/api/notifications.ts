import { apiClient } from "@/lib/api/client";
import type { PaginatedNotifications, NotificationResponse } from "@/lib/types";

export async function fetchNotifications(page: number, limit: number): Promise<PaginatedNotifications> {
  const { data } = await apiClient.get<PaginatedNotifications>("/notifications/", {
    params: { page, limit },
  });
  return data;
}

export async function markAllNotificationsRead(): Promise<{ message: string }> {
  const { data } = await apiClient.patch("/notifications/mark-all-read");
  return data;
}

export async function markNotificationRead(notificationId: string): Promise<NotificationResponse> {
  const { data } = await apiClient.patch<NotificationResponse>(`/notifications/${notificationId}/read`);
  return data;
}
