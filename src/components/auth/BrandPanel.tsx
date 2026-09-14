import { ShieldCheck, Star, Lock } from "lucide-react";
import { BoleanLogo } from "@/components/ui/BoleanLogo";

const FEATURES = [
  { icon: ShieldCheck, label: "Verified identity", desc: "Real ID and biometric checks, not self-reported claims." },
  { icon: Star, label: "Real reputation", desc: "A track record built from actual repayment history." },
  { icon: Lock, label: "Secure by design", desc: "Your credentials never touch persistent storage." },
];

/**
 * Deliberately always-dark, in both site themes — a fixed branding panel,
 * not a themed surface. Its text is fixed light-on-dark accordingly rather
 * than using the theme-relative foreground tokens, which are calibrated
 * for --background (light in light mode) and would go dark-on-dark here.
 */
export function BrandPanel() {
  return (
    <div className="relative hidden lg:flex w-[360px] flex-shrink-0 flex-col justify-between overflow-hidden bg-[#0A0A0A] border-r border-border px-10 py-11">
      {/* decorative concentric rings, echoing the verification/scan motif */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.06]">
        {[260, 200, 140, 80].map((size) => (
          <div
            key={size}
            className="absolute rounded-full border border-white"
            style={{ width: size, height: size }}
          />
        ))}
      </div>
      <div
        className="pointer-events-none absolute w-[380px] h-[380px] rounded-full bg-primary opacity-[0.08]"
        style={{ filter: "blur(140px)", top: "-140px", left: "-140px" }}
      />

      {/* BoleanLogo is a fixed-color image now (not theme-adaptive SVG), so
          it renders identically here regardless of this panel's permanent
          dark background — no more need for a separate hardcoded-color
          duplicate of the mark. onDark since this panel is always dark
          regardless of site theme, unlike the sidebar/header's dark: fix. */}
      <div className="relative">
        <BoleanLogo size="lg" onDark />
      </div>

      <div className="relative space-y-8">
        <div className="space-y-2.5">
          <p className="text-[10.5px] font-mono tracking-[0.28em] text-white/50 uppercase">
            Trust, Verified.
          </p>
          <h2 className="font-display font-semibold text-2xl text-white leading-snug">
            Peer-to-peer credit reputation, verified.
          </h2>
          <p className="text-[13px] text-white/60 leading-relaxed">
            Background verification and credit reputation for Lesotho — build a track record that lenders
            can actually trust.
          </p>
        </div>

        <div className="space-y-4">
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                <Icon size={14} className="text-primary" />
              </div>
              <div>
                <p className="text-[13px] text-white font-medium">{label}</p>
                <p className="text-[11.5px] text-white/60 leading-relaxed mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="relative text-[10.5px] text-white/40">© {new Date().getFullYear()} Bolean</p>
    </div>
  );
}
