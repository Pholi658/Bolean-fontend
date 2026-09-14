"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { Stepper, type StepDef } from "@/components/biometric/Stepper";
import { IdUploadPanel } from "@/components/biometric/IdUploadPanel";
import { SelfieCapturePanel } from "@/components/biometric/SelfieCapturePanel";
import { SelfieReviewPanel } from "@/components/biometric/SelfieReviewPanel";
import { VerificationResultPanel } from "@/components/biometric/VerificationResultPanel";
import { MobileVerificationFlow } from "@/components/biometric/MobileVerificationFlow";
import { useBiometricSubmission } from "@/hooks/useBiometricSubmission";

type WizardStep = "id" | "selfie" | "review" | "verifying";
type Direction = "forward" | "backward";

const STEPS: StepDef[] = [
  { label: "Personal details" },
  { label: "Identity document" },
  { label: "Selfie" },
  { label: "Verification" },
];

const STEP_INDEX: Record<WizardStep, number> = { id: 1, selfie: 2, review: 2, verifying: 3 };

export default function VerificationWorkspace() {
  const [step, setStep] = useState<WizardStep>("id");
  const [direction, setDirection] = useState<Direction>("forward");
  const [idFile, setIdFile] = useState<File | null>(null);
  const [selfieBlob, setSelfieBlob] = useState<Blob | null>(null);
  const { submitStatus, uploadProgress, errorMessage, isDuplicate, submit } = useBiometricSubmission();

  const goTo = (next: WizardStep, dir: Direction) => {
    setDirection(dir);
    setStep(next);
  };

  const animationClass =
    direction === "forward"
      ? "animate-[step-slide-in-right_320ms_cubic-bezier(0.65,0,0.35,1)]"
      : "animate-[step-slide-in-left_320ms_cubic-bezier(0.65,0,0.35,1)]";

  return (
    <>
      {/* Mobile: its own full-screen takeover (see MobileVerificationFlow) —
          the dashboard chrome around this page (sidebar/topbar/bottom nav,
          all disabled anyway pre-verification) was crowding an already
          camera-heavy flow on small screens. */}
      <MobileVerificationFlow />

      {/* Desktop: unchanged — single-panel wizard inside the dashboard shell. */}
      <div className="hidden lg:flex h-full flex-col p-6 xl:p-8 overflow-hidden">
        <div className="max-w-[1100px] mx-auto w-full flex flex-col min-h-0 flex-1">
          <div className="flex-shrink-0">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground mb-2">
              <Lock size={11} />
              Secure identity verification
            </div>
            <h1 className="font-display font-semibold text-xl text-foreground">Verify your identity</h1>
            <p className="text-[13.5px] text-muted-foreground mt-1">
              Complete the steps below to unlock your Bolean account.
            </p>

            <div className="mt-4 mb-1">
              <Stepper steps={STEPS} currentIndex={STEP_INDEX[step]} />
            </div>
          </div>

          {/* Top-aligned, not vertically centered: centering an
              overflow-y-auto container clips its top overflow unreachably
              (scrollTop can't go negative), which would silently crop the
              step's heading on shorter screens. no-scrollbar keeps the
              safety-net scroll working without a visible scrollbar. */}
          <div className="no-scrollbar mt-4 flex-1 min-h-0 rounded-2xl border border-border bg-card/60 p-6 sm:p-7 xl:p-9 overflow-y-auto relative">
            <div key={step} className={`w-full ${animationClass}`}>
              {step === "id" && (
                <IdUploadPanel
                  file={idFile}
                  onFileSelected={setIdFile}
                  onContinue={() => goTo("selfie", "forward")}
                />
              )}

              {step === "selfie" && (
                <SelfieCapturePanel
                  onCaptured={(blob) => {
                    setSelfieBlob(blob);
                    goTo("review", "forward");
                  }}
                />
              )}

              {step === "review" && selfieBlob && (
                <SelfieReviewPanel
                  selfieBlob={selfieBlob}
                  onRetake={() => {
                    setSelfieBlob(null);
                    goTo("selfie", "backward");
                  }}
                  onConfirm={() => {
                    goTo("verifying", "forward");
                    if (idFile) void submit(selfieBlob, idFile, () => setSelfieBlob(null));
                  }}
                />
              )}

              {step === "verifying" && submitStatus && (
                <VerificationResultPanel
                  status={submitStatus}
                  uploadProgress={uploadProgress}
                  errorMessage={errorMessage}
                  isDuplicate={isDuplicate}
                  onRetry={() => goTo("review", "backward")}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
