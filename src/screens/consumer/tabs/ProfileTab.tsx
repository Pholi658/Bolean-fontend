import { useState } from "react";
import { LogOut, MessageCircle, X, Shield, Phone, CreditCard, Eye } from "lucide-react";
import { Avatar, StarRating } from "@/components/ui";
import { openWhatsApp } from "@/lib/utils";
import { CURRENT_USER, CONSUMER_SESSIONS, ADMIN_WHATSAPP, ADMIN_WHATSAPP_DISPLAY } from "@/lib/mock-data";

interface ProfileTabProps {
  onLogout: () => void;
}

export default function ProfileTab({ onLogout }: ProfileTabProps) {
  const [adminOpen, setAdminOpen] = useState(false);
  const reviews = CONSUMER_SESSIONS.filter((s) => s.review).map((s) => s.review!);

  const stats = [
    { label: "Completed", value: 8, color: "#22C55E" },
    { label: "Active",    value: 1, color: "#C9A420" },
    { label: "Defaulted", value: 1, color: "#EF4444" },
    { label: "Disputed",  value: 1, color: "#F472B6" },
  ];

  return (
    <div className="space-y-5 pb-8">
      {/* Identity */}
      <div className="flex items-center gap-4">
        <Avatar name={CURRENT_USER.name} size="lg" />
        <div>
          <h2 className="font-display font-bold text-xl text-foreground">{CURRENT_USER.name}</h2>
          {CURRENT_USER.isVerified && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <Shield size={11} className="text-primary" />
              <span className="text-[10px] font-mono text-primary tracking-widest">VERIFIED</span>
            </div>
          )}
        </div>
      </div>

      {/* Contact details */}
      <div className="bg-card border border-border rounded-[4px] divide-y divide-border">
        {[
          { label: "Phone",        value: CURRENT_USER.phone },
          { label: "Email",        value: CURRENT_USER.email },
          { label: "WhatsApp",     value: CURRENT_USER.whatsapp },
          { label: "Member Since", value: CURRENT_USER.memberSince },
        ].map((r) => (
          <div key={r.label} className="flex items-center justify-between px-4 py-3">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{r.label}</span>
            <span className="text-sm text-foreground font-mono">{r.value}</span>
          </div>
        ))}
      </div>

      {/* Reputation */}
      <div className="bg-[#0D0A00] border border-primary/30 rounded-[4px] p-4 space-y-3">
        <p className="text-[10px] font-mono text-primary tracking-widest uppercase">Credit Reputation</p>
        <StarRating rating={CURRENT_USER.avgRating} />
        <div className="grid grid-cols-4 gap-3">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-muted-foreground text-[10px] font-mono">{s.label}</p>
              <p className="font-bold mt-0.5 text-sm" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews Received */}
      <div className="space-y-3">
        <p className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">
          Reviews Received ({reviews.length})
        </p>
        {reviews.length === 0 ? (
          <p className="text-xs text-muted-foreground font-mono">No reviews yet.</p>
        ) : (
          reviews.map((r, i) => (
            <div key={i} className="bg-card border border-border rounded-[4px] p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{r.reviewerName}</span>
                <StarRating rating={r.rating} />
              </div>
              <p className="text-xs text-muted-foreground italic leading-relaxed">"{r.comment}"</p>
            </div>
          ))
        )}
      </div>

      {/* KYC Identity Documents */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <p className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">Identity Documents</p>
          {CURRENT_USER.isVerified && (
            <div className="flex items-center gap-1">
              <Shield size={10} className="text-primary" />
              <span className="text-[9px] font-mono text-primary">Verified</span>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border border-border rounded-[4px] p-3 space-y-2.5">
            <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">National ID</p>
            <div className="h-28 bg-secondary border border-border/50 rounded-[3px] flex flex-col items-center justify-center gap-2">
              <CreditCard size={26} className="text-muted-foreground opacity-25" />
              <p className="text-[9px] font-mono text-muted-foreground">ID Document</p>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
              <span className="text-[9px] font-mono text-[#22C55E]">On file</span>
            </div>
          </div>
          <div className="bg-card border border-border rounded-[4px] p-3 space-y-2.5">
            <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Biometric Selfie</p>
            <div className="h-28 bg-secondary border border-border/50 rounded-[3px] flex flex-col items-center justify-center gap-2">
              <Avatar name={CURRENT_USER.name} size="md" />
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
              <span className="text-[9px] font-mono text-[#22C55E]">On file</span>
            </div>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground font-mono leading-relaxed">
          These documents were submitted during registration. Lenders who are granted profile access can verify your identity against these documents.
        </p>
      </div>

      {/* Contact Admin */}
      <div className="bg-card border border-border rounded-[4px] p-4 space-y-3">
        <div>
          <p className="text-sm font-medium text-foreground">Need help?</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Contact Bolean support for disputes, account issues, or general enquiries.
          </p>
        </div>
        <button
          onClick={() => setAdminOpen(true)}
          className="w-full py-2.5 border border-border text-foreground text-sm font-medium rounded-[4px] hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
        >
          <MessageCircle size={15} /> Contact Admin
        </button>
      </div>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="w-full py-3 border border-border text-muted-foreground text-sm font-medium rounded-[4px] hover:border-[#DC2626] hover:text-[#DC2626] hover:bg-[#0F0000] transition-colors flex items-center justify-center gap-2"
      >
        <LogOut size={14} /> Log Out
      </button>

      {/* Admin Contact Modal */}
      {adminOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center z-50 p-4 pb-8 sm:pb-4">
          <div className="w-full max-w-sm bg-card border border-border rounded-[4px] p-5 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-foreground">Contact Admin</h3>
              <button onClick={() => setAdminOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-center">
              <div className="w-12 h-12 rounded-full bg-[#001800] border border-[#22C55E] flex items-center justify-center mx-auto">
                <MessageCircle size={22} className="text-[#22C55E]" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Bolean Support</p>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">{ADMIN_WHATSAPP_DISPLAY}</p>
                <p className="text-[10px] text-muted-foreground mt-1">Available Mon – Sat, 8am – 6pm (SAST)</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex items-center gap-2 flex-1 p-3 border border-border rounded-[4px]">
                <Phone size={14} className="text-muted-foreground" />
                <div>
                  <p className="text-[10px] text-muted-foreground font-mono">CALL</p>
                  <p className="text-xs text-foreground font-mono">{ADMIN_WHATSAPP_DISPLAY}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                openWhatsApp(
                  ADMIN_WHATSAPP,
                  `Hello Bolean Admin, I need assistance with my account (${CURRENT_USER.phone}). `
                );
                setAdminOpen(false);
              }}
              className="w-full py-3 bg-[#22C55E] text-[#001800] font-display font-bold text-sm rounded-[4px] hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <MessageCircle size={16} /> Open WhatsApp Chat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
