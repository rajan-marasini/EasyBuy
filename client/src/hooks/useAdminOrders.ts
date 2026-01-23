import api from "@/lib/api";
import { PaginatedOrdersResponse } from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useAdminOrders(page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: ["admin-orders", page, limit],
    queryFn: async (): Promise<PaginatedOrdersResponse> => {
      const { data } = await api.get<PaginatedOrdersResponse>("/orders", {
        params: { page, limit },
      });
      return data;
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      type,
    }: {
      id: string;
      status: string;
      type: "order" | "delivery";
    }) => {
      const payload =
        type === "order"
          ? { order_status: status }
          : { delivery_status: status };
      const response = await api.patch(`/orders/${id}/status`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
  });
}
