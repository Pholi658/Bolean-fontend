import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { UserResponse } from "@/lib/types";

export function initialsOf(fullName: string): string {
  return fullName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function UserRow({
  user,
  onInteract,
  renderActions,
}: {
  user: UserResponse;
  onInteract: () => void;
  renderActions: (user: UserResponse) => React.ReactNode;
}) {
  return (
    <Card className="p-4 flex items-center gap-3" onClick={onInteract}>
      <div className="w-10 h-10 rounded-lg bg-secondary text-foreground flex items-center justify-center text-sm font-semibold flex-shrink-0">
        {initialsOf(user.full_name)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm text-foreground font-medium truncate">{user.full_name}</p>
          {user.is_verified && <CheckCircle2 size={13} className="text-success flex-shrink-0" />}
        </div>
        <p className="text-[11.5px] text-muted-foreground font-mono">{user.phone_number}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">{renderActions(user)}</div>
    </Card>
  );
}
