"use client";

import { Button } from "@/components/ui/button";
import { useProductReviews } from "@/hooks/useReviews";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { ReviewItem } from "./ReviewItem";

interface ReviewListProps {
    productId: string;
}

export function ReviewList({ productId }: ReviewListProps) {
    const { ref, inView } = useInView();

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useProductReviews(productId);

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, fetchNextPage]);

    if (status === "pending") {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className="text-center py-8 text-red-500">
                Error loading reviews: {error?.message}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-3xl font-black border-l-8 border-emerald-600 pl-4 uppercase tracking-tighter bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    Product Reviews
                </h3>
                {/* We can add a "Write a Review" button here later or keep it as per design */}
            </div>

            <div className="space-y-6">
                {data?.pages.map((page, i) => (
                    <div key={i} className="space-y-6">
                        {page.data.map((review: any) => (
                            <ReviewItem key={review.id} review={review} />
                        ))}
                    </div>
                ))}
            </div>

            {data?.pages[0].data.length === 0 && (
                <div className="bg-linear-to-br from-zinc-50 to-emerald-50/30 rounded-3xl p-12 text-center dark:from-zinc-900 dark:to-emerald-900/30 border-2 border-zinc-100">
                    <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">
                        No reviews for this product yet. Be the first to review!
                    </p>
                    <Button
                        variant="link"
                        className="mt-4 text-emerald-600 font-bold hover:text-teal-600 transition-colors"
                    >
                        Write a Review
                    </Button>
                </div>
            )}

            <div ref={ref} className="flex justify-center py-4">
                {isFetchingNextPage && (
                    <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                )}
            </div>
        </div>
    );
}
