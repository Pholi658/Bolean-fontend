import { useState } from "react";
import { FileText, ChevronRight } from "lucide-react";
import { clsx } from "clsx";
import { StatusBadge, EmptyState } from "@/components/ui";
import { fmt, fmtDate } from "@/lib/utils";
import { CONSUMER_SESSIONS } from "@/lib/mock-data";
import type { Session } from "@/lib/types";

type ConsumerFilter = "ALL" | "ACTIVE" | "COMPLETED" | "DISPUTED";

const FILTERS: { id: ConsumerFilter; label: string }[] = [
  { id: "ALL",       label: "All" },
  { id: "ACTIVE",    label: "Active" },
  { id: "COMPLETED", label: "Completed" },
  { id: "DISPUTED",  label: "Disputed" },
];

export default function SessionsTab({
  onViewSession,
}: {
  onViewSession: (s: Session) => void;
}) {
  const [sessions] = useState(CONSUMER_SESSIONS);
  const [filter, setFilter] = useState<ConsumerFilter>("ALL");

  const filtered = sessions.filter((s) => {
    if (filter === "ALL") return true;
    if (filter === "ACTIVE") return ["ACTIVE", "OVERDUE", "PENDING", "LATE"].includes(s.status);
    if (filter === "COMPLETED") return s.status === "COMPLETED";
    if (filter === "DISPUTED") return s.status === "DISPUTED";
    return true;
  });

  const getCount = (f: ConsumerFilter) => {
    if (f === "ALL") return sessions.length;
    if (f === "ACTIVE") return sessions.filter((s) => ["ACTIVE","OVERDUE","PENDING","LATE"].includes(s.status)).length;
    if (f === "COMPLETED") return sessions.filter((s) => s.status === "COMPLETED").length;
    return sessions.filter((s) => s.status === "DISPUTED").length;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-xl text-foreground">My Sessions</h2>
        <span className="text-xs font-mono text-muted-foreground">{sessions.length} total</span>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 bg-secondary rounded-[4px]">
        {FILTERS.map((f) => {
          const count = getCount(f.id);
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={clsx(
                "flex-1 py-1.5 text-[10px] font-mono tracking-wider uppercase rounded-[3px] transition-colors flex items-center justify-center gap-1",
                filter === f.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
              {count > 0 && (
                <span className={clsx("text-[8px]", filter === f.id ? "opacity-70" : "opacity-50")}>
                  ({count})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<FileText size={28} className="text-muted-foreground" />}
          message={`No ${filter.toLowerCase()} sessions.`}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((session) => (
            <SessionRow key={session.id} session={session} onClick={() => onViewSession(session)} />
          ))}
        </div>
      )}
    </div>
  );
}

function SessionRow({ session, onClick }: { session: Session; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "w-full text-left bg-card border rounded-[4px] p-4 flex items-center gap-3 hover:bg-secondary transition-colors group",
        session.status === "DISPUTED" ? "border-[#F472B6]/25" :
        session.status === "OVERDUE"  ? "border-[#F97316]/25" :
        session.status === "DEFAULTED"? "border-[#EF4444]/20" :
        "border-border"
      )}
    >
      {/* Left: info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-[9px] font-mono text-muted-foreground">{session.id}</span>
          <StatusBadge status={session.status} />
        </div>
        <p className="text-sm font-medium text-foreground truncate">{session.lenderName}</p>
        <p className="text-xs text-muted-foreground">{session.transactionType}</p>
      </div>

      {/* Right: amount + due */}
      <div className="text-right flex-shrink-0">
        <p className="font-display font-bold text-foreground">{fmt(session.amount)}</p>
        <p className="text-[10px] text-muted-foreground font-mono mt-0.5">Due {fmtDate(session.dueDate)}</p>
      </div>

      {/* Arrow */}
      <ChevronRight size={15} className="text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity -mr-1" />
    </button>
  );
}
