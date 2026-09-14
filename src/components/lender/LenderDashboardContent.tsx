"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Pagination } from "@/components/ui/Pagination";
import { CollectedVsDisbursedChart } from "@/components/lender/CollectedVsDisbursedChart";
import { UnconfirmedReminderNote } from "@/components/lender/UnconfirmedReminderNote";
import { ChartReminderSlideshow } from "@/components/lender/ChartReminderSlideshow";
import { OverdueAmountCard } from "@/components/lender/OverdueAmountCard";
import { useLenderAnalytics } from "@/hooks/useAnalytics";
import { useMySessionsAsLender } from "@/hooks/useSessions";
import { formatDate, formatMaloti, formatTransactionType } from "@/lib/format";
import type { LenderSessionItem } from "@/lib/types";

/**
 * One of the three KPIs stacked beside the Overdue card. Narrow columns
 * (mobile, and lg where the sidebar eats the width) keep label-over-value
 * with no indicator line, so the stack stays shorter than the Overdue card
 * instead of stretching it into a hollow gap; from xl there's room to put
 * the value on the right and bring the indicator back beside the label.
 */
function StackedKpiCard({
  label,
  shortLabel,
  value,
  indicator,
  className,
}: {
  label: string;
  /** Mobile column is ~150px — long uppercase labels would truncate. */
  shortLabel?: string;
  value: string;
  indicator: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-border/60 bg-card shadow-card min-w-0 px-4 py-3 lg:px-6 lg:py-4 xl:px-7",
        "flex flex-col justify-center xl:flex-row xl:items-center xl:justify-between xl:gap-6",
        "hover:border-border hover:bg-foreground/[0.015] transition-colors",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="text-[10px] lg:text-[10.5px] font-medium tracking-[0.09em] text-muted-foreground uppercase truncate">
          <span className="lg:hidden">{shortLabel ?? label}</span>
          <span className="hidden lg:inline">{label}</span>
        </p>
        <div className="hidden xl:block mt-1.5">{indicator}</div>
      </div>
      <p className="font-display font-semibold text-[20px] lg:text-[26px] xl:text-[28px] text-foreground leading-[1.1] tabular-nums mt-1 lg:mt-1.5 xl:mt-0 flex-shrink-0">
        {value}
      </p>
    </div>
  );
}

function SessionRowMobile({ item, onOpen }: { item: LenderSessionItem; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="w-full text-left px-4 py-3.5 hover:bg-foreground/[0.015] transition-colors"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[14px] font-medium text-foreground truncate">{item.borrowerName}</p>
        <StatusBadge status={item.status} />
      </div>
      <p className="text-[12px] text-muted-foreground mt-0.5">{formatTransactionType(item.transactionType)}</p>
      <div className="flex items-center justify-between gap-3 mt-2">
        <p className="font-display font-semibold text-base text-foreground">{formatMaloti(item.amount)}</p>
        <p className="text-[12px] text-muted-foreground flex-shrink-0">
          {item.dueDate ? `Due ${formatDate(item.dueDate)}` : "—"}
        </p>
      </div>
      {item.daysRemaining !== null && (
        <p className="text-[11px] text-muted-foreground mt-1">
          {item.daysRemaining} day{item.daysRemaining === 1 ? "" : "s"} remaining
        </p>
      )}
    </button>
  );
}

