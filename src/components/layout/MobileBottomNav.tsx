"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { LayoutDashboard, User, Inbox, ListChecks, Search, PlusCircle, Menu } from "lucide-react";
import { MobileMoreDrawer } from "@/components/layout/MobileMoreDrawer";
import { PulsingBadge } from "@/components/ui/PulsingBadge";
import { useInboxBadge } from "@/hooks/useInboxBadge";
import type { UserResponse as AuthUser } from "@/lib/types";

function TabButton({
  icon: Icon,
  label,
  active,
  disabled,
  badge,
  ...rest
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  active: boolean;
  disabled?: boolean;
  badge?: boolean;
} & (
  | { href: string; onClick?: undefined }
  | { href?: undefined; onClick: () => void }
)) {
  const content = (
    <>
      <span className="relative">
        <Icon size={21} />
        {badge && <PulsingBadge className="-top-1 -right-1.5" />}
      </span>
      <span className="text-[10px] font-medium leading-none">{label}</span>
    </>
  );
  const className = clsx(
    "flex-1 flex flex-col items-center justify-center gap-1 py-1.5 min-w-0",
    disabled ? "text-muted-foreground/40 pointer-events-none" : active ? "text-primary" : "text-muted-foreground",
  );

  if ("href" in rest && rest.href) {
    return (
      <Link href={rest.href} className={className}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={"onClick" in rest ? rest.onClick : undefined} className={className}>
      {content}
    </button>
  );
}

/**
 * Mobile equivalent of the sidebar's per-mode nav groups — same routes as
 * desktop, a "More" tab standing in for the sidebar's bottom section.
 * Consumer and lender modes get different tab sets, exactly mirroring how
 * Sidebar branches on isLenderMode.
 *
 * Fixed to the viewport (not just a flex sibling after the scrollable
 * content) so it never scrolls out of view or gets clipped by mobile
 * browser chrome — the scrollable content area below reserves matching
 * bottom padding (see (dashboard)/layout.tsx) so nothing renders underneath it.
 */
export function MobileBottomNav({ user, disabled = false }: { user?: AuthUser; disabled?: boolean }) {
  const pathname = usePathname();
  const isLenderMode = pathname.startsWith("/lender");
  const onInboxPage = pathname === "/inbox";
  const { hasUnseen } = useInboxBadge(onInboxPage, disabled);
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-30 flex lg:hidden h-[60px] items-stretch border-t border-border bg-background pb-[env(safe-area-inset-bottom)]">
        {isLenderMode ? (
          <>
            <TabButton icon={LayoutDashboard} label="Dashboard" href="/lender" active={pathname === "/lender"} />
            <TabButton
              icon={Search}
              label="Search"
              href="/lender/search"
              active={pathname.startsWith("/lender/search")}
              disabled={disabled}
            />
            <TabButton
              icon={ListChecks}
              label="Sessions"
              href="/lender/sessions"
              active={pathname.startsWith("/lender/sessions")}
              disabled={disabled}
            />
            <TabButton
              icon={PlusCircle}
              label="New"
              href="/lender/create-session"
              active={pathname.startsWith("/lender/create-session")}
              disabled={disabled}
            />
          </>
        ) : (
          <>
            <TabButton icon={LayoutDashboard} label="Dashboard" href="/" active={pathname === "/"} />
            <TabButton
              icon={ListChecks}
              label="Sessions"
              href="/sessions"
              active={pathname.startsWith("/sessions")}
              disabled={disabled}
            />
            <TabButton
              icon={Inbox}
              label="Inbox"
              href="/inbox"
              active={onInboxPage}
              disabled={disabled}
              badge={hasUnseen}
            />
            <TabButton
              icon={User}
              label="Profile"
              href="/profile"
              active={pathname.startsWith("/profile")}
              disabled={disabled}
            />
          </>
        )}
        <TabButton icon={Menu} label="More" active={moreOpen} onClick={() => setMoreOpen(true)} />
      </div>

      {moreOpen && (
        <MobileMoreDrawer
          user={user}
          isLenderMode={isLenderMode}
          disabled={disabled}
          onClose={() => setMoreOpen(false)}
        />
      )}
    </>
  );
}
