import { ShieldCheck, Video } from "lucide-react";

const TIPS = [
  {
    icon: ShieldCheck,
    title: "Verify before you send funds",
    body: "Always check the borrower's profile details — including their verified ID and selfie — against the person actually in front of you.",
  },
  {
    icon: Video,
    title: "Meeting remotely?",
    body: "Video call the borrower first to confirm you're speaking with the real profile owner before agreeing to anything.",
  },
];

export function CreateSessionTipsCard() {
  return (
    <div className="rounded-xl border border-border bg-foreground/[0.015] p-5 sm:p-6">
      <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase mb-4">
        Before you lend
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {TIPS.map((tip) => (
          <div key={tip.title} className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center flex-shrink-0">
              <tip.icon size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-[13.5px] text-foreground font-medium">{tip.title}</p>
              <p className="text-[12.5px] text-muted-foreground leading-relaxed mt-0.5">{tip.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
