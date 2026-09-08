"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { clsx } from "clsx";

const STORAGE_KEY = "bolean-theme";
const THEME_CHANGE_EVENT = "bolean-theme-change";

/**
 * A single switch style used everywhere (topbar, auth screens, the sidebar
 * settings popover) — the class on <html> is the single source of truth,
 * but this is mounted more than once at a time, so each instance still
 * needs telling when a DIFFERENT instance flips it. A plain window event
 * does that without a store just for this. Starts as null (renders a
 * same-size placeholder) until mounted, so it never flashes the wrong
 * state: the class the blocking inline script (root layout) already set
 * before first paint may differ from whatever this component would
 * otherwise guess during SSR.
 */
export function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    const sync = () => setIsDark(document.documentElement.classList.contains("dark"));
    sync();
    window.addEventListener(THEME_CHANGE_EVENT, sync);
    return () => window.removeEventListener(THEME_CHANGE_EVENT, sync);
  }, []);

  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    } catch {
      // localStorage can throw in private/locked-down browser contexts —
      // the toggle still works for the rest of this tab's session.
    }
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  };

  if (isDark === null) {
    return <div aria-hidden className="w-[46px] h-[26px] flex-shrink-0" />;
  }

  return (
    <button
      role="switch"
      aria-checked={isDark}
      onClick={toggle}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={clsx(
        "relative w-[46px] h-[26px] rounded-full flex-shrink-0 p-[3px] transition-colors duration-200",
        isDark ? "bg-primary" : "bg-muted border border-border",
      )}
    >
      <span
        className={clsx(
          "flex items-center justify-center w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200",
          isDark && "translate-x-5",
        )}
      >
        {isDark ? <Moon size={11} className="text-primary" /> : <Sun size={11} className="text-warning" />}
      </span>
    </button>
  );
}
