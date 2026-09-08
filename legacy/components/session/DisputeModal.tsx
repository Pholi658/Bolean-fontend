import { useState } from "react";
import { X, Flag, AlertTriangle } from "lucide-react";
import { clsx } from "clsx";
import { StatusBadge, ConfirmDialog } from "@/components/ui";
import { fmt, fmtDate } from "@/lib/utils";
import type { Session } from "@/lib/types";

export default function DisputeModal({
  session, onSubmit, onClose,
}: {
  session: Session;
  onSubmit: (sessionId: string, issue: string) => void;
  onClose: () => void;
}) {
  const [issue, setIssue] = useState("");
  const [confirming, setConfirming] = useState(false);
  const MIN = 10;
  const MAX = 100;
  const len = issue.trim().length;
  const isValid = len >= MIN && len <= MAX;

  return (
    <div className="fixed inset-0 bg-black/88 flex items-end sm:items-center justify-center z-50 p-4 pb-0 sm:pb-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-t-[4px] sm:rounded-[4px] flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <Flag size={15} className="text-[#F472B6]" />
            <h3 className="font-display font-bold text-foreground">File a Dispute</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Session summary */}
          <div className="bg-secondary rounded-[4px] p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-muted-foreground">{session.id}</span>
              <StatusBadge status={session.status} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div>
                <p className="text-muted-foreground">Creditor</p>
                <p className="text-foreground mt-0.5">{session.lenderName ?? "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Amount</p>
                <p className="text-foreground mt-0.5 font-bold">{fmt(session.amount)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Type</p>
                <p className="text-foreground mt-0.5">{session.transactionType}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Due</p>
                <p className="text-foreground mt-0.5">{fmtDate(session.dueDate)}</p>
              </div>
            </div>
          </div>

          {/* Legal warning */}
          <div className="flex items-start gap-2 p-3 bg-[#1A0012] border border-[#F472B6]/30 rounded-[4px]">
            <AlertTriangle size={13} className="text-[#F472B6] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#F472B6] leading-relaxed">
              Disputes are reviewed by Bolean administrators. Filing a false or misleading dispute may result in account suspension.
            </p>
          </div>

          {/* Issue field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono tracking-widest text-muted-foreground uppercase">
                Issue Description
              </label>
              <span className={clsx(
                "text-[10px] font-mono transition-colors",
                issue.length > MAX ? "text-[#EF4444]" :
                len >= MIN ? "text-[#22C55E]" : "text-muted-foreground"
              )}>
                {issue.length}/{MAX}
              </span>
            </div>
            <textarea
              value={issue}
              onChange={(e) => setIssue(e.target.value.slice(0, MAX))}
              placeholder="Briefly describe the grounds for your dispute…"
              className="w-full px-3 py-3 bg-secondary border border-border rounded-[4px] text-foreground text-sm outline-none focus:border-primary transition-colors resize-none"
              rows={4}
            />
            {issue.length > 0 && len < MIN && (
              <p className="text-[10px] text-[#EF4444] font-mono">
                {MIN - len} more character{MIN - len !== 1 ? "s" : ""} required
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border flex-shrink-0">
          <button
            onClick={() => isValid && setConfirming(true)}
            disabled={!isValid}
            className={clsx(
              "w-full py-3 font-display font-bold text-sm rounded-[4px] tracking-wider uppercase transition-opacity flex items-center justify-center gap-2",
              isValid
                ? "bg-[#DC2626] text-white hover:opacity-90"
                : "bg-secondary text-muted-foreground cursor-not-allowed"
            )}
          >
            <Flag size={14} /> Submit Dispute
          </button>
        </div>
      </div>

      {confirming && (
        <ConfirmDialog
          title="Submit this dispute?"
          message="Your dispute will be reviewed by Bolean administrators. The session will be flagged as Disputed. This action cannot be undone."
          confirmLabel="Submit Dispute"
          onConfirm={() => { onSubmit(session.id, issue.trim()); setConfirming(false); }}
          onCancel={() => setConfirming(false)}
          danger
        />
      )}
    </div>
  );
}
