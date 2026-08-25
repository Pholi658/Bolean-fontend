import { useState } from "react";
import { ArrowLeft, Calendar, Clock, FileText, CheckCircle, AlertTriangle, XCircle, UserCheck } from "lucide-react";
import { clsx } from "clsx";
import { StatusBadge, StarRating, Avatar, WarningBanner } from "@/components/ui";
import ReviewModal from "@/components/profile/ReviewModal";
import { fmt, fmtDate } from "@/lib/utils";
import type { Session, SessionStatus } from "@/lib/types";

export default function SessionDetailSection({
  session: initial,
  onBack,
  onUpdateSession,
}: {
  session: Session;
  onBack: () => void;
  onUpdateSession: (id: string, status: SessionStatus, review?: { rating: number; comment: string }) => void;
}) {
  const [session, setSession] = useState(initial);
  const [pendingStatus, setPendingStatus] = useState<SessionStatus | null>(null);
  const [showReview, setShowReview] = useState(false);

  // Mark Late available only >= 1 full day past due
  const daysOver = session.daysRemaining !== undefined ? -session.daysRemaining : 0;
  const isPastDue = daysOver >= 1;

  const canMarkComplete = !["LATE", "DEFAULTED", "COMPLETED"].includes(session.status);
  const canMarkLate = isPastDue && !["LATE", "DEFAULTED", "COMPLETED"].includes(session.status);
  const canMarkDefaulted = daysOver >= 1 && !["DEFAULTED", "COMPLETED"].includes(session.status);

  const handleAction = (status: SessionStatus) => {
    setPendingStatus(status);
    setSession((s) => ({ ...s, status }));
    if (status === "COMPLETED" || status === "LATE") {
      setShowReview(true);
    } else {
      onUpdateSession(session.id, status);
    }
  };

  const handleReviewSubmit = (id: string, rating: number, msg: string) => {
    const review = { rating, comment: msg, date: new Date().toISOString().split("T")[0] };
    setSession((s) => ({ ...s, review }));
    setShowReview(false);
    onUpdateSession(id, pendingStatus ?? session.status, { rating, comment: msg });
    setPendingStatus(null);
  };

  return (
    <>
      <div className="max-w-2xl mx-auto space-y-3 pb-8">
        {/* Back */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <ArrowLeft size={15} /> Back to Sessions
        </button>

        {/* Hero */}
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

          {/* Borrower */}
          <div className="flex items-center gap-3 pt-3 border-t border-border">
            <Avatar name={session.borrowerName} size="sm" />
            <div>
              <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Borrower</p>
              <p className="text-sm font-semibold text-foreground">{session.borrowerName}</p>
              <p className="text-[10px] font-mono text-muted-foreground">{session.borrowerPhone}</p>
            </div>
          </div>
        </div>

        {/* Dates */}
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

        {/* Action panel */}
        {(canMarkComplete || canMarkLate || canMarkDefaulted) && (
          <div className="bg-card border border-border rounded-[4px] p-4 space-y-3">
            <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Update Session Status</p>

            {canMarkComplete && (
              <button
                onClick={() => handleAction("COMPLETED")}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#001800] border border-[#22C55E]/40 text-[#22C55E] text-sm font-bold rounded-[4px] hover:border-[#22C55E]/70 hover:bg-[#001800] transition-colors"
              >
                <CheckCircle size={15} /> Mark Completed
              </button>
            )}

            {canMarkLate && (
              <button
                onClick={() => handleAction("LATE")}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#1C1400] border border-[#EAB308]/40 text-[#EAB308] text-sm font-bold rounded-[4px] hover:border-[#EAB308]/70 transition-colors"
              >
                <AlertTriangle size={15} /> Mark Late
              </button>
            )}

            {canMarkDefaulted && (
              <button
                onClick={() => handleAction("DEFAULTED")}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#1C0000] border border-[#EF4444]/40 text-[#EF4444] text-sm font-bold rounded-[4px] hover:border-[#EF4444]/70 transition-colors"
              >
                <XCircle size={15} /> Mark Defaulted
              </button>
            )}

            {/* Note about 24h rule */}
            {(session.daysRemaining ?? 0) === 0 && (
              <div className="flex items-center gap-2 pt-1">
                <AlertTriangle size={11} className="text-[#EAB308] flex-shrink-0" />
                <p className="text-[10px] font-mono text-muted-foreground">
                  Late / Defaulted options become available 24 hours after the due date.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Completed / status terminal state note */}
        {["COMPLETED", "LATE", "DEFAULTED"].includes(session.status) && !session.review && (
          <div className="flex items-center gap-2 p-3 bg-[#0D0A00] border border-primary/20 rounded-[4px]">
            <UserCheck size={13} className="text-primary flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              Review pending — submit a review to complete this record.
            </p>
          </div>
        )}

        {/* Review */}
        {session.review && (
          <div className="bg-card border border-border rounded-[4px] p-4 space-y-2">
            <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Your Review</p>
            <div className="flex items-center gap-3">
              <StarRating rating={session.review.rating} />
              <span className="text-[10px] font-mono text-muted-foreground">{fmtDate(session.review.date)}</span>
            </div>
            <p className="text-sm text-foreground italic leading-relaxed">"{session.review.comment}"</p>
          </div>
        )}

        {/* Consumer dispute on record */}
        {session.dispute && (
          <div className="bg-[#1A0012] border border-[#F472B6]/20 rounded-[4px] p-4 space-y-1.5">
            <p className="text-[9px] font-mono text-[#F472B6] uppercase tracking-widest">Consumer Dispute on Record</p>
            <p className="text-sm text-foreground leading-relaxed">{session.dispute.issue}</p>
            <p className="text-[10px] font-mono text-muted-foreground">Filed {fmtDate(session.dispute.filedAt)}</p>
          </div>
        )}
      </div>

      {/* Required review — no close button */}
      {showReview && (
        <ReviewModal session={session} onSubmit={handleReviewSubmit} />
      )}
    </>
  );
}
