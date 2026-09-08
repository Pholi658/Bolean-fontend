import { apiClient } from "@/lib/api/client";
import type { DisputeResponse } from "@/lib/types";

export async function raiseDispute(sessionId: string, issue: string): Promise<DisputeResponse> {
  const { data } = await apiClient.post<DisputeResponse>(`/disputes/sessions/${sessionId}`, { issue });
  return data;
}
