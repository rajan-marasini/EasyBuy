import api from "@/lib/api";
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
  return useMutation({
    mutationFn: async (orderData: CreateOrderRequest) => {
      const { data } = await api.post("/orders", orderData);
      return data;
    },
    onError: (error) => {
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || "Failed to place order");
    },
  });
}
