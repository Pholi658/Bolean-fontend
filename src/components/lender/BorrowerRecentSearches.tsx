"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { initialsOf } from "@/components/lender/UserRow";
import { getRecentSearches, clearRecentSearches, type RecentSearchEntry } from "@/lib/recent-searches";
import { formatRelativeTime } from "@/lib/format";
import type { UserResponse } from "@/lib/types";

/** Recent searches shared with the main Search tab — here, picking one
 * selects them as the borrower instead of opening their profile. */
export function BorrowerRecentSearches({ onSelect }: { onSelect: (user: UserResponse) => void }) {
  const [recent, setRecent] = useState<RecentSearchEntry[]>([]);

  useEffect(() => {
    setRecent(getRecentSearches());
  }, []);

  if (recent.length === 0) {
    return (
      <Card className="p-5 h-full">
        <p className="flex items-center gap-1.5 text-[13px] font-medium text-foreground mb-2">
          <Clock size={13} className="text-muted-foreground" /> Recent searches
        </p>
        <p className="text-[12.5px] text-muted-foreground">
          People you look up will show up here for quick access.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-5">
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
      <div className="space-y-2">
        {recent.slice(0, 6).map((entry) => (
          <button
            key={entry.user.id}
            type="button"
            onClick={() => onSelect(entry.user)}
            className="w-full flex items-center gap-2.5 rounded-lg border border-border/60 px-3 py-2.5 hover:bg-foreground/[0.03] transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-secondary text-foreground flex items-center justify-center text-[11px] font-semibold flex-shrink-0">
              {initialsOf(entry.user.full_name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-foreground truncate">{entry.user.full_name}</p>
              <p className="text-[11px] text-muted-foreground font-mono">{entry.user.phone_number}</p>
            </div>
            <span className="text-[11px] text-muted-foreground flex-shrink-0">
              {formatRelativeTime(entry.searched_at)}
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
}
