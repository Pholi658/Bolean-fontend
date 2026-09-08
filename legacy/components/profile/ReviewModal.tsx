import { useState } from "react";
import { AlertCircle, Lock } from "lucide-react";
import { clsx } from "clsx";
import { Avatar, StarRating } from "@/components/ui";
import { fmt } from "@/lib/utils";
import type { Session } from "@/lib/types";

export default function ReviewModal({
  session, onSubmit,
}: {
  session: Session;
  // no onClose — this modal is required and cannot be dismissed without submitting
  onSubmit: (sessionId: string, rating: number, msg: string) => void;
}) {
  const [rating, setRating] = useState(0);
  const [msg, setMsg] = useState("");
  const MIN_MSG = 10;
  const MAX_MSG = 1000;
  const isValid = rating >= 1 && msg.trim().length >= MIN_MSG;

  const handleSubmit = () => {
    if (!isValid) return;
    onSubmit(session.id, rating, msg.trim());
  };

  return (
    // Intentionally no onClick on backdrop — non-ignorable
    <div className="fixed inset-0 bg-black/92 flex items-end sm:items-center justify-center z-[60] p-4 pb-0 sm:pb-4">
      <div className="w-full max-w-sm bg-card border border-primary/30 rounded-t-[4px] sm:rounded-[4px] flex flex-col max-h-[92vh]">

        {/* Header — no X button */}
        <div className="px-5 py-4 border-b border-border bg-[#0D0A00] flex-shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <Lock size={14} className="text-primary" />
            <h3 className="font-display font-bold text-primary">Review Required</h3>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            A review is mandatory before you can continue. This record is permanent and cannot be edited.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Session summary */}
          <div className="flex items-center gap-3 p-3 bg-secondary rounded-[4px]">
            <Avatar name={session.borrowerName} size="sm" />
            <div>
              <p className="text-sm font-medium text-foreground">{session.borrowerName}</p>
              <p className="text-[11px] text-muted-foreground font-mono">{session.id} · {fmt(session.amount)}</p>
            </div>
          </div>

          {/* Rating — required */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono tracking-widest text-muted-foreground uppercase">
                Rating <span className="text-[#EF4444]">*</span>
              </label>
              {rating > 0 && (
                <span className="text-[10px] font-mono text-muted-foreground">{rating} / 5</span>
              )}
            </div>
            <StarRating rating={0} interactive value={rating} onChange={setRating} />
            {rating === 0 && (
              <p className="text-[10px] text-muted-foreground font-mono">Select a star rating to proceed</p>
            )}
          </div>

          {/* Review message — required */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono tracking-widest text-muted-foreground uppercase">
                Review <span className="text-[#EF4444]">*</span>
              </label>
              <span className={clsx(
                "text-[10px] font-mono transition-colors",
                msg.length > MAX_MSG ? "text-[#EF4444]" :
                msg.trim().length >= MIN_MSG ? "text-[#22C55E]" : "text-muted-foreground"
              )}>
                {msg.length}/{MAX_MSG}
              </span>
            </div>
            <textarea
              value={msg}
              onChange={(e) => setMsg(e.target.value.slice(0, MAX_MSG))}
              placeholder="Describe this borrower's payment behaviour (min 10 characters)…"
              className="w-full px-3 py-3 bg-secondary border border-border rounded-[4px] text-foreground text-sm outline-none focus:border-primary transition-colors resize-none"
              rows={4}
            />
            {msg.length > 0 && msg.trim().length < MIN_MSG && (
              <p className="text-[10px] text-[#EF4444] font-mono">
                {MIN_MSG - msg.trim().length} more character{MIN_MSG - msg.trim().length !== 1 ? "s" : ""} required
              </p>
            )}
          </div>

          {/* Notice */}
          <div className="flex items-start gap-2 p-3 bg-[#111] border border-border rounded-[4px]">
            <AlertCircle size={13} className="text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Reviews are immutable once submitted and form part of this consumer's permanent credit record on Bolean.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border flex-shrink-0">
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className={clsx(
              "w-full py-3 font-display font-bold text-sm rounded-[4px] tracking-wider uppercase transition-opacity",
              isValid
                ? "bg-primary text-primary-foreground hover:opacity-90"
                : "bg-secondary text-muted-foreground cursor-not-allowed"
            )}
          >
            Submit Review
          </button>
          {!isValid && (
            <p className="text-[10px] text-center text-muted-foreground font-mono mt-2">
              {rating === 0
                ? "Select a rating to enable submission"
                : `Write at least ${MIN_MSG - msg.trim().length} more character${MIN_MSG - msg.trim().length !== 1 ? "s" : ""}`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
