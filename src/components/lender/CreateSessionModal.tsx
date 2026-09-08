"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCreateSession } from "@/hooks/useSessions";
import { addPendingSession } from "@/lib/pending-sessions";
import { createSessionSchema, TRANSACTION_TYPES, type CreateSessionFormValues } from "@/lib/validation/session";
import { getFriendlyErrorMessage } from "@/lib/errors";
import type { UserResponse } from "@/lib/types";

/**
 * A popup over the borrower-picker page rather than a full-page takeover —
 * the backdrop is deliberately light (not the near-opaque dim used
 * elsewhere) so the search tab stays visibly present behind it.
 */
export function CreateSessionModal({
  borrowerId,
  borrower,
  borrowerLoading,
  onClose,
  onDone,
}: {
  borrowerId: string;
  borrower?: UserResponse;
  borrowerLoading: boolean;
  onClose: () => void;
  onDone: () => void;
}) {
  const createSession = useCreateSession();
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateSessionFormValues>({ resolver: zodResolver(createSessionSchema) });

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  if (typeof document === "undefined") return null;

  const onSubmit = async (values: CreateSessionFormValues) => {
    setFormError(null);
    try {
      const dueDate = new Date(`${values.due_date}T23:59:00`);
      await createSession.mutateAsync({
        transaction_type: values.transaction_type,
        amount: values.amount,
        description: values.description,
        borrower_id: borrowerId,
        due_date: dueDate.toISOString(),
      });
      if (borrower) {
        addPendingSession({
          borrowerName: borrower.full_name,
          borrowerPhone: borrower.phone_number,
          amount: values.amount,
          transactionType: values.transaction_type,
        });
      }
      setSuccess(true);
    } catch (err) {
      setFormError(getFriendlyErrorMessage(err));
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return createPortal(
    // Light backdrop with a soft blur — the search tab underneath stays
    // present and visible, just softened so it reads as background rather
    // than competing for attention with the form.
    <div
      className="fixed inset-0 bg-black/25 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-card border border-border shadow-2xl shadow-black/50 p-7 sm:p-9 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05] transition-colors"
          aria-label="Close"
        >
          <X size={15} />
        </button>

        {success ? (
          <div className="flex flex-col items-center text-center gap-3 py-4">
            <CheckCircle2 size={32} className="text-success" />
            <h2 className="font-display font-semibold text-xl text-foreground">Session Sent</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {borrower?.full_name ?? "The borrower"} will be notified and can accept or decline the session
              from their inbox.
            </p>
            <div className="flex gap-2.5 w-full mt-2">
              <Button variant="outline" onClick={onDone} className="flex-1">
                Create Another
              </Button>
              <Button onClick={onDone} className="flex-1">
                Done
              </Button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="font-display font-semibold text-xl text-foreground mb-1">New Credit Session</h2>
            {borrowerLoading ? (
              <Skeleton className="h-5 w-40 mb-5" />
            ) : (
              <p className="text-sm text-muted-foreground mb-5">
                For <span className="text-foreground font-medium">{borrower?.full_name}</span> (
                {borrower?.phone_number})
              </p>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  Transaction Type
                </label>
                <select
                  {...register("transaction_type")}
                  className="px-3.5 py-3 rounded-lg bg-input-background border border-border text-sm text-foreground outline-none focus:border-primary/60"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select type
                  </option>
                  {TRANSACTION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                {errors.transaction_type && (
                  <p className="text-xs text-destructive">{errors.transaction_type.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  Amount (Maloti)
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register("amount")}
                  className="px-3.5 py-3 rounded-lg bg-input-background border border-border text-sm text-foreground outline-none focus:border-primary/60"
                />
                {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  Due Date
                </label>
                <input
                  type="date"
                  min={today}
                  {...register("due_date")}
                  className="px-3.5 py-3 rounded-lg bg-input-background border border-border text-sm text-foreground outline-none focus:border-primary/60"
                />
                {errors.due_date && <p className="text-xs text-destructive">{errors.due_date.message}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  Description
                </label>
                <textarea
                  rows={3}
                  {...register("description")}
                  className="px-3.5 py-3 rounded-lg bg-input-background border border-border text-sm text-foreground outline-none focus:border-primary/60 resize-none"
                />
                {errors.description && (
                  <p className="text-xs text-destructive">{errors.description.message}</p>
                )}
              </div>

              {formError && <p className="text-sm text-destructive text-center">{formError}</p>}

              <Button
                type="submit"
                loading={isSubmitting || createSession.isPending}
                disabled={isSubmitting || createSession.isPending}
                className="w-full"
              >
                Send Session
              </Button>
            </form>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
