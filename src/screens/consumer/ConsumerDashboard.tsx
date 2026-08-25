import { useState } from "react";
import { Home, FileText, Inbox as InboxIcon, User, Bell, LogOut } from "lucide-react";
import { clsx } from "clsx";
import { BoleanLogo, Avatar } from "@/components/ui";
import NotificationPanel from "@/components/notifications/NotificationPanel";
import HomeTab from "./tabs/HomeTab";
import SessionsTab from "./tabs/SessionsTab";
import SessionDetailTab from "./tabs/SessionDetailTab";
import InboxTab from "./tabs/InboxTab";
import ProfileTab from "./tabs/ProfileTab";
import { CURRENT_USER, NOTIFICATIONS, INBOX_ITEMS } from "@/lib/mock-data";
import type { AppScreen, ConsumerTab, Session } from "@/lib/types";

const TAB_LABELS: Record<ConsumerTab, string> = {
  home:             "Home",
  sessions:         "My Sessions",
  inbox:            "Inbox",
  profile:          "My Profile",
  "session-detail": "Session Detail",
};

export default function ConsumerDashboard({ go }: { go: (s: AppScreen) => void }) {
  const [tab, setTab] = useState<ConsumerTab>("home");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [notifOpen, setNotifOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const inboxPending = INBOX_ITEMS.filter((i) => i.status === "pending").length;
  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const handleViewSession = (session: Session) => {
    setSelectedSession(session);
    setTab("session-detail");
  };

  const NAV_TABS: { id: ConsumerTab; icon: React.ReactNode; label: string }[] = [
    { id: "home",     icon: <Home size={17} />,     label: "Home" },
    { id: "sessions", icon: <FileText size={17} />, label: "Sessions" },
    { id: "inbox",    icon: <InboxIcon size={17} />, label: "Inbox" },
    { id: "profile",  icon: <User size={17} />,     label: "Profile" },
  ];

  const isNavActive = (id: ConsumerTab) =>
    tab === id || (id === "sessions" && tab === "session-detail");

  return (
    <div className="min-h-screen bg-background flex">
      {/* ── Sidebar — Desktop ── */}
      <aside className="hidden md:flex w-56 border-r border-border flex-col flex-shrink-0 h-screen sticky top-0">
        <div className="p-5 border-b border-border">
          <BoleanLogo size="sm" />
          <span className="text-[10px] font-mono text-muted-foreground tracking-widest mt-1.5 block">CONSUMER VIEW</span>
        </div>

        <nav className="flex-1 py-3">
          {NAV_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={clsx(
                "w-full flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors text-left",
                isNavActive(t.id)
                  ? "text-primary bg-[#0D0A00] border-r-2 border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <span className="relative flex-shrink-0">
                {t.icon}
                {t.id === "inbox" && inboxPending > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full text-[7px] text-primary-foreground flex items-center justify-center font-bold leading-none">
                    {inboxPending}
                  </span>
                )}
              </span>
              {t.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-1">
          <div className="flex items-center gap-2 px-3 py-2 mb-2">
            <Avatar name={CURRENT_USER.name} size="sm" onClick={() => setTab("profile")} />
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{CURRENT_USER.name}</p>
              <p className="text-[10px] font-mono text-muted-foreground truncate">{CURRENT_USER.phone}</p>
            </div>
          </div>
          <button
            onClick={() => go("lender")}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors rounded-[4px]"
          >
            <FileText size={13} /> Lender View
          </button>
          <button
            onClick={() => go("login")}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-[#DC2626] hover:bg-[#0F0000] transition-colors rounded-[4px]"
          >
            <LogOut size={13} /> Log Out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Desktop top bar */}
        <div className="hidden md:flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div>
            <h1 className="font-display font-bold text-xl text-foreground">{TAB_LABELS[tab]}</h1>
            <p className="text-[11px] text-muted-foreground font-mono">
              {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setNotifOpen(true)}
              className="relative text-muted-foreground hover:text-foreground transition-colors"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] bg-primary rounded-full text-[8px] text-primary-foreground flex items-center justify-center font-bold px-0.5">
                  {unreadCount}
                </span>
              )}
            </button>
            <Avatar name={CURRENT_USER.name} size="sm" onClick={() => setTab("profile")} />
          </div>
        </div>

        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-5 py-3.5 border-b border-border flex-shrink-0">
          <BoleanLogo size="sm" />
          <div className="flex items-center gap-3">
            <button
              onClick={() => setNotifOpen(true)}
              className="relative text-muted-foreground hover:text-foreground transition-colors"
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] bg-primary rounded-full text-[8px] text-primary-foreground flex items-center justify-center font-bold px-0.5">
                  {unreadCount}
                </span>
              )}
            </button>
            <Avatar name={CURRENT_USER.name} size="sm" onClick={() => setTab("profile")} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 md:px-8 py-5">
          <div className="max-w-2xl mx-auto md:max-w-none md:mx-0">
            {tab === "home" && (
              <HomeTab onSwitchToLender={() => go("lender")} onTabChange={setTab} />
            )}
            {tab === "sessions" && (
              <SessionsTab onViewSession={handleViewSession} />
            )}
            {tab === "session-detail" && selectedSession && (
              <SessionDetailTab
                session={selectedSession}
                onBack={() => { setTab("sessions"); setSelectedSession(null); }}
              />
            )}
            {tab === "inbox" && <InboxTab />}
            {tab === "profile" && <ProfileTab onLogout={() => go("login")} />}
          </div>
        </div>

        {/* Mobile bottom nav */}
        <div className="md:hidden flex-shrink-0 border-t border-border bg-background">
          <div className="flex">
            {NAV_TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={clsx(
                  "flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-mono tracking-wider transition-colors relative",
                  isNavActive(t.id) ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isNavActive(t.id) && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary" />
                )}
                <div className="relative">
                  {t.icon}
                  {t.id === "inbox" && inboxPending > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full text-[7px] text-primary-foreground flex items-center justify-center font-bold">
                      {inboxPending}
                    </span>
                  )}
                </div>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notification Panel */}
      {notifOpen && (
        <NotificationPanel
          notifications={notifications}
          onClose={() => setNotifOpen(false)}
          onMarkAllRead={markAllRead}
        />
      )}
    </div>
  );
}
