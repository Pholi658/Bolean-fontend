"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DisputeForm } from "@/components/session/DisputeForm";
import { TalkToAdminButton } from "@/components/support/TalkToAdminButton";
import type { DisputeResponse } from "@/lib/types";

const STATUS_LABEL: Record<DisputeResponse["status"], string> = {
  PENDING: "Pending review",
  PUBLISHED: "Reviewed by admin",
  REJECTED: "Rejected",
};

const STATUS_COLOR: Record<DisputeResponse["status"], string> = {
  PENDING: "var(--warning)",
  PUBLISHED: "var(--info)",
  REJECTED: "var(--muted-foreground)",
};

/**
 * Always its own card, never folded into the general session info — a
 * dispute is a serious, rare action and needs to read as one, with a clear
 * confirmation once filed rather than silently disappearing back into the
 * page (see useRaiseDispute for why the backend alone can't be trusted to
 * reflect a freshly-filed PENDING dispute back to the borrower).
 */
export function DisputeCard({
  sessionId,
  dispute,
  eligible,
}: {
  sessionId: string;
  dispute: DisputeResponse | null;
  eligible: boolean;
}) {
  const [open, setOpen] = useState(false);

  if (!dispute && !eligible) return null;

  return (
    <div className="rounded-2xl border border-border/60 p-6">
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-full bg-dispute/10 flex items-center justify-center flex-shrink-0">
          <Flag size={16} className="text-dispute" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-[15px] text-foreground">
            {dispute ? "Dispute Filed" : "Something wrong with this session?"}
          </h3>

          {dispute ? (
            <>
              <div className="flex items-center gap-1.5 mt-1.5 mb-3">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: STATUS_COLOR[dispute.status] }}
                />
                <span className="text-[12.5px] font-medium" style={{ color: STATUS_COLOR[dispute.status] }}>
                  {STATUS_LABEL[dispute.status]}
                </span>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">&ldquo;{dispute.issue}&rdquo;</p>
              {dispute.status === "PUBLISHED" && dispute.plausibility && (
                <p className="text-[11.5px] text-muted-foreground mt-2.5">
                  Admin plausibility rating: <span className="text-foreground/80">{dispute.plausibility}</span>
                </p>
              )}
              {dispute.status === "PENDING" && (
                <p className="text-[11.5px] text-muted-foreground mt-2.5">
                  An admin hasn&apos;t reviewed this yet — you&apos;ll be notified once they do.
                </p>
              )}
              <div className="mt-3">
                <TalkToAdminButton variant="inline" />
              </div>
            </>
          ) : (
            <>
              <p className="text-[13px] text-muted-foreground leading-relaxed mt-1 mb-4">
                File a dispute if your lender left a review that was inaccurate, or spoke about you in an
                unfair or disrespectful way. An admin will look into it and publish a plausibility rating.
              </p>
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => setOpen(true)}>
                  <Flag size={14} /> File a Dispute
                </Button>
                <TalkToAdminButton variant="inline" />
              </div>
            </>
          )}
        </div>
      </div>

      {open && <DisputeForm sessionId={sessionId} onClose={() => setOpen(false)} />}
    </div>
  );
}
