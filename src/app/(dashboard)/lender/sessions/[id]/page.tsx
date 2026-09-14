"use client";

import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SessionActions } from "@/components/session/SessionActions";
import { Field } from "@/components/session/Field";
import { useSessionDetail } from "@/hooks/useSessions";
import { formatDate, formatMaloti, formatTransactionType } from "@/lib/format";

export default function LenderSessionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, isLoading } = useSessionDetail(params.id);

  if (isLoading || !session) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 xl:p-10 max-w-[880px] mx-auto space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-[360px] rounded-2xl" />
      </div>
    );
  }

  const needsReview =
    (session.status === "COMPLETED" || session.status === "LATE") && !session.review;

  return (
    <div className="p-4 sm:p-6 lg:p-8 xl:p-10 max-w-[880px] mx-auto space-y-5 lg:space-y-6 animate-[dashboard-section-in_400ms_ease-out_both]">
      <button
        onClick={() => router.push("/lender/sessions")}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft size={15} /> Back to Sessions
      </button>

      <div className="rounded-2xl border border-border/60 bg-card shadow-card p-4 sm:p-7">
        <div className="flex items-start justify-between gap-3 mb-6">
          <div className="min-w-0">
            <p className="text-[11px] font-mono text-muted-foreground mb-1">#{session.id.slice(0, 8)}</p>
            <h1 className="font-display font-semibold text-[22px] sm:text-[26px] text-foreground leading-tight">
              {formatTransactionType(session.transaction_type)}
            </h1>
          </div>
          <StatusBadge status={session.status} />
        </div>

        <div className="grid grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-4 sm:gap-y-5 pb-6 mb-6 border-b border-border/60">
          <Field label="Amount">
            <p className="font-display font-semibold text-2xl text-foreground">
              {formatMaloti(session.amount)}
            </p>
          </Field>
          <Field label="Due Date">
            <p className="text-sm text-foreground">{formatDate(session.due_date)}</p>
          </Field>
          <Field label="Borrower">
            <p className="text-sm text-foreground">{session.borrower.full_name}</p>
          </Field>
          <Field label="Phone">
            <p className="text-sm text-foreground font-mono">{session.borrower.phone_number}</p>
          </Field>
        </div>

        {session.description && (
          <div className="pb-6 mb-6 border-b border-border/60">
            <Field label="Description">
              <p className="text-sm text-foreground/85 leading-relaxed">{session.description}</p>
            </Field>
          </div>
        )}

        {session.review && (
          <div className="pb-6 mb-6 border-b border-border/60">
            <Field label="Your Review">
              <p className="text-sm text-foreground/85 leading-relaxed">{session.review.msg}</p>
            </Field>
          </div>
        )}

        {session.dispute && (
          <div className="pb-6 mb-6 border-b border-border/60">
            <div className="flex items-center gap-2 mb-1.5">
              <p className="text-[10.5px] font-medium tracking-[0.08em] uppercase text-muted-foreground">
                Borrower&apos;s Dispute
              </p>
              <span className="text-[11px] text-dispute font-medium">{session.dispute.status}</span>
            </div>
            <p className="text-sm text-foreground/85 leading-relaxed">{session.dispute.issue}</p>
          </div>
        )}

        <SessionActions sessionId={session.id} status={session.status} needsReview={needsReview} />
      </div>
    </div>
  );
}
