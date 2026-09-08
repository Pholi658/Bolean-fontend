"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { logErrorInDev } from "@/lib/errors";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    logErrorInDev("app/error-boundary", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-2xl bg-card border border-border p-8 text-center space-y-4">
        <h1 className="font-display font-semibold text-xl text-foreground">Something went wrong</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Please try again. If this keeps happening, contact support.
        </p>
        <Button onClick={reset} className="w-full">
          Try again
        </Button>
      </div>
    </div>
  );
}
