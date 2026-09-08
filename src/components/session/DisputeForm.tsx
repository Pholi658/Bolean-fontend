"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useRaiseDispute } from "@/hooks/useDisputes";
import { getFriendlyErrorMessage } from "@/lib/errors";

const MIN = 10;
const MAX = 100;

export function DisputeForm({ sessionId, onClose }: { sessionId: string; onClose: () => void }) {
  const [issue, setIssue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const raiseDispute = useRaiseDispute(sessionId);

  const trimmed = issue.trim();
  const valid = trimmed.length >= MIN && trimmed.length <= MAX;

  const handleSubmit = async () => {
    setError(null);
    try {
      await raiseDispute.mutateAsync(trimmed);
      onClose();
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    }
  };

  return (
    <Modal onClose={onClose} size="lg">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-dispute/10 flex items-center justify-center flex-shrink-0">
          <Flag size={17} className="text-dispute" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-lg text-foreground">File a Dispute</h3>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            Describe what your lender got wrong or said unfairly. An admin will review this and publish a
            plausibility rating on your profile.
          </p>
        </div>
      </div>

      <textarea
        value={issue}
        onChange={(e) => setIssue(e.target.value.slice(0, MAX))}
        rows={6}
        autoFocus
        placeholder="e.g. My lender said I never paid, but I have proof of payment on the due date..."
        className="w-full px-4 py-3.5 rounded-lg bg-input-background border border-border text-sm text-foreground outline-none focus:border-primary/60 resize-none"
      />
      <div className="flex justify-between mt-1.5 mb-5">
        <span className="text-[11px] text-muted-foreground">Minimum {MIN} characters</span>
        <span
          className={
            trimmed.length > MAX
              ? "text-[11px] text-destructive"
              : trimmed.length >= MIN
                ? "text-[11px] text-success"
                : "text-[11px] text-muted-foreground"
          }
        >
          {trimmed.length}/{MAX}
        </span>
      </div>
      {error && <p className="text-sm text-destructive mb-3">{error}</p>}
      <div className="flex gap-2.5">
        <Button variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!valid || raiseDispute.isPending}
          loading={raiseDispute.isPending}
          className="flex-1"
        >
          Submit Dispute
        </Button>
      </div>
    </Modal>
  );
}
