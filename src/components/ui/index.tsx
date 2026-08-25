import { useState } from "react";
import { clsx } from "clsx";
import { Star, AlertCircle } from "lucide-react";
import type { SessionStatus, PlausibilityRating } from "@/lib/types";
import { getInitials } from "@/lib/utils";

// ── Logo ─────────────────────────────────────────────────────────────────────

export function BoleanLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const cfg = {
    sm: { px: 18, text: "text-lg tracking-[0.12em]" },
    md: { px: 22, text: "text-xl tracking-[0.14em]" },
    lg: { px: 32, text: "text-3xl tracking-[0.16em]" },
  }[size];
  return (
    <div className="flex items-center gap-2 select-none">
      <svg width={cfg.px} height={cfg.px} viewBox="0 0 24 24" fill="none">
        <polygon points="12,2 22,12 12,22 2,12" stroke="#C9A420" strokeWidth="1.5" fill="none" strokeLinejoin="miter" />
        <polygon points="12,7 17,12 12,17 7,12" fill="#C9A420" opacity="0.45" />
      </svg>
      <span className={clsx("font-display font-bold text-primary uppercase", cfg.text)}>Bolean</span>
    </div>
  );
}

// ── Status Badge ─────────────────────────────────────────────────────────────

export const STATUS_CFG: Record<SessionStatus, { bg: string; text: string; label: string }> = {
  PENDING:     { bg: "bg-[#1E1E1E]", text: "text-[#9CA3AF]", label: "Pending" },
  ACTIVE:      { bg: "bg-[#1C1800]", text: "text-[#C9A420]", label: "Active" },
  OVERDUE:     { bg: "bg-[#1C0E00]", text: "text-[#F97316]", label: "Overdue" },
  COMPLETED:   { bg: "bg-[#001C00]", text: "text-[#22C55E]", label: "Completed" },
  LATE:        { bg: "bg-[#1C1400]", text: "text-[#EAB308]", label: "Late" },
  DEFAULTED:   { bg: "bg-[#1C0000]", text: "text-[#EF4444]", label: "Defaulted" },
  DISPUTED:    { bg: "bg-[#1A0012]", text: "text-[#F472B6]", label: "Disputed" },
  DECLINED:    { bg: "bg-[#1E1E1E]", text: "text-[#6B7280]", label: "Declined" },
  UNCONFIRMED: { bg: "bg-[#0E0E1C]", text: "text-[#818CF8]", label: "Unconfirmed" },
};

export function StatusBadge({ status }: { status: SessionStatus }) {
  const c = STATUS_CFG[status];
  return (
    <span className={clsx(
      "inline-flex items-center px-2 py-0.5 rounded-[2px] text-[10px] font-mono font-bold tracking-widest uppercase",
      c.bg, c.text
    )}>
      {c.label}
    </span>
  );
}

// ── Plausibility Badge ───────────────────────────────────────────────────────

const PLAUSIBILITY_CFG: Record<PlausibilityRating, { bg: string; text: string }> = {
  HIGH:   { bg: "bg-[#001800]", text: "text-[#22C55E]" },
  MEDIUM: { bg: "bg-[#1C1400]", text: "text-[#EAB308]" },
  LOW:    { bg: "bg-[#1C0000]", text: "text-[#EF4444]" },
};

export function PlausibilityBadge({ rating }: { rating: PlausibilityRating }) {
  const c = PLAUSIBILITY_CFG[rating];
  return (
    <span className={clsx(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] text-[10px] font-mono font-bold tracking-widest uppercase",
      c.bg, c.text
    )}>
      Plausibility: {rating}
    </span>
  );
}

// ── Star Rating ──────────────────────────────────────────────────────────────

export function StarRating({
  rating, interactive = false, value, onChange,
}: {
  rating: number; interactive?: boolean; value?: number; onChange?: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  const display = interactive ? (hovered || value || 0) : rating;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={interactive ? 22 : 13}
          className={clsx(
            "transition-colors",
            i <= display ? "fill-primary text-primary" : "fill-transparent text-[#333]",
            interactive && "cursor-pointer"
          )}
          onClick={() => interactive && onChange?.(i)}
          onMouseEnter={() => interactive && setHovered(i)}
          onMouseLeave={() => interactive && setHovered(0)}
        />
      ))}
      {!interactive && rating > 0 && (
        <span className="ml-1 text-xs font-mono text-muted-foreground">{rating.toFixed(1)}</span>
      )}
    </div>
  );
}

