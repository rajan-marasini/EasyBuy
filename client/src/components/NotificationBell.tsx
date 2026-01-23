"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { Bell, Check, X } from "lucide-react";

/**
 * NotificationBell Component
 *
 * A dropdown notification bell that displays real-time notifications.
 * Shows unread count badge and allows marking notifications as read.
 *
 * @example
 * ```tsx
 * import NotificationBell from "@/components/NotificationBell";
 *
 * export default function Header() {
 *   return (
 *     <header>
 *       <NotificationBell />
 *     </header>
 *   );
 * }
 * ```
 */
export default function NotificationBell() {
  const {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    clearNotifications,
  } = useNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
          {!isConnected && (
            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-yellow-500" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-2 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearNotifications}
              className="h-8 text-xs"
            >
              Clear all
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mb-2 opacity-20" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex items-start gap-3 p-3 cursor-pointer ${
                  !notification.is_read ? "bg-accent/50" : ""
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{notification.title}</p>
                    {!notification.is_read && (
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                {notification.is_read ? (
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                ) : (
                  <X className="h-4 w-4 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100" />
                )}
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
        {!isConnected && (
          <div className="p-2 border-t bg-yellow-50 dark:bg-yellow-950/20">
            <p className="text-xs text-yellow-800 dark:text-yellow-200 text-center">
              Reconnecting to notification service...
            </p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
