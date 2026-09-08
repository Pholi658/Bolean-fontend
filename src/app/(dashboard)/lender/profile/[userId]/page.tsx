"use client";

import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ProfileView } from "@/components/profile/ProfileView";

export default function LenderProfileViewPage() {
  const params = useParams<{ userId: string }>();
  const router = useRouter();

  return (
    <div>
      <div className="px-7 pt-7">
        <button
          onClick={() => router.push("/lender/search")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors max-w-5xl mx-auto"
        >
          <ChevronLeft size={15} /> Back to Search
        </button>
      </div>
      <ProfileView userId={params.userId} />
    </div>
  );
}
