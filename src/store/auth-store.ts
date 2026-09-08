import { create } from "zustand";

export interface AuthUser {
  id: string;
  full_name: string;
  phone_number: string;
  whatsapp_number: string | null;
  email: string;
  created_at: string;
  is_verified: boolean;
  is_biometrically_verified: boolean;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  setAuth: (token: string, user?: AuthUser | null) => void;
  setUser: (user: AuthUser) => void;
  clearAuth: () => void;
}

/**
 * Deliberately not wrapped in zustand's `persist` middleware — the token
 * must live only in JS memory (never localStorage/sessionStorage) so it is
 * gone on tab close and on refresh, per the security requirements.
 */
export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  setAuth: (token, user = null) => set({ token, user }),
  setUser: (user) => set({ user }),
  clearAuth: () => set({ token: null, user: null }),
}));
