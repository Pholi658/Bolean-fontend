"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { clsx } from "clsx";
import { ArrowLeft } from "lucide-react";
import { MobileFaceCapture } from "@/components/biometric/MobileFaceCapture";
import { IdUploadPanel } from "@/components/biometric/IdUploadPanel";
import { VerificationResultPanel } from "@/components/biometric/VerificationResultPanel";
import { useBiometricSubmission } from "@/hooks/useBiometricSubmission";

const SLIDE_LABELS = ["Face ID", "ID Document"] as const;

/**
 * Mobile-only: a dedicated full-screen takeover (portalled to <body>, sits
 * above the entire dashboard shell) instead of being squeezed into the
 * disabled-but-still-visible sidebar/topbar/bottom-nav layout. Two gated
 * slides — Face ID, then ID Document — reusing the same submission
 * pipeline as the desktop wizard (see VerificationWorkspace,
 * useBiometricSubmission); only the outer navigation shell differs.
 *
 * This is still registration's step 2 (account details was step 1, see
 * RegisterForm) — the two internal slides are sub-steps *within* that, not
 * a second "step 1 of 2", so the header keeps that framing explicit rather
 * than reusing "step" language for the slides themselves.
 *
 * Always mounted alongside the desktop layout, purely CSS-toggled
 * (lg:hidden) — consistent with how the rest of this app's mobile/desktop
 * splits work, and harmless here since nothing (camera, file picker)
 * activates until this is actually the visible slide.
 */
export function MobileVerificationFlow() {
  const [activeSlide, setActiveSlide] = useState<0 | 1>(0);
  const [selfieBlob, setSelfieBlob] = useState<Blob | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);
  const { submitStatus, uploadProgress, errorMessage, isDuplicate, submit } = useBiometricSubmission();

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  if (typeof document === "undefined") return null;

  const handleFaceConfirmed = (blob: Blob) => {
    setSelfieBlob(blob);
    setActiveSlide(1);
  };

  const handleContinueId = () => {
    if (selfieBlob && idFile) void submit(selfieBlob, idFile, () => setSelfieBlob(null));
  };

  const handleRetry = () => {
    // A failed submission (e.g. the duplicate-face rejection) is most often
    // really about the face capture, so retry lands back on that slide.
    setActiveSlide(0);
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-background flex flex-col lg:hidden">
      <div className="flex-shrink-0 px-6 pt-5 pb-2 relative">
        {/* Only on the ID slide — nothing to go back to from the first one.
            The face slide keeps whatever it already captured (it never
            unmounts), so coming back just re-shows that review step with
            Retake/Continue rather than forcing a fresh capture. */}
        {!submitStatus && activeSlide === 1 && (
          <button
            type="button"
            onClick={() => setActiveSlide(0)}
            aria-label="Back to face capture"
            className="absolute left-4 top-4 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/[0.06] transition-colors"
          >
            <ArrowLeft size={17} />
          </button>
        )}

        <div className="flex gap-2 mb-2 max-w-[180px] mx-auto">
          <div className="h-[2.5px] flex-1 rounded-full bg-success" />
          <div className="h-[2.5px] flex-1 rounded-full bg-primary" />
        </div>
        <p className="text-center text-[10.5px] font-medium tracking-widest text-muted-foreground uppercase">
          Step 2 of 2 — Identity verification
        </p>

        {!submitStatus && (
          <div className="flex items-center justify-center gap-1.5 mt-2.5">
            {[0, 1].map((i) => (
              <span
                key={i}
                className={clsx("w-1.5 h-1.5 rounded-full transition-colors", i === activeSlide ? "bg-primary" : "bg-border")}
              />
            ))}
            <span className="ml-1 text-[11px] font-medium text-foreground/70">{SLIDE_LABELS[activeSlide]}</span>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-hidden relative">
        {submitStatus ? (
          <div className="h-full overflow-y-auto no-scrollbar flex items-center justify-center px-5">
            <VerificationResultPanel
              status={submitStatus}
              uploadProgress={uploadProgress}
              errorMessage={errorMessage}
              isDuplicate={isDuplicate}
              onRetry={handleRetry}
            />
          </div>
        ) : (
          <div
            className="flex w-[200%] h-full transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)]"
            style={{ transform: activeSlide === 0 ? "translateX(0%)" : "translateX(-50%)" }}
          >
            {/* inert on the off-screen slide: keeps a hidden camera/file
                input from stealing focus or being interacted with while its
                slide isn't the one showing — same reasoning as AuthCard's
                login/register slider. Each pane fills the full slide height
                so its content can anchor its action to the bottom (thumb
                reach) instead of trailing right under the content. */}
            <div
              className="w-1/2 h-full flex-shrink-0 overflow-y-auto no-scrollbar px-5 pt-4"
              inert={activeSlide !== 0 ? true : undefined}
            >
              <MobileFaceCapture onConfirmed={handleFaceConfirmed} />
            </div>
            <div
              className="w-1/2 h-full flex-shrink-0 overflow-y-auto no-scrollbar px-5 pt-4"
              inert={activeSlide !== 1 ? true : undefined}
            >
              <IdUploadPanel file={idFile} onFileSelected={setIdFile} onContinue={handleContinueId} fill />
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
