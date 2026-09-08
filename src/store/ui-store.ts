import { create } from "zustand";

/**
 * Small shared UI state — currently just whether the Inbox flyout is open.
 * Needed because a notification click (in the Topbar) must be able to open
 * the Inbox flyout (in the Sidebar), two components with no other shared
 * parent state. Not persisted — purely in-memory, resets on reload like
 * everything else in this app.
 */
interface UIState {
  inboxOpen: boolean;
  setInboxOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  inboxOpen: false,
  setInboxOpen: (open) => set({ inboxOpen: open }),
}));
