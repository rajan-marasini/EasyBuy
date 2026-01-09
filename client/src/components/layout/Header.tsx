"use client";

import UserDropdown from "@/components/layout/UserDropdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/lib/auth-store";
import { useCartStore } from "@/lib/cart-store";
import { useSearchStore } from "@/lib/search-store";
import { Search, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import NotificationDialog from "./NotificationDialog";

export default function Header() {
    const user = useAuthStore((state) => state.user);
    const cartItems = useCartStore((state) => state.items);
    const { searchQuery, setSearchQuery } = useSearchStore();

    const [isHydrated, setIsHydrated] = useState(false);
    useEffect(() => {
        (async () => {
            setIsHydrated(true);
        })();
    }, []);

    const cartItemsCount = cartItems.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-xl supports-backdrop-filter:bg-white/80 shadow-sm dark:bg-zinc-950/95 dark:border-zinc-800">
            {isHydrated && user && !user.is_verified && (
                <div className="w-full bg-yellow-100/80 dark:bg-yellow-900/30 backdrop-blur-sm border-b border-yellow-200 dark:border-yellow-800 px-4 py-1.5 flex items-center justify-center gap-2 text-xs font-medium text-yellow-800 dark:text-yellow-200 shadow-sm animate-in slide-in-from-top-2 duration-300">
                    <span>
                        Your account is not verified. Please check your email to
                        verify your account.
                    </span>
                    <button
                        onClick={() => toast.success("Verification email sent")}
                        className="underline hover:text-yellow-900 dark:hover:text-yellow-100 font-bold cursor-pointer rounded px-1"
                    >
                        Resend Email
                    </button>
                </div>
            )}
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link
                    href="/"
                    className="text-2xl font-black tracking-tight bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent hover:from-emerald-700 hover:to-teal-700 transition-all duration-300"
                >
                    EasyBuy
                </Link>

                {/* Search Bar */}
                <div className="hidden flex-1 md:flex justify-center max-w-md mx-8">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <Input
                            placeholder="Search products..."
                            className="pl-9 rounded-full bg-linear-to-r from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 border-none h-10 w-full focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Icons */}
                <div className="flex items-center gap-2">
                    <Link
                        href="/cart"
                        className="relative p-2 text-zinc-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300 hover:scale-110"
                    >
                        <ShoppingCart className="h-6 w-6" />
                        {isHydrated && cartItemsCount > 0 && (
                            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-linear-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 border-2 border-white dark:border-zinc-950 shadow-lg animate-in zoom-in-50">
                                {cartItemsCount}
                            </Badge>
                        )}
                    </Link>
                    {isHydrated && user && (
                        <div className="mr-1">
                            <NotificationDialog />
                        </div>
                    )}

                    {user ? (
                        <UserDropdown user={user} />
                    ) : (
                        <Button
                            asChild
                            variant="ghost"
                            className="rounded-full hover:bg-linear-to-r hover:from-emerald-50 hover:to-teal-50 dark:hover:from-emerald-950 dark:hover:to-teal-950 transition-all duration-300"
                        >
                            <Link
                                href="/login"
                                className="flex items-center gap-2"
                            >
                                <User className="h-5 w-5" />
                                <span className="hidden md:inline font-semibold text-sm">
                                    Login
                                </span>
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            {/* Mobile Search - Visible only on mobile */}
            <div className="md:hidden px-4 pb-3">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <Input
                        placeholder="Search products..."
                        className="pl-9 rounded-full bg-linear-to-r from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 border-none h-10 w-full focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>
        </header>
    );
}
