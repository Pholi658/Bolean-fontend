import { useState } from "react";
import { TrendingUp, ChevronUp, ChevronDown, ChevronRight, AlertCircle } from "lucide-react";
import { clsx } from "clsx";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import { StatusBadge, Avatar, StatCard, EmptyState } from "@/components/ui";
import ReviewModal from "@/components/profile/ReviewModal";
import { fmt, fmtDate } from "@/lib/utils";
import { LENDER_ALL_SESSIONS, LENDER_STATS, MONTHLY_COLLECTIONS } from "@/lib/mock-data";
import type { Session, SessionFilter } from "@/lib/types";

type SortKey = "amount" | "dueDate" | "borrowerName";
type SortDir = "asc" | "desc";

const FILTERS: { id: SessionFilter; label: string }[] = [
  { id: "ALL",         label: "All" },
  { id: "ACTIVE",      label: "Active" },
  { id: "OVERDUE",     label: "Overdue" },
  { id: "LATE",        label: "Late" },
  { id: "COMPLETED",   label: "Completed" },
  { id: "DEFAULTED",   label: "Defaulted" },
  { id: "UNCONFIRMED", label: "Unconfirmed" },
];

export default function DashboardSection({
  onViewSession,
}: {
  onViewSession: (s: Session) => void;
}) {
  const [sessions, setSessions] = useState<Session[]>(LENDER_ALL_SESSIONS);
  const [filter, setFilter] = useState<SessionFilter>("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("dueDate");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [reviewTarget, setReviewTarget] = useState<Session | null>(null);

  const handleSort = (key: SortKey) => {
    setSortKey(key);
    setSortDir((d) => (sortKey === key ? (d === "asc" ? "desc" : "asc") : "asc"));
  };

  const handleReviewSubmit = (id: string, rating: number, msg: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, review: { rating, comment: msg, date: new Date().toISOString().split("T")[0] } }
          : s
      )
    );
    setReviewTarget(null);
  };

  const filtered = sessions.filter((s) => {
    if (filter === "ALL") return true;
    return s.status === filter;
  });

  const sorted = [...filtered].sort((a, b) => {
    let diff = 0;
    if (sortKey === "amount") diff = a.amount - b.amount;
    else if (sortKey === "dueDate") diff = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    else if (sortKey === "borrowerName") diff = a.borrowerName.localeCompare(b.borrowerName);
    return sortDir === "asc" ? diff : -diff;
  });

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (
      sortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />
    ) : null;

  const unconfirmedSessions = sessions.filter((s) => s.status === "UNCONFIRMED");
  const overdueSessions = sessions.filter((s) => s.status === "OVERDUE");
  const overdueAmount = overdueSessions.reduce((a, s) => a + s.amount, 0);

  return (
    <div className="space-y-5">
      {/* Unconfirmed alert banner */}
      {unconfirmedSessions.length > 0 && (
        <div className="flex items-start gap-3 p-4 bg-[#0A0014] border border-[#818CF8]/50 rounded-[4px]">
          <span className="relative flex h-2.5 w-2.5 flex-shrink-0 mt-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#818CF8] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#818CF8]" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#818CF8]">
              {unconfirmedSessions.length} session{unconfirmedSessions.length !== 1 ? "s" : ""} require status confirmation
            </p>
            <p className="text-xs text-[#818CF8]/65 mt-0.5 leading-relaxed">
              These sessions have passed their due date without an update. Bolean automatically flagged them as Unconfirmed.
              Please mark each as Completed, Late, or Defaulted.
            </p>
          </div>
          <button
            onClick={() => setFilter("UNCONFIRMED")}
            className="flex-shrink-0 px-3 py-1.5 text-[10px] font-mono font-bold text-[#818CF8] border border-[#818CF8]/40 rounded-[3px] hover:bg-[#818CF8]/10 transition-colors whitespace-nowrap"
          >
            Review Now
          </button>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Sessions Issued" value={LENDER_STATS.issuedTotal.toString()} sub="+2 this month" accent />
        <StatCard label="Total Distributed" value={fmt(LENDER_STATS.totalDistributed)} sub={`${fmt(LENDER_STATS.activeAmount)} active`} accent />
        <StatCard
          label="Overdue Sessions"
          value={overdueSessions.length.toString()}
          sub={overdueSessions.length === 0 ? "All on track" : "Immediate attention"}
          danger
        />
        <StatCard
          label="Overdue Amount"
          value={fmt(overdueAmount)}
          sub={`${overdueSessions.length} session${overdueSessions.length !== 1 ? "s" : ""} at risk`}
          danger
        />
      </div>

      {/* Monthly collections chart */}
      <div className="bg-card border border-border rounded-[4px] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Collections vs Disbursements</p>
            <p className="font-display font-bold text-base text-foreground">Mar – Aug 2026</p>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[10px] font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-1.5 rounded-sm bg-primary inline-block" />
              <span className="text-muted-foreground">Collected</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-1.5 rounded-sm bg-[#818CF8] inline-block" />
              <span className="text-muted-foreground">Disbursed</span>
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={MONTHLY_COLLECTIONS} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradCollected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C9A420" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#C9A420" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradDisbursed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#818CF8" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#818CF8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#6B6B6B", fontFamily: "monospace" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#6B6B6B", fontFamily: "monospace" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              content={({ active, payload, label }: any) => {
                if (!active || !payload?.length) return null;
                return (
                  <div style={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4, padding: "8px 12px" }}>
                    <p style={{ fontSize: 10, color: "#6B6B6B", fontFamily: "monospace", marginBottom: 4 }}>{label} 2026</p>
                    {payload.map((p: any) => (
                      <p key={p.dataKey} style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: p.color }}>
                        {p.dataKey === "collected" ? "Collected" : "Disbursed"}: M {p.value.toLocaleString()}
                      </p>
                    ))}
                  </div>
                );
              }}
            />
            <Area type="monotone" dataKey="collected" stroke="#C9A420" strokeWidth={2} fill="url(#gradCollected)" dot={false} activeDot={{ r: 4, fill: "#C9A420" }} />
            <Area type="monotone" dataKey="disbursed" stroke="#818CF8" strokeWidth={1.5} fill="url(#gradDisbursed)" strokeDasharray="4 2" dot={false} activeDot={{ r: 3, fill: "#818CF8" }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Sessions Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg text-foreground">Sessions</h2>
          <span className="text-[10px] font-mono text-muted-foreground">{sorted.length} shown</span>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
          {FILTERS.map((f) => {
            const count = f.id === "ALL" ? sessions.length : sessions.filter((s) => s.status === f.id).length;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={clsx(
                  "flex-shrink-0 px-3 py-1.5 text-[10px] font-mono tracking-wider rounded-[3px] transition-colors flex items-center gap-1.5",
                  filter === f.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                {f.label}
                {count > 0 && (
                  <span className={clsx("text-[8px]", filter === f.id ? "opacity-60" : "opacity-40")}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {sorted.length === 0 ? (
          <EmptyState icon={<TrendingUp size={24} className="text-muted-foreground" />}
            message={`No ${filter.toLowerCase()} sessions.`} />
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block border border-border rounded-[4px] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary">
                    <th className="text-left px-4 py-2.5 text-[10px] font-mono text-muted-foreground uppercase tracking-wider w-28">ID</th>
                    <th
                      className="text-left px-4 py-2.5 text-[10px] font-mono text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                      onClick={() => handleSort("borrowerName")}
                    >
                      <span className="flex items-center gap-1">Borrower <SortIcon k="borrowerName" /></span>
                    </th>
                    <th
                      className="text-right px-4 py-2.5 text-[10px] font-mono text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                      onClick={() => handleSort("amount")}
                    >
                      <span className="flex items-center justify-end gap-1">Amount <SortIcon k="amount" /></span>
                    </th>
                    <th className="text-left px-4 py-2.5 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Type</th>
                    <th
                      className="text-left px-4 py-2.5 text-[10px] font-mono text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                      onClick={() => handleSort("dueDate")}
                    >
                      <span className="flex items-center gap-1">Due Date <SortIcon k="dueDate" /></span>
                    </th>
                    <th className="text-left px-4 py-2.5 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="w-6" />
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((s) => (
                    <tr
                      key={s.id}
                      onClick={() => onViewSession(s)}
                      className={clsx(
                        "border-b border-border last:border-0 cursor-pointer transition-colors group",
                        s.status === "OVERDUE"      ? "bg-[#0C0600] hover:bg-[#140A00]" :
                        s.status === "DEFAULTED"    ? "bg-[#0A0000] hover:bg-[#120000]" :
                        s.status === "UNCONFIRMED"  ? "bg-[#080014] hover:bg-[#0E0020]" :
                        "hover:bg-secondary/60"
                      )}
                    >
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-mono text-muted-foreground">{s.id}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar name={s.borrowerName} size="sm" />
                          <div>
                            <p className="text-sm text-foreground font-medium">{s.borrowerName}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{s.borrowerPhone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className="font-display font-bold text-foreground">{fmt(s.amount)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-muted-foreground">{s.transactionType}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-mono text-foreground">{fmtDate(s.dueDate)}</p>
                        {s.daysRemaining !== undefined && (
                          <p className={clsx("text-[10px] font-mono",
                            s.daysRemaining < 0 ? "text-[#F97316]" :
                            s.daysRemaining <= 7 ? "text-[#EAB308]" : "text-muted-foreground"
                          )}>
                            {s.daysRemaining < 0 ? `${Math.abs(s.daysRemaining)}d overdue` : `${s.daysRemaining}d left`}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="px-4 py-3">
                        <ChevronRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-2">
              {sorted.map((s) => (
                <MobileSessionCard key={s.id} session={s} onClick={() => onViewSession(s)} />
              ))}
            </div>
          </>
        )}
      </div>

      {reviewTarget && (
        <ReviewModal session={reviewTarget} onSubmit={handleReviewSubmit} />
      )}
    </div>
  );
}

function MobileSessionCard({ session: s, onClick }: { session: Session; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "w-full text-left bg-card border rounded-[4px] p-4 flex items-center gap-3 hover:bg-secondary transition-colors group",
        s.status === "OVERDUE" ? "border-[#F97316]/30" : "border-border"
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1.5">
          <span className="text-[9px] font-mono text-muted-foreground">{s.id}</span>
          <StatusBadge status={s.status} />
        </div>
        <div className="flex items-center gap-2">
          <Avatar name={s.borrowerName} size="sm" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{s.borrowerName}</p>
            <p className="text-[10px] text-muted-foreground font-mono">{s.transactionType}</p>
          </div>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-display font-bold text-foreground">{fmt(s.amount)}</p>
        <p className="text-[10px] text-muted-foreground font-mono">{fmtDate(s.dueDate)}</p>
      </div>
      <ChevronRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
    </button>
  );
}
