"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { PlusCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCurrentUser } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUsers";
import { useUserAnalytics } from "@/hooks/useAnalytics";
import { useMySessionsAsBorrower, useUserSessionHistory } from "@/hooks/useSessions";
import { useMyReviews, useReviewsForUser } from "@/hooks/useReviews";
import { useRequestPermission } from "@/hooks/usePermissions";
import { formatMaloti } from "@/lib/format";
import { getFriendlyErrorMessage } from "@/lib/errors";
import { ProfileOverviewCard } from "@/components/profile/ProfileOverviewCard";
import { OwnIdentityDocumentsCard } from "@/components/profile/OwnIdentityDocumentsCard";
import { VisualIdentityCallout } from "@/components/profile/VisualIdentityCallout";
import { IdentityConfirmationModal } from "@/components/profile/IdentityConfirmationModal";
import { SessionSummarySection } from "@/components/profile/SessionSummarySection";
import { ReviewsSection } from "@/components/profile/ReviewsSection";
import { AccessRestrictedCard } from "@/components/profile/AccessRestrictedCard";

/**
 * The one profile layout for both "my own profile" and "a Bolean user I
 * searched for" — pass a userId for the latter, omit it for the former.
 * Stats come from the same endpoint either way (/analytics/users/{id}): the
 * backend lets you view yourself freely and requires an approved Permission
 * for anyone else, and that 403 is what shows the access-restricted card.
 */
export function ProfileView({ userId }: { userId?: string }) {
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();
  const isOwnProfile = !userId || userId === currentUser?.id;

  const [showIdentityModal, setShowIdentityModal] = useState(false);
  const [requested, setRequested] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const requestPermission = useRequestPermission();
  const queryClient = useQueryClient();

  const otherUserQuery = useUserProfile(isOwnProfile ? undefined : userId);
  const profileUser = isOwnProfile ? currentUser : otherUserQuery.data;

  const analytics = useUserAnalytics(isOwnProfile ? currentUser?.id : userId);
  const permissionDenied =
    !isOwnProfile && analytics.isError && (analytics.error as AxiosError)?.response?.status === 403;
  const hasForeignAccess = !isOwnProfile && analytics.isSuccess;

  const ownSessions = useMySessionsAsBorrower(isOwnProfile);
  const ownReviews = useMyReviews(isOwnProfile);
  const foreignSessions = useUserSessionHistory(hasForeignAccess ? userId : undefined);
  const foreignReviews = useReviewsForUser(isOwnProfile ? undefined : userId, hasForeignAccess);

  const handleRequestAccess = async () => {
    setRequestError(null);
    try {
      await requestPermission.mutateAsync(userId as string);
      setRequested(true);
    } catch (error) {
      const detail = error instanceof AxiosError ? error.response?.data?.detail : undefined;

      // A request already exists and is pending — that's the same end state
      // as a fresh success, so treat it as one rather than surfacing an
      // error for something that isn't actually a problem.
      if (detail === "Request already pending") {
        setRequested(true);
        return;
      }
      // The backend thinks access is already approved but this page is
      // still showing the restricted view — its cached permission state is
      // stale, so refetch instead of showing a confusing "error".
      if (detail === "You already have access") {
        queryClient.invalidateQueries({ queryKey: ["analytics", "user", userId] });
        queryClient.invalidateQueries({ queryKey: ["sessions", "history", userId] });
        queryClient.invalidateQueries({ queryKey: ["reviews", "user", userId] });
        return;
      }
      setRequestError(getFriendlyErrorMessage(error));
    }
  };

  if (!isOwnProfile && otherUserQuery.isError) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
        <Card className="p-8 text-center">
          <p className="text-sm text-muted-foreground">This Bolean profile couldn&apos;t be found.</p>
        </Card>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-4">
        <Skeleton className="h-[152px]" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  const sessions = isOwnProfile ? ownSessions.data ?? [] : foreignSessions.data ?? [];
  const reviews = isOwnProfile ? ownReviews.data ?? [] : foreignReviews.data ?? [];
  const avgRating = analytics.data?.reputation.avg_rating;

  const stats = analytics.data
    ? [
        { label: "Total Transacted", value: formatMaloti(analytics.data.kpis.total_transacted) },
        { label: "Outstanding", value: formatMaloti(analytics.data.kpis.outstanding) },
        { label: "Sessions", value: String(analytics.data.kpis.sessions_lifetime) },
        { label: "Completed", value: String(analytics.data.kpis.total_completed) },
      ]
    : null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-5">
      {/* Only shown once permission is approved — the identity images are
          the most sensitive thing on this page, so they stay gated behind
          the same approval as session history and reviews rather than
          being visible to anyone who merely looked someone up. */}
      {!isOwnProfile && hasForeignAccess && (
        <VisualIdentityCallout onConfirm={() => setShowIdentityModal(true)} />
      )}

      <ProfileOverviewCard
        user={profileUser}
        actions={
          !isOwnProfile ? (
            <Button onClick={() => router.push(`/lender/create-session?borrowerId=${profileUser.id}`)}>
              <PlusCircle size={15} />
              New Session
            </Button>
          ) : undefined
        }
      />

      {isOwnProfile ? (
        <>
          <OwnIdentityDocumentsCard userId={profileUser.id} />
          {stats && <SessionSummarySection stats={stats} sessions={sessions} viewAllHref="/sessions" />}
          <ReviewsSection reviews={reviews} avgRating={avgRating} />
        </>
      ) : analytics.isLoading || (hasForeignAccess && foreignSessions.isLoading) ? (
        <Card className="p-10">
          <Skeleton className="h-24" />
        </Card>
      ) : permissionDenied ? (
        <AccessRestrictedCard
          requested={requested}
          requestPending={requestPermission.isPending}
          error={requestError}
          onRequestAccess={handleRequestAccess}
        />
      ) : hasForeignAccess && !foreignSessions.isError ? (
        <>
          {stats && <SessionSummarySection stats={stats} sessions={sessions} />}
          <ReviewsSection reviews={reviews} avgRating={avgRating} />
        </>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t load this person&apos;s session history right now.
          </p>
        </Card>
      )}

      {!isOwnProfile && hasForeignAccess && showIdentityModal && (
        <IdentityConfirmationModal userId={userId as string} onClose={() => setShowIdentityModal(false)} />
      )}
    </div>
  );
}
