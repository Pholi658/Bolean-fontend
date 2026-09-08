import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchCurrentUser,
  login,
  registerAccount,
  type LoginPayload,
  type RegisterAccountPayload,
} from "@/lib/api/auth";
import { useAuthStore } from "@/store/auth-store";
import { setSessionHintCookie, clearSessionHintCookie } from "@/lib/session-hint";

export const CURRENT_USER_QUERY_KEY = ["users", "me"] as const;

export function useCurrentUser() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: fetchCurrentUser,
    enabled: !!token,
    staleTime: 5 * 60_000,
  });
}

export function useLoginMutation() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: async (data) => {
      setAuth(data.access_token);
      setSessionHintCookie();
      await queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY });
    },
  });
}

export function useRegisterAccountMutation() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (payload: RegisterAccountPayload) => registerAccount(payload),
    onSuccess: (data) => {
      setAuth(data.access_token);
      setSessionHintCookie();
    },
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const queryClient = useQueryClient();

  return () => {
    clearAuth();
    clearSessionHintCookie();
    queryClient.clear();
    window.location.assign("/login");
  };
}

/**
 * For /login and /register: if a token already exists the moment this page
 * mounts (e.g. opened in a new tab while already logged in elsewhere),
 * skip straight to the dashboard. Checks the store's value once on mount
 * rather than subscribing to it — these pages set the token themselves
 * right before their own onSubmit navigates to "/"; subscribing here would
 * race that navigation. "/" is the only destination now regardless of
 * verification status — the dashboard renders the biometric verification
 * step in place of the normal home content until the profile is verified,
 * instead of a separate route.
 *
 * This used to trap anyone mid-registration (token exists, not yet
 * biometrically verified): a soft nav to /login doesn't clear the
 * in-memory token, so this hook bounced them straight back into the
 * dashboard guard, which bounced them straight back to the verification
 * step, with no way out. The actual fix for that is an explicit "Log out"
 * button in the sidebar (via useLogout, which clears the token for real
 * before navigating) — not removing this redirect, which is a real nicety
 * for genuinely-finished sessions.
 */
export function useRedirectIfAuthenticated() {
  const router = useRouter();

  useEffect(() => {
    if (useAuthStore.getState().token) router.replace("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
