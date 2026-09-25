"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import imageCompression from "browser-image-compression";
import { submitBiometrics, fetchCurrentUser } from "@/lib/api/auth";
import { getFriendlyErrorMessage, isDuplicateFaceError } from "@/lib/errors";
import { CURRENT_USER_QUERY_KEY } from "@/hooks/useAuth";

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

/**
 * The compress -> upload -> refetch-profile -> error-classify pipeline for
 * biometric submission — shared by the desktop wizard and the mobile
 * full-screen flow (VerificationWorkspace / MobileVerificationFlow) so
 * there's exactly one implementation of it, not two drifting copies.
 */
export function useBiometricSubmission() {
  const queryClient = useQueryClient();
  const [submitStatus, setSubmitStatus] = useState<"processing" | "success" | "failure" | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDuplicate, setIsDuplicate] = useState(false);

  const submit = async (selfie: Blob, id: File, onSuccess?: () => void) => {
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
      setSubmitStatus("success");
      onSuccess?.();
    } catch (err) {
      setErrorMessage(getFriendlyErrorMessage(err));
      setIsDuplicate(isDuplicateFaceError(err));
      setSubmitStatus("failure");
      setUploadProgress(0);
    }
  };

  // Back to "nothing submitted yet" — callers that render the result panel
  // off `submitStatus` (MobileVerificationFlow) need this to leave it on
  // retry, otherwise the panel keeps winning and the retry looks dead.
  const reset = () => {
    setSubmitStatus(null);
    setUploadProgress(0);
    setErrorMessage(null);
    setIsDuplicate(false);
  };

  return { submitStatus, uploadProgress, errorMessage, isDuplicate, submit, reset };
}
