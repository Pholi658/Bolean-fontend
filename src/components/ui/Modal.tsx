"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { clsx } from "clsx";

interface ModalProps {
  children: React.ReactNode;
  onClose?: () => void; // omit for a mandatory, non-dismissable modal
  /** "sm" (default) for short confirmations; "lg" gives a form real desktop
   *  breathing room instead of cramming it into a narrow mobile-width box. */
  size?: "sm" | "lg";
}

export function Modal({ children, onClose, size = "sm" }: ModalProps) {
  useEffect(() => {
    if (!onClose) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      // Above every other portalled overlay in the app (full-screen
      // takeovers like MobileVerificationFlow/IdentityConfirmationModal
      // included, both z-[100]) — a modal can be opened from inside one of
      // those (e.g. "Talk to Admin" from the registration failure screen)
      // and must never render underneath it.
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[150] p-4"
      onClick={onClose}
    >
      <div
        className={clsx(
          "w-full rounded-xl bg-card border border-border shadow-2xl shadow-black/40",
          size === "lg" ? "max-w-2xl p-7" : "max-w-sm p-6",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
