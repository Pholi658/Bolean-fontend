import { useState, useRef } from "react";
import { ChevronLeft, Camera, Check, CheckCircle, Upload, X } from "lucide-react";
import { clsx } from "clsx";
import { BoleanLogo } from "@/components/ui";
import type { AppScreen } from "@/lib/types";

export default function RegisterStep2({ go }: { go: (s: AppScreen) => void }) {
  const [captured, setCaptured] = useState(false);
  const [idUploaded, setIdUploaded] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const canSubmit = captured && idUploaded;

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <button onClick={() => go("reg1")} className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft size={20} />
        </button>
        <BoleanLogo size="sm" />
        <div className="w-5" />
      </div>

      <div className="px-5 py-5 max-w-sm mx-auto">
        <div className="flex gap-2 mb-1">
          <div className="h-0.5 flex-1 bg-primary" />
          <div className="h-0.5 flex-1 bg-primary" />
        </div>
        <p className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase mb-5">
          Step 2 of 2 — Identity Verification
        </p>

        <div className="space-y-8 pb-10">
          {/* Camera Section */}
          <div className="space-y-4">
            <div>
              <h2 className="font-display font-bold text-xl text-foreground">Biometric Capture</h2>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                Position your face in the oval. Look straight ahead. Ensure good lighting.
              </p>
            </div>

            {/* Viewfinder */}
            <div className="relative w-full aspect-[3/4] bg-[#080808] border border-border rounded-[4px] overflow-hidden flex items-center justify-center">
              {!captured ? (
                <>
                  <div className="absolute inset-0 opacity-[0.04]"
                    style={{ backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.15) 2px,rgba(255,255,255,0.15) 4px)" }} />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[62%] aspect-[3/4] rounded-full border-2 border-primary"
                      style={{ boxShadow: "0 0 0 9999px rgba(0,0,0,0.65)" }} />
                  </div>
                  {(["top-3 left-3 border-t-2 border-l-2", "top-3 right-3 border-t-2 border-r-2",
                     "bottom-3 left-3 border-b-2 border-l-2", "bottom-3 right-3 border-b-2 border-r-2"] as const).map((c, i) => (
                    <div key={i} className={`absolute w-6 h-6 border-primary/50 ${c}`} />
                  ))}
                  <div className="absolute w-[62%] aspect-[3/4] rounded-full border border-primary/15 animate-ping"
                    style={{ animationDuration: "2.5s" }} />
                  <Camera size={28} className="text-muted-foreground opacity-20 absolute" />
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="w-[62%] aspect-[3/4] rounded-full bg-[#111] border-2 border-primary flex items-center justify-center">
                    <Camera size={44} className="text-muted-foreground opacity-25" />
                  </div>
                  <div className="flex items-center gap-1.5 text-[#22C55E]">
                    <CheckCircle size={13} />
                    <span className="text-xs font-mono">Photo captured</span>
                  </div>
                </div>
              )}
            </div>

            {!captured ? (
              <button onClick={() => setCaptured(true)}
                className="w-full py-3 bg-primary text-primary-foreground font-display font-bold tracking-wider uppercase text-sm rounded-[4px] hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                <Camera size={16} /> Capture Photo
              </button>
            ) : (
              <div className="flex gap-3">
                <button onClick={() => setCaptured(false)}
                  className="flex-1 py-2.5 border border-border text-foreground text-sm font-medium rounded-[4px] hover:bg-secondary transition-colors">
                  Retake
                </button>
                <div className="flex-1 py-2.5 bg-[#001800] border border-[#22C55E] text-[#22C55E] text-sm font-bold rounded-[4px] flex items-center justify-center gap-1.5">
                  <Check size={14} /> Confirmed
                </div>
              </div>
            )}
          </div>

          {/* ID Upload */}
          <div className="space-y-4">
            <div>
              <h2 className="font-display font-bold text-xl text-foreground">Upload ID Document</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Lesotho National ID, Passport, or Driver's Licence.
              </p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { if (e.target.files?.length) setIdUploaded(true); }} />
            {!idUploaded ? (
              <button onClick={() => fileRef.current?.click()}
                className="w-full py-5 border border-dashed border-border rounded-[4px] flex flex-col items-center gap-2 hover:border-primary hover:bg-[#0D0A00] transition-colors group">
                <Upload size={22} className="text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  Tap to upload ID photo
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-[#001800] border border-[#22C55E] rounded-[4px]">
                <CheckCircle size={15} className="text-[#22C55E] flex-shrink-0" />
                <span className="text-sm text-[#22C55E] font-mono">ID document uploaded</span>
                <button onClick={() => setIdUploaded(false)} className="ml-auto text-muted-foreground hover:text-foreground">
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          <button onClick={() => canSubmit && go("consumer")} disabled={!canSubmit}
            className={clsx(
              "w-full py-3.5 font-display font-bold tracking-[0.12em] uppercase text-sm rounded-[4px] transition-all",
              canSubmit ? "bg-primary text-primary-foreground hover:opacity-90" : "bg-[#181818] text-[#383838] cursor-not-allowed"
            )}>
            Submit Registration
          </button>
          {!canSubmit && (
            <p className="text-[11px] text-muted-foreground text-center font-mono -mt-2">
              Complete photo capture and ID upload to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
