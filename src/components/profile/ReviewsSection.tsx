import { Star, MessageSquareText } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/format";
import type { ReviewOut } from "@/lib/types";

export function ReviewsSection({
  reviews,
  avgRating,
}: {
  reviews: ReviewOut[];
  /** Only available for your own profile — the backend has no aggregate
   *  rating endpoint for other users, and individual reviews don't carry a
   *  rating field at all, so this is omitted (not faked) when viewing
   *  someone else. */
  avgRating?: number;
}) {
  return (
    <Card>
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h2 className="font-display font-semibold text-[15px] text-foreground">
          Reviews <span className="text-muted-foreground font-normal">({reviews.length})</span>
        </h2>
        {avgRating !== undefined && reviews.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Star size={14} className="fill-primary text-primary" />
            <span className="text-[13px] text-foreground font-medium">{avgRating.toFixed(1)}</span>
            <span className="text-[12px] text-muted-foreground">average</span>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-14">
          <MessageSquareText size={20} className="text-muted-foreground opacity-40" />
          <p className="text-sm text-muted-foreground">No reviews yet.</p>
        </div>
      ) : (
        <div>
          {reviews.map((review) => (
            <div key={review.id} className="px-5 py-4 border-b border-border/60 last:border-b-0">
              <p className="text-[13.5px] text-foreground/90 leading-relaxed">{review.msg}</p>
              <p className="text-[11.5px] text-muted-foreground mt-2">{formatDate(review.created_at)}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
