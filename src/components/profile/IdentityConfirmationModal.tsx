"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, X, ShieldOff, TimerOff, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useIdentityImages } from "@/hooks/useIdentity";

const WINDOW_SECONDS = 20;

type Phase = "loading" | "active" | "expired" | "unavailable";

export function IdentityConfirmationModal({
  userId,
  onClose,
}: {
  userId: string;
  onClose: () => void;
}) {
  const imagesQuery = useIdentityImages(userId, true);
  const [phase, setPhase] = useState<Phase>("loading");
  const [secondsLeft, setSecondsLeft] = useState(WINDOW_SECONDS);

  // The countdown begins the moment the images actually become visible —
  // not when the modal opens, and not at all if the request fails or the
  // account simply has no verified images yet (never before completing
  // biometrics), since there's nothing to protect in that case.
  useEffect(() => {
    if (imagesQuery.isSuccess) {
      const hasImages = !!imagesQuery.data.selfie_url && !!imagesQuery.data.id_document_url;
      setPhase(hasImages ? "active" : "unavailable");
      if (hasImages) setSecondsLeft(WINDOW_SECONDS);
    } else if (imagesQuery.isError) {
      setPhase("unavailable");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagesQuery.isSuccess, imagesQuery.isError, imagesQuery.data]);

  useEffect(() => {
    if (phase !== "active") return;
    if (secondsLeft <= 0) {
      setPhase("expired");
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, secondsLeft]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    // Strong blur + dim covering the entire viewport (sidebar and topbar
    // included, via the body portal) so nothing of the underlying profile —
    // name, sessions, reviews — stays readable or reachable while identity
    // images are on screen.
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/85 backdrop-blur-2xl"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-[960px] rounded-2xl bg-card border border-border shadow-2xl shadow-black/50 p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-1">
          <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
            <Lock size={13} />
            Confirm visual identity
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05] transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {phase === "active" && imagesQuery.data?.selfie_url && imagesQuery.data?.id_document_url && (
          <>
            <div className="flex items-center justify-between flex-wrap gap-3 mb-1">
              <h2 className="font-display font-semibold text-xl text-foreground">
                Compare the verified images below
              </h2>
              <div
                className={`px-3 py-1 rounded-full text-[13px] font-semibold tabular-nums ${
                  secondsLeft <= 5
                    ? "bg-destructive/15 text-destructive border border-destructive/30"
                    : "bg-primary/15 text-primary border border-primary/30"
                }`}
              >
                {secondsLeft} second{secondsLeft === 1 ? "" : "s"} remaining
              </div>
            </div>
            <p className="text-[13px] text-muted-foreground mb-6">
              Compare the person&apos;s appearance with the person shown in these verified images.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <figure className="rounded-xl border border-border overflow-hidden bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagesQuery.data.id_document_url}
                  alt="Verified ID photo"
                  className="w-full aspect-[4/3] object-cover"
                />
                <figcaption className="text-center text-[12px] text-muted-foreground py-2 border-t border-border">
                  ID photo
                </figcaption>
              </figure>
              <figure className="rounded-xl border border-border overflow-hidden bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagesQuery.data.selfie_url}
                  alt="Verified biometric selfie"
                  className="w-full aspect-[4/3] object-cover"
                />
                <figcaption className="text-center text-[12px] text-muted-foreground py-2 border-t border-border">
                  Biometric selfie
                </figcaption>
              </figure>
            </div>

            <p className="text-[12px] text-muted-foreground text-center mt-5">
              For your privacy, identity images are shown temporarily and separately from the profile.
              This session cannot be extended.
            </p>
          </>
        )}

        {phase === "loading" && (
          <div className="flex flex-col items-center gap-3 text-center py-16">
            <Loader2 size={24} className="text-muted-foreground animate-spin" />
            <p className="text-sm text-muted-foreground">Loading verified identity images…</p>
          </div>
        )}

        {phase === "unavailable" && (
          <div className="flex flex-col items-center gap-3 text-center py-16 px-6">
            <div className="w-12 h-12 rounded-2xl bg-foreground/[0.04] border border-border flex items-center justify-center">
              <ShieldOff size={20} className="text-muted-foreground" />
            </div>
            <h2 className="font-display font-semibold text-lg text-foreground">
              Identity images aren&apos;t available
            </h2>
            <p className="text-[13px] text-muted-foreground leading-relaxed max-w-sm">
              This account doesn&apos;t have verified identity images to compare yet. Nothing was shown or
              shared.
            </p>
            <Button type="button" variant="outline" onClick={onClose} className="mt-1">
              Close
            </Button>
          </div>
        )}

        {phase === "expired" && (
          <div className="flex flex-col items-center gap-3 text-center py-16 px-6">
            <div className="w-12 h-12 rounded-2xl bg-foreground/[0.04] border border-border flex items-center justify-center">
              <TimerOff size={20} className="text-muted-foreground" />
            </div>
            <h2 className="font-display font-semibold text-lg text-foreground">Viewing session ended</h2>
            <p className="text-[13px] text-muted-foreground leading-relaxed max-w-sm">
              For your privacy, identity images are only shown for a short window and can&apos;t be
              extended. Close this and click &quot;Confirm visual identity&quot; again if you need another
              look.
            </p>
            <Button type="button" variant="outline" onClick={onClose} className="mt-1">
              Close
            </Button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
