"use client";

import { useEffect, useRef, useState } from "react";
import { Settings } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

/** Opens upward, not downward — this sits at the very bottom of a
 *  fixed-height sidebar, so a panel opening below it would run off screen. */
export function SidebarSettings() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative flex-shrink-0" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        title="Settings"
        className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
      >
        <Settings size={15} />
      </button>

      {open && (
        <div className="absolute bottom-[calc(100%+8px)] left-0 w-56 rounded-xl bg-card border border-border shadow-2xl shadow-black/40 p-3 z-40">
          <p className="text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase px-1 mb-2">
            Settings
          </p>
          <div className="flex items-center justify-between px-1 py-1">
            <span className="text-[13px] text-foreground">Appearance</span>
            <ThemeToggle />
          </div>
        </div>
      )}
    </div>
  );
}
