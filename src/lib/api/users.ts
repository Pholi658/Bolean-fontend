import { apiClient } from "@/lib/api/client";
import type { UserResponse } from "@/lib/types";

export async function searchUsers(query: string): Promise<UserResponse[]> {
  const { data } = await apiClient.get<{ users: UserResponse[] }>("/users/search", {
    params: { query },
  });
  return data.users;
}

export async function fetchUserProfile(userId: string): Promise<UserResponse> {
  const { data } = await apiClient.get<UserResponse>(`/users/profile/${userId}`);
  return data;
}
