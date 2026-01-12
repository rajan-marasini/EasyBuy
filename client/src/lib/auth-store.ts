import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "./api";

export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    password?: string;
    is_verified: boolean;
    email_verification_token?: string;
    email_verified_at?: string;
    password_reset_token?: string;
    role: string;
    status: string;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
    last_login_at?: string;
}

interface AuthState {
    user: User | null;
    setAuth: (user: User) => void;
    logout: () => void;
    fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            setAuth: (user) => set({ user }),
            logout: () => set({ user: null }),
            fetchUser: async () => {
                try {
                    const response = await api.get("/auth/me");
                    if (response.data.success) {
                        set({ user: response.data.data });
                    }
                } catch {
                    set({ user: null });
                }
            },
        }),
        {
            name: "auth-storage",
        }
    )
);
