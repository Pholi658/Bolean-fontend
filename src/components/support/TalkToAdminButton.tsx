"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { TalkToAdminModal } from "@/components/support/TalkToAdminModal";

/**
 * Deliberately placed in several independent spots (sidebar, topbar, the
 * dispute card) rather than once — each instance owns its own open state,
 * so none of them depend on the others being mounted.
 */
export function TalkToAdminButton({ variant = "sidebar" }: { variant?: "sidebar" | "icon" | "inline" }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {variant === "sidebar" && (
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-success/25 bg-success/[0.06] text-success text-[12.5px] font-medium hover:bg-success/[0.12] hover:border-success/40 transition-colors"
        >
          <MessageCircle size={13} /> Talk to Admin
        </button>
      )}
      {variant === "icon" && (
        <button
          onClick={() => setOpen(true)}
          title="Talk to Admin"
          className="relative w-[34px] h-[34px] rounded-lg border border-border flex items-center justify-center hover:bg-foreground/[0.03] transition-colors"
        >
          <MessageCircle size={15} className="text-foreground/80" />
        </button>
      )}
      {variant === "inline" && (
        <button
          onClick={() => setOpen(true)}
          className="text-[12px] text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
        >
          Prefer to talk to someone? Contact admin
        </button>
      )}
      {open && <TalkToAdminModal onClose={() => setOpen(false)} />}
    </>
  );
}
