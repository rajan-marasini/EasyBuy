"use client";

import { useAuthStore } from "@/lib/auth-store";
import * as types from "@/lib/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface WebSocketContextType {
  notifications: types.Notification[];
  isConnected: boolean;
  addNotification: (notification: types.Notification) => void;
  markAsRead: (notificationId: string) => void;
  clearNotifications: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined,
);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<types.Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    (() => {
      if (!user) {
        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
        }
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
        setIsConnected(false);
        setNotifications([]);
        reconnectAttemptsRef.current = 0;
        return;
      }

      // Function to establish WebSocket connection
      const connect = () => {
        // Clear any existing connection
        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
        }

        // Clear any pending reconnection
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }

        try {
          const wsUrl = `${process.env.NEXT_PUBLIC_API_URL}/ws`;
          console.log("🔌 Connecting to WebSocket:", wsUrl);

          const ws = new WebSocket(wsUrl);

          ws.onopen = () => {
            console.log("✅ WebSocket connected");
            setIsConnected(true);
            reconnectAttemptsRef.current = 0;
          };

          ws.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              console.log("📬 New notification received:", data);

              setNotifications((prev) => [data, ...prev]);

              // Optional: Show browser notification
              if (
                "Notification" in window &&
                Notification.permission === "granted"
              ) {
                new Notification(data.title, {
                  body: data.message,
                  icon: "/favicon.ico",
                });
              }
            } catch (error) {
              console.error("Error parsing notification:", error);
            }
          };

          ws.onerror = (error) => {
            console.error("❌ WebSocket error:", error);
            setIsConnected(false);
          };

          ws.onclose = (event) => {
            console.log("❌ WebSocket disconnected:", event.code, event.reason);
            setIsConnected(false);
            wsRef.current = null;

            // Only reconnect if:
            // 1. Not intentionally closed (code 1000)
            // 2. Haven't exceeded max attempts
            // 3. User is still logged in (checked via ref)
            if (event.code !== 1000 && reconnectAttemptsRef.current < 5) {
              reconnectAttemptsRef.current++;
              const delay = Math.min(
                1000 * Math.pow(2, reconnectAttemptsRef.current),
                10000,
              );
              console.log(
                `🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current}/5)`,
              );

              reconnectTimeoutRef.current = setTimeout(() => {
                connect();
              }, delay);
            }
          };

          wsRef.current = ws;
        } catch (error) {
          console.error("Failed to create WebSocket connection:", error);
          setIsConnected(false);
        }
      };

      // Connect when user is authenticated
      connect();

      // Cleanup on unmount or user change
      return () => {
        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
        }
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };
    })();
  }, [user]);

  const addNotification = useCallback((notification: types.Notification) => {
    setNotifications((prev) => [notification, ...prev]);
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, is_read: true } : notif,
      ),
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value: WebSocketContextType = {
    notifications,
    isConnected,
    addNotification,
    markAsRead,
    clearNotifications,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
}
