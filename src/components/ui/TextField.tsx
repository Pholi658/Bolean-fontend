import { clsx } from "clsx";
import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  label: string;
  error?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, prefix, suffix, className, id, ...props },
  ref,
) {
  const inputId = id ?? props.name;
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={inputId}
        className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase"
      >
        {label}
      </label>
      <div
        className={clsx(
          "flex items-center border border-border rounded-lg bg-input-background overflow-hidden transition-colors",
          "focus-within:border-primary/60",
          error && "border-destructive/60",
        )}
      >
        {prefix}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            "flex-1 min-w-0 px-3.5 py-2.5 bg-transparent text-foreground text-sm outline-none placeholder:text-muted-foreground/60",
            className,
          )}
          {...props}
        />
        {suffix}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
});
