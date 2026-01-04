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
        onSuccess: (data) => {
            setAuth(data.user, data.token);
            toast.success("Login successful!");
            router.push("/");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Login failed");
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
        signup: signupMutation,
    };
}
