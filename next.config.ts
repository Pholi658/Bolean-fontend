import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Don't auto-generate AGENTS.md/CLAUDE.md on dev boot.
  agentRules: false,
  // Dev server only: without this, Next 15.2+ 403s every _next/static/*
  // chunk (and the HMR websocket) when the request's origin isn't
  // localhost/127.0.0.1 — a CSRF/DNS-rebinding guard on the dev server
  // itself. That means opening the "Network:" URL dev prints (e.g. from a
  // phone on the same Wi-Fi, which is how this app's mobile-heavy UI work
  // actually gets tested) loads the HTML shell fine but React never
  // hydrates at all: no click handlers attach, so every form silently
  // falls back to a native browser submit instead of calling the API.
  // Wildcarded to the whole home LAN subnet, not just today's DHCP-assigned
  // IP, so it keeps working across reconnects. Has no effect in production.
  allowedDevOrigins: ["192.168.1.*"],
  // Proxies /api/* to the real backend (NEXT_PUBLIC_API_URL) server-side, so
  // the browser only ever talks to this app's own origin. That's what makes
  // the backend's httpOnly access_token cookie a first-party cookie instead
  // of a cross-site one — frontend and backend are on different domains
  // (vercel.app / railway.app), and browsers increasingly block or
  // outright refuse third-party cookies (Safari blocks them by default,
  // full stop), so without this proxy the cookie would silently fail to
  // persist for a large chunk of real users. See src/lib/api/client.ts,
  // whose baseURL is "/api" to route through this.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "bolean-a1",

  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
