import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/lib/auth-store";
import { Pencil, Star, Trash2 } from "lucide-react";

interface ReviewItemProps {
    review: {
        id: string;
        rating: number;
        comment: string;
        created_at: string;
        user: {
            id: string;
            name: string;
        };
    };
}

export function ReviewItem({ review }: ReviewItemProps) {
    const { user } = useAuthStore();
    const isOwner = user?.id === review.user.id;

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardContent className="p-0 space-y-4">
                <div className="flex items-start justify-between gap-4">
                    {/* Left */}
                    <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10 border border-zinc-200 dark:border-zinc-800">
                            <AvatarImage
                                src={`https://api.dicebear.com/7.x/initials/svg?seed=${review.user.name}`}
                                alt={review.user.name}
                            />
                            <AvatarFallback className="font-bold">
                                {review.user.name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>

                        <div>
                            <h4 className="font-semibold text-sm">
                                {review.user.name}
                            </h4>

                            <div className="flex items-center gap-2">
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`h-3 w-3 ${
                                                i < review.rating
                                                    ? "fill-yellow-400 text-yellow-400"
                                                    : "fill-zinc-200 text-zinc-200 dark:fill-zinc-800 dark:text-zinc-800"
                                            }`}
                                        />
                                    ))}
                                </div>

                                <span className="text-xs text-zinc-500">
                                    {new Date(
                                        review.created_at
                                    ).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right – Edit / Delete */}
                    {isOwner && (
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-zinc-500 hover:text-red-600 cursor-pointer"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>

                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {review.comment}
                </p>

                <div className="h-px bg-zinc-100 dark:bg-zinc-800 w-full" />
            </CardContent>
        </Card>
    );
}
