import api from "@/lib/api";
import { User } from "@/lib/auth-store";
import { ApiError } from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

interface UpdateProfileRequest {
    name?: string;
    phone?: string;
}

export function useProfile() {
    const queryClient = useQueryClient();

    const profileQuery = useQuery({
        queryKey: ["profile"],
        queryFn: async () => {
            const { data } = await api.get<{
                success: boolean;
                message: string;
                data: User;
            }>("/auth/me");
            return data.data;
        },
    });

    const updateProfileMutation = useMutation({
        mutationFn: async (updateData: UpdateProfileRequest) => {
            const { data } = await api.patch(
                `/users/${profileQuery.data?.id}`,
                updateData
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["profile"] });
            toast.success("Profile updated successfully");
        },
        onError: (error: AxiosError<ApiError>) => {
            toast.error(
                error.response?.data?.message || "Failed to update profile"
            );
        },
    });

    return {
        profile: profileQuery.data,
        isLoading: profileQuery.isLoading,
        error: profileQuery.error,
        updateProfile: updateProfileMutation,
    };
}
