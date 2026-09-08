import { clsx } from "clsx";

/** A small "there's something new here" indicator — a solid dot with an
 * expanding ping ring behind it. Purely presentational; when it shows and
 * hides is up to the caller. */
export function PulsingBadge({ className }: { className?: string }) {
  return (
    <span className={clsx("absolute flex h-2.5 w-2.5", className)}>
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary border border-card" />
    </span>
  );
}
