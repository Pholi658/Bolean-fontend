import type { SessionStatus } from "@/lib/types";

const STATUS_CONFIG: Record<SessionStatus, { color: string; label: string }> = {
  PENDING: { color: "var(--muted-foreground)", label: "Pending" },
  ACTIVE: { color: "var(--primary)", label: "Active" },
  UNCONFIRMED: { color: "var(--info)", label: "Unconfirmed" },
  OVERDUE: { color: "var(--destructive)", label: "Overdue" },
  COMPLETED: { color: "var(--success)", label: "Completed" },
  LATE: { color: "var(--warning)", label: "Late" },
  DEFAULTED: { color: "var(--destructive)", label: "Defaulted" },
  DISPUTED: { color: "var(--dispute)", label: "Disputed" },
  DECLINED: { color: "var(--muted-foreground)", label: "Declined" },
};

export function StatusBadge({ status }: { status: SessionStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: cfg.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color }} />
      {cfg.label}
    </span>
  );
}
