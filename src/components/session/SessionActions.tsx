"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ReviewForm } from "@/components/session/ReviewForm";
import { useMarkSessionCompleted, useMarkSessionLate, useMarkSessionOverdue } from "@/hooks/useSessions";
import { useSubmitReview } from "@/hooks/useReviews";
import { getFriendlyErrorMessage } from "@/lib/errors";
import type { SessionStatus } from "@/lib/types";

type Action = "completed" | "late" | "overdue";

/**
 * Mirrors exactly what the backend allows a lender to do per status
 * (app/services/session_service.py): ACTIVE can only be closed out early,
 * UNCONFIRMED is the one status with all three outcomes open, OVERDUE can
 * still be walked back to a formal "late" record. Every other status is
 * immutable from the lender's side.
 */
const ACTIONS_BY_STATUS: Partial<Record<SessionStatus, Action[]>> = {
  ACTIVE: ["completed"],
  UNCONFIRMED: ["completed", "late", "overdue"],
  OVERDUE: ["late"],
};

const ACTION_LABEL: Record<Action, string> = {
  completed: "Mark Completed",
  late: "Mark Paid Late",
  overdue: "Mark Overdue",
};

/**
 * The backend only accepts a review once the session is actually COMPLETED
 * or LATE (app/services/review_service.py rejects anything else with a
 * 400), so the status change has to land first and the mandatory review
 * modal opens right after — not before, which is what would happen if this
 * read the same way the actions read out loud.
 */
const REQUIRES_REVIEW: Record<Action, boolean> = {
  completed: true,
  late: true,
  overdue: false,
};

export function SessionActions({
  sessionId,
  status,
  needsReview = false,
  size = "md",
}: {
  sessionId: string;
  status: SessionStatus;
  /** True when this session is already COMPLETED/LATE but has no review yet
   *  (e.g. the lender closed the tab last time before finishing it) — only
   *  the detail page can know this, since the list view doesn't carry the
   *  review field. Re-opens the mandatory modal without re-running the
   *  status change. */
  needsReview?: boolean;
  size?: "sm" | "md";
}) {
  const [pending, setPending] = useState<Action | "recover" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const markCompleted = useMarkSessionCompleted();
  const markLate = useMarkSessionLate();
  const markOverdue = useMarkSessionOverdue();
  const submitReview = useSubmitReview(sessionId);

  useEffect(() => {
    if (needsReview) setPending("recover");
  }, [needsReview]);

  const actions = ACTIONS_BY_STATUS[status] ?? [];
  const busy = markCompleted.isPending || markLate.isPending || markOverdue.isPending || submitReview.isPending;

  const runStatusChange = (action: Action) => {
    if (action === "completed") return markCompleted.mutateAsync(sessionId);
    if (action === "late") return markLate.mutateAsync(sessionId);
    return markOverdue.mutateAsync(sessionId);
  };

  const handleClick = async (action: Action, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);
    try {
      await runStatusChange(action);
      if (REQUIRES_REVIEW[action]) setPending(action);
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    }
  };

  const handleReviewSubmit = async (rating: number, msg: string) => {
    await submitReview.mutateAsync({ rating, msg });
    setPending(null);
  };

  if (actions.length === 0 && !pending) return null;

  return (
    <>
      {actions.length > 0 && (
        <div
          className={size === "sm" ? "flex flex-wrap gap-1.5" : "flex flex-col sm:flex-row gap-2.5"}
          onClick={(e) => e.stopPropagation()}
        >
          {actions.map((action) => (
            <Button
              key={action}
              size={size}
              variant={action === "completed" ? "primary" : "outline"}
              onClick={(e) => handleClick(action, e)}
              disabled={busy}
              className={size === "md" ? "flex-1" : undefined}
            >
              {ACTION_LABEL[action]}
            </Button>
          ))}
        </div>
      )}
      {error && <p className="text-[11.5px] text-destructive mt-2">{error}</p>}
      {pending && <ReviewForm onSubmit={handleReviewSubmit} />}
    </>
  );
}
