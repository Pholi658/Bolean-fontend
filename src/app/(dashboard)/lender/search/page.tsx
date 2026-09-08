"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { SearchLanding } from "@/components/lender/SearchLanding";
import { SearchResultsList } from "@/components/lender/SearchResultsList";

export default function LenderSearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Arriving with ?q= (from the topbar's quick search "Enter" submission)
  // lands directly on the results view for that query.
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [submitted, setSubmitted] = useState(initialQuery.trim().length > 0);

  const renderActions = (user: { id: string }) => (
    <>
      <Button variant="outline" onClick={() => router.push(`/lender/profile/${user.id}`)}>
        View Profile
      </Button>
      <Button onClick={() => router.push(`/lender/create-session?borrowerId=${user.id}`)}>New Session</Button>
    </>
  );

  return (
    <div className="p-7">
      {submitted ? (
        <SearchResultsList
          query={query}
          onQueryChange={(next) => {
            setQuery(next);
            if (!next.trim()) setSubmitted(false);
          }}
          onBack={() => setSubmitted(false)}
          renderActions={renderActions}
        />
      ) : (
        <SearchLanding
          query={query}
          onQueryChange={setQuery}
          onSubmit={(submittedQuery) => {
            setQuery(submittedQuery);
            setSubmitted(true);
          }}
        />
      )}
    </div>
  );
}
