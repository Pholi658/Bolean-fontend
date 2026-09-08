"use client";

import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useApproveSession, useRejectSession } from "@/hooks/useSessions";
import { useApprovePermission, useRejectPermission } from "@/hooks/usePermissions";
import { getFriendlyErrorMessage } from "@/lib/errors";
import { formatDate, formatMaloti, formatTransactionType } from "@/lib/format";
import type { SessionResponse, PermissionItem } from "@/lib/types";

/** Shared row renderers for pending inbox items — used by both the desktop
 * flyout (InboxPanel) and the mobile full page so accept/decline behavior
 * never has two implementations. */
export function SessionOfferRow({ session, onOpenDetail }: { session: SessionResponse; onOpenDetail: () => void }) {
  const approve = useApproveSession();
  const reject = useRejectSession();
  const busy = approve.isPending || reject.isPending;
  const error = approve.error ?? reject.error;

  return (
    <div className="border-b border-border/60 last:border-b-0">
      <button
        type="button"
        onClick={onOpenDetail}
        className="w-full flex items-start gap-2 px-4 pt-3.5 text-left hover:bg-foreground/[0.02] transition-colors"
      >
        <div className="flex-1 min-w-0">
          <p className="text-[10.5px] text-muted-foreground uppercase tracking-wide mb-1">Session Offer</p>
          <p className="text-[12.5px] text-foreground leading-snug">
            {formatTransactionType(session.transaction_type)} — {formatMaloti(session.amount)}, due{" "}
            {formatDate(session.due_date)}
          </p>
        </div>
        <ChevronRight size={14} className="text-muted-foreground flex-shrink-0 mt-0.5" />
      </button>
      <div className="flex gap-2 px-4 pb-3.5 pt-2.5">
        <Button
          variant="outline"
          disabled={busy}
          onClick={(e) => {
            e.stopPropagation();
            reject.mutate(session.id);
          }}
          className="flex-1"
        >
          Decline
        </Button>
        <Button
          disabled={busy}
          loading={approve.isPending}
          onClick={(e) => {
            e.stopPropagation();
            approve.mutate(session.id);
          }}
          className="flex-1"
        >
          Accept
        </Button>
      </div>
      {error && <p className="text-[11.5px] text-destructive px-4 pb-3">{getFriendlyErrorMessage(error)}</p>}
    </div>
  );
}

export function PermissionRequestRow({ permission }: { permission: PermissionItem }) {
  const approve = useApprovePermission();
  const reject = useRejectPermission();
  const busy = approve.isPending || reject.isPending;
  const error = approve.error ?? reject.error;

  return (
    <div className="px-4 py-3.5 border-b border-border/60 last:border-b-0">
      <p className="text-[10.5px] text-muted-foreground uppercase tracking-wide mb-1">Profile Access Request</p>
      <p className="text-[12.5px] text-foreground mb-2.5 leading-snug">
        <span className="font-medium">{permission.requester_name}</span> ({permission.requester_phone}) wants
        to view your full profile and session history.
      </p>
      <div className="flex gap-2">
        <Button variant="outline" disabled={busy} onClick={() => reject.mutate(permission.id)} className="flex-1">
          Decline
        </Button>
        <Button disabled={busy} loading={approve.isPending} onClick={() => approve.mutate(permission.id)} className="flex-1">
          Approve
        </Button>
      </div>
      {error && <p className="text-[11.5px] text-destructive mt-2">{getFriendlyErrorMessage(error)}</p>}
    </div>
  );
}
