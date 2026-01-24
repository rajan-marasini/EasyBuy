import { useWebSocket } from "@/providers/WebSocketProvider";

export function useNotifications() {
  const { notifications, isConnected, markAsRead, clearNotifications } =
    useWebSocket();

  const unreadCount = notifications.filter((n) => !n.is_read).length || 0;

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    clearNotifications,
  };
}
