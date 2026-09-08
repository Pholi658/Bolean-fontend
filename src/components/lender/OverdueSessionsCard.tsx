"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { useAllMySessionsAsLender } from "@/hooks/useSessions";

/**
 * Mobile-only KPI cell (see LenderDashboardContent) — how many issued
 * sessions are currently overdue, linking straight to the Sessions view
 * pre-filtered to that status. Styled distinctly from its neighboring KPI
 * cells (low-opacity warning orange, clickable) since it's an alert to act
 * on, not just a number to read.
 */
export function OverdueSessionsCard({ className }: { className?: string }) {
  const { data: sessions, isLoading } = useAllMySessionsAsLender();
  const overdueCount = sessions?.items.filter((s) => s.status === "OVERDUE").length ?? 0;

  if (isLoading) {
    return <div className={clsx("rounded-2xl border border-border/60 animate-pulse bg-foreground/[0.02]", className)} />;
  }

  return (
    <Link
      href="/lender/sessions?status=OVERDUE"
      className={clsx(
        "rounded-2xl border border-warning/25 bg-warning/[0.07] px-5 py-4 flex flex-col justify-center hover:bg-warning/[0.11] transition-colors",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10.5px] font-medium tracking-[0.09em] text-warning/90 uppercase">Overdue</p>
        <ChevronRight size={14} className="text-warning/70 flex-shrink-0" />
      </div>
      <p className="font-display font-semibold text-[28px] text-foreground leading-[1.1] mt-2">{overdueCount}</p>
      <span className="mt-2 text-[11.5px] flex items-center gap-1.5 text-warning">
        <AlertTriangle size={12} />
        {overdueCount === 1 ? "session" : "sessions"} overdue
      </span>
    </Link>
  );
}
