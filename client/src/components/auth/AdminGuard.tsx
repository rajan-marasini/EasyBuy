"use client";

import { useAuthStore } from "@/lib/auth-store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function AdminGuard({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, hasHydrated } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!hasHydrated) return;

        if (!user) {
            router.push("/login");
            toast.error("Login in to access admin dashboard");
        } else if (user.role !== "admin") {
            router.push("/");
            toast.error("Access Denied");
        }
    }, [user, router, hasHydrated]);

    if (!hasHydrated || !user || user.role !== "admin") {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return <>{children}</>;
}
