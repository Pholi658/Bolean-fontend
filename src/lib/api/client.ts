import axios from "axios";
import { useAuthStore } from "@/store/auth-store";
import { logErrorInDev } from "@/lib/errors";
import { clearSessionHintCookie } from "@/lib/session-hint";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

if (!baseURL && typeof window !== "undefined") {
  // Fail loudly in the browser rather than silently hitting a relative URL —
  // the base URL must always come from the environment, never be hardcoded.
  logErrorInDev("api/client", "NEXT_PUBLIC_API_URL is not set");
}

export const apiClient = axios.create({
  baseURL,
  timeout: 20_000,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    logErrorInDev("api/client", error);

    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      if (typeof window !== "undefined") {
        clearSessionHintCookie();
        if (window.location.pathname !== "/login") {
          window.location.assign("/login");
        }
      }
    }

    return Promise.reject(error);
  },
);
