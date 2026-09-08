"use client";

import { useState } from "react";
import { Inbox as InboxIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { SessionDetailModal } from "@/components/inbox/SessionDetailModal";
import { SessionOfferRow, PermissionRequestRow } from "@/components/inbox/InboxRows";
import { useInboxItems } from "@/hooks/useInboxItems";
import { useInboxBadge } from "@/hooks/useInboxBadge";

/**
 * Full-page Inbox, reached from the mobile bottom nav's Inbox tab (desktop
 * keeps the sidebar flyout — see InboxPanel). Reuses the exact same data
 * hook and row components as that flyout.
 */
export default function InboxPage() {
  const { pendingSessions, pendingPermissions, isLoading, isEmpty } = useInboxItems();
  // Marks every currently-pending item "seen" for as long as this page is
  // mounted — the mobile-page equivalent of the flyout opening.
  useInboxBadge(true);
  const [detailSessionId, setDetailSessionId] = useState<string | null>(null);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-4 animate-[dashboard-section-in_400ms_ease-out_both]">
      <div>
        <h1 className="font-display font-semibold text-xl sm:text-2xl text-foreground">Inbox</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          Session offers and profile requests awaiting your response.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : isEmpty ? (
        <div className="rounded-2xl border border-border/60 flex flex-col items-center gap-2 py-20">
          <InboxIcon size={22} className="text-muted-foreground opacity-40" />
          <p className="text-sm text-muted-foreground">Nothing pending right now.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/60 overflow-hidden">
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

      {detailSessionId && (
        <SessionDetailModal sessionId={detailSessionId} onClose={() => setDetailSessionId(null)} />
      )}
    </div>
  );
}
