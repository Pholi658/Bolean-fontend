import { ShieldCheck, Star, Lock } from "lucide-react";

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

      {/* This panel is fixed-dark in both site themes (see the component
          note above), so its icon uses a fixed accent color too — light
          mode's --primary is calibrated for light backgrounds and would go
          muddy against this permanently-dark panel otherwise. */}
      <div className="relative flex items-center gap-2.5">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
          <path d="M10.61 4.12A8 8 0 1 1 4.12 10.61" stroke="#4FA69D" strokeWidth="1.6" strokeLinecap="round" fill="none" />
          <path
            d="M4.12 10.61A8 8 0 0 1 10.61 4.12"
            stroke="#4FA69D"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeDasharray="0.1 2.3"
            opacity="0.55"
            fill="none"
          />
          <circle cx="10.61" cy="4.12" r="0.9" fill="#4FA69D" />
          <circle cx="4.12" cy="10.61" r="0.9" fill="#4FA69D" opacity="0.7" />
          <path d="M8.5 12.2l2.3 2.3 4.7-4.9" stroke="#4FA69D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
        <span className="font-display font-semibold text-xl text-white">Bolean</span>
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
