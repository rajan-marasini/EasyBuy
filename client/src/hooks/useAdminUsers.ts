/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/api";
import { PaginatedUsersResponse, User } from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useAdminUsers(
  page: number = 1,
  limit: number = 10,
  search?: string,
) {
  return useQuery({
    queryKey: ["admin-users", page, limit, search],
    queryFn: async (): Promise<PaginatedUsersResponse> => {
      const params: any = { page, limit, search };
      const { data } = await api.get<PaginatedUsersResponse>("/users", {
        params,
      });
      return data;
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<User> }) => {
      const response = await api.patch(`/users/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
}
