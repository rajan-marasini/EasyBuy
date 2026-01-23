import api from "@/lib/api";
import { PaginatedOrdersResponse } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

export function useUserOrders(
  userId: string,
  page: number = 1,
  limit: number = 10,
) {
  return useQuery({
    queryKey: ["user-orders", userId, page, limit],
    queryFn: async (): Promise<PaginatedOrdersResponse> => {
      const { data } = await api.get<PaginatedOrdersResponse>(
        `/orders/user/${userId}`,
        {
          params: { page, limit },
        },
      );
      return data;
    },
    enabled: !!userId, // Only run query if userId is available
  });
}
