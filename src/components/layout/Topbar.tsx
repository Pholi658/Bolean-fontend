"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { NotificationPanel } from "@/components/layout/NotificationPanel";
import { QuickUserSearch } from "@/components/layout/QuickUserSearch";
import { PulsingBadge } from "@/components/ui/PulsingBadge";
import { TalkToAdminButton } from "@/components/support/TalkToAdminButton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useNotificationBadge } from "@/hooks/useNotificationBadge";
import type { UserResponse as AuthUser } from "@/lib/types";

export function Topbar({ user, disabled = false }: { user?: AuthUser; disabled?: boolean }) {
  const [panelOpen, setPanelOpen] = useState(false);
  const pathname = usePathname();
  const isLenderMode = pathname.startsWith("/lender");
  const { hasUnseen } = useNotificationBadge(panelOpen, disabled);

  const initials =
    user?.full_name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "";

  return (
    <div className="hidden lg:flex h-[64px] flex-shrink-0 items-center px-7 border-b border-border relative">
      <div className="flex-shrink-0">{isLenderMode && <QuickUserSearch disabled={disabled} />}</div>

      <div className="flex-1 flex items-center justify-end gap-3.5">
        <ThemeToggle />
        <TalkToAdminButton variant="icon" />
        <div className="relative">
          <button
            onClick={() => !disabled && setPanelOpen((v) => !v)}
            disabled={disabled}
            aria-label="Notifications"
            className={
              disabled
                ? "relative w-[34px] h-[34px] rounded-lg border border-border flex items-center justify-center opacity-40 pointer-events-none"
                : "relative w-[34px] h-[34px] rounded-lg border border-border flex items-center justify-center"
            }
          >
            <Bell size={15} className="text-foreground/80" />
            {hasUnseen && <PulsingBadge className="top-1.5 right-1.5" />}
          </button>
          {panelOpen && !disabled && <NotificationPanel onClose={() => setPanelOpen(false)} />}
        </div>
        {disabled ? (
          <div className="w-8 h-8 rounded-lg bg-secondary text-foreground flex items-center justify-center text-xs font-semibold opacity-40 pointer-events-none">
            {initials}
          </div>
        ) : (
          <Link
            href="/profile"
            title="View your profile"
            className="w-8 h-8 rounded-lg bg-secondary text-foreground flex items-center justify-center text-xs font-semibold hover:bg-foreground/[0.08] transition-colors"
          >
            {initials}
          </Link>
        )}
      </div>
    </div>
  );
}
