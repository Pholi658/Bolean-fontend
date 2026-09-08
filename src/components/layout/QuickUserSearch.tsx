"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search as SearchIcon, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { initialsOf } from "@/components/lender/UserRow";
import { useSearchUsers } from "@/hooks/useUsers";
import { addRecentSearch } from "@/lib/recent-searches";
import type { UserResponse } from "@/lib/types";

/**
 * A fast, always-available way to jump straight to a borrower's profile
 * from anywhere in lender mode, without leaving the current page. Backed by
 * the same /users/search endpoint (and the same recent-searches list) as
 * the dedicated Search page — this is a shortcut into that same data, not
 * a separate search feature.
 */
export function QuickUserSearch({ disabled = false }: { disabled?: boolean }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const { data: results, isFetching } = useSearchUsers(query);

  const goToProfile = (user: UserResponse) => {
    addRecentSearch(user);
    setOpen(false);
    setQuery("");
    router.push(`/lender/profile/${user.id}`);
  };

  const submit = () => {
    if (!query.trim()) return;
    setOpen(false);
    router.push(`/lender/search?q=${encodeURIComponent(query)}`);
    setQuery("");
  };

  return (
    <div className="relative w-[420px]">
      <div
        className={
          disabled
            ? "flex items-center gap-2.5 bg-secondary border border-border rounded-lg px-4 py-2.5 opacity-40 pointer-events-none"
            : "flex items-center gap-2.5 bg-secondary border border-border focus-within:border-primary/60 rounded-lg px-4 py-2.5 transition-colors"
        }
      >
        <SearchIcon size={16} className="text-muted-foreground flex-shrink-0" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value.replace(/\D/g, ""));
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
            if (e.key === "Escape") setOpen(false);
          }}
          disabled={disabled}
          placeholder="Quick search a borrower..."
          className="flex-1 min-w-0 bg-transparent text-[13.5px] text-foreground outline-none font-mono placeholder:font-sans"
        />
      </div>

      {open && query.trim().length > 0 && (
        <div
          className="absolute left-0 right-0 top-full mt-2 rounded-lg border border-border bg-card shadow-2xl shadow-black/40 overflow-hidden z-30"
          onMouseDown={(e) => e.preventDefault()}
        >
          {isFetching ? (
            <div className="p-2.5 space-y-2">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          ) : !results || results.length === 0 ? (
            <p className="text-[12.5px] text-muted-foreground text-center py-5">No matching accounts found.</p>
          ) : (
            <div>
              {results.slice(0, 5).map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => goToProfile(user)}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border/60 last:border-b-0 hover:bg-foreground/[0.04] transition-colors text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-secondary text-foreground flex items-center justify-center text-[10.5px] font-semibold flex-shrink-0">
                    {initialsOf(user.full_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[12.5px] text-foreground font-medium truncate">{user.full_name}</p>
                      {user.is_verified && <CheckCircle2 size={11} className="text-success flex-shrink-0" />}
                    </div>
                    <p className="text-[10.5px] text-muted-foreground font-mono">{user.phone_number}</p>
                  </div>
                </button>
              ))}
              <button
                type="button"
                onClick={submit}
                className="w-full text-center py-2 text-[11.5px] text-primary hover:underline"
              >
                See all results for &quot;{query}&quot;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
