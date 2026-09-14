"use client";

import { useEffect, useState } from "react";
import { Loader2, CameraOff, AlertTriangle, Check, RotateCcw } from "lucide-react";
import { clsx } from "clsx";
import { Button } from "@/components/ui/Button";
import { useCameraCapture } from "@/hooks/useCameraCapture";

/**
 * Mobile face-capture slide — a single circular frame that carries the
 * whole capture -> review sub-flow (live feed, then the captured still with
 * a confirmation badge), rather than two separate rectangular panels. This
 * is the standard visual language for biometric capture (Face ID, KYC
 * flows), and lets the browser's own permission prompt be the only "please
 * allow camera" UI — no custom in-app gate before it (camera access is
 * requested automatically on mount).
 *
 * Fills the slide's full height: the frame/caption sit naturally near the
 * top, the action (shutter, or retake/continue) is pinned to the bottom
 * within thumb reach instead of trailing right under the frame.
 */
export function MobileFaceCapture({ onConfirmed }: { onConfirmed: (blob: Blob) => void }) {
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { state, videoRef, requestCamera, handleCapture, qualityMessage, capturing, videoReady, setVideoReady } =
    useCameraCapture(setCapturedBlob, true);

  useEffect(() => {
    if (!capturedBlob) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(capturedBlob);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [capturedBlob]);

  const reviewing = !!capturedBlob;

  const retake = () => {
    setCapturedBlob(null);
    void requestCamera();
  };

  return (
    <div className="h-full flex flex-col items-center justify-between">
      <div className="w-full flex flex-col items-center pt-2">
        <div
          className={clsx(
            "relative w-[62vw] max-w-[260px] aspect-square rounded-full border-4 bg-[#050505] overflow-hidden flex items-center justify-center transition-colors",
            reviewing ? "border-success/60" : "border-border",
          )}
        >
          {reviewing && previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="Captured selfie preview" className="w-full h-full object-cover" />
          ) : state === "live" ? (
            <>
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                onLoadedMetadata={() => setVideoReady(true)}
                className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
              />
              {!videoReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#050505]">
                  <Loader2 size={20} className="text-muted-foreground animate-spin" />
                </div>
              )}
            </>
          ) : state === "denied" ? (
            <div className="flex flex-col items-center gap-2 px-6 text-center">
              <CameraOff size={18} className="text-destructive" />
              <p className="text-[11px] text-muted-foreground leading-snug">Camera access denied</p>
            </div>
          ) : state === "unavailable" ? (
            <div className="flex flex-col items-center gap-2 px-6 text-center">
              <AlertTriangle size={18} className="text-warning" />
              <p className="text-[11px] text-muted-foreground leading-snug">No camera found</p>
            </div>
          ) : (
            <Loader2 size={20} className="text-muted-foreground animate-spin" />
          )}

          {reviewing && (
            <span className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-success border-2 border-background flex items-center justify-center">
              <Check size={14} strokeWidth={3} className="text-success-foreground" />
            </span>
          )}
        </div>

        <p className="text-[13px] text-muted-foreground text-center mt-4 max-w-[280px]">
          {reviewing
            ? "Does this photo look clear?"
            : state === "live"
              ? "Position your face inside the circle and hold steady."
              : state === "denied" || state === "unavailable"
                ? "You can retry once camera access is available."
                : "Starting your camera…"}
        </p>

        {qualityMessage && !reviewing && <p className="text-[12.5px] text-warning text-center mt-2">{qualityMessage}</p>}
      </div>

      <div className="w-full flex-shrink-0 flex flex-col items-center pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        {reviewing ? (
          <div className="flex gap-3 w-full max-w-[300px]">
            <Button type="button" variant="outline" onClick={retake} className="flex-1">
              <RotateCcw size={14} /> Retake
            </Button>
            <Button type="button" onClick={() => capturedBlob && onConfirmed(capturedBlob)} className="flex-1">
              Continue
            </Button>
          </div>
        ) : state === "live" ? (
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={handleCapture}
              disabled={capturing || !videoReady}
              aria-label="Capture selfie"
              className="w-16 h-16 rounded-full border-4 border-foreground/15 bg-primary flex items-center justify-center transition-transform active:scale-95 disabled:opacity-50"
            >
              {capturing ? (
                <Loader2 size={20} className="text-primary-foreground animate-spin" />
              ) : (
                <span className="w-11 h-11 rounded-full bg-primary-foreground/90" />
              )}
            </button>
            <span className="text-[12.5px] font-medium text-foreground">
              {capturing ? "Capturing…" : "Capture"}
            </span>
          </div>
        ) : state === "denied" || state === "unavailable" ? (
          <Button type="button" variant="outline" onClick={requestCamera}>
            Try again
          </Button>
        ) : null}
      </div>
    </div>
  );
}
