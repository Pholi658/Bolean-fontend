"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Lock } from "lucide-react";
import imageCompression from "browser-image-compression";
import { Stepper, type StepDef } from "@/components/biometric/Stepper";
import { IdUploadPanel } from "@/components/biometric/IdUploadPanel";
import { SelfieCapturePanel } from "@/components/biometric/SelfieCapturePanel";
import { SelfieReviewPanel } from "@/components/biometric/SelfieReviewPanel";
import { VerificationResultPanel } from "@/components/biometric/VerificationResultPanel";
import { submitBiometrics, fetchCurrentUser } from "@/lib/api/auth";
import { getFriendlyErrorMessage, isDuplicateFaceError } from "@/lib/errors";
import { CURRENT_USER_QUERY_KEY } from "@/hooks/useAuth";

type WizardStep = "id" | "selfie" | "review" | "verifying";
type Direction = "forward" | "backward";

const STEPS: StepDef[] = [
  { label: "Personal details" },
  { label: "Identity document" },
  { label: "Selfie" },
  { label: "Verification" },
];

const STEP_INDEX: Record<WizardStep, number> = { id: 1, selfie: 2, review: 2, verifying: 3 };

const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 1024,
  useWebWorker: true,
  fileType: "image/jpeg" as const,
};

async function compressToJpeg(input: Blob, filename: string): Promise<File> {
  const file = input instanceof File ? input : new File([input], filename, { type: input.type });
  return imageCompression(file, COMPRESSION_OPTIONS);
}

export default function VerificationWorkspace() {
  const queryClient = useQueryClient();

  const [step, setStep] = useState<WizardStep>("id");
  const [direction, setDirection] = useState<Direction>("forward");
  const [idFile, setIdFile] = useState<File | null>(null);
  const [selfieBlob, setSelfieBlob] = useState<Blob | null>(null);
  const [submitStatus, setSubmitStatus] = useState<"processing" | "success" | "failure" | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDuplicate, setIsDuplicate] = useState(false);

  const goTo = (next: WizardStep, dir: Direction) => {
    setDirection(dir);
    setStep(next);
  };

  const submitVerification = async (selfie: Blob, id: File) => {
    setSubmitStatus("processing");
    setUploadProgress(0);
    setErrorMessage(null);
    setIsDuplicate(false);
    try {
      const [compressedSelfie, compressedId] = await Promise.all([
        compressToJpeg(selfie, "selfie.jpg"),
        compressToJpeg(id, "id-document.jpg"),
      ]);
      await submitBiometrics(compressedSelfie, compressedId, setUploadProgress);
      await queryClient.fetchQuery({ queryKey: CURRENT_USER_QUERY_KEY, queryFn: fetchCurrentUser });
      // Selfie/ID data is cleared from memory the moment it's no longer
      // needed, whether that's success (nothing left to hold) or failure
      // (kept only long enough for the "Try again" retry below).
      setSelfieBlob(null);
      setSubmitStatus("success");
    } catch (err) {
      setErrorMessage(getFriendlyErrorMessage(err));
      setIsDuplicate(isDuplicateFaceError(err));
      setSubmitStatus("failure");
      setUploadProgress(0);
    }
  };

  const animationClass =
    direction === "forward"
      ? "animate-[step-slide-in-right_320ms_cubic-bezier(0.65,0,0.35,1)]"
      : "animate-[step-slide-in-left_320ms_cubic-bezier(0.65,0,0.35,1)]";

  return (
    <div className="h-full flex flex-col p-6 xl:p-8 overflow-hidden">
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
                  if (idFile) void submitVerification(selfieBlob, idFile);
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
  );
}
