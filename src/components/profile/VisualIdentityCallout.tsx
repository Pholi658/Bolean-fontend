import { ShieldAlert, ScanFace } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function VisualIdentityCallout({ onConfirm }: { onConfirm: () => void }) {
  return (
    <div className="rounded-xl border border-warning/30 bg-warning/[0.06] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-warning/15 border border-warning/30 flex items-center justify-center flex-shrink-0">
        <ShieldAlert size={18} className="text-warning" />
      </div>
      <div className="flex-1">
        <h2 className="text-[14.5px] font-medium text-foreground">Confirm who you&apos;re dealing with</h2>
        <p className="text-[13px] text-muted-foreground leading-relaxed mt-1 max-w-2xl">
          Before entering into a transaction with this person, confirm that the person you&apos;re dealing
          with matches the verified identity shown on this profile. This helps protect you from
          impersonation and fraud.
        </p>
      </div>
      <Button type="button" onClick={onConfirm} className="flex-shrink-0">
        <ScanFace size={15} />
        Confirm visual identity
      </Button>
    </div>
  );
}
