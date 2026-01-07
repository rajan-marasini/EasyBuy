import api from "@/lib/api";
import { PaginatedProductsResponse } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";

export function useProducts(category?: string, search?: string) {
    return useInfiniteQuery({
        queryKey: ["products", { category, search }],
        queryFn: async ({
            pageParam = 1,
        }): Promise<PaginatedProductsResponse> => {
            const params: any = { page: pageParam, limit: 10, search };

            if (category && category.toLowerCase() !== "all") {
                const { data } = await api.get<any>(`/categories/${category}`);
                return {
                    data: data.products || [],
                    meta: {
                        current_page: 1,
                        total_pages: 1,
                        limit: (data.products || []).length,
                        total_items: (data.products || []).length,
                    },
                } as PaginatedProductsResponse;
            }

            const { data } = await api.get<PaginatedProductsResponse>(
                "/products",
                { params }
            );
            return data;
        },
        getNextPageParam: (lastPage) => {
            if (lastPage.meta.current_page < lastPage.meta.total_pages) {
                return lastPage.meta.current_page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
    });
}
