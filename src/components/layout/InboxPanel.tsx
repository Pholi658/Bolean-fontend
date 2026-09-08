"use client";

import { useEffect, useRef, useState } from "react";
import { Inbox as InboxIcon, X } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { SessionDetailModal } from "@/components/inbox/SessionDetailModal";
import { SessionOfferRow, PermissionRequestRow } from "@/components/inbox/InboxRows";
import { useInboxItems } from "@/hooks/useInboxItems";

/**
 * Desktop-only flyout beside the sidebar's Inbox row (mobile now uses a
 * dedicated full page at /inbox instead — see MobileBottomNav). Owns its
 * own outside-click/Escape handling so InboxNavItem doesn't have to.
 */
export function InboxPanel({ onClose }: { onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const { pendingSessions, pendingPermissions, isLoading, isEmpty } = useInboxItems();
  const [detailSessionId, setDetailSessionId] = useState<string | null>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClick);
    window.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  return (
    <>
      <div
        ref={panelRef}
        className="absolute left-full top-0 ml-2 w-[360px] max-h-[480px] overflow-y-auto rounded-xl bg-card border border-border shadow-2xl shadow-black/40 z-40"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border sticky top-0 bg-card">
          <h3 className="font-display font-semibold text-sm text-foreground">Inbox</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 -m-1">
            <X size={16} />
          </button>
        </div>

        {isLoading ? (
          <div className="p-4 space-y-2">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center gap-2 py-12">
            <InboxIcon size={20} className="text-muted-foreground opacity-40" />
            <p className="text-sm text-muted-foreground">Nothing pending right now.</p>
          </div>
        ) : (
          <div>
            {pendingSessions.map((session) => (
              <SessionOfferRow
                key={session.id}
                session={session}
                onOpenDetail={() => setDetailSessionId(session.id)}
              />
            ))}
            {pendingPermissions.map((permission) => (
              <PermissionRequestRow key={permission.id} permission={permission} />
            ))}
          </div>
        )}
      </div>

      {detailSessionId && (
        <SessionDetailModal sessionId={detailSessionId} onClose={() => setDetailSessionId(null)} />
      )}
    </>
  );
}
