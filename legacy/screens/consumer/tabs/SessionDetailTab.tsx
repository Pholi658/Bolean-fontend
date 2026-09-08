import { useState } from "react";
import { ArrowLeft, Building2, Calendar, Clock, FileText, Flag } from "lucide-react";
import { clsx } from "clsx";
import { StatusBadge, StarRating, PlausibilityBadge, WarningBanner } from "@/components/ui";
import DisputeModal from "@/components/session/DisputeModal";
import { fmt, fmtDate } from "@/lib/utils";
import type { Session } from "@/lib/types";

export default function SessionDetailTab({
  session: initial,
  onBack,
}: {
  session: Session;
  onBack: () => void;
}) {
  const [session, setSession] = useState(initial);
  const [showDispute, setShowDispute] = useState(false);

  const canDispute = ["DEFAULTED", "LATE", "OVERDUE"].includes(session.status) && !session.dispute;

  const handleDisputeSubmit = (_id: string, issue: string) => {
    setSession((s) => ({
      ...s,
      status: "DISPUTED",
      dispute: { issue, filedAt: new Date().toISOString().split("T")[0], plausibility: "MEDIUM" },
    }));
    setShowDispute(false);
  };

  const isPastDue = (session.daysRemaining ?? 0) < 0;

  return (
    <>
      <div className="space-y-3 pb-8">
        {/* Back */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <ArrowLeft size={15} /> Back to Sessions
        </button>

        {/* Hero card */}
        <div className="bg-card border border-border rounded-[4px] p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-mono text-muted-foreground mb-1.5 tracking-wider">{session.id}</p>
              <StatusBadge status={session.status} />
            </div>
            <div className="text-right">
              <p className="font-display font-black text-3xl text-foreground leading-none">{fmt(session.amount)}</p>
              <p className="text-[10px] font-mono text-muted-foreground mt-1">{session.transactionType}</p>
            </div>
          </div>

          {/* Lender */}
          <div className="flex items-center gap-2.5 pt-3 border-t border-border">
            <div className="w-8 h-8 rounded-[3px] bg-[#1A1400] border border-primary/20 flex items-center justify-center flex-shrink-0">
              <Building2 size={13} className="text-primary" />
            </div>
            <div>
              <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Creditor / Lender</p>
              <p className="text-sm font-semibold text-foreground">{session.lenderName ?? "—"}</p>
            </div>
          </div>
        </div>

        {/* Dates row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border border-border rounded-[4px] p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Clock size={11} className="text-muted-foreground" />
              <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Created</p>
            </div>
            <p className="text-sm font-mono text-foreground">{fmtDate(session.createdAt)}</p>
          </div>
          <div className={clsx(
            "bg-card border rounded-[4px] p-4",
            isPastDue ? "border-[#F97316]/45" : "border-border"
          )}>
            <div className="flex items-center gap-1.5 mb-2">
              <Calendar size={11} className={isPastDue ? "text-[#F97316]" : "text-muted-foreground"} />
              <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Due Date</p>
            </div>
            <p className="text-sm font-mono text-foreground">{fmtDate(session.dueDate)}</p>
            {session.daysRemaining !== undefined && (
              <p className={clsx("text-[10px] font-mono mt-1",
                session.daysRemaining < 0 ? "text-[#F97316]" :
                session.daysRemaining <= 3 ? "text-[#EAB308]" : "text-muted-foreground"
              )}>
                {session.daysRemaining < 0
                  ? `${Math.abs(session.daysRemaining)}d overdue`
                  : session.daysRemaining === 0 ? "Due today"
                  : `${session.daysRemaining}d remaining`}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="bg-card border border-border rounded-[4px] p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <FileText size={11} className="text-muted-foreground" />
            <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Description</p>
          </div>
          <p className="text-sm text-foreground leading-relaxed">{session.description}</p>
        </div>

        {/* Lender's Review */}
        {session.review && (
          <div className="bg-card border border-border rounded-[4px] p-4 space-y-2">
            <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Lender Review</p>
            <div className="flex items-center gap-3">
              <StarRating rating={session.review.rating} />
              <span className="text-[10px] font-mono text-muted-foreground">{fmtDate(session.review.date)}</span>
            </div>
            <p className="text-sm text-foreground italic leading-relaxed">"{session.review.comment}"</p>
            {session.review.reviewerName && (
              <p className="text-[10px] font-mono text-muted-foreground">— {session.review.reviewerName}</p>
            )}
          </div>
        )}

        {/* Your Dispute */}
        {session.dispute && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Your Dispute</p>
              <PlausibilityBadge rating={session.dispute.plausibility} />
            </div>
            <div className="bg-[#1A0012] border border-[#F472B6]/20 rounded-[4px] p-4">
              <p className="text-sm text-foreground leading-relaxed">{session.dispute.issue}</p>
              <p className="text-[10px] font-mono text-muted-foreground mt-2">
                Filed {fmtDate(session.dispute.filedAt)}
              </p>
            </div>
          </div>
        )}

        {/* Dispute CTA */}
        {canDispute && (
          <div className="space-y-3 pt-1">
            <WarningBanner message="If you believe this session status is incorrect, you may file a formal dispute with Bolean for review." />
            <button
              onClick={() => setShowDispute(true)}
              className="w-full flex items-center justify-center gap-2 py-3 border border-[#F472B6]/40 text-[#F472B6] text-sm font-medium rounded-[4px] hover:bg-[#1A0012] transition-colors"
            >
              <Flag size={14} /> File a Dispute
            </button>
          </div>
        )}
      </div>

      {showDispute && (
        <DisputeModal
          session={session}
          onSubmit={handleDisputeSubmit}
          onClose={() => setShowDispute(false)}
        />
      )}
    </>
  );
}
