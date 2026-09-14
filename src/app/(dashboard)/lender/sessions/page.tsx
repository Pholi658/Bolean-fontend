"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Inbox as InboxIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SessionActions } from "@/components/session/SessionActions";
import { useAllMySessionsAsLender } from "@/hooks/useSessions";
import { formatDate, formatMaloti, formatTransactionType } from "@/lib/format";
import type { LenderSessionItem, SessionStatus } from "@/lib/types";

const FILTERS: Array<{ key: "ALL" | SessionStatus; label: string }> = [
  { key: "ALL", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "ACTIVE", label: "Active" },
  { key: "UNCONFIRMED", label: "Unconfirmed" },
  { key: "OVERDUE", label: "Overdue" },
  { key: "LATE", label: "Late" },
  { key: "COMPLETED", label: "Completed" },
  { key: "DISPUTED", label: "Disputed" },
  { key: "DEFAULTED", label: "Defaulted" },
  { key: "DECLINED", label: "Declined" },
];

function SessionRowMobile({ item, onOpen }: { item: LenderSessionItem; onOpen: () => void }) {
  return (
    <div className="px-4 py-3.5">
      <button onClick={onOpen} className="w-full text-left">
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
      </button>
      <div className="mt-2.5">
        <SessionActions sessionId={item.id} status={item.status} size="sm" />
      </div>
    </div>
  );
}

export default function LenderSessionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") as SessionStatus | null;
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>(
    initialStatus && FILTERS.some((f) => f.key === initialStatus) ? initialStatus : "ALL",
  );
  const { data: sessions, isLoading } = useAllMySessionsAsLender();

  const filtered = useMemo(() => {
    if (!sessions) return [];
    return filter === "ALL" ? sessions.items : sessions.items.filter((s) => s.status === filter);
  }, [sessions, filter]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 xl:p-10 max-w-[1320px] mx-auto space-y-4 lg:space-y-5 animate-[dashboard-section-in_400ms_ease-out_both]">
      <div>
        <h1 className="font-display font-semibold text-xl sm:text-2xl text-foreground">Session Management</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          Every credit session you&apos;ve issued, with the actions available at each stage.
        </p>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={
              f.key === filter
                ? "px-3.5 py-1.5 rounded-lg text-[12.5px] font-medium bg-primary/10 text-primary"
                : "px-3.5 py-1.5 rounded-lg text-[12.5px] text-muted-foreground hover:text-foreground transition-colors"
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading || !sessions ? (
        <div className="space-y-2">
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card shadow-card flex flex-col items-center gap-2 py-16">
          <InboxIcon size={22} className="text-muted-foreground opacity-40" />
          <p className="text-sm text-muted-foreground">No sessions in this view.</p>
        </div>
      ) : (
        <>
          <div className="hidden lg:block overflow-x-auto rounded-2xl border border-border/60 bg-card shadow-card">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-left border-b border-border/60">
                  {["Borrower", "Type", "Amount", "Due Date", "Status", "Actions"].map((h) => (
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
                {filtered.map((item) => (
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
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <SessionActions sessionId={item.id} status={item.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="lg:hidden divide-y divide-border/60 rounded-2xl border border-border/60 bg-card shadow-card overflow-hidden">
            {filtered.map((item) => (
              <SessionRowMobile key={item.id} item={item} onOpen={() => router.push(`/lender/sessions/${item.id}`)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
