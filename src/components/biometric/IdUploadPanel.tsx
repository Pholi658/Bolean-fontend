"use client";

import { useRef, useState } from "react";
import { FileText, Upload, CheckCircle2, RefreshCw } from "lucide-react";
import { clsx } from "clsx";
import { Button } from "@/components/ui/Button";
import { formatFileSize } from "@/lib/format";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export function IdUploadPanel({
  file,
  onFileSelected,
  onContinue,
}: {
  file: File | null;
  onFileSelected: (file: File) => void;
  onContinue: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const acceptFile = (candidate: File | undefined) => {
    if (!candidate) return;
    if (!ACCEPTED_TYPES.includes(candidate.type)) {
      setError("Please upload a JPG or PNG image.");
      return;
    }
    if (candidate.size > MAX_SIZE_BYTES) {
      setError("That file is too large. Max 10MB.");
      return;
    }
    setError(null);
    onFileSelected(candidate);
  };

  return (
    <div className="max-w-[640px] mx-auto w-full">
      <div className="text-center mb-4">
        <h2 className="font-display font-semibold text-xl text-foreground">Upload your ID document</h2>
        <p className="text-[13px] text-muted-foreground mt-1.5">
          A Lesotho National ID, Passport, or Driver&apos;s Licence.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="hidden"
        onChange={(e) => acceptFile(e.target.files?.[0])}
      />

      {!file ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            acceptFile(e.dataTransfer.files?.[0]);
          }}
          className={clsx(
            "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-8 py-9 text-center transition-colors",
            dragActive ? "border-primary bg-primary/[0.04]" : "border-border bg-foreground/[0.015]",
          )}
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <FileText size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-sm text-foreground font-medium">
              Drag and drop your document here or choose a file
            </p>
          </div>
          <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
            <Upload size={14} /> Choose file
          </Button>
          <p className="text-[11.5px] text-muted-foreground/70 font-mono">JPG or PNG · Max 10MB</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-success/30 bg-success/[0.04] px-6 py-5 flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-success/15 border border-success/30 flex items-center justify-center">
            <CheckCircle2 size={20} className="text-success" />
          </div>
          <div>
            <p className="text-sm text-foreground font-medium truncate max-w-[360px]">{file.name}</p>
            <p className="text-[11.5px] text-muted-foreground font-mono mt-0.5">
              {formatFileSize(file.size)} · Uploaded
            </p>
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw size={12} /> Replace
          </button>
        </div>
      )}

      {error && <p className="text-sm text-destructive text-center mt-3">{error}</p>}

      <Button type="button" onClick={onContinue} disabled={!file} className="w-full mt-4">
        Continue
      </Button>
    </div>
  );
}
