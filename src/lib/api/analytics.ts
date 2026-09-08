import { apiClient } from "@/lib/api/client";
import type { ConsumerAnalytics, LenderAnalytics } from "@/lib/types";

export async function fetchConsumerAnalytics(): Promise<ConsumerAnalytics> {
  const { data } = await apiClient.get<ConsumerAnalytics>("/analytics/consumer");
  return data;
}

export async function fetchLenderAnalytics(): Promise<LenderAnalytics> {
  const { data } = await apiClient.get<LenderAnalytics>("/analytics/lender");
  return data;
}
