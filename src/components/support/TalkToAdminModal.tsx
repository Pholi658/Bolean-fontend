"use client";

import { MessageCircle, Phone } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { ADMIN_WHATSAPP, ADMIN_WHATSAPP_DISPLAY } from "@/lib/constants";

export function TalkToAdminModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal onClose={onClose}>
      <div className="flex items-start gap-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
          <MessageCircle size={17} className="text-success" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-lg text-foreground">Talk to Admin</h3>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            Need help with a dispute, a payment issue, or anything else? Reach our support team directly.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-input-background px-4 py-3.5 flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <Phone size={14} className="text-muted-foreground" />
          <span className="text-sm font-mono text-foreground">{ADMIN_WHATSAPP_DISPLAY}</span>
        </div>
        <a href={`tel:${ADMIN_WHATSAPP}`} className="text-[12px] text-primary hover:underline">
          Call
        </a>
      </div>

      <a
        href={`https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent("Hi, I need help with my Bolean account.")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-success text-success-foreground font-medium text-sm px-4 py-3 hover:opacity-90 transition-colors"
      >
        <MessageCircle size={15} /> Chat on WhatsApp
      </a>
    </Modal>
  );
}
