import { Pin, CheckCircle2, StickyNote } from "lucide-react";
import { formatMaloti, formatTransactionType, formatRelativeTime } from "@/lib/format";
import type { PendingSessionEntry } from "@/lib/pending-sessions";

/** A lightweight "sent!" confirmation feed for this browser — styled like a
 * pinned sticky note beside the search, not a formal records table. There's
 * nothing to click through to (the backend doesn't return a session id on
 * creation); it's purely reassurance that recent submissions went out. */
export function PendingSessionsPanel({ entries }: { entries: PendingSessionEntry[] }) {
  return (
    <div className="relative -rotate-1 rounded-xl border border-warning/25 bg-warning/[0.05] p-5 shadow-lg shadow-black/20">
      <Pin size={14} className="absolute -top-2 left-5 text-warning rotate-[-20deg]" />

      <div className="flex items-center gap-1.5 mb-3.5">
        <StickyNote size={13} className="text-warning" />
        <p className="text-[12.5px] font-semibold text-foreground">Sessions you&apos;ve sent</p>
      </div>

      {entries.length === 0 ? (
        <p className="text-[12.5px] text-muted-foreground leading-relaxed">
          Sessions you create will show up here so you can confirm they went out.
        </p>
      ) : (
        <div className="space-y-2.5">
          {entries.map((entry, i) => (
            <div
              key={`${entry.borrowerPhone}-${entry.createdAt}-${i}`}
              className="rounded-lg bg-foreground/[0.04] border border-border/60 px-3 py-2.5"
            >
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-success flex-shrink-0" />
                <p className="text-[12.5px] text-foreground font-medium truncate">{entry.borrowerName}</p>
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-[11px] text-muted-foreground">
                  {formatTransactionType(entry.transactionType)} · {formatMaloti(entry.amount)}
                </p>
                <p className="text-[10.5px] text-muted-foreground flex-shrink-0">
                  {formatRelativeTime(entry.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
