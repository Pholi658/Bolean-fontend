import { AlertTriangle, Clock, Star, RefreshCw, Bell, ArrowRight, Shield, TrendingUp, Wallet } from "lucide-react";
import { clsx } from "clsx";
import { StarRating } from "@/components/ui";
import { fmt, fmtDate } from "@/lib/utils";
import { CURRENT_USER, CONSUMER_SESSIONS, ACTIVITY_FEED } from "@/lib/mock-data";
import type { ConsumerTab } from "@/lib/types";

interface HomeTabProps {
  onSwitchToLender: () => void;
  onTabChange: (tab: ConsumerTab) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  due:    <Clock size={11} className="text-[#F97316]" />,
  offer:  <Bell size={11} className="text-primary" />,
  review: <Star size={11} className="text-primary" />,
  status: <RefreshCw size={11} className="text-muted-foreground" />,
};

export default function HomeTab({ onSwitchToLender, onTabChange }: HomeTabProps) {
  const urgentSessions = CONSUMER_SESSIONS.filter(
    (s) => s.status === "ACTIVE" && s.daysRemaining !== undefined && s.daysRemaining <= 3 && s.daysRemaining >= 0
  );
  const overdueSessions = CONSUMER_SESSIONS.filter((s) => s.status === "OVERDUE");

  // Consumer financial KPIs
  const totalTransacted = CONSUMER_SESSIONS.reduce((sum, s) => sum + s.amount, 0);
  const outstanding = CONSUMER_SESSIONS
    .filter((s) => ["ACTIVE", "OVERDUE", "LATE"].includes(s.status))
    .reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div>
        <h1 className="font-display font-bold text-2xl text-foreground">
          Welcome back, {CURRENT_USER.name.split(" ")[0]}
        </h1>
        {CURRENT_USER.isVerified && (
          <div className="flex items-center gap-1.5 mt-1">
            <Shield size={11} className="text-primary" />
            <span className="text-[10px] font-mono text-primary tracking-widest">VERIFIED ACCOUNT</span>
          </div>
        )}
      </div>

      {/* Financial KPI cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#0D0A00] border border-primary/30 rounded-[4px] p-4 space-y-1">
          <div className="flex items-center gap-1.5">
            <TrendingUp size={12} className="text-primary" />
            <p className="text-[9px] font-mono text-primary uppercase tracking-widest">Total Transacted</p>
          </div>
          <p className="font-display font-black text-2xl text-primary leading-none">{fmt(totalTransacted)}</p>
          <p className="text-[10px] font-mono text-muted-foreground">{CONSUMER_SESSIONS.length} sessions lifetime</p>
        </div>
        <div className={clsx(
          "border rounded-[4px] p-4 space-y-1",
          outstanding > 0 ? "bg-[#1C0E00] border-[#F97316]/35" : "bg-card border-border"
        )}>
          <div className="flex items-center gap-1.5">
            <Wallet size={12} className={outstanding > 0 ? "text-[#F97316]" : "text-muted-foreground"} />
            <p className={clsx("text-[9px] font-mono uppercase tracking-widest", outstanding > 0 ? "text-[#F97316]" : "text-muted-foreground")}>Outstanding</p>
          </div>
          <p className={clsx("font-display font-black text-2xl leading-none", outstanding > 0 ? "text-[#F97316]" : "text-foreground")}>
            {fmt(outstanding)}
          </p>
          <p className="text-[10px] font-mono text-muted-foreground">
            {outstanding > 0 ? "To be repaid" : "All clear"}
          </p>
        </div>
      </div>

      {/* ── Urgent Reminders ── */}
      {(urgentSessions.length > 0 || overdueSessions.length > 0) && (
        <div className="space-y-2">
          <p className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">⚠ Payment Reminders</p>

          {overdueSessions.map((s) => (
            <div
              key={s.id}
              onClick={() => onTabChange("sessions")}
              className="flex items-start gap-3 p-3 bg-[#1C0E00] border border-[#F97316]/40 rounded-[4px] cursor-pointer hover:border-[#F97316]/70 transition-colors"
            >
              <AlertTriangle size={15} className="text-[#F97316] flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#F97316] font-medium">Overdue · {s.lenderName}</p>
                <p className="text-xs text-[#F97316]/70 font-mono mt-0.5">
                  {fmt(s.amount)} — was due {fmtDate(s.dueDate)}
                </p>
              </div>
              <span className="text-[10px] font-mono text-[#F97316] flex-shrink-0">{Math.abs(s.daysRemaining!)}d ago</span>
            </div>
          ))}

          {urgentSessions.map((s) => (
            <div
              key={s.id}
              onClick={() => onTabChange("sessions")}
              className="flex items-start gap-3 p-3 bg-[#1C1400] border border-[#EAB308]/40 rounded-[4px] cursor-pointer hover:border-[#EAB308]/70 transition-colors"
            >
              <Clock size={15} className="text-[#EAB308] flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#EAB308] font-medium">Due soon · {s.lenderName}</p>
                <p className="text-xs text-[#EAB308]/70 font-mono mt-0.5">
                  {fmt(s.amount)} — due {fmtDate(s.dueDate)}
                </p>
              </div>
              <span className="text-[10px] font-mono text-[#EAB308] flex-shrink-0">
                {s.daysRemaining === 0 ? "Today" : `${s.daysRemaining}d left`}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Reputation Card */}
      <div className="border border-primary/40 rounded-[4px] p-4 bg-[#0D0A00] space-y-3">
        <span className="text-[10px] font-mono text-primary tracking-widest uppercase">Reputation Summary</span>
        <div className="flex items-center gap-5 flex-wrap">
          <div>
            <StarRating rating={CURRENT_USER.avgRating} />
            <p className="text-[10px] text-muted-foreground font-mono mt-0.5">Avg. Rating</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div>
            <p className="font-display font-bold text-2xl text-foreground">{CURRENT_USER.totalCompleted}</p>
            <p className="text-[10px] text-muted-foreground font-mono">Completed</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div>
            <p className="text-sm text-foreground font-mono">{CURRENT_USER.memberSince}</p>
            <p className="text-[10px] text-muted-foreground font-mono">Member Since</p>
          </div>
        </div>
      </div>

      {/* Switch to Lender */}
      {CURRENT_USER.isVerified && (
        <button
          onClick={onSwitchToLender}
          className="w-full py-3 border border-primary text-primary font-display font-bold text-sm rounded-[4px] hover:bg-[#0D0A00] transition-colors flex items-center justify-center gap-2 tracking-wider uppercase"
        >
          Switch to Lender View <ArrowRight size={15} />
        </button>
      )}

      {/* Activity Feed */}
      <div className="space-y-2">
        <p className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">Recent Activity</p>
        {ACTIVITY_FEED.map((item) => (
          <div key={item.id} className="flex items-start gap-3 p-3 bg-card border border-border rounded-[4px]">
            <div className="w-6 h-6 rounded-[2px] bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
              {ICON_MAP[item.icon] ?? <RefreshCw size={11} className="text-muted-foreground" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground leading-snug">{item.message}</p>
              <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
