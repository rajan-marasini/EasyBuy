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
import NotificationDialog from "./NotificationDialog";

export default function Header() {
    const user = useAuthStore((state) => state.user);
    const cartItems = useCartStore((state) => state.items);
    const { searchQuery, setSearchQuery } = useSearchStore();

    const [isHydrated, setIsHydrated] = useState(false);
    useEffect(() => {
        setIsHydrated(true);
    }, []);

    const cartItemsCount = cartItems.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-xl supports-backdrop-filter:bg-white/80 shadow-sm">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link
                    href="/"
                    className="text-2xl font-black tracking-tight bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                >
                    EasyBuy
                </Link>

                {/* Search Bar */}
                <div className="hidden flex-1 md:flex justify-center max-w-md mx-8">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <Input
                            placeholder="Search products..."
                            className="pl-9 rounded-full bg-linear-to-r from-zinc-50 to-zinc-100 border-none h-10 w-full focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Icons */}
                <div className="flex items-center gap-2">
                    <Link
                        href="/cart"
                        className="relative p-2 text-zinc-700 hover:text-blue-600 transition-all duration-300 hover:scale-110"
                    >
                        <ShoppingCart className="h-6 w-6" />
                        {isHydrated && cartItemsCount > 0 && (
                            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-linear-to-br from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 border-2 border-white shadow-lg animate-in zoom-in-50">
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
                            className="rounded-full hover:bg-linear-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300"
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
                        className="pl-9 rounded-full bg-linear-to-r from-zinc-50 to-zinc-100 border-none h-10 w-full focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>
        </header>
    );
}
