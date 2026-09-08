"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useCurrentUser } from "@/hooks/useAuth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

/**
 * Client-side auth guard — the real gate for this route tree. See
 * src/proxy.ts for why the JWT itself can't be checked at the edge.
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
  const token = useAuthStore((s) => s.token);
  const { data: user, isLoading, isError } = useCurrentUser();

  const verified = user?.is_biometrically_verified ?? false;

  useEffect(() => {
    if (!token) {
      router.replace("/login");
      return;
    }
    if (isError) {
      router.replace("/login");
      return;
    }
    if (user && !verified && pathname !== "/") {
      router.replace("/");
    }
  }, [token, user, verified, isError, pathname, router]);

  if (!token || isLoading || !user) {
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