// ── Avatar ───────────────────────────────────────────────────────────────────

export function Avatar({
  name, size = "md", onClick,
}: {
  name: string; size?: "sm" | "md" | "lg"; onClick?: () => void;
}) {
  const sz = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-14 h-14 text-base" }[size];
  return (
    <div
      onClick={onClick}
      className={clsx(
        "flex items-center justify-center rounded-[4px] bg-[#1A1400] border border-primary/25 text-primary font-mono font-bold flex-shrink-0",
        sz,
        onClick && "cursor-pointer hover:border-primary/60 transition-colors"
      )}
    >
      {getInitials(name)}
    </div>
  );
}

// ── Confirm Dialog ───────────────────────────────────────────────────────────

export function ConfirmDialog({
  title, message, confirmLabel = "Confirm", onConfirm, onCancel, danger = false,
}: {
  title: string; message: string; confirmLabel?: string;
  onConfirm: () => void; onCancel: () => void; danger?: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center z-50 p-4 pb-8 sm:pb-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-[4px] p-5 space-y-4">
        <h3 className="font-display font-bold text-lg text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-border text-foreground text-sm font-medium rounded-[4px] hover:bg-secondary transition-colors">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={clsx("flex-1 py-2.5 text-sm font-bold rounded-[4px] transition-opacity hover:opacity-90",
              danger ? "bg-[#DC2626] text-white" : "bg-primary text-primary-foreground"
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Empty State ──────────────────────────────────────────────────────────────

export function EmptyState({ icon, message, action }: {
  icon: React.ReactNode; message: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="opacity-25">{icon}</div>
      <p className="text-sm text-muted-foreground text-center max-w-xs leading-relaxed">{message}</p>
      {action}
    </div>
  );
}

// ── Form Primitives ──────────────────────────────────────────────────────────

export function FieldLabel({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-[11px] font-mono tracking-widest text-muted-foreground uppercase">{children}</label>
      {right && <span className="text-[10px] font-mono text-muted-foreground">{right}</span>}
    </div>
  );
}

export function FieldWrap({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx(
      "flex border border-border rounded-[4px] bg-secondary focus-within:border-primary transition-colors overflow-hidden",
      className
    )}>
      {children}
    </div>
  );
}

// ── Warning Banner ───────────────────────────────────────────────────────────

export function WarningBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 p-3 bg-[#1C0E00] border border-[#F97316]/40 rounded-[4px]">
      <AlertCircle size={14} className="text-[#F97316] flex-shrink-0 mt-0.5" />
      <p className="text-xs text-[#F97316] leading-relaxed">{message}</p>
    </div>
  );
}

// ── Stat Card ────────────────────────────────────────────────────────────────

export function StatCard({
  label, value, sub, accent = false, danger = false, warn = false,
}: {
  label: string; value: string; sub?: string;
  accent?: boolean; danger?: boolean; warn?: boolean;
}) {
  return (
    <div className={clsx(
      "p-4 border rounded-[4px] space-y-1",
      accent ? "bg-[#0D0A00] border-primary/30" :
      danger ? "bg-[#0F0000] border-[#EF4444]/25" :
      warn   ? "bg-[#0D0C00] border-[#EAB308]/25" :
               "bg-card border-border"
    )}>
      <p className={clsx("text-[10px] font-mono tracking-widest uppercase",
        accent ? "text-primary" : danger ? "text-[#EF4444]" : warn ? "text-[#EAB308]" : "text-muted-foreground"
      )}>
        {label}
      </p>
      <p className={clsx("font-display font-bold text-2xl",
        accent ? "text-primary" : danger ? "text-[#EF4444]" : warn ? "text-[#EAB308]" : "text-foreground"
      )}>
        {value}
      </p>
      {sub && <p className="text-[10px] text-muted-foreground font-mono">{sub}</p>}
    </div>
  );
}
