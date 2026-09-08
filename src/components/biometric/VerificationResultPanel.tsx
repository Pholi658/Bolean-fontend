import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TalkToAdminButton } from "@/components/support/TalkToAdminButton";

type Status = "processing" | "success" | "failure";

export function VerificationResultPanel({
  status,
  uploadProgress,
  errorMessage,
  isDuplicate = false,
  onRetry,
}: {
  status: Status;
  uploadProgress: number;
  errorMessage?: string | null;
  /** True for the duplicate-face rejection specifically — retrying with the
   *  same face will only fail again, so "Try again" is replaced with a
   *  direct path to manual registration via admin instead. */
  isDuplicate?: boolean;
  onRetry: () => void;
}) {
  return (
    <div className="max-w-[480px] mx-auto w-full flex flex-col items-center text-center gap-4 py-10">
      {status === "processing" && (
        <>
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Loader2 size={26} className="text-primary animate-spin" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-xl text-foreground">Verifying your identity</h2>
            <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">
              {uploadProgress > 0 ? `Uploading… ${uploadProgress}%` : "This usually takes a few seconds."}
            </p>
          </div>
        </>
      )}

      {status === "success" && (
        <>
          <div className="w-16 h-16 rounded-2xl bg-success/15 border border-success/30 flex items-center justify-center">
            <CheckCircle2 size={26} className="text-success" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-xl text-foreground">Identity verified</h2>
            <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">
              Your account is unlocking now.
            </p>
          </div>
        </>
      )}

      {status === "failure" && (
        <>
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/25 flex items-center justify-center">
            <XCircle size={26} className="text-destructive" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-xl text-foreground">
              {isDuplicate ? "We need a human to finish this" : "Verification failed"}
            </h2>
            <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">
              {errorMessage ?? "Something went wrong. Please try again."}
            </p>
          </div>
          {isDuplicate ? (
            <div className="w-full max-w-[280px]">
              <TalkToAdminButton variant="sidebar" />
            </div>
          ) : (
            <Button type="button" variant="outline" onClick={onRetry} className="mt-1">
              Try again
            </Button>
          )}
        </>
      )}
    </div>
  );
}
