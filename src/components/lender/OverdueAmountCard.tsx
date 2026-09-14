import Link from "next/link";
import { clsx } from "clsx";
import { AlertTriangle, ArrowRight, CircleCheck, Sailboat } from "lucide-react";
import { formatMaloti } from "@/lib/format";

/**
 * The lender dashboard's lead KPI: money past its due date. Orange and
 * clickable (through to the overdue sessions list) while anything is
 * overdue; green with a slide-up "smooth sailing" reveal once it's all
 * clear. Both states keep the figure and the footer in the same spots, so
 * clearing the last overdue session reads as the card's content changing,
 * not the card being swapped out.
 *
 * `count` is overdue sessions (one borrower can have several), so it's
 * worded as payments, not borrowers.
 */
export function OverdueAmountCard({ amount, count, className }: { amount: number; count: number; className?: string }) {
  return amount > 0 ? (
    <OverdueState amount={amount} count={count} className={className} />
  ) : (
    <ClearState className={className} />
  );
}

const shell = "rounded-2xl border p-4 lg:p-7 flex flex-col min-w-0 transition-colors";
const eyebrow = "flex items-center gap-1.5 text-[10.5px] font-medium tracking-[0.09em] uppercase";
const figure =
  "font-display font-semibold text-[28px] lg:text-[44px] text-foreground leading-[1.15] tabular-nums mt-3 lg:mt-4";
const footer = "mt-auto pt-4 lg:pt-6";
const footerRow = "border-t pt-3 lg:pt-4 flex items-start gap-2 text-[11.5px] lg:text-[13px] leading-snug";

function OverdueState({ amount, count, className }: { amount: number; count: number; className?: string }) {
  return (
    <Link
      href="/lender/sessions?status=OVERDUE"
      className={clsx(
        shell,
        "group border-warning/30 bg-warning/[0.07] hover:border-warning/45 hover:bg-warning/[0.1]",
        className,
      )}
    >
      <p className={clsx(eyebrow, "text-warning")}>
        <AlertTriangle size={12} />
        Overdue
      </p>

      <p className={figure}>{formatMaloti(amount)}</p>
      <p className="text-[11.5px] lg:text-[13px] text-warning mt-1">
        {count} {count === 1 ? "payment" : "payments"} overdue
      </p>

      <div className={footer}>
        <span className={clsx(footerRow, "border-warning/20 font-medium text-warning")}>
          {/* the phone column fits ~20 characters; the full label wraps and strands the arrow */}
          <span className="lg:hidden">Review sessions</span>
          <span className="hidden lg:inline">Review overdue sessions</span>
          <ArrowRight size={14} className="flex-shrink-0 mt-px transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

function ClearState({ className }: { className?: string }) {
  return (
    <div className={clsx(shell, "kpi-reveal border-success/25 bg-success/[0.06]", className)}>
      <p className={clsx(eyebrow, "text-success")}>
        <CircleCheck size={12} />
        Overdue
      </p>

      {/* overflow-hidden line box = the mask the figure rolls up out of */}
      <p className={clsx(figure, "overflow-hidden")}>
        <span className="block animate-[kpi-roll-up_700ms_cubic-bezier(0.22,1,0.36,1)_80ms_both]">{formatMaloti(0)}</span>
      </p>
      <p className="text-[13px] lg:text-[15px] font-medium text-success mt-1 animate-[kpi-rise-in_600ms_cubic-bezier(0.22,1,0.36,1)_280ms_both]">
        Smooth sailing…
      </p>

      <div className={clsx(footer, "animate-[kpi-rise-in_600ms_cubic-bezier(0.22,1,0.36,1)_420ms_both]")}>
        <p className={clsx(footerRow, "border-success/20 text-muted-foreground text-balance")}>
          <Sailboat size={14} className="text-success flex-shrink-0 mt-px" />
          Every borrower is on schedule.
        </p>
      </div>
    </div>
  );
}
