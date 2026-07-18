import { Stars } from "@/components/ui/Stars";
import type { RatingSummary } from "@/lib/db/reviews";

export interface ReviewItem {
  id: string;
  authorName: string;
  overall: number;
  body: string | null;
  createdAt: string;
}

interface Props {
  summary: RatingSummary;
  reviews: ReviewItem[];
}

export function ReviewList({ summary, reviews }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Stars value={summary.average} />
        <span className="text-sm text-neutral-600">
          {summary.count > 0
            ? `${summary.average.toFixed(1)} · ${summary.count} review${summary.count === 1 ? "" : "s"}`
            : "No reviews yet"}
        </span>
      </div>

      {reviews.map((review) => (
        <div key={review.id} className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-neutral-900">{review.authorName}</p>
            <Stars value={review.overall} size={14} />
          </div>
          {review.body && <p className="mt-1.5 text-sm text-neutral-600">{review.body}</p>}
        </div>
      ))}
    </div>
  );
}
