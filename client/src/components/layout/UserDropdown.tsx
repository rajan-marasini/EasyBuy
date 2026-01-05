"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { User } from "@/lib/auth-store";
import {
    LayoutDashboard,
    LogOut,
    Package,
    Settings,
    User as UserIcon,
} from "lucide-react";
import Link from "next/link";

interface UserDropdownProps {
    user: User;
}

export default function UserDropdown({ user }: UserDropdownProps) {
    const { logout } = useAuth();

    const handleLogout = () => {
        logout.mutate();
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="flex items-center gap-2 px-3 h-10 rounded-full hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300"
                >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:block font-semibold text-sm text-zinc-700">
                        {user.name}
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-56 rounded-2xl border-2 shadow-2xl bg-white/95 backdrop-blur-xl p-2"
            >
                <DropdownMenuLabel className="px-3 py-2">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-bold text-zinc-900">
                            {user.name}
                        </p>
                        <p className="text-xs text-zinc-500">{user.email}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-200" />

                {user.role === "admin" && (
                    <>
                        <DropdownMenuItem asChild>
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200"
                            >
                                <LayoutDashboard className="h-4 w-4 text-blue-600" />
                                <span className="font-semibold text-sm">
                                    Dashboard
                                </span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-zinc-200" />
                    </>
                )}

                <DropdownMenuItem asChild>
                    <Link
                        href="/profile"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-zinc-50 transition-all duration-200"
                    >
                        <UserIcon className="h-4 w-4 text-zinc-600" />
                        <span className="font-semibold text-sm">Profile</span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                    <Link
                        href="/orders"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-zinc-50 transition-all duration-200"
                    >
                        <Package className="h-4 w-4 text-zinc-600" />
                        <span className="font-semibold text-sm">Orders</span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                    <Link
                        href="/settings"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-zinc-50 transition-all duration-200"
                    >
                        <Settings className="h-4 w-4 text-zinc-600" />
                        <span className="font-semibold text-sm">Settings</span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-zinc-200" />

                <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-red-50 text-red-600 transition-all duration-200"
                >
                    <LogOut className="h-4 w-4" />
                    <span className="font-semibold text-sm">Logout</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
