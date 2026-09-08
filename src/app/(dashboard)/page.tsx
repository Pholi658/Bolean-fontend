"use client";

import { Star, MessageSquareText, Bell, Clock, RefreshCw } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/Skeleton";
import { MetricStrip } from "@/components/dashboard/MetricStrip";
import { useConsumerAnalytics } from "@/hooks/useAnalytics";
import { useNotifications } from "@/hooks/useNotifications";
import { useCurrentUser } from "@/hooks/useAuth";
import { formatMaloti, formatDaysRemaining } from "@/lib/format";
import type { SessionUrgentItem, NotificationType } from "@/lib/types";

// Most users only ever see this once, right after registering.
const VerificationWorkspace = dynamic(() => import("@/components/biometric/VerificationWorkspace"), {
  ssr: false,
  loading: () => <div className="h-full max-w-[1100px] mx-auto" />,
});

const NOTIFICATION_ICON: Record<NotificationType, React.ComponentType<{ size?: number }>> = {
  upcoming_due: Clock,
  session_offer: Bell,
  profile_request: Bell,
  status_update: RefreshCw,
  review: Star,
};

function ReminderRow({ session, tone }: { session: SessionUrgentItem; tone: "warning" | "destructive" }) {
  const color = tone === "warning" ? "var(--warning)" : "var(--destructive)";
  const label = tone === "warning" ? "Due soon" : "Overdue";
  return (
    <Link
      href={`/sessions/${session.id}`}
      className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0 border-b border-border/50 last:border-b-0 hover:bg-foreground/[0.015] transition-colors -mx-2 px-2 rounded-lg"
    >
      <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ background: color }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color }}>
            {label}
          </span>
          <span className="text-[11.5px] text-muted-foreground">
            {formatDaysRemaining(session.days_remaining)}
          </span>
        </div>
        <p className="text-[13px] text-foreground/70 mt-0.5">Session {session.id.slice(0, 8)}</p>
      </div>
      <p className="font-display font-semibold text-lg text-foreground flex-shrink-0">
        {formatMaloti(session.amount)}
      </p>
    </Link>
  );
}

export default function DashboardHomePage() {
  const { data: user } = useCurrentUser();
  const verified = user?.is_biometrically_verified ?? false;

  const { data: analytics, isLoading, isError } = useConsumerAnalytics(verified);
  const { data: notifications } = useNotifications(1, 5, verified);

  if (!verified) {
    return <VerificationWorkspace />;
  }

  if (isError) {
    return (
      <div className="p-8 max-w-2xl">
        <p className="text-sm text-destructive">
          We couldn&apos;t load your dashboard right now. Please try again shortly.
        </p>
      </div>
    );
  }

  const pendingCount = analytics ? analytics.urgent_sessions.length + analytics.overdue_sessions.length : 0;
  const overdueCount = analytics?.overdue_sessions.length ?? 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 xl:p-10 max-w-[1320px] mx-auto space-y-6 lg:space-y-8 animate-[dashboard-section-in_400ms_ease-out_both]">
      <div>
        <h1 className="font-display font-semibold text-xl sm:text-2xl text-foreground">
          {user ? `Welcome back, ${user.full_name.split(" ")[0]}` : "Dashboard"}
        </h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          Here&apos;s what&apos;s happening with your account today.
        </p>
      </div>

      {/* Reputation sits above the KPIs, not buried below Reminders — it's
          the one number a consumer wants to check without scrolling. */}
      <div>
        <h2 className="font-display font-semibold text-[15px] text-foreground/90 mb-4">Reputation</h2>
        {isLoading || !analytics ? (
          <Skeleton className="h-20" />
        ) : (
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-end gap-2.5">
              <p className="font-display font-semibold text-[42px] text-foreground leading-none">
                {analytics.reputation.avg_rating.toFixed(1)}
              </p>
              <div className="flex items-center gap-0.5 mb-1.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    size={13}
                    className={
                      i <= Math.round(analytics.reputation.avg_rating)
                        ? "fill-primary text-primary"
                        : "fill-transparent text-border"
                    }
                  />
                ))}
              </div>
            </div>
            <div className="text-right space-y-1">
              <p className="text-[13px] text-foreground/80">
                {analytics.reputation.total_completed} completed sessions
              </p>
              {analytics.reputation.member_since && (
                <p className="text-[11.5px] text-muted-foreground">
                  Member since {analytics.reputation.member_since}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {isLoading || !analytics ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Skeleton className="h-[104px] sm:h-[128px]" />
          <Skeleton className="h-[104px] sm:h-[128px]" />
          <Skeleton className="h-[104px] sm:h-[128px]" />
        </div>
      ) : (
        <MetricStrip
          featuredIndex={1}
          metrics={[
            {
              label: "Total Transacted",
              value: formatMaloti(analytics.kpis.total_transacted),
              indicator: <span className="text-[11.5px] text-muted-foreground">Lifetime volume</span>,
            },
            {
              label: "Outstanding",
              value: formatMaloti(analytics.kpis.outstanding),
              indicator: (
                <span
                  className="text-[11.5px] flex items-center gap-1.5"
                  style={{ color: pendingCount > 0 ? "var(--warning)" : "var(--muted-foreground)" }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: pendingCount > 0 ? "var(--warning)" : "var(--muted-foreground)" }}
                  />
                  {pendingCount} active session{pendingCount === 1 ? "" : "s"}
                </span>
              ),
            },
            {
              label: "Sessions Lifetime",
              value: String(analytics.kpis.sessions_lifetime),
              indicator: (
                <span className="text-[11.5px] flex items-center gap-1.5 text-success">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  {analytics.kpis.total_completed} completed
                </span>
              ),
            },
          ]}
        />
      )}

      {/* Reminders keeps a real bordered surface — it demands attention.
          Full-width on its own now that Reputation has moved up top. */}
      <div className="rounded-2xl border border-border/70 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-display font-semibold text-[15px] text-foreground/90">Reminders</h2>
          {analytics && pendingCount > 0 && (
            <span
              className="text-[11.5px] font-medium"
              style={{ color: overdueCount > 0 ? "var(--destructive)" : "var(--warning)" }}
            >
              {pendingCount} pending
            </span>
          )}
        </div>
        {isLoading || !analytics ? (
          <div className="space-y-2 mt-4">
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
          </div>
        ) : pendingCount === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No upcoming or overdue sessions. You&apos;re all caught up.
          </p>
        ) : (
          <div className="mt-3">
            {analytics.overdue_sessions.map((s) => (
              <ReminderRow key={s.id} session={s} tone="destructive" />
            ))}
            {analytics.urgent_sessions.map((s) => (
              <ReminderRow key={s.id} session={s} tone="warning" />
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="font-display font-semibold text-[15px] text-foreground/90 mb-4">Recent Activity</h2>
        {!notifications ? (
          <div className="space-y-2">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        ) : notifications.items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No recent activity.</p>
        ) : (
          <div className="divide-y divide-border/50">
            {notifications.items.map((n) => {
              const Icon = NOTIFICATION_ICON[n.type] ?? MessageSquareText;
              return (
                <div key={n.id} className="flex items-center gap-3 py-3 hover:bg-foreground/[0.015] transition-colors -mx-2 px-2 rounded-lg">
                  <div className="w-7 h-7 rounded-full bg-foreground/5 flex items-center justify-center flex-shrink-0">
                    <Icon size={13} />
                  </div>
                  <p className="flex-1 text-[13px] text-foreground/85">{n.message}</p>
                  <span className="text-[11px] text-muted-foreground">{n.time}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
