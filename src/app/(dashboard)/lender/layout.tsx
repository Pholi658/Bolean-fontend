"use client";

import { ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useCurrentUser } from "@/hooks/useAuth";

/**
 * Lender mode is a switch inside one account (no separate lender account
 * type — see the Bolean backend's User model), but the security spec calls
 * for gating it on the profile's is_verified flag. Enforced here as
 * conditional UI, not a route-level redirect, consistent with that model.
 */
export default function LenderLayout({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) return null;

  if (user && !user.is_verified) {
    return (
      <div className="p-7 max-w-md">
        <Card className="p-8 flex flex-col items-center text-center gap-3">
          <ShieldAlert size={26} className="text-warning" />
          <h2 className="font-display font-semibold text-lg text-foreground">Verification Required</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Lender mode is only available to verified accounts. Once your account is verified, you&apos;ll
            be able to issue and track credit sessions here.
          </p>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
