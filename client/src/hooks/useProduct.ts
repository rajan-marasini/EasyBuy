import api from "@/lib/api";
import { Product } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

export function useProduct(id: string) {
    return useQuery({
        queryKey: ["product", id],
        queryFn: async () => {
            const { data } = await api.get<Product>(`/products/${id}`);
            return (data as any).data;
        },
        enabled: !!id,
    });
}
