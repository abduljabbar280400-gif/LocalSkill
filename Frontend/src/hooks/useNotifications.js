import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/useAuth";
import { useClientAuth } from "../context/client/useClientAuth";

export default function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const { user: freelancerUser } = useAuth();
  const { user: clientUser } = useClientAuth();

  const currentUser = freelancerUser || clientUser;

  // ✅ MARK SINGLE AS READ
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

      return notification.data; // 👈 important for navigation
    } catch (err) {
      console.error("Error marking notification read", err);
    }
  };

  // ✅ MARK ALL AS READ
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

  // ✅ RELATIVE TIME
  const getRelativeTime = (date) => {
    const now = new Date();
    const created = new Date(date);
    const seconds = Math.floor((now - created) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;

    const days = Math.floor(seconds / 86400);
    if (days === 1) return "Yesterday";

    return created.toLocaleDateString();
  };

  // ✅ GROUPING
  const groupNotifications = () => {
    const today = [];
    const yesterday = [];
    const earlier = [];

    const now = new Date();

    notifications.forEach((n) => {
      const date = new Date(n.created_at);
      const diff = (now - date) / (1000 * 60 * 60 * 24);

      if (diff < 1) today.push(n);
      else if (diff < 2) yesterday.push(n);
      else earlier.push(n);
    });

    return { today, yesterday, earlier };
  };

  // ✅ FETCH NOTIFICATIONS
  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      try {
        if (!currentUser) {
          if (isMounted) {
            setNotifications([]);
            setUnreadCount(0);
          }
          return;
        }

        const [notifRes, countRes] = await Promise.all([
          api.get("/notifications"),
          api.get("/notifications/unread-count"),
        ]);

        if (isMounted) {
          setNotifications(notifRes.data);
          setUnreadCount(countRes.data.count);
        }
      } catch (err) {
        console.error("Notification fetch error", err);
      }
    };

    loadNotifications();

    const interval = setInterval(loadNotifications, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentUser]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    getRelativeTime,
    groupNotifications,
    freelancerUser,
    clientUser,
  };
}