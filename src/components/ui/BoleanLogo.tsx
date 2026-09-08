import { clsx } from "clsx";

const SIZES = {
  sm: { px: 20, text: "text-[16px]" },
  md: { px: 24, text: "text-[19px]" },
  lg: { px: 28, text: "text-[24px]" },
  xl: { px: 38, text: "text-[32px]" },
} as const;

export function BoleanLogo({ size = "md" }: { size?: keyof typeof SIZES }) {
  const cfg = SIZES[size];
  return (
    <div className={clsx("flex items-center select-none", size === "xl" ? "gap-3.5" : "gap-2.5")}>
      <svg width={cfg.px} height={cfg.px} viewBox="0 0 24 24" fill="none">
        {/* mostly-solid verification ring, open at the upper-left where a
            dotted arc picks up instead — echoes a scan sweeping to complete */}
        <path d="M10.61 4.12A8 8 0 1 1 4.12 10.61" stroke="var(--primary)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        <path
          d="M4.12 10.61A8 8 0 0 1 10.61 4.12"
          stroke="var(--primary)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeDasharray="0.1 2.3"
          opacity="0.55"
          fill="none"
        />
        <circle cx="10.61" cy="4.12" r="0.9" fill="var(--primary)" />
        <circle cx="4.12" cy="10.61" r="0.9" fill="var(--primary)" opacity="0.7" />
        <path d="M8.5 12.2l2.3 2.3 4.7-4.9" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      <span className={clsx("font-display font-semibold text-foreground", cfg.text)}>Bolean</span>
    </div>
  );
}
