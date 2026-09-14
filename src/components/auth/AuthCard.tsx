"use client";

import { useEffect, useRef, useState } from "react";
import { BrandPanel } from "@/components/auth/BrandPanel";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { BoleanLogo } from "@/components/ui/BoleanLogo";
import { useRedirectIfAuthenticated } from "@/hooks/useAuth";

type Mode = "login" | "register";

export function AuthCard({ initialMode }: { initialMode: Mode }) {
  useRedirectIfAuthenticated();
  const [mode, setMode] = useState<Mode>(initialMode);
  const loginPanelRef = useRef<HTMLDivElement>(null);
  const registerPanelRef = useRef<HTMLDivElement>(null);

  // Nothing else on the auth page scrolls, so on desktop a wheel anywhere scrolls the active form, not just over it.
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onWheel = (e: WheelEvent) => {
      if (!desktop.matches) return;
      const panel = (mode === "login" ? loginPanelRef : registerPanelRef).current;
      if (!panel || panel.contains(e.target as Node)) return;
      panel.scrollBy({ top: e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY });
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, [mode]);

  const switchTo = (next: Mode) => {
    setMode(next);
    // Keep the URL bar honest for refresh/bookmarking without ever
    // triggering an actual Next.js navigation — the slide is purely a
    // client-side state change, never a page transition.
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", next === "login" ? "/login" : "/register");
    }
  };

  return (
    <div className="w-full max-w-[860px] rounded-2xl bg-card border border-border shadow-2xl shadow-black/30 flex overflow-hidden max-h-[calc(100dvh-48px)]">
      <BrandPanel />

      <div className="flex-1 min-w-0 flex items-center justify-center px-8 py-4 sm:px-12 lg:py-8">
        <div className="w-full max-w-[400px] flex flex-col items-center">
          {/* Mobile-only branding (BrandPanel carries the logo on lg+); counted in the box's 210px height reserve below. */}
          <div className="lg:hidden mt-8 mb-7 flex-shrink-0">
            <BoleanLogo size="xl" />
          </div>

          {/* Fixed-size window so the card never resizes between modes; capped against the viewport so it scrolls internally, not the page. Desktop has no logo block, so it reserves less. */}
          <div className="relative w-full h-[min(660px,calc(100dvh-210px))] lg:h-[min(660px,calc(100dvh-152px))] overflow-hidden flex-shrink-0">
            <div
              className="flex w-[200%] h-full transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)]"
              style={{ transform: mode === "login" ? "translateX(0%)" : "translateX(-50%)" }}
            >
              {/* inert on the off-screen panel: both forms stay mounted for the slide and share field names, so the hidden one must not take focus or autofill. */}
              <div
                ref={loginPanelRef}
                className="no-scrollbar lg-thin-scrollbar w-1/2 h-full flex-shrink-0 overflow-y-auto px-0.5"
                inert={mode !== "login" ? true : undefined}
              >
                {/* Desktop-only centering: min-h-full centers when shorter than the box and scrolls from the top (no clipping) when taller. */}
                <div className="lg:min-h-full lg:flex lg:flex-col lg:justify-center lg:py-2">
                  <LoginForm />
                </div>
              </div>
              <div
                ref={registerPanelRef}
                className="no-scrollbar lg-thin-scrollbar w-1/2 h-full flex-shrink-0 overflow-y-auto px-0.5"
                inert={mode !== "register" ? true : undefined}
              >
                <div className="lg:min-h-full lg:flex lg:flex-col lg:justify-center lg:py-2">
                  <RegisterForm onBackToLogin={() => switchTo("login")} />
                </div>
              </div>
            </div>
          </div>

          {/* Persistent mode-switch link, outside the sliding/scrollable
              viewport above so it's always visible regardless of how tall
              either form gets — it never depends on the user scrolling to
              find their way back to the other mode. */}
          <p className="mt-3 text-center text-[13px] text-muted-foreground flex-shrink-0">
            {mode === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button type="button" onClick={() => switchTo("register")} className="text-primary hover:underline">
                  Register
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button type="button" onClick={() => switchTo("login")} className="text-primary hover:underline">
                  Log in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
