"use client";

import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { Bell, Check, CheckCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from "@/hooks/useNotifications";
import { useNotificationBadge } from "@/hooks/useNotificationBadge";
import { NOTIFICATION_ICON, resolveNotificationTarget } from "@/lib/notification-target";
import type { NotificationResponse } from "@/lib/types";

/**
 * Facebook-style full-page notifications, reached from MobileHeader's bell
 * on mobile (desktop keeps the Topbar dropdown — see NotificationPanel).
 * Reuses the exact same data hooks and target-resolution logic as that
 * dropdown; only the "open inbox" destination differs (a full page here
 * instead of a flyout, since mobile no longer has one).
 */
export default function NotificationsPage() {
  const router = useRouter();
  const { data, isLoading } = useNotifications(1, 30);
  // Marks every currently-loaded notification "seen" for as long as this
  // page is mounted — the mobile-page equivalent of the dropdown opening.
  useNotificationBadge(true);
  const markAllRead = useMarkAllNotificationsRead();
  const markRead = useMarkNotificationRead();

  const handleSelect = (n: NotificationResponse) => {
    if (!n.read) markRead.mutate(n.id);
    const { openInbox, href } = resolveNotificationTarget(n);
    if (openInbox) router.push("/inbox");
    else if (href) router.push(href);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-4 animate-[dashboard-section-in_400ms_ease-out_both]">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-semibold text-xl sm:text-2xl text-foreground">Notifications</h1>
        {data && data.items.some((n) => !n.read) && (
          <button
            onClick={() => markAllRead.mutate()}
            className="flex items-center gap-1.5 text-[12.5px] font-medium text-primary hover:underline"
          >
            <CheckCheck size={14} />
            Mark all read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="-mx-4 sm:-mx-6 lg:mx-0 lg:rounded-2xl lg:border lg:border-border/60 flex flex-col items-center gap-2 py-20">
          <Bell size={22} className="text-muted-foreground opacity-40" />
          <p className="text-sm text-muted-foreground">No notifications yet.</p>
        </div>
      ) : (
        <div className="-mx-4 sm:-mx-6 lg:mx-0 divide-y divide-border/60 overflow-hidden lg:rounded-2xl lg:border lg:border-border/60">
          {data.items.map((n) => {
            const Icon = NOTIFICATION_ICON[n.type] ?? Bell;
            return (
              <div
                key={n.id}
                className={clsx("flex items-start gap-1", !n.read && "bg-primary/[0.03]")}
              >
                <button
                  onClick={() => handleSelect(n)}
                  className="flex-1 min-w-0 flex items-start gap-3 px-4 py-4 text-left hover:bg-foreground/[0.02] transition-colors"
                >
                  <div
                    className={clsx(
                      "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0",
                      n.read ? "bg-foreground/5" : "bg-primary/15",
                    )}
                  >
                    <Icon size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={clsx("text-[13.5px] leading-snug", n.read ? "text-muted-foreground" : "text-foreground")}>
                      {n.message}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">{n.time}</p>
                  </div>
                </button>
                {!n.read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markRead.mutate(n.id);
                    }}
                    title="Mark as read"
                    aria-label="Mark as read"
                    className="flex-shrink-0 mt-3.5 mr-3.5 p-1.5 rounded-full text-primary hover:bg-primary/10 transition-colors"
                  >
                    <Check size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
