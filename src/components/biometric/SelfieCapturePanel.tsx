"use client";

import { Camera, CameraOff, AlertTriangle, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCameraCapture } from "@/hooks/useCameraCapture";

const CHECKLIST = ["Good lighting", "Face clearly visible", "Look directly at camera"];

function FrameShell({ children }: { children: React.ReactNode }) {
  return (
    // Height-driven, not width-driven: aspect-ratio only computes the auto
    // dimension from the definite one. With w-full + max-height both set,
    // the browser clamps height without ever recomputing (shrinking) the
    // width, breaking the ratio. An explicit height with width left auto
    // (no w-full/max-w) lets aspect-ratio derive the correct width from it.
    <div className="relative mx-auto h-[min(420px,31vh)] max-w-full aspect-[4/3] rounded-2xl border border-border bg-[#050505] overflow-hidden flex items-center justify-center">
      {children}
    </div>
  );
}

function StatusPanel({
  icon,
  title,
  message,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3.5 text-center px-10 max-w-[380px]">
      <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-border flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-sm text-foreground font-medium">{title}</p>
        <p className="text-[12.5px] text-muted-foreground mt-1 leading-relaxed">{message}</p>
      </div>
      {action}
    </div>
  );
}

export function SelfieCapturePanel({ onCaptured }: { onCaptured: (blob: Blob) => void }) {
  const { state, videoRef, requestCamera, handleCapture, qualityMessage, capturing, videoReady, setVideoReady } =
    useCameraCapture(onCaptured);

  return (
    <div className="max-w-[640px] mx-auto w-full">
      <div className="text-center mb-3">
        <h2 className="font-display font-semibold text-xl text-foreground">Take a selfie</h2>
        <p className="text-[13px] text-muted-foreground mt-1.5">
          Position your face inside the frame. Look directly at the camera.
        </p>
      </div>

      <FrameShell>
        {state === "idle" && (
          <StatusPanel
            icon={<Camera size={22} className="text-muted-foreground" />}
            title="Camera access required"
            message="Bolean needs access to your camera to capture your biometric selfie."
            action={
              <Button type="button" onClick={requestCamera} className="mt-1">
                Allow camera access
              </Button>
            }
          />
        )}

        {state === "loading" && (
          <StatusPanel
            icon={<Loader2 size={22} className="text-muted-foreground animate-spin" />}
            title="Starting camera…"
            message="This will only take a moment."
          />
        )}

        {state === "denied" && (
          <StatusPanel
            icon={<CameraOff size={22} className="text-destructive" />}
            title="Camera access denied"
            message="Please allow camera access in your browser settings, then try again."
            action={
              <Button type="button" variant="outline" onClick={requestCamera} className="mt-1">
                Try again
              </Button>
            }
          />
        )}

        {state === "unavailable" && (
          <StatusPanel
            icon={<AlertTriangle size={22} className="text-warning" />}
            title="Camera unavailable"
            message="We couldn't find a camera on this device. Please use a device with a camera to continue."
            action={
              <Button type="button" variant="outline" onClick={requestCamera} className="mt-1">
                Try again
              </Button>
            }
          />
        )}

        {state === "live" && (
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
                <Loader2 size={22} className="text-muted-foreground animate-spin" />
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="w-[46%] aspect-[3/4] rounded-full border-2 border-primary"
                style={{ boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)" }}
              />
              {/* corner brackets for a deliberate "capture interface" feel */}
              {[
                "top-6 left-6 border-t-2 border-l-2",
                "top-6 right-6 border-t-2 border-r-2",
                "bottom-6 left-6 border-b-2 border-l-2",
                "bottom-6 right-6 border-b-2 border-r-2",
              ].map((pos) => (
                <div key={pos} className={`absolute w-6 h-6 border-primary/50 ${pos}`} />
              ))}
            </div>
          </>
        )}
      </FrameShell>

      {qualityMessage && <p className="text-sm text-warning text-center mt-3">{qualityMessage}</p>}

      {state === "live" && (
        <>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-3">
            {CHECKLIST.map((item) => (
              <div key={item} className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
                <Check size={12} className="text-success" />
                {item}
              </div>
            ))}
          </div>
          <Button
            type="button"
            onClick={handleCapture}
            loading={capturing}
            disabled={capturing || !videoReady}
            className="w-full mt-3"
          >
            <Camera size={15} /> Capture selfie
          </Button>
        </>
      )}
    </div>
  );
}
