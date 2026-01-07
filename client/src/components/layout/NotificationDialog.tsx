"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Bell, Check, Info } from "lucide-react";

export default function NotificationDialog() {
    const notifications = [
        {
            id: 1,
            title: "Order Received!",
            description: "Your order has been received successfully.",
            time: "1m ago",
            read: true,
        },
        {
            id: 2,
            title: "Order Placed!",
            description: "Your order has been placed successfully.",
            time: "2m ago",
            read: false,
        },
        {
            id: 3,
            title: "Welcome!",
            description: "Thanks for joining EasyBuy.",
            time: "5m ago",
            read: true,
        },
    ];

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <div className="relative cursor-pointer group">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative p-2 text-zinc-700 hover:text-emerald-600 transition-all duration-300 hover:scale-110 rounded-full"
                    >
                        <Bell className="h-6 w-6" />
                        {unreadCount > 0 && (
                            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-linear-to-br from-emerald-500 to-teal-600 border-2 border-white shadow-lg animate-in zoom-in-50">
                                {unreadCount}
                            </Badge>
                        )}
                    </Button>
                </div>
            </PopoverTrigger>
            <PopoverContent
                className="w-96 rounded-3xl border-2 shadow-2xl bg-white/95 backdrop-blur-xl p-0 overflow-hidden flex flex-col max-h-[85vh]"
                align="end"
                sideOffset={8}
            >
                <div className="px-4 py-3 border-b border-zinc-100 shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                            <Bell className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-black bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                Notifications
                            </h3>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                Recent Activity
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex-1 w-full overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                            <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center mb-3 border-2 border-dashed border-emerald-100">
                                <Info className="h-6 w-6 text-emerald-300" />
                            </div>
                            <h3 className="text-base font-bold text-zinc-900 mb-1">
                                All Caught Up!
                            </h3>
                            <p className="text-xs text-zinc-500 max-w-[180px]">
                                You don&apos;t have any new notifications at the
                                moment.
                            </p>
                        </div>
                    ) : (
                        <div className="py-2">
                            {/* Notification items will go here */}
                            {notifications.map((n, i) => (
                                <div
                                    key={`${n.id}-${i}`}
                                    className={`flex items-start gap-3 p-3 hover:bg-zinc-50 transition-colors cursor-pointer group/item relative ${
                                        !n.read ? "bg-emerald-50/60" : ""
                                    }`}
                                >
                                    <div
                                        className={`mt-1 h-2 w-2 rounded-full shrink-0 transition-colors ${
                                            !n.read
                                                ? "bg-emerald-500"
                                                : "bg-zinc-200"
                                        }`}
                                    />
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-bold text-zinc-800 group-hover/item:text-emerald-700 transition-colors">
                                                {n.title}
                                            </p>
                                            <span className="text-[10px] font-medium text-zinc-400 whitespace-nowrap">
                                                {n.time}
                                            </span>
                                        </div>
                                        <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">
                                            {n.description}
                                        </p>
                                    </div>
                                    {!n.read && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 bg-white/80 shadow-xs opacity-0 group-hover/item:opacity-100 transition-all scale-90 hover:scale-100"
                                            title="Mark as read"
                                        >
                                            <Check className="h-3 w-3 cursor-pointer" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="p-2 border-t border-zinc-100 bg-zinc-50/50 shrink-0">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-emerald-600 font-bold hover:bg-emerald-50 hover:text-emerald-700 rounded-xl text-xs h-8 cursor-pointer"
                        disabled={unreadCount === 0}
                    >
                        Mark all as read
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
