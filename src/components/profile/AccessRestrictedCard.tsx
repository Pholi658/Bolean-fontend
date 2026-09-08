import { Lock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function AccessRestrictedCard({
  requested,
  requestPending,
  error,
  onRequestAccess,
}: {
  requested: boolean;
  requestPending: boolean;
  error?: string | null;
  onRequestAccess: () => void;
}) {
  return (
    <Card className="p-8 flex flex-col items-center text-center gap-3">
      <Lock size={22} className="text-muted-foreground" />
      <h2 className="font-display font-semibold text-lg text-foreground">Session history is restricted</h2>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
        Request access to view this person&apos;s session history and reviews. They&apos;ll need to
        approve your request.
      </p>
      {requested ? (
        <p className="text-sm text-success mt-2">Request sent — you&apos;ll be notified once approved.</p>
      ) : (
        <>
          <Button type="button" onClick={onRequestAccess} loading={requestPending} className="mt-2">
            Request Profile Access
          </Button>
          {error && <p className="text-sm text-destructive mt-1">{error}</p>}
        </>
      )}
    </Card>
  );
}
