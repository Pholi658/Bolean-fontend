import { useState } from "react";
import { ChevronLeft, Eye, EyeOff, Check } from "lucide-react";
import { BoleanLogo, FieldLabel, FieldWrap } from "@/components/ui";
import { getPasswordStrength } from "@/lib/utils";
import type { AppScreen } from "@/lib/types";

export default function RegisterStep1({ go }: { go: (s: AppScreen) => void }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [sameAsPhone, setSameAsPhone] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const strength = getPasswordStrength(password);

  const handleSameAsPhone = () => {
    const next = !sameAsPhone;
    setSameAsPhone(next);
    if (next) setWhatsapp(phone);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <button onClick={() => go("login")} className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft size={20} />
        </button>
        <BoleanLogo size="sm" />
        <div className="w-5" />
      </div>

      <div className="px-5 py-5 max-w-sm mx-auto">
        <div className="flex gap-2 mb-1">
          <div className="h-0.5 flex-1 bg-primary" />
          <div className="h-0.5 flex-1 bg-border" />
        </div>
        <p className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase mb-5">
          Step 1 of 2 — Account Details
        </p>

        <div className="space-y-4 pb-10">
          {/* Full Name */}
          <div className="space-y-1.5">
            <FieldLabel>Full Name</FieldLabel>
            <FieldWrap>
              <input type="text" placeholder="Nthabi Sekhobe" value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="flex-1 px-3 py-3 bg-transparent text-foreground text-sm outline-none" />
            </FieldWrap>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <FieldLabel>Email Address</FieldLabel>
            <FieldWrap>
              <input type="email" placeholder="your@email.co.ls" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-3 py-3 bg-transparent text-foreground text-sm outline-none" />
            </FieldWrap>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <FieldLabel>Phone Number</FieldLabel>
            <FieldWrap>
              <span className="px-3 py-3 text-muted-foreground font-mono text-sm border-r border-border bg-[#0D0D0D]">+266</span>
              <input type="tel" placeholder="5800 0000" value={phone} onChange={(e) => setPhone(e.target.value)}
                className="flex-1 px-3 py-3 bg-transparent text-foreground text-sm outline-none font-mono" />
            </FieldWrap>
          </div>

          {/* WhatsApp */}
          <div className="space-y-2">
            <div className="space-y-1.5">
              <FieldLabel>WhatsApp Number</FieldLabel>
              <FieldWrap>
                <span className="px-3 py-3 text-muted-foreground font-mono text-sm border-r border-border bg-[#0D0D0D]">+266</span>
                <input type="tel" placeholder="5800 0000" value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  disabled={sameAsPhone}
                  className="flex-1 px-3 py-3 bg-transparent text-foreground text-sm outline-none font-mono disabled:opacity-50" />
              </FieldWrap>
            </div>
            <label className="flex items-center gap-2 cursor-pointer" onClick={handleSameAsPhone}>
              <div className={`w-4 h-4 border rounded-[2px] flex items-center justify-center transition-colors flex-shrink-0 ${
                sameAsPhone ? "bg-primary border-primary" : "border-border bg-secondary"
              }`}>
                {sameAsPhone && <Check size={10} className="text-primary-foreground" />}
              </div>
              <span className="text-xs text-muted-foreground">Same as phone number</span>
            </label>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <FieldLabel>Password</FieldLabel>
            <FieldWrap>
              <input type={showPw ? "text" : "password"} placeholder="Create a strong password"
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="flex-1 px-3 py-3 bg-transparent text-foreground text-sm outline-none" />
              <button onClick={() => setShowPw(!showPw)} className="px-3 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </FieldWrap>
            {password && (
              <div className="space-y-1 pt-0.5">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-0.5 flex-1 rounded-full transition-all"
                      style={{ backgroundColor: i <= strength.score ? strength.color : "#222" }} />
                  ))}
                </div>
                <p className="text-xs font-mono" style={{ color: strength.color }}>{strength.label}</p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <FieldLabel>Confirm Password</FieldLabel>
            <FieldWrap>
              <input type={showConfirm ? "text" : "password"} placeholder="Repeat your password"
                value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
                className="flex-1 px-3 py-3 bg-transparent text-foreground text-sm outline-none" />
              <button onClick={() => setShowConfirm(!showConfirm)} className="px-3 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </FieldWrap>
            {confirmPw && password !== confirmPw && (
              <p className="text-xs font-mono text-[#EF4444]">Passwords do not match</p>
            )}
          </div>

          <button onClick={() => go("reg2")}
            className="w-full py-3.5 bg-primary text-primary-foreground font-display font-bold tracking-[0.12em] uppercase text-sm rounded-[4px] hover:opacity-90 transition-opacity">
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
