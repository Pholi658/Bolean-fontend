"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search as SearchIcon,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  History,
  Star,
  Lock,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { initialsOf } from "@/components/lender/UserRow";
import { useSearchUsers } from "@/hooks/useUsers";
import { getRecentSearches, addRecentSearch, clearRecentSearches, type RecentSearchEntry } from "@/lib/recent-searches";
import { formatRelativeTime } from "@/lib/format";
import type { UserResponse } from "@/lib/types";

const INFO_CARDS = [
  { icon: ShieldCheck, title: "Verify identities", body: "Confirm the person you're dealing with." },
  { icon: History, title: "Check history", body: "View their credit sessions and repayment record." },
  { icon: Star, title: "Read reviews", body: "See what others are saying before you decide." },
  { icon: Lock, title: "Stay safe", body: "Make informed decisions and reduce your risk." },
];

/** The Google-like landing state: centered search, recent searches, a
 * live autocomplete dropdown while typing. Submitting hands off to the
 * existing full results experience (SearchResultsList) via onSubmit. */
export function SearchLanding({
  query,
  onQueryChange,
  onSubmit,
}: {
  query: string;
  onQueryChange: (query: string) => void;
  onSubmit: (query: string) => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [recent, setRecent] = useState<RecentSearchEntry[]>([]);
  const [showAllRecent, setShowAllRecent] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { data: suggestions, isFetching } = useSearchUsers(query);

  useEffect(() => {
    setRecent(getRecentSearches());
  }, []);

  // A real "/" focus shortcut, matching the hint shown next to the input —
  // ignored while any other field already has focus.
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const alreadyTyping = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA";
      if (e.key === "/" && !alreadyTyping) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const goToProfile = (user: UserResponse) => {
    addRecentSearch(user);
    setRecent(getRecentSearches());
    setDropdownOpen(false);
    router.push(`/lender/profile/${user.id}`);
  };

  const submit = () => {
    if (!query.trim()) return;
    setDropdownOpen(false);
    onSubmit(query);
  };

  const visibleRecent = showAllRecent ? recent : recent.slice(0, 6);

  return (
    <div className="max-w-3xl mx-auto w-full pt-8 sm:pt-14 pb-10">
      <h1 className="font-display font-semibold text-[32px] text-foreground text-center">Search Bolean</h1>
      <p className="text-[14px] text-muted-foreground text-center mt-2 mb-8">
        Find a Bolean user by phone number. Check their credit history and reviews.
      </p>

      <div className="relative max-w-2xl mx-auto">
        <div className="flex items-center gap-2.5 bg-input-background border border-border focus-within:border-primary/60 rounded-xl px-4 py-3.5 shadow-lg shadow-black/20 transition-colors">
          <SearchIcon size={16} className="text-muted-foreground flex-shrink-0" />
          <span className="text-muted-foreground font-mono text-[13px] flex-shrink-0">+266</span>
          <div className="w-px h-4 bg-border flex-shrink-0" />
          <input
            ref={inputRef}
            autoFocus
            value={query}
            onChange={(e) => {
              onQueryChange(e.target.value.replace(/\D/g, ""));
              setDropdownOpen(true);
            }}
            onFocus={() => setDropdownOpen(true)}
            onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
              if (e.key === "Escape") setDropdownOpen(false);
            }}
            placeholder="Search by phone number"
            className="flex-1 bg-transparent text-sm text-foreground outline-none font-mono min-w-0"
          />
          {!query && (
            <kbd className="hidden sm:flex items-center justify-center w-5 h-5 rounded border border-border text-[10px] text-muted-foreground flex-shrink-0">
              /
            </kbd>
          )}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={submit}
            disabled={!query.trim()}
            className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-[13px] font-medium disabled:opacity-40 hover:opacity-90 transition-opacity flex-shrink-0"
          >
            Search
          </button>
        </div>

        {dropdownOpen && query.trim().length > 0 && (
          <div
            className="absolute left-0 right-0 top-full mt-2 rounded-xl border border-border bg-card shadow-2xl shadow-black/40 overflow-hidden z-20"
            onMouseDown={(e) => e.preventDefault()}
          >
            {isFetching ? (
              <div className="p-3 space-y-2">
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
              </div>
            ) : !suggestions || suggestions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No matching accounts found.</p>
            ) : (
              <div>
                {suggestions.slice(0, 5).map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => goToProfile(user)}
                    className="w-full flex items-center gap-3 px-4 py-3 border-b border-border/60 last:border-b-0 hover:bg-foreground/[0.04] transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-secondary text-foreground flex items-center justify-center text-xs font-semibold flex-shrink-0">
                      {initialsOf(user.full_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm text-foreground font-medium truncate">{user.full_name}</p>
                        {user.is_verified && <CheckCircle2 size={12} className="text-success flex-shrink-0" />}
                      </div>
                      <p className="text-[11px] text-muted-foreground font-mono">{user.phone_number}</p>
                    </div>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={submit}
                  className="w-full text-center py-2.5 text-[12.5px] text-primary hover:underline"
                >
                  See all results for &quot;{query}&quot;
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dimmed while the dropdown is actually showing — without it, a
          short dropdown can end mid-row through this content and leave the
          bottom half of a card or recent-search row peeking out beneath
          it. Gated on query length too: the input auto-focuses on mount,
          which alone shouldn't dim anything before the dropdown has
          content to show. */}
      <div
        className={
          dropdownOpen && query.trim().length > 0
            ? "opacity-20 transition-opacity pointer-events-none"
            : "opacity-100 transition-opacity"
        }
      >
      {recent.length > 0 && (
        <Card className="max-w-2xl mx-auto mt-8 p-5">
          <div className="flex items-center justify-between mb-3.5">
            <p className="flex items-center gap-1.5 text-[13px] font-medium text-foreground">
              <Clock size={13} className="text-muted-foreground" /> Recent searches
            </p>
            <button
              type="button"
              onClick={() => {
                clearRecentSearches();
                setRecent([]);
              }}
              className="text-[12px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear all
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {visibleRecent.map((entry) => (
              <button
                key={entry.user.id}
                type="button"
                onClick={() => goToProfile(entry.user)}
                className="flex items-center gap-2.5 rounded-lg border border-border/60 px-3 py-2.5 hover:bg-foreground/[0.03] transition-colors text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-secondary text-foreground flex items-center justify-center text-[11px] font-semibold flex-shrink-0">
                  {initialsOf(entry.user.full_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-foreground truncate">{entry.user.full_name}</p>
                </div>
                <span className="text-[11px] text-muted-foreground flex-shrink-0">
                  {formatRelativeTime(entry.searched_at)}
                </span>
                <ArrowUpRight size={13} className="text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>
          {recent.length > 6 && !showAllRecent && (
            <button
              type="button"
              onClick={() => setShowAllRecent(true)}
              className="w-full text-center mt-3 text-[12.5px] text-primary hover:underline"
            >
              View all searches
            </button>
          )}
        </Card>
      )}

      <div className="max-w-3xl mx-auto mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {INFO_CARDS.map((card) => (
          <div key={card.title} className="rounded-lg border border-border/60 bg-foreground/[0.015] p-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center mb-2.5">
              <card.icon size={14} className="text-primary" />
            </div>
            <p className="text-[13px] text-foreground font-medium mb-1">{card.title}</p>
            <p className="text-[11.5px] text-muted-foreground leading-relaxed">{card.body}</p>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}