export default function LenderDashboardContent() {
  const router = useRouter();
  const { data: analytics, isLoading: analyticsLoading } = useLenderAnalytics();
  const [page, setPage] = useState(1);
  const { data: sessions, isLoading: sessionsLoading } = useMySessionsAsLender(page);

  return (
    <div className="p-4 sm:p-6 lg:p-8 xl:p-10 max-w-[1320px] mx-auto space-y-6 lg:space-y-8 animate-[dashboard-section-in_400ms_ease-out_both]">
      <div>
        <h1 className="font-display font-semibold text-xl sm:text-2xl text-foreground">Lender Dashboard</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          Track issued credit and outstanding balances.
        </p>
      </div>

      {/* Overdue leads on its own full-height card; the three running totals
          stack beside it. Same composition at every width — only sizing and
          each card's internal layout adapt. Placement is explicit so the
          stack never auto-flows into the left column. */}
      <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:grid-cols-2 grid-rows-3 gap-3 lg:gap-4">
        {analyticsLoading || !analytics ? (
          <>
            <Skeleton className="col-start-1 row-start-1 row-span-3 rounded-2xl" />
            <Skeleton className="col-start-2 row-start-1 rounded-2xl h-[68px] lg:h-[84px] xl:h-[92px]" />
            <Skeleton className="col-start-2 row-start-2 rounded-2xl h-[68px] lg:h-[84px] xl:h-[92px]" />
            <Skeleton className="col-start-2 row-start-3 rounded-2xl h-[68px] lg:h-[84px] xl:h-[92px]" />
          </>
        ) : (
          <>
            <OverdueAmountCard
              className="col-start-1 row-start-1 row-span-3"
              amount={analytics.stats.overdue_amount}
              count={analytics.stats.overdue_count}
            />
            <StackedKpiCard
              className="col-start-2 row-start-1"
              label="Active Amount"
              value={formatMaloti(analytics.stats.active_amount)}
              indicator={
                <span className="text-[11.5px] flex items-center gap-1.5 text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Currently outstanding
                </span>
              }
            />
            <StackedKpiCard
              className="col-start-2 row-start-2"
              label="Total Distributed"
              shortLabel="Distributed"
              value={formatMaloti(analytics.stats.total_distributed)}
              indicator={<span className="text-[11.5px] text-muted-foreground">Collected to date</span>}
            />
            <StackedKpiCard
              className="col-start-2 row-start-3"
              label="Total Sessions Issued"
              shortLabel="Sessions Issued"
              value={String(analytics.stats.issued_total)}
              indicator={<span className="text-[11.5px] text-muted-foreground">Lifetime issued</span>}
            />
          </>
        )}
      </div>

      {/* Desktop: chart and reminder side by side, unchanged. Mobile: they
          used to just stack full-width — now they auto-play as a two-slide
          carousel instead (see ChartReminderSlideshow). */}
      <div className="hidden lg:grid grid-cols-2 gap-8 items-stretch">
        <div>
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="font-display font-semibold text-[15px] text-foreground/90">
                Collected vs Disbursed
              </h2>
              <p className="text-[11.5px] text-muted-foreground mt-0.5">Last 6 months</p>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-sm bg-primary inline-block" /> Disbursed
              </span>
              <span className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-sm bg-success inline-block" /> Collected
              </span>
            </div>
          </div>
          {analyticsLoading || !analytics ? (
            <Skeleton className="h-[176px] mt-3" />
          ) : (
            <CollectedVsDisbursedChart data={analytics.monthly_collections} />
          )}
        </div>

        <UnconfirmedReminderNote />
      </div>

      {analyticsLoading || !analytics ? (
        <Skeleton className="lg:hidden -mx-4 h-[224px]" />
      ) : (
        <ChartReminderSlideshow monthlyCollections={analytics.monthly_collections} />
      )}

      <div>
        <h2 className="font-display font-semibold text-[15px] text-foreground/90 mb-4">
          Recent Credit Sessions
        </h2>
        {sessionsLoading || !sessions ? (
          <div className="space-y-2">
            <Skeleton className="h-11" />
            <Skeleton className="h-11" />
          </div>
        ) : sessions.items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-10 text-center">No sessions issued yet.</p>
        ) : (
          <>
            {/* Desktop: full six-column table. Mobile: the same session
                data recomposed as a scannable card list below. */}
            <div className="hidden lg:block overflow-x-auto rounded-2xl border border-border/60 bg-card shadow-card">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-left border-b border-border/60">
                    {["Borrower", "Type", "Amount", "Due Date", "Days Remaining", "Status"].map((h) => (
                      <th
                        key={h}
                        className="text-[10.5px] font-medium tracking-[0.08em] uppercase text-muted-foreground px-5 py-3"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sessions.items.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => router.push(`/lender/sessions/${item.id}`)}
                      className="border-b border-border/40 last:border-b-0 hover:bg-foreground/[0.015] transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-3.5 text-sm text-foreground whitespace-nowrap">{item.borrowerName}</td>
                      <td className="px-5 py-3.5 text-sm text-foreground/85 whitespace-nowrap">
                        {formatTransactionType(item.transactionType)}
                      </td>
                      <td className="px-5 py-3.5 text-sm font-medium text-foreground whitespace-nowrap">
                        {formatMaloti(item.amount)}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-foreground/85 whitespace-nowrap">
                        {item.dueDate ? formatDate(item.dueDate) : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-foreground/85 whitespace-nowrap">
                        {item.daysRemaining ?? "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={item.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden divide-y divide-border/60 rounded-2xl border border-border/60 bg-card shadow-card overflow-hidden">
              {sessions.items.map((item) => (
                <SessionRowMobile key={item.id} item={item} onOpen={() => router.push(`/lender/sessions/${item.id}`)} />
              ))}
            </div>
          </>
        )}
        {sessions && <Pagination page={sessions.page} totalPages={sessions.total_pages} onChange={setPage} />}
      </div>
    </div>
  );
}
