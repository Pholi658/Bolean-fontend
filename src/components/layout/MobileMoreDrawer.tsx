"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { ArrowLeftRight, LogOut, X } from "lucide-react";
import { TalkToAdminButton } from "@/components/support/TalkToAdminButton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useLogout } from "@/hooks/useAuth";
import type { UserResponse as AuthUser } from "@/lib/types";

const TRANSITION_MS = 220;

/**
 * The mobile analog of the desktop sidebar's bottom section (profile row,
 * switch-mode link, Talk to Admin, appearance, log out) — same actions,
 * same hooks/components, just reached through the bottom nav's "More" tab.
 * A full-height side drawer (slides in from the right), not a bottom sheet —
 * mirrors how a "more" menu reads on most mobile apps. Mobile-only: there is
 * no desktop breakpoint variant since the sidebar already covers this.
 */
export function MobileMoreDrawer({
  user,
  isLenderMode,
  disabled,
  onClose,
}: {
  user?: AuthUser;
  isLenderMode: boolean;
  disabled: boolean;
  onClose: () => void;
}) {
  const logout = useLogout();
  const drawerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const initials =
    user?.full_name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "";

  // Mounted closed, flipped to open on the next frame so the transform
  // transition below actually has something to animate from.
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, TRANSITION_MS);
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) handleClose();
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("mousedown", handleClick);
    window.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("keydown", handleKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={clsx(
        "fixed inset-0 z-50 bg-black/60 transition-opacity ease-out",
        visible ? "opacity-100" : "opacity-0",
      )}
      style={{ transitionDuration: `${TRANSITION_MS}ms` }}
    >
      <div
        ref={drawerRef}
        className={clsx(
          "absolute inset-y-0 right-0 h-full w-[82%] max-w-[320px] bg-card border-l border-border shadow-2xl shadow-black/40 flex flex-col transition-transform ease-out",
          visible ? "translate-x-0" : "translate-x-full",
        )}
        style={{ transitionDuration: `${TRANSITION_MS}ms` }}
      >
        <div className="flex items-center justify-between h-14 px-4 border-b border-border flex-shrink-0">
          <h3 className="font-display font-semibold text-base text-foreground">More</h3>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground p-1 -m-1">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <Link
            href="/profile"
            onClick={handleClose}
            className={
              disabled
                ? "flex items-center gap-3 rounded-lg px-2 py-2.5 opacity-40 pointer-events-none"
                : "flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-secondary transition-colors"
            }
          >
            <div className="w-10 h-10 rounded-lg bg-secondary text-foreground flex items-center justify-center text-sm font-semibold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] text-foreground font-medium truncate">{user?.full_name}</p>
              <p className="text-[12px] text-muted-foreground truncate">
                {user?.is_verified ? "Verified" : "Unverified"}
              </p>
            </div>
          </Link>

          <div className="h-px bg-border my-3" />

          <div className="space-y-2">
            {disabled ? (
              <div
                title="Finish identity verification to unlock this"
                className="flex items-center gap-2.5 py-3 px-2 rounded-lg text-muted-foreground/40 text-[14px] font-medium cursor-not-allowed select-none"
              >
                <ArrowLeftRight size={16} />
                Switch to Lender View
              </div>
            ) : (
              <Link
                href={isLenderMode ? "/" : "/lender"}
                onClick={handleClose}
                className="flex items-center gap-2.5 py-3 px-2 rounded-lg text-foreground text-[14px] font-medium hover:bg-secondary transition-colors"
              >
                <ArrowLeftRight size={16} />
                {isLenderMode ? "Switch to Consumer View" : "Switch to Lender View"}
              </Link>
            )}

            <div className="flex items-center justify-between py-2 px-2">
              <span className="text-[14px] text-foreground">Appearance</span>
              <ThemeToggle />
            </div>

            <div className="px-2">
              <TalkToAdminButton variant="sidebar" />
            </div>
          </div>
        </div>

        <div className="p-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-border flex-shrink-0">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-destructive/25 bg-destructive/[0.06] text-destructive text-[14px] font-medium hover:bg-destructive/[0.12] transition-colors"
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
