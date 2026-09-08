"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, User, LogOut, ArrowLeftRight, ListChecks, Search, PlusCircle } from "lucide-react";
import { BoleanLogo } from "@/components/ui/BoleanLogo";
import { InboxNavItem } from "@/components/layout/InboxNavItem";
import { TalkToAdminButton } from "@/components/support/TalkToAdminButton";
import { SidebarSettings } from "@/components/layout/SidebarSettings";
import { useLogout } from "@/hooks/useAuth";
import type { AuthUser } from "@/store/auth-store";

function NavGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-[18px] first:mt-0.5">
      <p className="px-3 mb-1.5 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground/70 uppercase">
        {label}
      </p>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

function NavRow({
  icon: Icon,
  label,
  href,
  active,
  disabled,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  href: string;
  active: boolean;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <div
        title="Finish identity verification to unlock this"
        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] text-muted-foreground/40 cursor-not-allowed select-none"
      >
        <Icon size={16} />
        <span>{label}</span>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={
        active
          ? "relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] bg-primary/10 text-primary font-medium"
          : "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] text-muted-foreground hover:text-foreground transition-colors"
      }
    >
      {active && <span className="absolute right-0 top-2 bottom-2 w-0.5 bg-primary rounded-full" />}
      <Icon size={16} />
      <span>{label}</span>
    </Link>
  );
}

export function Sidebar({ user, disabled = false }: { user?: AuthUser; disabled?: boolean }) {
  const logout = useLogout();
  const pathname = usePathname();
  const isLenderMode = pathname.startsWith("/lender");
  const initials =
    user?.full_name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "";

  return (
    <div className="hidden lg:flex w-[244px] flex-shrink-0 border-r border-border flex-col p-3.5">
      <div className="flex items-center gap-2 px-2 pb-5 pt-1">
        <BoleanLogo size="md" />
      </div>

      {isLenderMode && (
        <div className="mx-0.5 mb-1 px-2.5 py-1 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary/70" />
          <span className="text-[10px] font-semibold tracking-wider text-primary/80 uppercase">Lender Mode</span>
        </div>
      )}

      {isLenderMode ? (
        <>
          <NavGroup label="Overview">
            <NavRow
              icon={LayoutDashboard}
              label="Dashboard"
              href="/lender"
              active={pathname === "/lender"}
              disabled={disabled}
            />
            <NavRow
              icon={Search}
              label="Search"
              href="/lender/search"
              active={pathname.startsWith("/lender/search")}
              disabled={disabled}
            />
          </NavGroup>
          <NavGroup label="Records">
            <NavRow
              icon={ListChecks}
              label="Sessions"
              href="/lender/sessions"
              active={pathname.startsWith("/lender/sessions")}
              disabled={disabled}
            />
            <NavRow
              icon={PlusCircle}
              label="New Session"
              href="/lender/create-session"
              active={pathname.startsWith("/lender/create-session")}
              disabled={disabled}
            />
          </NavGroup>
        </>
      ) : (
        <>
          <NavGroup label="Overview">
            <NavRow icon={LayoutDashboard} label="Dashboard" href="/" active={pathname === "/"} />
          </NavGroup>
          <NavGroup label="Activity">
            <NavRow
              icon={ListChecks}
              label="Sessions"
              href="/sessions"
              active={pathname.startsWith("/sessions")}
              disabled={disabled}
            />
            <InboxNavItem disabled={disabled} />
          </NavGroup>
          <NavGroup label="Account">
            <NavRow
              icon={User}
              label="Profile"
              href="/profile"
              active={pathname.startsWith("/profile")}
              disabled={disabled}
            />
          </NavGroup>
        </>
      )}

      <div className="flex-1" />

      <div className="mb-2">
        <TalkToAdminButton variant="sidebar" />
      </div>

      {disabled ? (
        <div
          title="Finish identity verification to unlock this"
          className="flex items-center justify-center gap-1.5 py-2.5 border border-border rounded-lg text-muted-foreground/40 text-[12.5px] font-medium mb-3.5 cursor-not-allowed select-none"
        >
          <ArrowLeftRight size={13} />
          Switch to Lender View
        </div>
      ) : (
        <Link
          href={isLenderMode ? "/" : "/lender"}
          className="flex items-center justify-center gap-1.5 py-2.5 border border-border rounded-lg text-muted-foreground text-[12.5px] font-medium mb-3.5 hover:bg-secondary transition-colors"
        >
          <ArrowLeftRight size={13} />
          {isLenderMode ? "Switch to Consumer View" : "Switch to Lender View"}
        </Link>
      )}

      <div className="border-t border-border pt-3 space-y-2.5">
        {disabled ? (
          <div className="flex items-center gap-1.5">
            <div className="flex-1 flex items-center gap-2.5 min-w-0 opacity-40 cursor-not-allowed select-none">
              <div className="w-8 h-8 rounded-lg bg-secondary text-foreground flex items-center justify-center text-xs font-semibold flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12.5px] text-foreground font-medium truncate">{user?.full_name}</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {user?.is_verified ? "Verified" : "Unverified"}
                </p>
              </div>
            </div>
            <SidebarSettings />
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <Link
              href="/profile"
              title="View your profile"
              className="flex-1 flex items-center gap-2.5 rounded-lg -mx-1.5 px-1.5 py-1 hover:bg-secondary transition-colors min-w-0"
            >
              <div className="w-8 h-8 rounded-lg bg-secondary text-foreground flex items-center justify-center text-xs font-semibold flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12.5px] text-foreground font-medium truncate">{user?.full_name}</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {user?.is_verified ? "Verified" : "Unverified"}
                </p>
              </div>
            </Link>
            <SidebarSettings />
          </div>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-destructive/25 bg-destructive/[0.06] text-destructive text-[12.5px] font-medium hover:bg-destructive/[0.12] hover:border-destructive/40 transition-colors"
        >
          <LogOut size={14} />
          Log out
        </button>
      </div>
    </div>
  );
}
