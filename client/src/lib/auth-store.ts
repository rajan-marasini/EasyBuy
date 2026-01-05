import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface AuthState {
    user: User | null;
    setAuth: (user: User) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            setAuth: (user) => set({ user }),
            logout: () => set({ user: null }),
        }),
        {
            name: "auth-storage",
        }
    )
);
