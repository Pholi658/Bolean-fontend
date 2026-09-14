import { clsx } from "clsx";

// Heights, not the old icon-only pixel sizes: the old logo was a small
// square icon plus separately-sized text next to it, so its "20/24/28/38"
// scale described just the icon. This is one combined image where the
// wordmark occupies a fraction of the total height, so sizing it off those
// same small numbers starved the text — these are chosen to match the old
// design's *overall width* (icon + gap + text) at each size instead.
const SIZES = {
  sm: 30,
  md: 35,
  lg: 42,
  xl: 57,
} as const;

// Intrinsic aspect ratio of public/bolean-logo.png (1762x635), so each named
// size only has to specify a height — width follows automatically.
const ASPECT_RATIO = 1762 / 635;

export function BoleanLogo({
  size = "md",
  onDark = false,
}: {
  size?: keyof typeof SIZES;
  /** The mark's baked-in teal reads fine on light surfaces but is nearly
   *  invisible on the app's near-black dark ones — measured well under
   *  WCAG contrast against #0A0A0A. `dark:` alone only fixes contexts that
   *  actually follow the site theme (sidebar, mobile header); pass this for
   *  a surface that's *always* dark regardless of theme (BrandPanel). */
  onDark?: boolean;
}) {
  const height = SIZES[size];
  const width = Math.round(height * ASPECT_RATIO);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/bolean-logo.png"
      alt="Bolean"
      width={width}
      height={height}
      className={clsx("select-none", onDark ? "brightness-150" : "dark:brightness-150")}
      style={{ width, height }}
    />
  );
}
