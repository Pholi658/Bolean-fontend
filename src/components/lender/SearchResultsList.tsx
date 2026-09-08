"use client";

import { Search as SearchIcon, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { UserRow } from "@/components/lender/UserRow";
import { useSearchUsers } from "@/hooks/useUsers";
import { addRecentSearch } from "@/lib/recent-searches";
import type { UserResponse } from "@/lib/types";

/** The "existing search/profile result experience" — a compact search bar
 * with the full, live-updating match list beneath it. */
export function SearchResultsList({
  query,
  onQueryChange,
  onBack,
  renderActions,
}: {
  query: string;
  onQueryChange: (query: string) => void;
  onBack: () => void;
  renderActions: (user: UserResponse) => React.ReactNode;
}) {
  const { data: results, isLoading, isFetching } = useSearchUsers(query);

  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="flex items-center gap-2.5 bg-input-background border border-border rounded-lg px-3.5 py-3 mb-4">
        <button
          type="button"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
          aria-label="Back to search"
        >
          <ArrowLeft size={15} />
        </button>
        <div className="w-px h-4 bg-border" />
        <span className="text-muted-foreground font-mono text-[13px]">+266</span>
        <div className="w-px h-4 bg-border" />
        <SearchIcon size={14} className="text-muted-foreground" />
        <input
          autoFocus
          value={query}
          onChange={(e) => onQueryChange(e.target.value.replace(/\D/g, ""))}
          placeholder="Search by phone number"
          className="flex-1 bg-transparent text-sm text-foreground outline-none font-mono"
        />
      </div>

      {isLoading || isFetching ? (
        <div className="space-y-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : !results || results.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-10">No matching accounts found.</p>
      ) : (
        <div className="space-y-2">
          {results.map((user) => (
            <UserRow key={user.id} user={user} onInteract={() => addRecentSearch(user)} renderActions={renderActions} />
          ))}
        </div>
      )}
    </div>
  );
}
