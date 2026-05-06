import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "./useAuth";
import { useClientAuth } from "./client/useClientAuth";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const { user: freelancerUser } = useAuth();
  const { user: clientUser } = useClientAuth();
  const currentUser = freelancerUser || clientUser;

  const loadNotifications = async () => {
    if (!currentUser) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      const [notifRes, countRes] = await Promise.all([
        api.get("/notifications"),
        api.get("/notifications/unread-count"),
      ]);
      setNotifications(notifRes.data);
      setUnreadCount(countRes.data.count);
    } catch (err) {
      console.error("Notification fetch error", err);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const markAsRead = async (notification) => {
    try {
      await api.post(`/notifications/${notification.id}/read`);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id
            ? { ...n, read_at: new Date().toISOString() }
            : n
        )
      );
      setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
      return notification.data;
    } catch (err) {
      console.error("Error marking notification read", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post("/notifications/mark-all-read");
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          read_at: new Date().toISOString(),
        }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all read", err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        refresh: loadNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotificationContext = () => useContext(NotificationContext);
