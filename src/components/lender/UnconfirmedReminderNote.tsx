"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { StickyNote, ShieldCheck, ArrowRight } from "lucide-react";
import { useAllMySessionsAsLender } from "@/hooks/useSessions";

/**
 * Unconfirmed sessions are the one status that silently erodes trust in the
 * platform if a lender forgets about them — the due date has passed but
 * nobody has told the record what actually happened. This is a deliberately
 * loud, always-visible callout (not another dismissible card) so it can't
 * be missed the way a buried table row could be.
 *
 * `variant="bare"` drops the rounded-card shape (used inside the mobile
 * chart/reminder slideshow, where the slide itself already provides the
 * edge-to-edge frame — a second nested card would double up on it).
 */
export function UnconfirmedReminderNote({ variant = "card" }: { variant?: "card" | "bare" }) {
  const { data: sessions, isLoading } = useAllMySessionsAsLender();
  const unconfirmedCount = sessions?.items.filter((s) => s.status === "UNCONFIRMED").length ?? 0;

  const shape = variant === "card" ? "rounded-2xl border" : "";
  const sizing = variant === "card" ? "min-h-[120px] lg:h-full lg:min-h-[176px]" : "h-full";

  if (isLoading) {
    return <div className={clsx(shape, "border-border/60", sizing, "animate-pulse bg-foreground/[0.02]")} />;
  }

  if (unconfirmedCount === 0) {
    return (
      <div
        className={clsx(
          shape,
          "border-success/25 bg-success/[0.05]",
          sizing,
          "p-5 flex flex-col justify-center items-start gap-2.5",
        )}
      >
        <ShieldCheck size={18} className="text-success" />
        <p className="text-[13px] font-medium text-foreground">All sessions confirmed</p>
        <p className="text-[11.5px] text-muted-foreground leading-relaxed">
          Nothing is waiting on a status update right now — your record is fully up to date.
        </p>
      </div>
    );
  }

  return (
    <div
      className={clsx(shape, "border-warning/30 bg-warning/[0.06]", sizing, "p-5 flex flex-col justify-between gap-3")}
    >
      <div className="flex items-start gap-2.5">
        <StickyNote size={18} className="text-warning flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-[13px] font-semibold text-foreground">
            {unconfirmedCount} session{unconfirmedCount === 1 ? "" : "s"} need{unconfirmedCount === 1 ? "s" : ""} a status update
          </p>
          <p className="text-[11.5px] text-muted-foreground leading-relaxed mt-1">
            Their due date has passed. Confirm whether each was paid, paid late, or gone unpaid — this is what
            keeps your record trustworthy for other lenders.
          </p>
        </div>
      </div>
      <Link
        href="/lender/sessions?status=UNCONFIRMED"
        className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-warning hover:gap-2.5 transition-all self-start"
      >
        Review unconfirmed sessions <ArrowRight size={13} />
      </Link>
    </div>
  );
}
