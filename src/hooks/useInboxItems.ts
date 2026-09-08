import { useMySessionsAsBorrower } from "@/hooks/useSessions";
import { useIncomingPermissions } from "@/hooks/usePermissions";

/**
 * Shared fetch + "pending only" filtering for the Inbox — reused by the
 * desktop flyout (InboxPanel), the mobile full page, and the badge hook, so
 * the definition of "what's actually in the inbox" lives in exactly one
 * place.
 */
export function useInboxItems(disabled = false) {
  const { data: sessions, isLoading: sessionsLoading } = useMySessionsAsBorrower(!disabled);
  const { data: permissions, isLoading: permissionsLoading } = useIncomingPermissions(!disabled);

  const pendingSessions = (sessions ?? []).filter((s) => s.status === "PENDING");
  const pendingPermissions = (permissions ?? []).filter((p) => p.status === "PENDING");
  const isLoading = sessionsLoading || permissionsLoading;
  const isEmpty = !isLoading && pendingSessions.length === 0 && pendingPermissions.length === 0;

  return { pendingSessions, pendingPermissions, isLoading, isEmpty };
}
