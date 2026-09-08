import { useEffect, useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";

/**
 * Shared "unseen notification" tracking, reused by the desktop topbar bell
 * and the mobile header bell — each caller owns its own panel-open boolean
 * (it's local state, not shared across instances), but the seen-tracking
 * logic itself is identical either way.
 */
export function useNotificationBadge(panelOpen: boolean, disabled = false) {
  const { data } = useNotifications(1, 20, !disabled);
  const notificationIds = data?.items.map((n) => n.id) ?? [];

  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  const hasUnseen = notificationIds.some((id) => !seenIds.has(id));

  useEffect(() => {
    if (panelOpen) setSeenIds((prev) => new Set([...prev, ...notificationIds]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panelOpen]);

  return { hasUnseen };
}
