import api from "@/lib/api";
import { PaginatedProductsResponse, Product } from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useAdminProducts(
  page: number = 1,
  limit: number = 10,
  category?: string,
  search?: string,
) {
  return useQuery({
    queryKey: ["admin-products", page, limit, category, search],
    queryFn: async (): Promise<PaginatedProductsResponse> => {
      const params: {
        page: number;
        limit: number;
        search: string | undefined;
      } = { page, limit, search };

      if (category && category.toLowerCase() !== "all") {
        const { data } = await api.get<{ products: Product[] }>(
          `/categories/${category}`,
        );
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

      const { data } = await api.get<PaginatedProductsResponse>("/products", {
        params,
      });
      return data;
    },
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.post("/products", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      const response = await api.patch(`/products/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
