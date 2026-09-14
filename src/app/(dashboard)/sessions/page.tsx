"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Inbox as InboxIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useMySessionsAsBorrower } from "@/hooks/useSessions";
import { formatDate, formatMaloti, formatTransactionType } from "@/lib/format";
import type { SessionResponse, SessionStatus } from "@/lib/types";

const FILTERS: Array<{ key: "ALL" | SessionStatus; label: string }> = [
  { key: "ALL", label: "All" },
  { key: "ACTIVE", label: "Active" },
  { key: "UNCONFIRMED", label: "Unconfirmed" },
  { key: "OVERDUE", label: "Overdue" },
  { key: "COMPLETED", label: "Completed" },
  { key: "LATE", label: "Late" },
  { key: "DISPUTED", label: "Disputed" },
];

function SessionRowMobile({ session, onOpen }: { session: SessionResponse; onOpen: () => void }) {
  return (
    <button onClick={onOpen} className="w-full text-left px-4 py-3.5 hover:bg-foreground/[0.015] transition-colors">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[14px] font-medium text-foreground truncate">
          {formatTransactionType(session.transaction_type)}
        </p>
        <StatusBadge status={session.status} />
      </div>
      <div className="flex items-center justify-between gap-3 mt-1.5">
        <p className="font-display font-semibold text-base text-foreground">{formatMaloti(session.amount)}</p>
        <p className="text-[12px] text-muted-foreground flex-shrink-0">Due {formatDate(session.due_date)}</p>
      </div>
    </button>
  );
}

export default function SessionsPage() {
  const router = useRouter();
  const { data: sessions, isLoading } = useMySessionsAsBorrower();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("ALL");

  const filtered = useMemo(() => {
    if (!sessions) return [];
    return filter === "ALL" ? sessions : sessions.filter((s) => s.status === filter);
  }, [sessions, filter]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 xl:p-10 max-w-[1320px] mx-auto space-y-4 lg:space-y-5 animate-[dashboard-section-in_400ms_ease-out_both]">
      <div>
        <h1 className="font-display font-semibold text-xl sm:text-2xl text-foreground">Sessions</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">Every credit session you&apos;ve borrowed.</p>
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

      {isLoading ? (
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
                  {["Type", "Amount", "Due Date", "Status"].map((h) => (
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
                {filtered.map((session) => (
                  <tr
                    key={session.id}
                    onClick={() => router.push(`/sessions/${session.id}`)}
                    className="border-b border-border/40 last:border-b-0 hover:bg-foreground/[0.015] transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5 text-sm text-foreground whitespace-nowrap">
                      {formatTransactionType(session.transaction_type)}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-medium text-foreground whitespace-nowrap">
                      {formatMaloti(session.amount)}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-foreground/85 whitespace-nowrap">
                      {formatDate(session.due_date)}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <StatusBadge status={session.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="lg:hidden divide-y divide-border/60 rounded-2xl border border-border/60 bg-card shadow-card overflow-hidden">
            {filtered.map((session) => (
              <SessionRowMobile key={session.id} session={session} onOpen={() => router.push(`/sessions/${session.id}`)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
