import api from "@/lib/api";
import {
    useInfiniteQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

interface ReviewResponse {
    data: any[];
    meta: {
        current_page: number;
        total_pages: number;
        total_items: number;
        limit: number;
    };
}

export function useProductReviews(productId: string) {
    return useInfiniteQuery({
        queryKey: ["reviews", productId],
        queryFn: async ({ pageParam = 1 }) => {
            const { data } = await api.get<ReviewResponse>(
                `reviews/product/${productId}?page=${pageParam}&limit=5`
            );
            return data;
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (lastPage.meta.current_page < lastPage.meta.total_pages) {
                return lastPage.meta.current_page + 1;
            }
            return undefined;
        },
        enabled: !!productId,
    });
}

export function useAddReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: {
            productId: string;
            rating: number;
            comment: string;
        }) => {
            const response = await api.post("/reviews", {
                product_id: data.productId,
                rating: data.rating,
                comment: data.comment,
            });
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["reviews", variables.productId],
            });
            queryClient.invalidateQueries({
                queryKey: ["product", variables.productId],
            });
        },
    });
}
