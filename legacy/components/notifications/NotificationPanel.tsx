import { useEffect, useRef } from "react";
import { clsx } from "clsx";
import { X, Clock, Star, Shield, RefreshCw, Bell } from "lucide-react";
import type { AppNotification } from "@/lib/types";

const ICON_MAP: Record<AppNotification["type"], React.ReactNode> = {
  upcoming_due:   <Clock size={13} className="text-[#F97316]" />,
  session_offer:  <Bell size={13} className="text-primary" />,
  profile_request:<Shield size={13} className="text-[#818CF8]" />,
  status_update:  <RefreshCw size={13} className="text-muted-foreground" />,
  review:         <Star size={13} className="text-primary" />,
};

interface NotificationPanelProps {
  notifications: AppNotification[];
  onClose: () => void;
  onMarkAllRead: () => void;
}

export default function NotificationPanel({ notifications, onClose, onMarkAllRead }: NotificationPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("mousedown", handle);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handle);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  const pending = notifications.filter((n) => ["session_offer", "profile_request"].includes(n.type));
  const upcoming = notifications.filter((n) => n.type === "upcoming_due");
  const recent = notifications.filter((n) => ["status_update", "review"].includes(n.type));

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" />
      <div
        ref={panelRef}
        className="fixed top-0 right-0 h-full w-[320px] bg-card border-l border-border z-50 flex flex-col shadow-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-bold text-foreground">Notifications</h3>
            {unread > 0 && (
              <span className="text-[10px] font-mono text-primary bg-[#1C1800] px-1.5 py-0.5 rounded-[2px]">
                {unread} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {unread > 0 && (
              <button onClick={onMarkAllRead} className="text-[11px] font-mono text-muted-foreground hover:text-primary transition-colors">
                Mark all read
              </button>
            )}
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 opacity-40">
              <Bell size={28} className="text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div className="py-3">
              {pending.length > 0 && (
                <NotifGroup label="Pending Actions" items={pending} />
              )}
              {upcoming.length > 0 && (
                <NotifGroup label="Upcoming Dues" items={upcoming} />
              )}
              {recent.length > 0 && (
                <NotifGroup label="Recent" items={recent} />
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function NotifGroup({ label, items }: { label: string; items: AppNotification[] }) {
  return (
    <div className="mb-2">
      <p className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase px-5 py-2">
        {label}
      </p>
      {items.map((n) => (
        <div
          key={n.id}
          className={clsx(
            "flex items-start gap-3 px-5 py-3 border-b border-border last:border-0 transition-colors hover:bg-secondary",
            !n.read && "bg-[#0D0A00]"
          )}
        >
          <div className="w-6 h-6 rounded-[2px] bg-[#1A1A1A] flex items-center justify-center flex-shrink-0 mt-0.5">
            {ICON_MAP[n.type]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-foreground leading-snug">{n.message}</p>
            <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{n.time}</p>
          </div>
          {!n.read && (
            <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-1.5" />
          )}
        </div>
      ))}
    </div>
  );
}
