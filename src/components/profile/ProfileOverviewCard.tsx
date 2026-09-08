import { CheckCircle2, Mail, Phone, MessageSquare, Calendar } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { UserResponse } from "@/lib/types";

function initialsOf(fullName: string): string {
  return fullName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function DetailRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ size?: number }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-foreground/[0.04] border border-border flex items-center justify-center flex-shrink-0">
        <Icon size={14} />
      </div>
      <div className="min-w-0">
        <p className="text-[10.5px] text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="text-[13.5px] text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}

export function ProfileOverviewCard({ user, actions }: { user: UserResponse; actions?: React.ReactNode }) {
  const memberSince = new Date(user.created_at).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
  const statusLine = user.is_biometrically_verified ? "Identity verified" : "Not yet identity-verified";

  return (
    // A single wrapping element, not a bare fragment — ProfileView lays out
    // its sections with space-y-*, which spaces DOM siblings regardless of
    // which one is actually visible at the current breakpoint. Returning
    // two always-present top-level nodes here would make that margin land
    // between them instead of between this component and the next section.
    <div>
      {/* Mobile: photo/name/verification stand alone at the top (no card,
          no side-by-side detail grid) — contact details move into their
          own card below as a plain vertical list instead of a dense grid. */}
      <div className="lg:hidden">
        <div className="flex flex-col items-center text-center px-4 pt-2 pb-6">
          <div className="w-20 h-20 rounded-2xl bg-secondary text-foreground flex items-center justify-center text-2xl font-semibold">
            {initialsOf(user.full_name)}
          </div>
          <div className="flex items-center gap-1.5 mt-3.5">
            <h1 className="font-display font-semibold text-xl text-foreground">{user.full_name}</h1>
            {user.is_biometrically_verified && (
              <span title="Biometrically verified">
                <CheckCircle2 size={16} className="text-success flex-shrink-0" />
              </span>
            )}
          </div>
          <p className="text-[13px] text-muted-foreground mt-1">{statusLine}</p>
          {actions && <div className="mt-4 w-full max-w-[260px]">{actions}</div>}
        </div>

        <Card className="p-5 divide-y divide-border">
          <div className="pb-3.5">
            <DetailRow icon={Phone} label="Phone" value={user.phone_number} />
          </div>
          {user.whatsapp_number && (
            <div className="py-3.5">
              <DetailRow icon={MessageSquare} label="WhatsApp" value={user.whatsapp_number} />
            </div>
          )}
          <div className="py-3.5">
            <DetailRow icon={Calendar} label="Member since" value={memberSince} />
          </div>
          <div className="pt-3.5">
            <DetailRow icon={Mail} label="Email" value={user.email} />
          </div>
        </Card>
      </div>

      {/* Desktop: unchanged — single card, header row with inline actions,
          contact details as a compact grid underneath. */}
      <Card className="hidden lg:block p-6 sm:p-7">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-16 h-16 rounded-2xl bg-secondary text-foreground flex items-center justify-center text-xl font-semibold flex-shrink-0">
              {initialsOf(user.full_name)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-display font-semibold text-2xl text-foreground truncate">{user.full_name}</h1>
                {user.is_biometrically_verified && (
                  <span title="Biometrically verified">
                    <CheckCircle2 size={18} className="text-success flex-shrink-0" />
                  </span>
                )}
              </div>
              <p className="text-[13px] text-muted-foreground mt-0.5">{statusLine}</p>
            </div>
          </div>
          {actions && <div className="flex-shrink-0">{actions}</div>}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 border-t border-border">
          <DetailRow icon={Phone} label="Phone" value={user.phone_number} />
          <DetailRow icon={Mail} label="Email" value={user.email} />
          {user.whatsapp_number && (
            <DetailRow icon={MessageSquare} label="WhatsApp" value={user.whatsapp_number} />
          )}
          <DetailRow icon={Calendar} label="Member since" value={memberSince} />
        </div>
      </Card>
    </div>
  );
}
