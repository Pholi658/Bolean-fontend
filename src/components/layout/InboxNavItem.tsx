"use client";

import { Inbox } from "lucide-react";
import { InboxPanel } from "@/components/layout/InboxPanel";
import { PulsingBadge } from "@/components/ui/PulsingBadge";
import { useInboxBadge } from "@/hooks/useInboxBadge";
import { useUIStore } from "@/store/ui-store";

/** Replaces a plain nav Link — Inbox opens as a small flyout beside the
 * sidebar (Facebook-style mini window), not a full-page navigation. Open
 * state lives in a shared store so a notification click elsewhere can open
 * this flyout too, not just this button. */
export function InboxNavItem({ disabled = false }: { disabled?: boolean }) {
  const open = useUIStore((s) => s.inboxOpen);
  const setOpen = useUIStore((s) => s.setInboxOpen);
  const { hasUnseen } = useInboxBadge(open, disabled);

  if (disabled) {
    return (
      <div
        title="Finish identity verification to unlock this"
        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] text-muted-foreground/40 cursor-not-allowed select-none"
      >
        <Inbox size={16} />
        <span>Inbox</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={
          open
            ? "relative w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] bg-primary/10 text-primary font-medium"
            : "relative w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] text-muted-foreground hover:text-foreground transition-colors"
        }
      >
        {open && <span className="absolute right-0 top-2 bottom-2 w-0.5 bg-primary rounded-full" />}
        <span className="relative flex-shrink-0">
          <Inbox size={16} />
          {hasUnseen && <PulsingBadge className="-top-1 -right-1" />}
        </span>
        <span>Inbox</span>
      </button>
      {open && <InboxPanel onClose={() => setOpen(false)} />}
    </div>
  );
}
