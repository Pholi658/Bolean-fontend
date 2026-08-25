import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { BoleanLogo, FieldLabel, FieldWrap } from "@/components/ui";
import type { AppScreen } from "@/lib/types";

export default function LoginScreen({ go }: { go: (s: AppScreen) => void }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-3">
          <BoleanLogo size="lg" />
          <p className="text-[11px] font-mono tracking-[0.35em] text-muted-foreground uppercase">
            Trust, Verified.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <FieldLabel>Phone Number</FieldLabel>
            <FieldWrap>
              <span className="px-3 py-3 text-muted-foreground font-mono text-sm border-r border-border bg-[#0D0D0D] flex-shrink-0">
                +266
              </span>
              <input
                type="tel"
                placeholder="5800 0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 px-3 py-3 bg-transparent text-foreground text-sm outline-none font-mono"
              />
            </FieldWrap>
          </div>

          <div className="space-y-1.5">
            <FieldLabel>Password</FieldLabel>
            <FieldWrap>
              <input
                type={showPw ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 px-3 py-3 bg-transparent text-foreground text-sm outline-none"
              />
              <button
                onClick={() => setShowPw(!showPw)}
                className="px-3 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </FieldWrap>
          </div>

          <button
            onClick={() => go("consumer")}
            className="w-full py-3.5 bg-primary text-primary-foreground font-display font-bold tracking-[0.12em] uppercase text-sm rounded-[4px] hover:opacity-90 active:scale-[0.99] transition-all"
          >
            Log In
          </button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <button
            onClick={() => go("reg1")}
            className="text-primary hover:opacity-75 transition-opacity underline underline-offset-2"
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
}
