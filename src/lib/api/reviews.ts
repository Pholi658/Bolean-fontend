import { apiClient } from "@/lib/api/client";
import type { ReviewOut } from "@/lib/types";

export async function fetchMyReviews(): Promise<ReviewOut[]> {
  const { data } = await apiClient.get<{ reviews: ReviewOut[] }>("/profile/my_reviews");
  return data.reviews;
}

export async function fetchReviewsForUser(userId: string): Promise<ReviewOut[]> {
  const { data } = await apiClient.get<{ reviews: ReviewOut[] }>(`/profile/reviews/${userId}`);
  return data.reviews;
}

export async function submitReview(
  sessionId: string,
  payload: { msg: string; rating: number },
): Promise<{ message: string }> {
  const { data } = await apiClient.post(`/profile/${sessionId}/reviews`, payload);
  return data;
}
