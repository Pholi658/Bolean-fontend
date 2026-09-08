import { useState } from "react";
import { X, Shield, Lock, Star } from "lucide-react";
import { clsx } from "clsx";
import { Avatar, StarRating, StatusBadge } from "@/components/ui";
import { fmt, fmtDate } from "@/lib/utils";
import type { SearchUser } from "@/lib/types";

interface ProfileModalProps {
  user: SearchUser;
  accessGranted: boolean;
  onClose: () => void;
  onCreateSession: (user: SearchUser) => void;
  onRequestAccess: (user: SearchUser) => void;
}

export default function ProfileModal({
  user, accessGranted, onClose, onCreateSession, onRequestAccess,
}: ProfileModalProps) {
  const [accessRequested, setAccessRequested] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/90 flex items-end sm:items-center justify-center z-50 p-4 pb-0 sm:pb-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-t-[4px] sm:rounded-[4px] flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
          <h3 className="font-display font-bold text-foreground">Consumer Profile</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Identity */}
          <div className="flex items-start gap-4">
            <Avatar name={user.name} size="lg" />
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display font-bold text-xl text-foreground">{user.name}</h2>
                {user.isVerified
                  ? <Shield size={14} className="text-primary" />
                  : <span className="text-[10px] font-mono text-muted-foreground border border-border px-1.5 py-0.5 rounded-[2px]">UNVERIFIED</span>
                }
              </div>
              <p className="text-sm text-muted-foreground font-mono">{user.phone}</p>
              <p className="text-[10px] text-muted-foreground font-mono mt-0.5">Member since {user.memberSince}</p>
            </div>
          </div>

          {/* Reputation */}
          <div className="bg-[#0D0A00] border border-primary/25 rounded-[4px] p-4 space-y-3">
            <p className="text-[10px] font-mono text-primary tracking-widest uppercase">Credit Reputation</p>
            <div className="flex items-center gap-2">
              {user.avgRating > 0
                ? <StarRating rating={user.avgRating} />
                : <span className="text-xs text-muted-foreground font-mono">No ratings yet</span>
              }
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs font-mono pt-1">
              <div>
                <p className="text-muted-foreground text-[10px]">Sessions</p>
                <p className="text-foreground font-bold mt-0.5">{user.totalSessions}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[10px]">Completed</p>
                <p className="text-[#22C55E] font-bold mt-0.5">{user.completedSessions}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[10px]">Defaulted</p>
                <p className={clsx("font-bold mt-0.5", user.defaultedSessions > 0 ? "text-[#EF4444]" : "text-muted-foreground")}>
                  {user.defaultedSessions}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-[10px]">Late</p>
                <p className={clsx("font-bold mt-0.5", user.lateSessions > 0 ? "text-[#EAB308]" : "text-muted-foreground")}>
                  {user.lateSessions}
                </p>
              </div>
            </div>
          </div>

          {/* Credit History */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">Credit History</p>
              {accessGranted && <Shield size={11} className="text-[#22C55E]" />}
            </div>

            {accessGranted ? (
              <div className="space-y-2">
                {user.reviews && user.reviews.length > 0 ? (
                  user.reviews.map((r, i) => (
                    <div key={i} className="p-3 bg-secondary rounded-[4px] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-foreground">{r.reviewerName}</span>
                        <StarRating rating={r.rating} />
                      </div>
                      {r.comment && (
                        <p className="text-xs text-muted-foreground italic leading-relaxed">"{r.comment}"</p>
                      )}
                      <p className="text-[10px] text-muted-foreground font-mono">{fmtDate(r.date)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground font-mono">No reviews available.</p>
                )}
              </div>
            ) : (
              <div className="border border-dashed border-border rounded-[4px] p-5 flex flex-col items-center gap-3 text-center">
                <Lock size={20} className="text-muted-foreground opacity-40" />
                <div>
                  <p className="text-sm text-foreground">Profile Access Required</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    This consumer's payment history is private. Send a request and wait for their approval.
                  </p>
                </div>
                {!accessRequested ? (
                  <button
                    onClick={() => { setAccessRequested(true); onRequestAccess(user); }}
                    className="px-4 py-2 border border-primary text-primary text-xs font-bold rounded-[4px] hover:bg-[#0D0A00] transition-colors"
                  >
                    Request Profile Access
                  </button>
                ) : (
                  <span className="text-[11px] font-mono text-[#22C55E] bg-[#001800] px-3 py-1.5 rounded-[2px]">
                    ✓ Request sent — awaiting response
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="p-5 border-t border-border flex-shrink-0">
          <button
            onClick={() => { onClose(); onCreateSession(user); }}
            className="w-full py-3 bg-primary text-primary-foreground font-display font-bold text-sm rounded-[4px] hover:opacity-90 transition-opacity tracking-wider uppercase"
          >
            Create Credit Session
          </button>
        </div>
      </div>
    </div>
  );
}
