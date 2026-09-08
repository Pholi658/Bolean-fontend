"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Bell, X } from "lucide-react";
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from "@/hooks/useNotifications";
import { useUIStore } from "@/store/ui-store";
import { NOTIFICATION_ICON, resolveNotificationTarget } from "@/lib/notification-target";
import type { NotificationResponse } from "@/lib/types";

/**
 * Desktop-only dropdown from the Topbar bell (mobile now uses a dedicated
 * full page at /notifications instead — see MobileHeader). "Open inbox"
 * targets land on the desktop sidebar's Inbox flyout here, since that's
 * this surface's own equivalent of the mobile Inbox page.
 */
export function NotificationPanel({ onClose }: { onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const setInboxOpen = useUIStore((s) => s.setInboxOpen);
  const { data, isLoading } = useNotifications(1, 20);
  const markAllRead = useMarkAllNotificationsRead();
  const markRead = useMarkNotificationRead();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClick);
    window.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  const handleSelect = (n: NotificationResponse) => {
    if (!n.read) markRead.mutate(n.id);
    const { openInbox, href } = resolveNotificationTarget(n);
    if (openInbox) {
      router.push("/");
      setInboxOpen(true);
    } else if (href) {
      router.push(href);
    }
    onClose();
  };

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-[calc(100%+8px)] w-[340px] max-h-[420px] overflow-y-auto rounded-xl bg-card border border-border shadow-2xl shadow-black/40 z-40"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border sticky top-0 bg-card">
        <h3 className="font-display font-semibold text-sm text-foreground">Notifications</h3>
        <div className="flex items-center gap-3">
          {data && data.items.some((n) => !n.read) && (
            <button
              onClick={() => markAllRead.mutate()}
              className="text-[11px] text-primary hover:underline"
            >
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 -m-1">
            <X size={16} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground text-center py-8">Loading…</p>
      ) : !data || data.items.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No notifications yet.</p>
      ) : (
        data.items.map((n) => {
          const Icon = NOTIFICATION_ICON[n.type] ?? Bell;
          return (
            <button
              key={n.id}
              onClick={() => handleSelect(n)}
              className="w-full flex items-start gap-2.5 px-4 py-3 border-b border-border/60 last:border-b-0 hover:bg-foreground/[0.02] transition-colors text-left"
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${n.read ? "bg-foreground/5" : "bg-primary/15"}`}
              >
                <Icon size={12} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[13px] leading-snug ${n.read ? "text-muted-foreground" : "text-foreground"}`}>
                  {n.message}
                </p>
                <p className="text-[10.5px] text-muted-foreground mt-1">{n.time}</p>
              </div>
              {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />}
            </button>
          );
        })
      )}
    </div>
  );
}
