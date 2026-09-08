"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useApproveSession, useRejectSession, useSessionDetail } from "@/hooks/useSessions";
import { formatDate, formatMaloti, formatTransactionType } from "@/lib/format";

/** Same light, blurred-not-blocked popup treatment as CreateSessionModal —
 * lets the borrower read the full offer (especially the description, where
 * the actual loan terms live) before accepting, without leaving the inbox
 * flyout behind it. */
export function SessionDetailModal({ sessionId, onClose }: { sessionId: string; onClose: () => void }) {
  const { data: session, isLoading } = useSessionDetail(sessionId);
  const approve = useApproveSession();
  const reject = useRejectSession();
  const busy = approve.isPending || reject.isPending;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  if (typeof document === "undefined") return null;

  const handleApprove = async () => {
    await approve.mutateAsync(sessionId);
    onClose();
  };
  const handleReject = async () => {
    await reject.mutateAsync(sessionId);
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 bg-black/25 backdrop-blur-md flex items-center justify-center z-[60] p-4"
      onClick={onClose}
      // Stops the native mousedown here entirely — without it, the
      // InboxPanel's own outside-click-to-close listener (on document)
      // sees every click inside this portalled modal as "outside" its
      // flyout and closes the whole inbox behind it.
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-card border border-border shadow-2xl shadow-black/50 p-7 sm:p-9 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05] transition-colors"
          aria-label="Close"
        >
          <X size={15} />
        </button>

        {isLoading || !session ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-24" />
            <Skeleton className="h-10" />
          </div>
        ) : (
          <>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Session Offer</p>
            <div className="flex items-center gap-2.5 mb-5">
              <h2 className="font-display font-semibold text-xl text-foreground">
                {formatTransactionType(session.transaction_type)}
              </h2>
              <StatusBadge status={session.status} />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5 pb-5 border-b border-border">
              <div>
                <p className="text-[10.5px] text-muted-foreground uppercase tracking-wide mb-1">From</p>
                <p className="text-[13.5px] text-foreground">{session.lender.full_name}</p>
                <p className="text-[11.5px] text-muted-foreground font-mono">{session.lender.phone_number}</p>
              </div>
              <div>
                <p className="text-[10.5px] text-muted-foreground uppercase tracking-wide mb-1">Amount</p>
                <p className="font-display font-semibold text-lg text-foreground">
                  {formatMaloti(session.amount)}
                </p>
              </div>
              <div>
                <p className="text-[10.5px] text-muted-foreground uppercase tracking-wide mb-1">Due date</p>
                <p className="text-[13.5px] text-foreground">{formatDate(session.due_date)}</p>
              </div>
              <div>
                <p className="text-[10.5px] text-muted-foreground uppercase tracking-wide mb-1">Offered</p>
                <p className="text-[13.5px] text-foreground">{formatDate(session.created_at)}</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-[10.5px] text-muted-foreground uppercase tracking-wide mb-1.5">
                Terms of this loan
              </p>
              <p className="text-[13.5px] text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {session.description || "No description provided."}
              </p>
            </div>

            {session.status === "PENDING" && (
              <div className="flex gap-2.5">
                <Button variant="outline" disabled={busy} onClick={handleReject} className="flex-1">
                  Decline
                </Button>
                <Button disabled={busy} loading={approve.isPending} onClick={handleApprove} className="flex-1">
                  Accept
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
