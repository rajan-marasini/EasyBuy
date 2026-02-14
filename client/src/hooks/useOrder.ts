import api from "@/lib/api";
import { CreateOrderResponse } from "@/lib/types";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

interface OrderItem {
  productId: string;
  quantity: number;
}

interface CreateOrderRequest {
  items: OrderItem[];
  paymentMethod: string;
  shippingAddress: string;
  paymentId?: string;
}

export function useCreateOrder() {
  return useMutation<
    CreateOrderResponse,
    AxiosError<{ message: string }>,
    CreateOrderRequest
  >({
    mutationFn: async (orderData: CreateOrderRequest) => {
      const { data } = await api.post<CreateOrderResponse>(
        "/orders",
        orderData,
      );
      return data;
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to place order");
    },
  });
}
