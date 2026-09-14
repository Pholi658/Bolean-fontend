"use client";

import { useEffect, useRef } from "react";
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

/**
 * Drives the hero's scroll response by mutating styles directly via refs on
 * every scroll frame, instead of routing through React state — a
 * setState-per-scroll-event here would re-render the whole dashboard tree
 * on every frame. Two things happen as the sheet scrolls up over the hero:
 *
 * 1. The image darkens slightly (a scroll-linked scrim on top of the
 *    fixed gradient) so it reads as receding into the surface that's
 *    covering it.
 * 2. The Reputation row's two halves — the rating on the left, "completed
 *    sessions"/"member since" on the right — slide toward each other and
 *    fade, like a shutter/iris closing. This is deliberately finished
 *    (closeDistance === 0% progress fully applied) well before the sheet's
 *    physical top edge would otherwise reach that row: without it, the
 *    opaque sheet just hard-clips straight across the text mid-scroll,
 *    which reads as a rendering glitch rather than a designed transition.
 *    Resolving the motion early turns that unavoidable clip into a
 *    deliberate "the numbers close up and tuck away" beat instead.
 *
 * The hero's own rendered height defines 0→100% scroll progress; the
 * convergence uses a remapped, faster-finishing progress (CLOSE_END) so it
 * completes partway through that range instead of exactly at its end.
 */
const CLOSE_END = 0.6;

function useHeroScrollResponse() {
  const heroRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const repLeftRef = useRef<HTMLDivElement>(null);
  const repRightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const scrim = scrimRef.current;
    if (!hero || !scrim) return;

    // The page itself doesn't scroll — the dashboard layout's own
    // overflow-auto pane does (see (dashboard)/layout.tsx).
    const scrollEl = hero.closest(".overflow-auto") as HTMLElement | null;
    if (!scrollEl) return;

    let ticking = false;
    const apply = () => {
      ticking = false;
      const heroHeight = hero.offsetHeight || 1;
      const progress = Math.min(1, Math.max(0, scrollEl.scrollTop / heroHeight));
      scrim.style.opacity = String(progress * 0.35);

      const closeProgress = Math.min(1, progress / CLOSE_END);
      const left = repLeftRef.current;
      const right = repRightRef.current;
      if (left) {
        left.style.transform = `translateX(${closeProgress * 28}px)`;
        left.style.opacity = String(1 - closeProgress);
      }
      if (right) {
        right.style.transform = `translateX(${-closeProgress * 28}px)`;
        right.style.opacity = String(1 - closeProgress);
      }
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(apply);
      }
    };

    apply();
    scrollEl.addEventListener("scroll", onScroll, { passive: true });
    return () => scrollEl.removeEventListener("scroll", onScroll);
  }, []);

  return { heroRef, scrimRef, repLeftRef, repRightRef };
}

export default function DashboardHomePage() {
  const { heroRef, scrimRef, repLeftRef, repRightRef } = useHeroScrollResponse();
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
    <div className="relative animate-[dashboard-section-in_400ms_ease-out_both]">
      {/* Hero: sticky, not just absolutely positioned — it pins to the top
          of the scroll container (the layout's own overflow-auto div, not
          the window) and stays put while the sheet below scrolls up over
          it, since sticky's pinned range is bounded by this shared parent,
          not by the hero's own (much shorter) box. Full-bleed edge-to-edge
          (no horizontal padding, no rounded corners of its own) so it
          actually reaches the edges of the content pane; only its inner
          text wrapper carries the shared max-w/padding so Welcome and
          Reputation still line up with the KPI cards below. Welcome +
          Reputation stay fixed light-text-on-dark-scrim regardless of site
          theme (same treatment as BrandPanel — this is a fixed surface,
          not a themed one). */}
      <div ref={heroRef} className="sticky top-0 z-0 h-[300px] sm:h-[360px] lg:h-[400px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/dashboard-banner.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/45 to-black/80" />
        {/* Scroll-driven darkening scrim, separate from the fixed gradient
            above — opacity is pushed from 0 by useHeroScrollResponse as the
            sheet scrolls up, so the image dims further right as it recedes. */}
        <div ref={scrimRef} className="absolute inset-0 bg-black opacity-0" />

        <div className="relative h-full max-w-[1320px] mx-auto flex flex-col justify-between px-4 sm:px-6 lg:px-8 xl:px-10 pt-6 sm:pt-8 pb-10 sm:pb-14">
          <div>
            <h1 className="font-display font-semibold text-xl sm:text-2xl text-white">
              {user ? `Welcome back, ${user.full_name.split(" ")[0]}` : "Dashboard"}
            </h1>
            <p className="text-[13px] text-white/70 mt-0.5">
              Here&apos;s what&apos;s happening with your account today.
            </p>
          </div>

          <div>
            <h2 className="font-display font-semibold text-[15px] text-white/90 mb-4">Reputation</h2>
            {isLoading || !analytics ? (
              <div className="h-20 rounded-xl bg-white/10 animate-pulse" />
            ) : (
              <div className="flex items-center justify-between gap-6">
                <div ref={repLeftRef} className="flex items-end gap-2.5">
                  <p className="font-display font-semibold text-[42px] text-white leading-none">
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
                            : "fill-transparent text-white/30"
                        }
                      />
                    ))}
                  </div>
                </div>
                <div ref={repRightRef} className="text-right space-y-1">
                  <p className="text-[13px] text-white/85">
                    {analytics.reputation.total_completed} completed sessions
                  </p>
                  {analytics.reputation.member_since && (
                    <p className="text-[11.5px] text-white/60">
                      Member since {analytics.reputation.member_since}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sheet: normal document flow (not sticky), so it scrolls right over
          the pinned hero above — its own opaque bg-background is what
          visually "closes in" the image as this sheet's rounded top edge
          slides up past it. z-10 plus a later DOM position both guarantee
          it paints above the sticky hero regardless of stacking-context
          subtleties. Full-bleed background like the hero; an inner max-w
          wrapper keeps KPIs/Reminders/Activity aligned with the hero text. */}
      <div className="relative z-10 -mt-6 sm:-mt-8 rounded-t-2xl sm:rounded-t-3xl bg-background shadow-[0_-12px_24px_-16px_rgba(0,0,0,0.35)]">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pt-5 sm:pt-6 pb-6 lg:pb-8 space-y-6 lg:space-y-8">
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

          {/* Reminders keeps a real bordered surface — it demands attention. */}
          <div className="rounded-2xl border border-border/70 bg-card shadow-card p-4 sm:p-6">
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
      </div>
    </div>
  );
}
