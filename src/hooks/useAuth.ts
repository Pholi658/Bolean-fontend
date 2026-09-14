import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchCurrentUser,
  login,
  logout as logoutRequest,
  registerAccount,
  type LoginPayload,
  type RegisterAccountPayload,
} from "@/lib/api/auth";
import { setSessionHintCookie, clearSessionHintCookie, hasSessionHint } from "@/lib/session-hint";

export const CURRENT_USER_QUERY_KEY = ["users", "me"] as const;

// Source of truth for "who is logged in": the token is an httpOnly cookie this client can't read, so ask the backend.
export function useCurrentUser(enabled = true) {
  return useQuery({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: fetchCurrentUser,
    staleTime: 5 * 60_000,
    enabled,
    // A 401 never changes on retry — fail fast so the dashboard guard redirects at once.
    retry: (failureCount, error) => failureCount < 1 && !(isAxiosError(error) && error.response?.status === 401),
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: async () => {
      // The response already set the access_token cookie — nothing for this
      // client to store. has_session is a separate, non-sensitive hint
      // cookie for the edge middleware (see src/proxy.ts) and the auth pages.
      setSessionHintCookie();
      await queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY });
    },
  });
}

export function useRegisterAccountMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterAccountPayload) => registerAccount(payload),
    onSuccess: async () => {
      setSessionHintCookie();
      await queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return () => {
    // Best-effort: even if the network call fails, still clear local state
    // and navigate away — a user must never be stuck unable to log out
    // client-side just because the logout request itself didn't land. The
    // cookie is httpOnly, so only this request can actually clear it; a
    // failure here means the cookie may outlive its intended session (it
    // still expires on its own after ACCESS_TOKEN_EXPIRE_HOURS either way).
    logoutRequest().catch(() => {});
    clearSessionHintCookie();
    queryClient.clear();
    window.location.assign("/login");
  };
}

// On /login and /register, jump to "/" if already logged in — only probes when has_session exists, so logged-out visitors don't 401.
export function useRedirectIfAuthenticated() {
  const router = useRouter();
  const { data: user } = useCurrentUser(hasSessionHint());

  useEffect(() => {
    if (user) router.replace("/");
  }, [user, router]);
}
