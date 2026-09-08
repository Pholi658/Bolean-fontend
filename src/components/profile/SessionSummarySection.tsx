import Link from "next/link";
import { ChevronRight, Inbox as InboxIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate, formatMaloti, formatTransactionType } from "@/lib/format";
import type { SessionResponse } from "@/lib/types";

interface SummaryStat {
  label: string;
  value: string;
}

export function SessionSummarySection({
  stats,
  sessions,
  viewAllHref,
}: {
  stats: SummaryStat[];
  sessions: SessionResponse[];
  viewAllHref?: string;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <p className="font-display font-semibold text-xl text-foreground leading-none">{stat.value}</p>
            <p className="text-[11px] text-muted-foreground mt-1.5">{stat.label}</p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-display font-semibold text-[15px] text-foreground">Sessions</h2>
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="text-[12.5px] text-primary hover:underline flex items-center gap-1"
            >
              View all sessions <ChevronRight size={13} />
            </Link>
          )}
        </div>

        {sessions.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-14">
            <InboxIcon size={20} className="text-muted-foreground opacity-40" />
            <p className="text-sm text-muted-foreground">No sessions yet.</p>
          </div>
        ) : (
          <div>
            {sessions.slice(0, 8).map((session) => (
              <div
                key={session.id}
                className="flex items-center gap-4 px-5 py-3.5 border-b border-border/60 last:border-b-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground font-medium">
                    {formatTransactionType(session.transaction_type)}
                  </p>
                  <p className="text-[11.5px] text-muted-foreground mt-0.5">
                    Due {formatDate(session.due_date)}
                  </p>
                </div>
                <p className="font-display font-semibold text-sm text-foreground flex-shrink-0">
                  {formatMaloti(session.amount)}
                </p>
                <div className="w-[110px] flex-shrink-0">
                  <StatusBadge status={session.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
