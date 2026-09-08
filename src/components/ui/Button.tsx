import { clsx } from "clsx";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline";
  size?: "sm" | "md";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading = false, disabled, className, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        size === "md" && "text-sm px-4 py-3",
        size === "sm" && "text-[11.5px] px-2.5 py-1.5 gap-1.5",
        variant === "primary" && "bg-primary text-primary-foreground hover:opacity-90",
        variant === "outline" && "border border-border text-foreground hover:bg-secondary hover:border-primary/40",
        className,
      )}
      {...props}
    >
      {loading && <Loader2 size={size === "sm" ? 12 : 15} className="animate-spin" />}
      {children}
    </button>
  );
});
