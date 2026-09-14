"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useAuth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

/**
 * Client-side auth guard — the real gate for this route tree. See
 * src/proxy.ts for why the JWT itself can't be checked at the edge.
 *
 * There's no local "am I logged in" flag to check synchronously anymore —
 * the access token lives in an httpOnly cookie this client can't read, so
 * useCurrentUser's real network result (backed by that cookie) is the only
 * source of truth. That means every mount of this layout — including a
 * plain page reload — fires a real /users/me request rather than assuming
 * "no local state" means "not logged in"; a valid cookie resolves it
 * successfully and the dashboard renders normally instead of bouncing to
 * /login, which is the whole point of having moved off memory-only storage.
 *
 * Biometric verification (the old registration "step 2") lives inside this
 * shell now rather than a separate route: an unverified profile still sees
 * the sidebar and topbar, just with navigation disabled to everything but
 * "/" (see Sidebar's `disabled` prop) — "/" itself renders the
 * verification step in place of the normal dashboard home. Trying to
 * reach any other protected route while unverified bounces back to "/".
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: user, isError } = useCurrentUser();

  const verified = user?.is_biometrically_verified ?? false;

  useEffect(() => {
    if (isError) {
      router.replace("/login");
      return;
    }
    if (user && !verified && pathname !== "/") {
      router.replace("/");
    }
  }, [user, verified, isError, pathname, router]);

  if (!user) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="h-dvh bg-background flex overflow-hidden">
      <Sidebar user={user} disabled={!verified} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar user={user} disabled={!verified} />
        <MobileHeader user={user} disabled={!verified} />
        {/* MobileBottomNav is fixed (not a flex sibling), so its height is
            reserved here instead — otherwise mobile content would render
            underneath it. */}
        <div className="flex-1 overflow-auto pb-[calc(60px+env(safe-area-inset-bottom))] lg:pb-0">
          {children}
        </div>
        <MobileBottomNav user={user} disabled={!verified} />
      </div>
    </div>
  );
}
