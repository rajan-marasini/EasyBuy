import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAddReview } from "@/hooks/useReviews";
import { Loader2, PenLine } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { StarRating } from "./StarRating";

interface AddReviewDialogProps {
    productId: string;
}

export function AddReviewDialog({ productId }: AddReviewDialogProps) {
    const [open, setOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const { mutate: addReview, isPending } = useAddReview();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            toast.error("Please select a rating");
            return;
        }

        if (comment.length < 10) {
            toast.error("Comment must be at least 10 characters long");
            return;
        }

        addReview(
            { productId, rating, comment },
            {
                onSuccess: () => {
                    toast.success("Review submitted successfully");
                    setOpen(false);
                    setRating(0);
                    setComment("");
                },
                onError: (error: any) => {
                    toast.error(
                        error?.response?.data?.message ||
                            "Failed to submit review"
                    );
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-500/20">
                    <PenLine className="h-4 w-4 mr-2" />
                    Write a Review
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-3xl border-2 border-zinc-100 dark:border-zinc-800">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-center bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        Write a Review
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest">
                            Your Rating
                        </span>
                        <StarRating
                            rating={rating}
                            onRatingChange={setRating}
                        />
                    </div>
                    <div className="space-y-2">
                        <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest ml-1">
                            Your Experience
                        </span>
                        <Textarea
                            placeholder="Tell us what you think about this product..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="min-h-[120px] rounded-2xl border-2 border-zinc-100 focus:border-emerald-500 focus:ring-emerald-500/20 resize-none p-4"
                        />
                        <p className="text-xs text-right text-zinc-400 font-bold">
                            {comment.length}/1000
                        </p>
                    </div>
                    <Button
                        type="submit"
                        className="w-full h-12 rounded-xl text-lg font-bold bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-xl shadow-emerald-500/30"
                        disabled={isPending}
                    >
                        {isPending ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            "Submit Review"
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
