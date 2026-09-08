"use client";

import { useRef, useState } from "react";
import { Search as SearchIcon, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { initialsOf } from "@/components/lender/UserRow";
import { useSearchUsers } from "@/hooks/useUsers";
import type { UserResponse } from "@/lib/types";

/** A big, centered search bar for picking a borrower to start a session
 * with — selecting a suggestion (click, or Enter for the top match) hands
 * the chosen user back via onSelect rather than navigating anywhere. */
export function BorrowerSearchBar({ onSelect }: { onSelect: (user: UserResponse) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const { data: results, isFetching } = useSearchUsers(query);

  const submitTopMatch = () => {
    const topMatch = results?.[0];
    if (topMatch) onSelect(topMatch);
  };

  return (
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
            setQuery(e.target.value.replace(/\D/g, ""));
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submitTopMatch();
            if (e.key === "Escape") setOpen(false);
          }}
          placeholder="Search by phone number"
          className="flex-1 min-w-0 bg-transparent text-sm text-foreground outline-none font-mono"
        />
      </div>

      {open && query.trim().length > 0 && (
        <div
          className="absolute left-0 right-0 top-full mt-2 rounded-xl border border-border bg-card shadow-2xl shadow-black/40 overflow-hidden z-20"
          onMouseDown={(e) => e.preventDefault()}
        >
          {isFetching ? (
            <div className="p-3 space-y-2">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          ) : !results || results.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No matching accounts found.</p>
          ) : (
            <div>
              {results.slice(0, 5).map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => onSelect(user)}
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}
