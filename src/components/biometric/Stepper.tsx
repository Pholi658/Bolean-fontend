import { Check } from "lucide-react";
import { clsx } from "clsx";

export interface StepDef {
  label: string;
}

export function Stepper({
  steps,
  currentIndex,
  onStepClick,
}: {
  steps: StepDef[];
  currentIndex: number;
  onStepClick?: (index: number) => void;
}) {
  return (
    <div className="flex items-center w-full">
      {steps.map((step, i) => {
        const state = i < currentIndex ? "done" : i === currentIndex ? "current" : "upcoming";
        const clickable = state === "done" && !!onStepClick;

        return (
          <div key={step.label} className="flex items-center flex-1 last:flex-none">
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onStepClick?.(i)}
              className={clsx(
                "flex items-center gap-2.5 flex-shrink-0",
                clickable ? "cursor-pointer" : "cursor-default",
              )}
            >
              <span
                className={clsx(
                  "w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0 border transition-colors",
                  state === "done" && "bg-success/15 border-success/40 text-success",
                  state === "current" && "bg-primary border-primary text-primary-foreground",
                  state === "upcoming" && "bg-transparent border-border text-muted-foreground/50",
                )}
              >
                {state === "done" ? <Check size={13} strokeWidth={3} /> : i + 1}
              </span>
              <span
                className={clsx(
                  "text-[12.5px] font-medium whitespace-nowrap hidden sm:inline",
                  state === "current" && "text-foreground",
                  state === "done" && "text-foreground/80",
                  state === "upcoming" && "text-muted-foreground/50",
                )}
              >
                {step.label}
              </span>
            </button>
            {i < steps.length - 1 && (
              <div
                className={clsx(
                  "h-px flex-1 mx-3 min-w-[16px] transition-colors",
                  i < currentIndex ? "bg-success/40" : "bg-border",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
