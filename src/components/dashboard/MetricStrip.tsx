import type { ReactNode } from "react";
import { clsx } from "clsx";

export interface Metric {
  label: string;
  value: string;
  indicator?: ReactNode;
}

/**
 * Separate bordered cards on a real grid gap — each metric reads as its own
 * surface rather than a shared strip.
 *
 * `featuredIndex` (mobile-only, exactly 3 metrics): instead of stacking all
 * three full-width, the featured metric takes a full-height cell on the
 * left while the other two stack at half-height on the right — used to
 * keep the single most important number (e.g. Outstanding) visually
 * dominant on a narrow screen instead of reading as three equal rows.
 * Desktop is unaffected either way — same horizontal row of cards as always.
 */
export function MetricStrip({ metrics, featuredIndex }: { metrics: Metric[]; featuredIndex?: number }) {
  const isBento = featuredIndex !== undefined && metrics.length === 3;
  let otherRank = -1;

  return (
    <div
      className={clsx(
        "grid gap-3 sm:gap-4",
        isBento ? "grid-cols-2 grid-rows-2" : "grid-cols-1",
        "sm:grid-rows-1 sm:[grid-template-columns:repeat(var(--metric-cols),minmax(0,1fr))]",
      )}
      style={{ "--metric-cols": metrics.length } as React.CSSProperties}
    >
      {metrics.map((m, i) => {
        const isFeatured = isBento && i === featuredIndex;
        if (isBento && !isFeatured) otherRank += 1;

        return (
          <div
            key={m.label}
            className={clsx(
              "bg-background border border-border/60 rounded-2xl px-5 py-4 sm:px-8 sm:py-6 hover:border-border hover:bg-foreground/[0.015] transition-colors",
              isBento && "sm:col-auto sm:row-auto sm:row-span-1 sm:flex-none sm:justify-normal",
              isFeatured && "col-start-1 row-start-1 row-span-2 flex flex-col justify-center",
              isBento && !isFeatured && otherRank === 0 && "col-start-2 row-start-1",
              isBento && !isFeatured && otherRank === 1 && "col-start-2 row-start-2",
            )}
          >
            <p className="text-[10.5px] font-medium tracking-[0.09em] text-muted-foreground uppercase">
              {m.label}
            </p>
            <p className="font-display font-semibold text-[28px] sm:text-[36px] text-foreground leading-[1.1] mt-2">
              {m.value}
            </p>
            {m.indicator && <div className="mt-2">{m.indicator}</div>}
          </div>
        );
      })}
    </div>
  );
}
