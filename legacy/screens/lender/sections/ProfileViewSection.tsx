import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft, Shield, Lock, Eye, AlertTriangle,
  CheckCircle, XCircle, CreditCard, UserCheck, User,
} from "lucide-react";
import { clsx } from "clsx";
import { Avatar, StarRating, StatusBadge, PlausibilityBadge } from "@/components/ui";
import CreateSessionModal from "@/components/session/CreateSessionModal";
import { fmt, fmtDate } from "@/lib/utils";
import type { SearchUser, Session } from "@/lib/types";

// ── Identity Viewer Overlay ───────────────────────────────────────────────────

function IdentityViewer({
  user,
  countdown,
  onClose,
}: {
  user: SearchUser;
  countdown: number;
  onClose: () => void;
}) {
  const pct = (countdown / 20) * 100;
  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-card border border-primary/40 rounded-[4px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#0D0A00] border-b border-border">
          <div>
            <p className="font-display font-bold text-primary text-base">Identity Documents</p>
            <p className="text-[11px] font-mono text-muted-foreground">{user.name} · {user.phone}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#1C0000] border-2 border-[#EF4444]/50 flex items-center justify-center">
              <span className="font-mono font-bold text-[#EF4444] text-base leading-none">{countdown}</span>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Caution */}
          <div className="flex items-start gap-2.5 p-3 bg-[#1C0E00] border border-[#F97316]/40 rounded-[4px]">
            <AlertTriangle size={15} className="text-[#F97316] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#F97316] leading-relaxed font-medium">
              Verify that these documents match the person you are dealing with.
              Proceeding without verification may expose you to identity fraud.
              This window auto-closes in <strong>{countdown}</strong> seconds.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* National ID */}
            <div className="space-y-1.5">
              <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">National ID / Passport</p>
              <div className="bg-secondary border border-border rounded-[4px] h-36 flex flex-col items-center justify-center gap-2">
                <CreditCard size={28} className="text-muted-foreground opacity-30" />
                <div className="text-center">
                  <p className="text-[10px] font-mono text-muted-foreground">ID Document</p>
                  <p className="text-[10px] font-mono text-foreground/60 mt-0.5">{user.name}</p>
                </div>
                {user.isVerified && (
                  <div className="flex items-center gap-1">
                    <Shield size={10} className="text-primary" />
                    <span className="text-[9px] font-mono text-primary">Verified</span>
                  </div>
                )}
              </div>
            </div>

            {/* Biometric selfie */}
            <div className="space-y-1.5">
              <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Biometric Selfie</p>
              <div className="bg-secondary border border-border rounded-[4px] h-36 flex flex-col items-center justify-center gap-2">
                <Avatar name={user.name} size="lg" />
                <p className="text-[10px] font-mono text-muted-foreground">Selfie on File</p>
              </div>
            </div>
          </div>

          {/* Countdown bar */}
          <div className="space-y-1.5">
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-[#EF4444] rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-[10px] font-mono text-muted-foreground text-center">
              Window closes automatically in {countdown} second{countdown !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Session Record Row ────────────────────────────────────────────────────────

function SessionRecord({ session }: { session: Session }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={clsx(
      "border rounded-[4px] overflow-hidden",
      session.status === "DISPUTED" ? "bg-[#1A0012] border-[#F472B6]/20" :
      session.status === "DEFAULTED" ? "bg-[#0A0000] border-[#EF4444]/20" :
      "bg-card border-border"
    )}>
      <div
        className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[9px] font-mono text-muted-foreground flex-shrink-0">{session.id}</span>
          <StatusBadge status={session.status} />
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-mono text-muted-foreground">{session.transactionType}</p>
          </div>
          <p className="font-display font-bold text-sm text-foreground">{fmt(session.amount)}</p>
          <p className="text-[10px] font-mono text-muted-foreground hidden md:block">{fmtDate(session.dueDate)}</p>
        </div>
      </div>

      {open && (
        <div className="px-4 pb-4 pt-2 border-t border-border/50 space-y-2">
          <p className="text-xs text-muted-foreground leading-relaxed">{session.description}</p>
          <div className="flex flex-wrap gap-3 text-[10px] font-mono text-muted-foreground">
            {session.lenderName && <span>Lender: <span className="text-foreground">{session.lenderName}</span></span>}
            <span>Due: <span className="text-foreground">{fmtDate(session.dueDate)}</span></span>
            <span>Created: <span className="text-foreground">{fmtDate(session.createdAt)}</span></span>
          </div>
          {session.review && (
            <div className="flex items-center gap-2">
              <StarRating rating={session.review.rating} />
              <p className="text-xs text-foreground italic">"{session.review.comment}"</p>
            </div>
          )}
          {session.dispute && (
            <div className="flex items-start gap-2">
              <PlausibilityBadge rating={session.dispute.plausibility} />
              <p className="text-xs text-muted-foreground leading-relaxed flex-1">{session.dispute.issue}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Profile View ─────────────────────────────────────────────────────────

export default function ProfileViewSection({
  user,
  hasPermission,
  onBack,
  onRequestPermission,
  onLookupReviewer,
}: {
  user: SearchUser;
  hasPermission: boolean;
  onBack: () => void;
  onRequestPermission: (u: SearchUser) => void;
  onLookupReviewer: (name: string) => void;
}) {
  const [permissionRequested, setPermissionRequested] = useState(false);
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [showIdentity, setShowIdentity] = useState(false);
  const [countdown, setCountdown] = useState(20);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!showIdentity) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    setCountdown(20);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current!);
          setShowIdentity(false);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [showIdentity]);

  // ── Not Permitted screen ──────────────────────────────────────────────────
  if (!hasPermission) {
    return (
      <div className="max-w-md mx-auto py-6 space-y-5">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={15} /> Back to Search
        </button>

        <div className="bg-card border border-border rounded-[4px] p-6 space-y-5">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#1C0000] border border-[#EF4444]/30 flex items-center justify-center">
              <Lock size={26} className="text-[#EF4444]" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-foreground mb-1.5">Access Restricted</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You do not have permission to view{" "}
                <strong className="text-foreground">{user.name}'s</strong>{" "}
                credit profile. The consumer must grant you access before their full credit history is visible.
              </p>
            </div>
          </div>

          {/* Preview card */}
          <div className="flex items-center gap-3 p-3 bg-secondary rounded-[4px]">
            <Avatar name={user.name} size="md" />
            <div>
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              <p className="text-[11px] font-mono text-muted-foreground">{user.phone}</p>
              {user.isVerified
                ? <div className="flex items-center gap-1 mt-0.5"><Shield size={10} className="text-primary" /><span className="text-[10px] font-mono text-primary">Verified</span></div>
                : <span className="text-[10px] font-mono text-muted-foreground">Not verified</span>
              }
            </div>
          </div>

          {permissionRequested ? (
            <div className="flex items-center justify-center gap-2 py-3 bg-[#001800] border border-[#22C55E]/30 rounded-[4px]">
              <CheckCircle size={14} className="text-[#22C55E]" />
              <span className="text-sm text-[#22C55E] font-medium">Permission requested — awaiting consumer's response</span>
            </div>
          ) : (
            <button
              onClick={() => { onRequestPermission(user); setPermissionRequested(true); }}
              className="w-full py-3 bg-primary text-primary-foreground font-display font-bold rounded-[4px] hover:opacity-90 transition-opacity"
            >
              Request Profile Access
            </button>
          )}

          <button
            onClick={onBack}
            className="w-full py-2.5 border border-border text-muted-foreground text-sm rounded-[4px] hover:bg-secondary transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // ── Full Profile View ─────────────────────────────────────────────────────
  const sessions = user.sessions ?? [];
  const cleanSessions = sessions.filter((s) => !["DISPUTED", "DEFAULTED"].includes(s.status));
  const problematicSessions = sessions.filter((s) => ["DISPUTED", "DEFAULTED"].includes(s.status));

  return (
    <>
      {/* Profile content — blurred when identity viewer is open */}
      <div className={clsx(
        "max-w-2xl mx-auto space-y-4 pb-8 transition-all duration-200",
        showIdentity && "blur-sm pointer-events-none select-none"
      )}>
        {/* Nav */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={15} /> Back to Search
        </button>

        {/* ⚠ Identity verification — impossible to miss */}
        <div className="bg-[#1C1400] border-2 border-primary rounded-[4px] p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-[3px] bg-primary/20 border border-primary/40 flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertTriangle size={16} className="text-primary" />
            </div>
            <div>
              <p className="font-display font-bold text-primary text-base leading-tight">Identity Verification Required</p>
              <p className="text-xs text-foreground/70 mt-1 leading-relaxed">
                Before any credit transaction, confirm that the ID documents and biometric selfie below
                match the person you are currently dealing with. Skipping this step exposes you to fraud risk.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowIdentity(true)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground font-display font-bold text-sm rounded-[4px] hover:opacity-90 transition-opacity"
          >
            <Eye size={15} /> View Identity Documents
          </button>
        </div>

        {/* Profile header */}
        <div className="bg-card border border-border rounded-[4px] p-5 space-y-4">
          <div className="flex items-start gap-4">
            <Avatar name={user.name} size="lg" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display font-bold text-2xl text-foreground leading-tight">{user.name}</h1>
                {user.isVerified
                  ? <Shield size={15} className="text-primary flex-shrink-0" />
                  : <span className="text-[9px] font-mono text-muted-foreground border border-border px-1.5 py-0.5 rounded-[2px]">UNVERIFIED</span>
                }
              </div>
              <p className="text-[11px] font-mono text-muted-foreground mt-0.5">{user.phone}</p>
              <div className="mt-1.5">
                {user.avgRating > 0
                  ? <StarRating rating={user.avgRating} />
                  : <p className="text-[10px] font-mono text-muted-foreground">No ratings yet</p>
                }
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-4 gap-2 pt-3 border-t border-border">
            {[
              { label: "Total", value: user.totalSessions, color: "text-foreground" },
              { label: "Completed", value: user.completedSessions, color: "text-[#22C55E]" },
              { label: "Late", value: user.lateSessions, color: "text-[#EAB308]" },
              { label: "Defaulted", value: user.defaultedSessions, color: "text-[#EF4444]" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className={clsx("font-display font-bold text-xl leading-none", stat.color)}>{stat.value}</p>
                <p className="text-[9px] font-mono text-muted-foreground uppercase mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] font-mono text-muted-foreground">Member since {user.memberSince}</p>
        </div>

        {/* Clean session records */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle size={13} className="text-[#22C55E]" />
            <h2 className="font-display font-semibold text-base text-foreground">Clean Records</h2>
            <span className="text-[10px] font-mono text-muted-foreground ml-auto">{cleanSessions.length} record{cleanSessions.length !== 1 ? "s" : ""}</span>
          </div>
          {cleanSessions.length === 0 ? (
            <div className="bg-card border border-border rounded-[4px] p-5 text-center">
              <User size={22} className="text-muted-foreground opacity-30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No clean records on file.</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {cleanSessions.map((s) => <SessionRecord key={s.id} session={s} />)}
            </div>
          )}
        </div>

        {/* Disputed / Defaulted */}
        {problematicSessions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <XCircle size={13} className="text-[#EF4444]" />
              <h2 className="font-display font-semibold text-base text-foreground">Disputed & Defaulted Records</h2>
              <span className="text-[10px] font-mono text-muted-foreground ml-auto">{problematicSessions.length}</span>
            </div>
            <div className="space-y-1.5">
              {problematicSessions.map((s) => <SessionRecord key={s.id} session={s} />)}
            </div>
          </div>
        )}

        {/* Reviews */}
        {user.reviews && user.reviews.length > 0 && (
          <div className="space-y-2">
            <h2 className="font-display font-semibold text-base text-foreground">Reviews from Lenders</h2>
            {user.reviews.map((r, i) => (
              <div key={i} className="bg-card border border-border rounded-[4px] p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <StarRating rating={r.rating} />
                  <span className="text-[10px] font-mono text-muted-foreground flex-shrink-0">{fmtDate(r.date)}</span>
                </div>
                <p className="text-sm text-foreground italic leading-relaxed">"{r.comment}"</p>
                {r.reviewerName && (
                  <button
                    onClick={() => onLookupReviewer(r.reviewerName!)}
                    className="text-[10px] font-mono text-muted-foreground hover:text-primary transition-colors text-left"
                  >
                    — {r.reviewerName}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Create session CTA */}
        <div className="pt-2 pb-4">
          <button
            onClick={() => setShowCreateSession(true)}
            className="w-full py-4 bg-primary text-primary-foreground font-display font-bold text-base rounded-[4px] hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <UserCheck size={17} /> Create Credit Session with {user.name.split(" ")[0]}
          </button>
        </div>
      </div>

      {/* Identity viewer — always rendered above blur */}
      {showIdentity && (
        <IdentityViewer
          user={user}
          countdown={countdown}
          onClose={() => setShowIdentity(false)}
        />
      )}

      {showCreateSession && (
        <CreateSessionModal user={user} onClose={() => setShowCreateSession(false)} />
      )}
    </>
  );
}
