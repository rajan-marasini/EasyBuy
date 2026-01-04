import api from "@/lib/api";
import { Category } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

export function useCategories() {
    return useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            const { data } = await api.get<Category[]>("/categories");
            return data;
        },
    });
}
