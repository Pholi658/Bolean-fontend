import { useState } from "react";
import { Inbox } from "lucide-react";
import { clsx } from "clsx";
import { ConfirmDialog, EmptyState } from "@/components/ui";
import { fmt, fmtDate } from "@/lib/utils";
import { INBOX_ITEMS } from "@/lib/mock-data";
import type { InboxItem } from "@/lib/types";

export default function InboxTab() {
  const [items, setItems] = useState<InboxItem[]>(INBOX_ITEMS);
  const [confirm, setConfirm] = useState<{ id: string; action: "accept" | "decline" } | null>(null);

  const doAction = (id: string, action: "accept" | "decline") => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, status: action === "accept" ? "accepted" : "declined" } : i
      )
    );
    setConfirm(null);
  };

  const pending = items.filter((i) => i.status === "pending").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-xl text-foreground">Inbox</h2>
        {pending > 0 && (
          <span className="text-[10px] font-mono text-primary bg-[#1C1800] px-2 py-1 rounded-[2px] tracking-wider">
            {pending} PENDING
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState icon={<Inbox size={28} className="text-muted-foreground" />} message="Your inbox is empty." />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <InboxCard
              key={item.id}
              item={item}
              onAction={(action) => item.status === "pending" && setConfirm({ id: item.id, action })}
            />
          ))}
        </div>
      )}

      {confirm && (
        <ConfirmDialog
          title={confirm.action === "accept" ? "Accept this offer?" : "Decline this offer?"}
          message={
            confirm.action === "accept"
              ? "By accepting, you agree to the terms of this credit session. An immutable record will be created on Bolean."
              : "The creditor will be notified that you declined. This cannot be undone."
          }
          confirmLabel={confirm.action === "accept" ? "Accept" : "Decline"}
          onConfirm={() => doAction(confirm.id, confirm.action)}
          onCancel={() => setConfirm(null)}
          danger={confirm.action === "decline"}
        />
      )}
    </div>
  );
}

function InboxCard({ item, onAction }: { item: InboxItem; onAction: (a: "accept" | "decline") => void }) {
  return (
    <div className={clsx(
      "bg-card border rounded-[4px] p-4 space-y-3 transition-opacity",
      item.status !== "pending" ? "border-border opacity-55" : "border-primary/30"
    )}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-foreground">{item.from}</p>
          <p className="text-[11px] text-muted-foreground font-mono">{item.fromPhone}</p>
        </div>
        <span className={clsx(
          "text-[10px] font-mono px-2 py-0.5 rounded-[2px] tracking-wider uppercase flex-shrink-0",
          item.type === "session_offer" ? "bg-[#1C1800] text-primary" : "bg-secondary text-muted-foreground"
        )}>
          {item.type === "session_offer" ? "Session Offer" : "Profile Request"}
        </span>
      </div>

      {item.type === "session_offer" && (
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div><p className="text-muted-foreground">Amount</p><p className="text-foreground font-bold mt-0.5">{fmt(item.amount!)}</p></div>
          <div><p className="text-muted-foreground">Due Date</p><p className="text-foreground mt-0.5">{fmtDate(item.dueDate!)}</p></div>
          <div><p className="text-muted-foreground">Type</p><p className="text-foreground mt-0.5">{item.transactionType}</p></div>
          {item.description && (
            <div className="col-span-2">
              <p className="text-muted-foreground">Description</p>
              <p className="text-foreground mt-0.5 leading-relaxed">{item.description}</p>
            </div>
          )}
        </div>
      )}

      {item.type === "profile_request" && (
        <p className="text-xs text-muted-foreground leading-relaxed">
          This creditor is requesting permission to view your private payment history and credit profile.
        </p>
      )}

      <p className="text-[10px] text-muted-foreground font-mono">{item.createdAt}</p>

      {item.status === "pending" ? (
        <div className="flex gap-2">
          <button
            onClick={() => onAction("decline")}
            className="flex-1 py-2 border border-border text-muted-foreground text-xs font-medium rounded-[4px] hover:border-[#DC2626] hover:text-[#DC2626] transition-colors"
          >
            Decline
          </button>
          <button
            onClick={() => onAction("accept")}
            className="flex-1 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-[4px] hover:opacity-90 transition-opacity"
          >
            Accept
          </button>
        </div>
      ) : (
        <div className={clsx(
          "text-[10px] font-mono text-center py-1.5 rounded-[2px] tracking-wider",
          item.status === "accepted" ? "text-[#22C55E] bg-[#001800]" : "text-[#6B7280] bg-[#1E1E1E]"
        )}>
          {item.status === "accepted" ? "✓ ACCEPTED" : "✕ DECLINED"}
        </div>
      )}
    </div>
  );
}
