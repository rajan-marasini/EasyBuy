import api from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useAuth() {
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);

    const loginMutation = useMutation({
        mutationFn: async (credentials: any) => {
            const { data } = await api.post("/auth/login", credentials);
            return data;
        },
        onSuccess: (response) => {
            // response.data contains the user object (UserLoginResponse) from the backend
            if (response.data) {
                setAuth(response.data);
            }
            toast.success("Login successful!");
            router.push("/");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Login failed");
        },
    });

    const logoutMutation = useMutation({
        mutationFn: async () => {
            await api.post("/auth/logout");
        },
        onSuccess: () => {
            useAuthStore.getState().logout();
            toast.success("Logged out successfully");
            router.push("/login");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Logout failed");
            // Still clear local state even if server call fails
            useAuthStore.getState().logout();
            router.push("/login");
        },
    });

    const signupMutation = useMutation({
        mutationFn: async (userData: any) => {
            const { data } = await api.post("/auth/register", userData);
            return data;
        },
        onSuccess: () => {
            toast.success("Registration successful! Please login.");
            router.push("/login");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Registration failed");
        },
    });

    return {
        login: loginMutation,
        logout: logoutMutation,
        signup: signupMutation,
    };
}
