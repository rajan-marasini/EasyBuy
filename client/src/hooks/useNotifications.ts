import { useWebSocket } from "@/providers/WebSocketProvider";

/**
 * Custom hook to access real-time notifications
 *
 * @example
 * ```tsx
 * const { notifications, isConnected, markAsRead } = useNotifications();
 *
 * return (
 *   <div>
 *     <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
 *     {notifications.map(notif => (
 *       <div key={notif.id} onClick={() => markAsRead(notif.id)}>
 *         <h3>{notif.title}</h3>
 *         <p>{notif.message}</p>
 *       </div>
 *     ))}
 *   </div>
 * );
 * ```
 */
export function useNotifications() {
  const { notifications, isConnected, markAsRead, clearNotifications } =
    useWebSocket();

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const unreadNotifications = notifications.filter((n) => !n.is_read);
  const readNotifications = notifications.filter((n) => n.is_read);

  return {
    notifications,
    unreadNotifications,
    readNotifications,
    unreadCount,
    isConnected,
    markAsRead,
    clearNotifications,
  };
}
