"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BorrowerSearchBar } from "@/components/lender/BorrowerSearchBar";
import { BorrowerRecentSearches } from "@/components/lender/BorrowerRecentSearches";
import { PendingSessionsPanel } from "@/components/lender/PendingSessionsPanel";
import { CreateSessionTipsCard } from "@/components/lender/CreateSessionTipsCard";
import { CreateSessionModal } from "@/components/lender/CreateSessionModal";
import { useUserProfile } from "@/hooks/useUsers";
import { addRecentSearch } from "@/lib/recent-searches";
import { getPendingSessions, type PendingSessionEntry } from "@/lib/pending-sessions";
import type { UserResponse } from "@/lib/types";

export default function CreateSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const borrowerId = searchParams.get("borrowerId") ?? undefined;
  const { data: borrower, isLoading: borrowerLoading } = useUserProfile(borrowerId);
  const [pendingSessions, setPendingSessions] = useState<PendingSessionEntry[]>([]);

  useEffect(() => {
    setPendingSessions(getPendingSessions());
  }, [borrowerId]);

  const selectBorrower = (user: UserResponse) => {
    addRecentSearch(user);
    router.push(`/lender/create-session?borrowerId=${user.id}`);
  };

  const closeModal = () => router.push("/lender/create-session");

  return (
    <div className="p-7">
      <div className="max-w-2xl mx-auto pt-6 sm:pt-10">
        <h1 className="font-display font-semibold text-[28px] text-foreground text-center">
          New Credit Session
        </h1>
        <p className="text-[14px] text-muted-foreground text-center mt-2 mb-8">
          Search for the borrower you want to start a session with.
        </p>
        <BorrowerSearchBar onSelect={selectBorrower} />
      </div>

      <div className="max-w-4xl mx-auto mt-8 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 items-start">
        <BorrowerRecentSearches onSelect={selectBorrower} />
        <PendingSessionsPanel entries={pendingSessions} />
      </div>

      <div className="max-w-4xl mx-auto mt-6">
        <CreateSessionTipsCard />
      </div>

      {borrowerId && (
        <CreateSessionModal
          borrowerId={borrowerId}
          borrower={borrower}
          borrowerLoading={borrowerLoading}
          onClose={closeModal}
          onDone={closeModal}
        />
      )}
    </div>
  );
}
