"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Info } from "lucide-react";

export default function NotificationDialog() {
    const notifications = [
        // {
        //     id: 1,
        //     title: "Welcome!",
        //     description: "Thanks for joining EasyBuy.",
        //     time: "2m ago",
        // },
    ];

    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className="relative cursor-pointer group">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative p-2 text-zinc-700 hover:text-blue-600 transition-all duration-300 hover:scale-110 rounded-full"
                    >
                        <Bell className="h-6 w-6" />
                        {notifications.length > 0 && (
                            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-linear-to-br from-blue-500 to-purple-600 border-2 border-white shadow-lg animate-in zoom-in-50">
                                {notifications.length}
                            </Badge>
                        )}
                    </Button>
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-3xl border-2 shadow-2xl bg-white/95 backdrop-blur-xl">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-10 w-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                            <Bell className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-black bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Notifications
                            </DialogTitle>
                            <DialogDescription className="text-xs font-medium text-zinc-500 uppercase tracking-widest">
                                Stay updated with your activity
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
                <ScrollArea className="mt-4 max-h-[350px] pr-4">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="h-20 w-20 rounded-full bg-zinc-50 flex items-center justify-center mb-4 border-2 border-dashed border-zinc-200">
                                <Info className="h-8 w-8 text-zinc-300" />
                            </div>
                            <h3 className="text-lg font-bold text-zinc-900 mb-1">
                                All Caught Up!
                            </h3>
                            <p className="text-sm text-zinc-500 max-w-[200px]">
                                You don&apos;t have any new notifications at the
                                moment.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Notification items will go here */}
                        </div>
                    )}
                </ScrollArea>
                <div className="mt-6 flex justify-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 font-bold hover:bg-blue-50 rounded-xl"
                    >
                        Mark all as read
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
