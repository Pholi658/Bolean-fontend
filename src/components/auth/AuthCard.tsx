"use client";

import { useState } from "react";
import { BrandPanel } from "@/components/auth/BrandPanel";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { BoleanLogo } from "@/components/ui/BoleanLogo";
import { useRedirectIfAuthenticated } from "@/hooks/useAuth";

type Mode = "login" | "register";

export function AuthCard({ initialMode }: { initialMode: Mode }) {
  useRedirectIfAuthenticated();
  const [mode, setMode] = useState<Mode>(initialMode);

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

      <div className="flex-1 min-w-0 flex items-center justify-center px-8 py-4 sm:px-12">
        <div className="w-full max-w-[400px] flex flex-col items-center">
          {/* BrandPanel already carries the logo on lg+ (where it's shown
              beside this form) — below that breakpoint it's hidden, so the
              form side would otherwise have no branding at all. The extra
              top margin is deliberate, not just bottom spacing: centered in
              a flex column, margin above the first child pushes the whole
              logo down away from the card's top edge instead of it sitting
              flush against it. Accounted for in the sliding box's height
              budget below — none of this is free space. */}
          <div className="lg:hidden mt-8 mb-7 flex-shrink-0">
            <BoleanLogo size="xl" />
          </div>

          {/* Fixed-size viewport: the card's dimensions never change between
              modes — only the content inside this window slides. Height is
              capped against the viewport (with room for the page's own
              padding, the logo above, and the persistent footer below) so
              the card itself never forces a page-level scrollbar on shorter
              screens — it scrolls internally instead, invisibly (see
              no-scrollbar below). The reserved allowance is deliberately
              generous (210px) since it has to cover the logo block on
              mobile *and* the footer link on every size at once. */}
          <div className="relative w-full h-[min(660px,calc(100dvh-210px))] overflow-hidden flex-shrink-0">
            <div
              className="flex w-[200%] h-full transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)]"
              style={{ transform: mode === "login" ? "translateX(0%)" : "translateX(-50%)" }}
            >
              {/*
                Register is top-aligned, not vertically centered: centering
                an overflow-y-auto container clips its top overflow
                unreachably (scrollTop can't go negative), which would
                silently eat the first field or two the moment validation
                errors push the form taller than the fixed box. Login is
                short enough to never approach that limit, so it's safe to
                center normally. no-scrollbar keeps the safety-net scroll
                working on both (e.g. a very short window) without
                rendering a visible scrollbar on top of the card.
              */}
              {/*
                inert on whichever panel is off-screen: both forms stay
                mounted at once for the slide, and they share field names
                (email, password) — without this, a hidden panel's inputs
                are still focusable/fillable (breaks Tab order and
                autofill/password-manager targeting, since two same-named
                fields exist in the DOM at once). inert removes the
                off-screen one from focus and interaction entirely while
                leaving it rendered for the animation.
              */}
              <div
                className="no-scrollbar w-1/2 h-full flex-shrink-0 overflow-y-auto px-0.5 flex flex-col justify-center"
                inert={mode !== "login" ? true : undefined}
              >
                <LoginForm />
              </div>
              <div
                className="no-scrollbar w-1/2 h-full flex-shrink-0 overflow-y-auto px-0.5"
                inert={mode !== "register" ? true : undefined}
              >
                <RegisterForm onBackToLogin={() => switchTo("login")} />
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
