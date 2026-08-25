import { useState } from "react";
import { Search, Shield, Plus } from "lucide-react";
import { clsx } from "clsx";
import { Avatar, StarRating, EmptyState } from "@/components/ui";
import CreateSessionModal from "@/components/session/CreateSessionModal";
import { SEARCH_RESULTS } from "@/lib/mock-data";
import type { SearchUser } from "@/lib/types";

export default function CreateSessionSection() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchUser[]>([]);
  const [searched, setSearched] = useState(false);
  const [createUser, setCreateUser] = useState<SearchUser | null>(null);

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
      {/* Heading */}
      <div className="space-y-1">
        <h2 className="font-display font-bold text-lg text-foreground">New Credit Session</h2>
        <p className="text-sm text-muted-foreground">
          Search for the consumer by name or phone number, then create a credit session.
        </p>
      </div>

      {/* Search bar */}
      <div className="flex gap-2">
        <div className="flex-1 flex border border-border rounded-[4px] bg-secondary focus-within:border-primary transition-colors overflow-hidden">
          <Search size={15} className="ml-3 self-center text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder="Consumer name or phone (+266…)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1 px-3 py-3 bg-transparent text-foreground text-sm outline-none"
            autoFocus
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
          icon={<Plus size={28} className="text-muted-foreground" />}
          message="Search for a consumer to begin creating a credit session."
        />
      ) : results.length === 0 ? (
        <EmptyState
          icon={<Search size={28} className="text-muted-foreground" />}
          message="No consumers found. Try a different name or number."
        />
      ) : (
        <div className="space-y-3">
          <p className="text-[10px] font-mono text-muted-foreground tracking-wider">
            {results.length} consumer{results.length !== 1 ? "s" : ""} found — select to create session
          </p>
          {results.map((user) => (
            <ConsumerPickerCard
              key={user.id}
              user={user}
              onSelect={() => setCreateUser(user)}
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

function ConsumerPickerCard({ user, onSelect }: { user: SearchUser; onSelect: () => void }) {
  return (
    <div className="bg-card border border-border rounded-[4px] p-4 flex items-center gap-4 hover:border-primary/40 transition-colors">
      <Avatar name={user.name} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-sm font-medium text-foreground">{user.name}</p>
          {user.isVerified
            ? <Shield size={11} className="text-primary flex-shrink-0" />
            : <span className="text-[9px] font-mono text-muted-foreground border border-border px-1 py-0.5 rounded-[2px]">UNVERIFIED</span>
          }
        </div>
        <p className="text-[11px] font-mono text-muted-foreground">{user.phone}</p>
        <div className="flex items-center gap-3 mt-1">
          {user.avgRating > 0
            ? <StarRating rating={user.avgRating} />
            : <span className="text-[10px] font-mono text-muted-foreground">No ratings</span>
          }
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className="text-[#22C55E]">{user.completedSessions}</span>
            <span className="text-muted-foreground">done</span>
            <span className="text-muted-foreground mx-0.5">·</span>
            <span className="text-[#EF4444]">{user.defaultedSessions}</span>
            <span className="text-muted-foreground">default</span>
          </div>
        </div>
      </div>
      <button
        onClick={onSelect}
        className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground font-display font-bold text-xs rounded-[4px] hover:opacity-90 transition-opacity"
      >
        <Plus size={13} /> Create Session
      </button>
    </div>
  );
}
