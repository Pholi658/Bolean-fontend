import { useState, useEffect } from "react";
import { Search, Shield, ChevronRight } from "lucide-react";
import { clsx } from "clsx";
import { Avatar, StarRating, EmptyState } from "@/components/ui";
import CreateSessionModal from "@/components/session/CreateSessionModal";
import { SEARCH_RESULTS } from "@/lib/mock-data";
import type { SearchUser } from "@/lib/types";

export default function SearchSection({
  onViewProfile,
  accessGranted,
  initialQuery,
}: {
  onViewProfile: (user: SearchUser) => void;
  accessGranted: Set<string>;
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery ?? "");
  const [results, setResults] = useState<SearchUser[]>([]);
  const [searched, setSearched] = useState(false);
  const [createUser, setCreateUser] = useState<SearchUser | null>(null);

  useEffect(() => {
    if (initialQuery) {
      const q = initialQuery.toLowerCase().trim();
      setQuery(initialQuery);
      setResults(SEARCH_RESULTS.filter(
        (u) => u.name.toLowerCase().includes(q) || u.phone.includes(q)
      ));
      setSearched(true);
    }
  }, [initialQuery]);

  const handleSearch = () => {
    const q = query.toLowerCase().trim();
    if (!q) return;
    setResults(SEARCH_RESULTS.filter(
      (u) => u.name.toLowerCase().includes(q) || u.phone.includes(q)
    ));
    setSearched(true);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="flex-1 flex border border-border rounded-[4px] bg-secondary focus-within:border-primary transition-colors overflow-hidden">
          <Search size={15} className="ml-3 self-center text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by name or phone number (+266…)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1 px-3 py-3 bg-transparent text-foreground text-sm outline-none"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-5 bg-primary text-primary-foreground font-display font-bold text-sm rounded-[4px] hover:opacity-90 transition-opacity flex-shrink-0"
        >
          Search
        </button>
      </div>

      {!searched ? (
        <EmptyState
          icon={<Search size={28} className="text-muted-foreground" />}
          message="Search for a consumer by name or phone number to view their credit profile."
        />
      ) : results.length === 0 ? (
        <EmptyState
          icon={<Search size={28} className="text-muted-foreground" />}
          message="No consumers found. Try a different name or number."
        />
      ) : (
        <div className="space-y-3">
          <p className="text-[10px] font-mono text-muted-foreground tracking-wider">
            {results.length} result{results.length !== 1 ? "s" : ""} found
          </p>
          {results.map((user) => (
            <SearchResultCard
              key={user.id}
              user={user}
              hasPermission={accessGranted.has(user.id)}
              onViewProfile={() => onViewProfile(user)}
              onCreateSession={() => setCreateUser(user)}
            />
          ))}
        </div>
      )}

      {createUser && (
        <CreateSessionModal user={createUser} onClose={() => setCreateUser(null)} />
      )}
    </div>
  );
}

function SearchResultCard({
  user, hasPermission, onViewProfile, onCreateSession,
}: {
  user: SearchUser;
  hasPermission: boolean;
  onViewProfile: () => void;
  onCreateSession: () => void;
}) {
  return (
    <div className="bg-card border border-border rounded-[4px] p-4 space-y-4">
      <div className="flex items-start gap-3">
        <Avatar name={user.name} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-sm font-medium text-foreground">{user.name}</p>
            {user.isVerified
              ? <Shield size={12} className="text-primary flex-shrink-0" />
              : <span className="text-[9px] font-mono text-muted-foreground border border-border px-1 py-0.5 rounded-[2px]">UNVERIFIED</span>
            }
          </div>
          <p className="text-[11px] text-muted-foreground font-mono">{user.phone}</p>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            {user.avgRating > 0
              ? <StarRating rating={user.avgRating} />
              : <span className="text-[10px] text-muted-foreground font-mono">No ratings yet</span>
            }
            <span className="text-[10px] text-muted-foreground font-mono">
              {user.totalSessions} session{user.totalSessions !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Mini stats */}
        <div className="hidden sm:flex flex-col gap-1 text-right flex-shrink-0">
          <div className="text-[10px] font-mono">
            <span className="text-[#22C55E]">{user.completedSessions}</span>
            <span className="text-muted-foreground"> done</span>
          </div>
          <div className="text-[10px] font-mono">
            <span className="text-[#EF4444]">{user.defaultedSessions}</span>
            <span className="text-muted-foreground"> default</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onViewProfile}
          className={clsx(
            "flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-[4px] border transition-colors",
            hasPermission
              ? "border-primary/40 text-primary hover:bg-[#0D0A00]"
              : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
          )}
        >
          View Profile
          {!hasPermission && <span className="text-[9px] font-mono opacity-50">(restricted)</span>}
          {hasPermission && <ChevronRight size={11} />}
        </button>
        <button
          onClick={onCreateSession}
          className="flex-1 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-[4px] hover:opacity-90 transition-opacity"
        >
          Create Session
        </button>
      </div>
    </div>
  );
}
