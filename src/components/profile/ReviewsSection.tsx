import { Star, MessageSquareText } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/format";
import type { ReviewOut } from "@/lib/types";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={12}
          className={i <= rating ? "fill-primary text-primary" : "fill-transparent text-border"}
        />
      ))}
    </div>
  );
}

export function ReviewsSection({ reviews, avgRating }: { reviews: ReviewOut[]; avgRating?: number }) {
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
              <Stars rating={review.rating} />
              <p className="text-[13.5px] text-foreground/90 leading-relaxed mt-1.5">{review.msg}</p>
              <p className="text-[11.5px] text-muted-foreground mt-2">{formatDate(review.created_at)}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
