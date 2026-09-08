import { Bell, Clock, RefreshCw, Star } from "lucide-react";
import type { NotificationResponse, NotificationType } from "@/lib/types";

export const NOTIFICATION_ICON: Record<NotificationType, React.ComponentType<{ size?: number }>> = {
  upcoming_due: Clock,
  session_offer: Bell,
  profile_request: Bell,
  status_update: RefreshCw,
  review: Star,
};

/**
 * Notifications only ever carry a free-text message and a type — there's no
 * session/permission/user id attached server-side to jump to directly. This
 * maps what's honestly derivable from that alone:
 * - session_offer / profile_request: always about *your own* Inbox, so
 *   opening it is always correct, no id needed.
 * - review: always about a review on *your own* profile.
 * - status_update covers several different real messages (see
 *   Flagger_app app/services/{session,permissions,dispute}_service.py for
 *   the exact strings) — the ones with a real, generic destination are
 *   matched by their fixed wording; "X approved/declined your profile
 *   request" and dispute updates have no reliable target today (the
 *   approved profile's user id isn't in the payload) and are left as
 *   mark-as-read only rather than guessing.
 *
 * Shared by the desktop dropdown (NotificationPanel) and the mobile full
 * page (app/(dashboard)/notifications) — each decides what "openInbox"
 * actually means in its own context (flyout vs. full-page navigation)
 * rather than this function assuming one or the other.
 */
export function resolveNotificationTarget(n: NotificationResponse): { openInbox: boolean; href: string | null } {
  if (n.type === "session_offer" || n.type === "profile_request") {
    return { openInbox: true, href: null };
  }
  if (n.type === "review") {
    return { openInbox: false, href: "/profile" };
  }
  if (n.type === "status_update") {
    if (n.message.includes("session request")) return { openInbox: false, href: "/lender" };
    if (n.message.includes("marked your session")) return { openInbox: false, href: "/sessions" };
  }
  return { openInbox: false, href: null };
}
