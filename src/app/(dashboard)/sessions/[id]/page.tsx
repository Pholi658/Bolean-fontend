"use client";

import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Field } from "@/components/session/Field";
import { DisputeCard } from "@/components/session/DisputeCard";
import { useSessionDetail } from "@/hooks/useSessions";
import { useCurrentUser } from "@/hooks/useAuth";
import { formatDate, formatMaloti, formatTransactionType } from "@/lib/format";
import type { SessionStatus } from "@/lib/types";

const DISPUTABLE_STATUSES = new Set<SessionStatus>(["LATE", "DEFAULTED", "COMPLETED"]);

export default function SessionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, isLoading } = useSessionDetail(params.id);
  const { data: currentUser } = useCurrentUser();

  if (isLoading || !session) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 xl:p-10 max-w-[880px] mx-auto space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-[360px] rounded-2xl" />
      </div>
    );
  }

  const isBorrower = currentUser?.id === session.borrower_id;
  const disputeEligible = isBorrower && DISPUTABLE_STATUSES.has(session.status);

  return (
    <div className="p-4 sm:p-6 lg:p-8 xl:p-10 max-w-[880px] mx-auto space-y-5 lg:space-y-6 animate-[dashboard-section-in_400ms_ease-out_both]">
      <button
        onClick={() => router.push("/sessions")}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft size={15} /> Back to Sessions
      </button>

      <div className="rounded-2xl border border-border/60 p-4 sm:p-7">
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
          <Field label="Lender">
            <p className="text-sm text-foreground">{session.lender.full_name}</p>
          </Field>
          <Field label="Phone">
            <p className="text-sm text-foreground font-mono">{session.lender.phone_number}</p>
          </Field>
        </div>

        {session.description && (
          <div className={session.review ? "pb-6 mb-6 border-b border-border/60" : ""}>
            <Field label="Description">
              <p className="text-sm text-foreground/85 leading-relaxed">{session.description}</p>
            </Field>
          </div>
        )}

        {session.review && (
          <Field label="Lender's Review">
            <p className="text-sm text-foreground/85 leading-relaxed">{session.review.msg}</p>
          </Field>
        )}
      </div>

      <DisputeCard sessionId={session.id} dispute={session.dispute} eligible={disputeEligible} />
    </div>
  );
}
