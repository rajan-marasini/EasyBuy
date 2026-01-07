import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
    totalStars?: number;
    rating: number;
    onRatingChange: (rating: number) => void;
    readOnly?: boolean;
}

export function StarRating({
    totalStars = 5,
    rating,
    onRatingChange,
    readOnly = false,
}: StarRatingProps) {
    const [hoverRating, setHoverRating] = useState(0);

    return (
        <div className="flex items-center gap-1">
            {[...Array(totalStars)].map((_, i) => {
                const starValue = i + 1;
                const isActive = starValue <= (hoverRating || rating);

                return (
                    <button
                        type="button"
                        key={i}
                        className={cn(
                            "transition-all duration-200 focus:outline-hidden",
                            readOnly
                                ? "cursor-default"
                                : "cursor-pointer hover:scale-110"
                        )}
                        onClick={() => !readOnly && onRatingChange(starValue)}
                        onMouseEnter={() =>
                            !readOnly && setHoverRating(starValue)
                        }
                        onMouseLeave={() => !readOnly && setHoverRating(0)}
                        disabled={readOnly}
                    >
                        <Star
                            className={cn(
                                "h-6 w-6 transition-colors",
                                isActive
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "fill-zinc-100 text-zinc-200 dark:fill-zinc-800 dark:text-zinc-700"
                            )}
                        />
                    </button>
                );
            })}
        </div>
    );
}
