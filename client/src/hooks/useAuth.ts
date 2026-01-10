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
      toast.success("Email verification sent. Check your inbox.");
      router.push("/login");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Registration failed");
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const { data } = await api.post("/auth/forgot-password", { email });
      return data;
    },
    onSuccess: (response) => {
      toast.success(response.message || "OTP sent to your email");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to send reset link");
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (resetData: any) => {
      const { data } = await api.post("/auth/reset-password", resetData);
      return data;
    },
    onSuccess: (response) => {
      toast.success(response.message || "Password reset successful");
      router.push("/login");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to reset password");
    },
  });

  return {
    login: loginMutation,
    logout: logoutMutation,
    signup: signupMutation,
    forgotPassword: forgotPasswordMutation,
    resetPassword: resetPasswordMutation,
  };
}
