"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { clsx } from "clsx";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { getFriendlyErrorMessage } from "@/lib/errors";

const MIN = 10;
const MAX = 1000;

/**
 * No onClose — this modal is mandatory: marking a session Completed or Late
 * requires leaving a review first, so the status change only commits after
 * a successful submit here.
 */
export function ReviewForm({
  onSubmit,
}: {
  onSubmit: (rating: number, msg: string) => Promise<void>;
}) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = msg.trim();
  const valid = rating > 0 && trimmed.length >= MIN && trimmed.length <= MAX;

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(rating, trimmed);
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <Modal>
      <h3 className="font-display font-semibold text-lg text-foreground mb-1.5">Leave a Review</h3>
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
        A review is required before this session&apos;s status can be updated.
      </p>

      <div className="flex items-center gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => setRating(i)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(0)}
          >
            <Star
              size={26}
              className={clsx(
                "transition-colors",
                i <= (hovered || rating) ? "fill-primary text-primary" : "fill-transparent text-border",
              )}
            />
          </button>
        ))}
      </div>

      <textarea
        value={msg}
        onChange={(e) => setMsg(e.target.value.slice(0, MAX))}
        rows={4}
        placeholder="How did this session go?"
        className="w-full px-3.5 py-3 rounded-lg bg-input-background border border-border text-sm text-foreground outline-none focus:border-primary/60 resize-none"
      />
      <div className="flex justify-between mt-1.5 mb-4">
        <span className="text-[11px] text-muted-foreground">Minimum {MIN} characters</span>
        <span className="text-[11px] text-muted-foreground">
          {trimmed.length}/{MAX}
        </span>
      </div>

      {error && <p className="text-sm text-destructive mb-3">{error}</p>}

      <Button onClick={handleSubmit} disabled={!valid || submitting} loading={submitting} className="w-full">
        Submit Review
      </Button>
    </Modal>
  );
}
