import axios from "axios";
import { logErrorInDev } from "@/lib/errors";
import { clearSessionHintCookie } from "@/lib/session-hint";

// Relative, not the backend's real origin — requests go through this app's
// own /api/* rewrite (next.config.ts), which proxies to NEXT_PUBLIC_API_URL
// server-side. That keeps the browser talking to a single origin, which is
// what makes the httpOnly access_token cookie set by the backend a
// first-party cookie instead of a cross-site one (see next.config.ts for
// why that distinction matters). No Authorization header is set here
// anymore for the same reason: the cookie travels automatically with every
// same-origin request, so there's no token for this client to read or
// attach — withCredentials is what makes the browser actually include it.
//
// Request paths must never end in "/" and must match a backend route
// exactly: Next 308s a trailing slash away before the rewrite, and if the
// result doesn't match, FastAPI 307s to an absolute URL on the backend's own
// origin — outside this proxy, so the cookie isn't sent, the request 401s,
// and the interceptor below logs the user out mid-session.
export const apiClient = axios.create({
  baseURL: "/api",
  timeout: 20_000,
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    logErrorInDev("api/client", error);

    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        clearSessionHintCookie();
        // On the auth pages a 401 only means "not logged in yet" — redirecting would kick people off /register.
        if (!["/login", "/register"].includes(window.location.pathname)) {
          window.location.assign("/login");
        }
      }
    }

    return Promise.reject(error);
  },
);
