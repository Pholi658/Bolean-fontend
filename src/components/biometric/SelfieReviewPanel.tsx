"use client";

import { useEffect, useState } from "react";
import { RotateCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function SelfieReviewPanel({
  selfieBlob,
  onRetake,
  onConfirm,
}: {
  selfieBlob: Blob;
  onRetake: () => void;
  onConfirm: () => void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(selfieBlob);
    setPreviewUrl(url);
    // Selfie preview URLs are revoked the moment this panel unmounts —
    // never left dangling in memory beyond the review step itself.
    return () => URL.revokeObjectURL(url);
  }, [selfieBlob]);

  return (
    <div className="max-w-[640px] mx-auto w-full">
      <div className="text-center mb-3">
        <h2 className="font-display font-semibold text-xl text-foreground">Selfie captured</h2>
        <p className="text-[13px] text-muted-foreground mt-1.5">Does this photo look clear?</p>
      </div>

      {/* Height-driven, not width-driven: aspect-ratio only computes the
          auto dimension from the definite one. With w-full + max-height
          both set, the browser clamps height without ever recomputing
          (shrinking) the width, breaking the ratio. Setting an explicit
          height and leaving width to auto (no w-full/max-w) lets
          aspect-ratio derive the correct width from it instead. */}
      <div className="relative mx-auto h-[min(420px,33vh)] max-w-full aspect-[3/4] rounded-2xl border border-border bg-black overflow-hidden">
        {previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="Captured selfie preview" className="w-full h-full object-cover" />
        )}
      </div>

      <div className="flex gap-3 mt-4 max-w-[340px] mx-auto">
        <Button type="button" variant="outline" onClick={onRetake} className="flex-1">
          <RotateCcw size={14} /> Retake
        </Button>
        <Button type="button" onClick={onConfirm} className="flex-1">
          <Check size={14} /> Use this selfie
        </Button>
      </div>
    </div>
  );
}
