import { CheckCircle2, OctagonX, TriangleAlert } from "lucide-react";
import { useWay2fast } from "@/lib/way2fastContext";
import type { RouteRating } from "@/lib/routeRating";

interface RatingBadgeProps {
  rating: RouteRating;
  showPattern?: boolean;
}

const RATING_META: Record<
  RouteRating,
  { className: string; strokeClass: string; dashArray?: string }
> = {
  easy: {
    className: "bg-rating-easy-bg text-rating-easy border-rating-easy",
    strokeClass: "stroke-rating-easy",
  },
  manageable: {
    className: "bg-rating-manageable-bg text-rating-manageable border-rating-manageable",
    strokeClass: "stroke-rating-manageable",
    dashArray: "6 4",
  },
  avoid: {
    className: "bg-rating-avoid-bg text-rating-avoid border-rating-avoid",
    strokeClass: "stroke-rating-avoid",
    dashArray: "2 4",
  },
};

export function RatingBadge({ rating, showPattern = true }: RatingBadgeProps) {
  const { t } = useWay2fast();
  const meta = RATING_META[rating];
  const label = t.routes.ratings[rating];
  const patternLabel = t.routes.patterns[rating];

  const Icon =
    rating === "easy" ? CheckCircle2 : rating === "manageable" ? TriangleAlert : OctagonX;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-bold ${meta.className}`}
      aria-label={`${label}, ${patternLabel}`}
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span>{label}</span>
      {showPattern && (
        <svg
          width="24"
          height="6"
          viewBox="0 0 24 6"
          aria-hidden="true"
          className="ml-0.5 shrink-0"
        >
          <line
            x1="1"
            y1="3"
            x2="23"
            y2="3"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={meta.dashArray}
            className={meta.strokeClass}
          />
        </svg>
      )}
    </span>
  );
}