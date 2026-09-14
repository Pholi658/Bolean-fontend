"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { clsx } from "clsx";
import { BoleanLogo } from "@/components/ui/BoleanLogo";
import { PulsingBadge } from "@/components/ui/PulsingBadge";
import { useNotificationBadge } from "@/hooks/useNotificationBadge";
import type { UserResponse as AuthUser } from "@/lib/types";

/**
 * Mobile equivalent of Topbar — same profile avatar (same /profile
 * destination) but the bell navigates to a dedicated full page (/notifications,
 * Facebook-style) instead of opening Topbar's dropdown; a small overlay
 * doesn't hold up well as the primary mobile notifications surface. Drops
 * the inline QuickUserSearch (its own bottom-nav destination on mobile) and
 * the theme/admin icon buttons (moved into the "More" drawer) to stay compact.
 */
export function MobileHeader({ user, disabled = false }: { user?: AuthUser; disabled?: boolean }) {
  const pathname = usePathname();
  const onNotificationsPage = pathname === "/notifications";
  const { hasUnseen } = useNotificationBadge(onNotificationsPage, disabled);

  const initials =
    user?.full_name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "";

  return (
    <div className="flex lg:hidden h-14 flex-shrink-0 items-center justify-between px-4 border-b border-border relative">
      <BoleanLogo size="sm" />

      <div className="flex items-center gap-2">
        {disabled ? (
          <div
            aria-label="Notifications"
            className="relative w-10 h-10 rounded-lg border border-border flex items-center justify-center opacity-40 pointer-events-none"
          >
            <Bell size={17} className="text-foreground/80" />
          </div>
        ) : (
          <Link
            href="/notifications"
            aria-label="Notifications"
            className={clsx(
              "relative w-10 h-10 rounded-lg border border-border flex items-center justify-center",
              onNotificationsPage && "border-primary/40 bg-primary/[0.06]",
            )}
          >
            <Bell size={17} className="text-foreground/80" />
            {hasUnseen && <PulsingBadge className="top-2 right-2" />}
          </Link>
        )}
        {disabled ? (
          <div className="w-10 h-10 rounded-lg bg-secondary text-foreground flex items-center justify-center text-xs font-semibold opacity-40 pointer-events-none">
            {initials}
          </div>
        ) : (
          <Link
            href="/profile"
            aria-label="View your profile"
            className="w-10 h-10 rounded-lg bg-secondary text-foreground flex items-center justify-center text-xs font-semibold"
          >
            {initials}
          </Link>
        )}
      </div>
    </div>
  );
}
