"use client";

import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { CollectedVsDisbursedChart } from "@/components/lender/CollectedVsDisbursedChart";
import { UnconfirmedReminderNote } from "@/components/lender/UnconfirmedReminderNote";

const SLIDE_MS = 10_000;
// Unconfirmed sessions first — an overdue status update needing action is
// more urgent than a lifetime chart, so it shouldn't wait its turn.
const SLIDE_LABELS = ["Unconfirmed Sessions", "Collected vs Disbursed"] as const;

interface DataPoint {
  month: string;
  collected: number;
  disbursed: number;
}

/**
 * Mobile-only: the chart and the unconfirmed-sessions reminder used to just
 * stack full-width, one above the other. Instead they auto-play as a
 * two-slide carousel inside one bordered card, advancing on a timer (long
 * enough to actually read either slide) rather than requiring a swipe.
 * Any tap on the card stops the timer for good — once someone's engaging
 * with it directly, it shouldn't yank the content out from under them.
 * Desktop is untouched: it still shows both side by side (see
 * LenderDashboardContent).
 */
export function ChartReminderSlideshow({ monthlyCollections }: { monthlyCollections: DataPoint[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    if (!autoplay) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => {
        const next = (prev + 1) % SLIDE_LABELS.length;
        const el = scrollerRef.current;
        if (el) el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
        return next;
      });
    }, SLIDE_MS);
    return () => clearInterval(interval);
  }, [autoplay]);

  const handleScroll = () => {
    const el = scrollerRef.current;
    if (!el || el.clientWidth === 0) return;
    setActiveSlide(Math.round(el.scrollLeft / el.clientWidth));
  };

  return (
    <div className="lg:hidden" onClick={() => setAutoplay(false)}>
      <div className="rounded-2xl border border-border/60 overflow-hidden">
        <div
          ref={scrollerRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
        >
          <div className="w-full flex-shrink-0 snap-center h-[248px]">
            <UnconfirmedReminderNote variant="bare" />
          </div>
          <div className="w-full flex-shrink-0 snap-center h-[248px] p-5 flex flex-col justify-center">
            <div className="flex items-center justify-end gap-3 mb-2">
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-sm bg-primary inline-block" /> Disbursed
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-sm bg-success inline-block" /> Collected
              </span>
            </div>
            <CollectedVsDisbursedChart data={monthlyCollections} />
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 py-3 border-t border-border/60">
          {SLIDE_LABELS.map((label, i) => (
            <span
              key={label}
              className={clsx(
                "h-1.5 rounded-full transition-all",
                i === activeSlide ? "w-4 bg-primary" : "w-1.5 bg-border",
              )}
            />
          ))}
        </div>
      </div>
      <p className="text-center text-[12px] text-muted-foreground mt-1.5">{SLIDE_LABELS[activeSlide]}</p>
    </div>
  );
}
