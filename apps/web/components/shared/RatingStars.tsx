import React from "react";
import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number; // 0 to 5
  count?: number; // total reviews
  className?: string;
  size?: number;
}

export function RatingStars({ rating, count, className, size = 16 }: RatingStarsProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex text-amber-500">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} size={size} className="fill-current" />
        ))}
        {hasHalfStar && <StarHalf size={size} className="fill-current" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} size={size} className="text-muted-foreground/30" strokeWidth={1.5} />
        ))}
      </div>
      {(count !== undefined) && (
        <span className="text-sm text-muted-foreground ml-1 font-medium">
          {rating.toFixed(1)} <span className="opacity-70 text-xs">({count})</span>
        </span>
      )}
    </div>
  );
}
