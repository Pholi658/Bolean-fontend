import { useState } from "react";
import { LayoutDashboard, Search, User, LogOut, Bell, Plus } from "lucide-react";
import { clsx } from "clsx";
import { BoleanLogo, Avatar } from "@/components/ui";
import NotificationPanel from "@/components/notifications/NotificationPanel";
import DashboardSection from "./sections/DashboardSection";
import SearchSection from "./sections/SearchSection";
import CreateSessionSection from "./sections/CreateSessionSection";
import ProfileViewSection from "./sections/ProfileViewSection";
import SessionDetailSection from "./sections/SessionDetailSection";
import { CURRENT_USER, NOTIFICATIONS } from "@/lib/mock-data";
import type { AppScreen, LenderSection, Session, SessionStatus, SearchUser } from "@/lib/types";

const SECTION_LABELS: Record<LenderSection, string> = {
  dashboard:        "Dashboard",
  search:           "Find Consumer",
  "create-session": "New Credit Session",
  "profile-view":   "Consumer Profile",
  "session-detail": "Session Detail",
};

export default function LenderDashboard({ go }: { go: (s: AppScreen) => void }) {
  const [section, setSection] = useState<LenderSection>("dashboard");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null);
  const [accessGranted] = useState<Set<string>>(new Set(["u1"]));
  const [accessRequested, setAccessRequested] = useState<Set<string>>(new Set());
  const [searchInitialQuery, setSearchInitialQuery] = useState<string | undefined>();
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [notifOpen, setNotifOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const handleViewSession = (session: Session) => {
    setSelectedSession(session);
    setSection("session-detail");
  };

  const handleViewProfile = (user: SearchUser) => {
    setSelectedUser(user);
    setSection("profile-view");
  };

  const handleLookupReviewer = (name: string) => {
    setSearchInitialQuery(name);
    setSection("search");
  };

  const handleNavClick = (id: LenderSection) => {
    if (id !== "search") setSearchInitialQuery(undefined);
    setSection(id);
  };

  const handleUpdateSession = (_id: string, status: SessionStatus, review?: { rating: number; comment: string }) => {
    setSelectedSession((s) => s ? {
      ...s, status,
      ...(review ? { review: { ...review, date: new Date().toISOString().split("T")[0] } } : {}),
    } : s);
  };

  const NAV: { id: LenderSection; icon: React.ReactNode; label: string }[] = [
    { id: "dashboard",      icon: <LayoutDashboard size={17} />, label: "Dashboard" },
    { id: "search",         icon: <Search size={17} />,          label: "Find Consumer" },
    { id: "create-session", icon: <Plus size={17} />,            label: "New Session" },
  ];

  const isNavActive = (id: LenderSection) =>
    section === id ||
    (id === "dashboard" && section === "session-detail") ||
    (id === "search" && section === "profile-view");

  return (
    <div className="min-h-screen bg-background flex">
      {/* ── Sidebar — Desktop ── */}
      <aside className="hidden md:flex w-56 border-r border-border flex-col flex-shrink-0 h-screen sticky top-0">
        <div className="p-5 border-b border-border">
          <BoleanLogo size="sm" />
          <span className="text-[10px] font-mono text-primary tracking-widest mt-1.5 block">LENDER VIEW</span>
        </div>

        <nav className="flex-1 py-3">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => handleNavClick(n.id)}
              className={clsx(
                "w-full flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors text-left",
                isNavActive(n.id)
                  ? "text-primary bg-[#0D0A00] border-r-2 border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              {n.icon} {n.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-1">
          <div className="flex items-center gap-2 px-3 py-2 mb-2">
            <Avatar name={CURRENT_USER.name} size="sm" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{CURRENT_USER.name}</p>
              <p className="text-[10px] font-mono text-muted-foreground truncate">{CURRENT_USER.phone}</p>
            </div>
          </div>
          <button
            onClick={() => go("consumer")}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors rounded-[4px]"
          >
            <User size={13} /> Consumer View
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
            <h1 className="font-display font-bold text-xl text-foreground">{SECTION_LABELS[section]}</h1>
            <p className="text-[11px] text-muted-foreground font-mono">
              {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
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
        </div>

        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-5 py-3.5 border-b border-border flex-shrink-0">
          <BoleanLogo size="sm" />
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-primary tracking-widest">LENDER</span>
            <button onClick={() => setNotifOpen(true)} className="relative text-muted-foreground hover:text-foreground transition-colors">
              <Bell size={17} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-primary rounded-full text-[8px] text-primary-foreground flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5">
          {section === "dashboard" && (
            <DashboardSection onViewSession={handleViewSession} />
          )}
          {section === "search" && (
            <SearchSection
              onViewProfile={handleViewProfile}
              accessGranted={accessGranted}
              initialQuery={searchInitialQuery}
            />
          )}
          {section === "create-session" && <CreateSessionSection />}
          {section === "profile-view" && selectedUser && (
            <ProfileViewSection
              user={selectedUser}
              hasPermission={accessGranted.has(selectedUser.id)}
              onBack={() => setSection("search")}
              onRequestPermission={(u) => setAccessRequested((prev) => new Set(prev).add(u.id))}
              onLookupReviewer={handleLookupReviewer}
            />
          )}
          {section === "session-detail" && selectedSession && (
            <SessionDetailSection
              session={selectedSession}
              onBack={() => setSection("dashboard")}
              onUpdateSession={handleUpdateSession}
            />
          )}
        </div>

        {/* Mobile bottom nav */}
        <div className="md:hidden flex-shrink-0 border-t border-border bg-background">
          <div className="flex">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => handleNavClick(n.id)}
                className={clsx(
                  "flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-mono tracking-wider transition-colors relative",
                  isNavActive(n.id) ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isNavActive(n.id) && <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary" />}
                {n.icon}
                <span>{n.label}</span>
              </button>
            ))}
            <button
              onClick={() => go("consumer")}
              className="flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors"
            >
              <User size={19} />
              <span>Consumer</span>
            </button>
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
