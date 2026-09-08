import { apiClient } from "@/lib/api/client";

export interface IdentityImagesResponse {
  selfie_url: string | null;
  id_document_url: string | null;
}

/**
 * Deliberately its own endpoint rather than a field on UserResponse — that
 * schema backs every ordinary profile fetch (search results, session
 * details, profile pages), so bundling these in there would send the raw
 * image URLs along with all of those instead of only the moment someone
 * opens "Confirm visual identity".
 */
export async function fetchIdentityImages(userId: string): Promise<IdentityImagesResponse> {
  const { data } = await apiClient.get<IdentityImagesResponse>(`/users/${userId}/identity-images`);
  return data;
}
