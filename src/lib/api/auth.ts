import { apiClient } from "@/lib/api/client";
import type { AuthUser } from "@/store/auth-store";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterAccountPayload {
  full_name: string;
  phone_number: string;
  whatsapp_number?: string;
  email: string;
  password: string;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface BiometricsResponse {
  status: string;
  message: string;
  is_biometrically_verified: boolean;
}

export async function login(payload: LoginPayload): Promise<TokenResponse> {
  const { data } = await apiClient.post<TokenResponse>("/auth/login", payload);
  return data;
}

export async function registerAccount(payload: RegisterAccountPayload): Promise<TokenResponse> {
  const { data } = await apiClient.post<TokenResponse>("/auth/register/account", payload);
  return data;
}

export async function submitBiometrics(
  selfie: Blob,
  idDocument: Blob,
  onUploadProgress?: (percent: number) => void,
): Promise<BiometricsResponse> {
  const form = new FormData();
  form.append("selfie", selfie, "selfie.jpg");
  form.append("id_document", idDocument, "id_document.jpg");

  const { data } = await apiClient.post<BiometricsResponse>("/auth/register/biometrics", form, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (event) => {
      if (!onUploadProgress || !event.total) return;
      onUploadProgress(Math.round((event.loaded / event.total) * 100));
    },
  });
  return data;
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const { data } = await apiClient.get<AuthUser>("/users/me");
  return data;
}
