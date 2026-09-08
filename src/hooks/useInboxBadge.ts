import { useEffect, useState } from "react";
import { useInboxItems } from "@/hooks/useInboxItems";

/**
 * Shared "unseen pending item" tracking for the Inbox entry point. `viewing`
 * is supplied by the caller rather than read from shared state internally,
 * since "viewing" means something different per surface: the desktop
 * sidebar's flyout-open boolean, or the mobile bottom-nav tab's
 * pathname === "/inbox" check for the full page. Either way, once
 * `viewing` flips true the currently-pending ids are marked seen.
 */
export function useInboxBadge(viewing: boolean, disabled = false) {
  const { pendingSessions, pendingPermissions } = useInboxItems(disabled);
  const pendingIds = [...pendingSessions.map((s) => s.id), ...pendingPermissions.map((p) => p.id)];

  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  const hasUnseen = pendingIds.some((id) => !seenIds.has(id));

  useEffect(() => {
    if (viewing) setSeenIds((prev) => new Set([...prev, ...pendingIds]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewing]);

  return { hasUnseen };
}
