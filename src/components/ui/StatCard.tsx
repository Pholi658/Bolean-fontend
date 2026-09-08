import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

export function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  sub?: ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-3.5">
        {icon}
        <span>{label}</span>
      </div>
      <div className="flex items-baseline justify-between">
        <p className="font-display font-semibold text-[30px] text-foreground leading-none">{value}</p>
        {sub}
      </div>
    </Card>
  );
}
