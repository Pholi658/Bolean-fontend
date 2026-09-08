import { useState } from "react";
import { X, ChevronLeft, Send, Check, Shield } from "lucide-react";
import { clsx } from "clsx";
import { Avatar, FieldLabel, FieldWrap } from "@/components/ui";
import { fmt, fmtDate } from "@/lib/utils";
import type { SearchUser } from "@/lib/types";

const TX_TYPES = ["Cash Loan", "Goods on Credit", "Service on Credit", "Deposit To", "Mekhatlo"];

interface CreateSessionModalProps {
  user: SearchUser;
  onClose: () => void;
}

export default function CreateSessionModal({ user, onClose }: CreateSessionModalProps) {
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [txType, setTxType] = useState("");
  const [step, setStep] = useState<"form" | "review" | "success">("form");
  const [ref] = useState(`BS-2026-${Math.floor(Math.random() * 900 + 100)}`);

  const today = new Date().toISOString().split("T")[0];
  const canProceed = amount && dueDate && txType && Number(amount) > 0;

  if (step === "success") {
    return (
      <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4">
        <div className="w-full max-w-sm bg-card border border-primary/30 rounded-[4px] p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#001800] border border-[#22C55E] flex items-center justify-center mx-auto">
            <Check size={24} className="text-[#22C55E]" />
          </div>
          <div>
            <h3 className="font-display font-bold text-xl text-foreground">Session Sent</h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              Credit session sent to <span className="text-foreground">{user.name}</span>. Awaiting their acceptance.
            </p>
          </div>
          <div className="bg-secondary px-4 py-3 rounded-[4px] text-left">
            <p className="text-[10px] text-muted-foreground font-mono tracking-widest">SESSION REFERENCE</p>
            <p className="text-sm font-mono text-foreground mt-0.5">{ref}</p>
          </div>
          <button onClick={onClose} className="w-full py-3 bg-primary text-primary-foreground font-display font-bold text-sm rounded-[4px] hover:opacity-90 transition-opacity">
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/90 flex items-end sm:items-center justify-center z-50 p-4 pb-0 sm:pb-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-t-[4px] sm:rounded-[4px] flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
          {step === "review"
            ? <button onClick={() => setStep("form")} className="text-muted-foreground hover:text-foreground"><ChevronLeft size={20} /></button>
            : <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
          }
          <div className="text-center">
            <h3 className="font-display font-bold text-foreground">
              {step === "form" ? "Create Session" : "Review Terms"}
            </h3>
            <p className="text-[10px] font-mono text-muted-foreground">
              {step === "form" ? "Step 1 of 2" : "Step 2 of 2"}
            </p>
          </div>
          <div className="w-5" />
        </div>

        {/* Borrower */}
        <div className="px-5 pt-4">
          <div className="flex items-center gap-3 p-3 bg-secondary rounded-[4px]">
            <Avatar name={user.name} />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              <p className="text-[11px] text-muted-foreground font-mono">{user.phone}</p>
            </div>
            {user.isVerified && <Shield size={14} className="text-primary" />}
          </div>
        </div>

        {/* Form / Review */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {step === "form" ? (
            <>
              {/* Transaction Type */}
              <div className="space-y-1.5">
                <FieldLabel>Transaction Type</FieldLabel>
                <FieldWrap>
                  <select value={txType} onChange={(e) => setTxType(e.target.value)}
                    className="w-full px-3 py-3 bg-transparent text-foreground text-sm outline-none">
                    <option value="" disabled>Select type...</option>
                    {TX_TYPES.map((t) => <option key={t} value={t} className="bg-[#1A1A1A]">{t}</option>)}
                  </select>
                </FieldWrap>
              </div>

              {/* Amount */}
              <div className="space-y-1.5">
                <FieldLabel>Amount (Maloti)</FieldLabel>
                <FieldWrap>
                  <span className="px-3 py-3 text-muted-foreground font-mono text-sm border-r border-border bg-[#0D0D0D] flex-shrink-0">M</span>
                  <input type="number" placeholder="0.00" value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="flex-1 px-3 py-3 bg-transparent text-foreground text-sm outline-none font-mono" />
                </FieldWrap>
              </div>

              {/* Due Date */}
              <div className="space-y-1.5">
                <FieldLabel>Due Date</FieldLabel>
                <FieldWrap>
                  <input type="date" value={dueDate} min={today}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-3 bg-transparent text-foreground text-sm outline-none [color-scheme:dark]" />
                </FieldWrap>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <FieldLabel right={`${description.length}/500`}>Description (Optional)</FieldLabel>
                <textarea value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                  placeholder="Describe what this credit session is for..."
                  className="w-full px-3 py-3 bg-secondary border border-border rounded-[4px] text-foreground text-sm outline-none focus:border-primary transition-colors resize-none"
                  rows={3} />
              </div>

              <button
                onClick={() => canProceed && setStep("review")}
                disabled={!canProceed}
                className={clsx(
                  "w-full py-3.5 font-display font-bold text-sm rounded-[4px] tracking-wider uppercase transition-opacity",
                  canProceed
                    ? "bg-primary text-primary-foreground hover:opacity-90"
                    : "bg-secondary text-muted-foreground cursor-not-allowed"
                )}
              >
                Review Terms →
              </button>
            </>
          ) : (
            <>
              {/* Terms Review */}
              <div className="bg-[#0D0A00] border border-primary/20 rounded-[4px] divide-y divide-border">
                {[
                  { label: "Borrower", value: user.name },
                  { label: "Transaction Type", value: txType },
                  { label: "Amount", value: fmt(Number(amount)) },
                  { label: "Due Date", value: fmtDate(dueDate) },
                  ...(description ? [{ label: "Description", value: description }] : []),
                ].map((r) => (
                  <div key={r.label} className="flex items-start justify-between gap-4 px-4 py-3">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider flex-shrink-0">{r.label}</span>
                    <span className="text-sm text-foreground text-right leading-relaxed">{r.value}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-2 p-3 bg-secondary border border-border rounded-[4px]">
                <Shield size={13} className="text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This session will be sent to the borrower for acceptance. Once accepted, an immutable record will be created on Bolean.
                </p>
              </div>

              <button
                onClick={() => setStep("success")}
                className="w-full py-3.5 bg-primary text-primary-foreground font-display font-bold text-sm rounded-[4px] tracking-wider uppercase hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Send size={15} /> Confirm & Send
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
