"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { captureFrameToCanvas, canvasToBlob, checkImageQuality } from "@/lib/image-quality";

export type CameraState = "idle" | "loading" | "live" | "denied" | "unavailable";

/**
 * getUserMedia + frame-capture + quality-check pipeline, shared by the
 * desktop capture panel and the mobile face-capture UI — only the JSX
 * around it differs (rectangular frame + manual "allow" gate on desktop,
 * circular frame + auto-requested permission on mobile).
 */
export function useCameraCapture(onCaptured: (blob: Blob) => void, autoStart = false) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<CameraState>("idle");
  const [qualityMessage, setQualityMessage] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  // Always release the camera on unmount, no matter what state we're in.
  useEffect(() => stopStream, [stopStream]);

  // The <video> element only mounts once state flips to "live", so the
  // stream can't be attached inline inside requestCamera (the ref is still
  // null at that point) — attach it here once the element actually exists.
  useEffect(() => {
    if (state === "live" && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [state]);

  const requestCamera = useCallback(async () => {
    setState("loading");
    setVideoReady(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      setState("live");
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setState("denied");
      } else {
        setState("unavailable");
      }
    }
  }, []);

  // Auto-request on mount for callers that want the browser's own
  // permission prompt to be the only "please allow camera" UI needed,
  // instead of a custom in-app gate before it.
  useEffect(() => {
    if (autoStart) void requestCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  const handleCapture = useCallback(async () => {
    if (!videoRef.current || !videoRef.current.videoWidth || !videoRef.current.videoHeight) return;
    setCapturing(true);
    setQualityMessage(null);
    const canvas = captureFrameToCanvas(videoRef.current);
    const quality = checkImageQuality(canvas);

    if (!quality.passed) {
      setQualityMessage(quality.message ?? "Image too dark or blurry. Please retake in better lighting.");
      setCapturing(false);
      return;
    }

    const blob = await canvasToBlob(canvas);
    stopStream();
    onCaptured(blob);
  }, [onCaptured, stopStream]);

  return {
    state,
    videoRef,
    requestCamera,
    handleCapture,
    qualityMessage,
    capturing,
    videoReady,
    setVideoReady,
    stopStream,
  };
}
