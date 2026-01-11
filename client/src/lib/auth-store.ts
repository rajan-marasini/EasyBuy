import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "./api";

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    is_verified: boolean;
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
