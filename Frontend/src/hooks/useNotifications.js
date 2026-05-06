import { useNotificationContext } from "../context/NotificationContext";
import { useAuth } from "../context/useAuth";
import { useClientAuth } from "../context/client/useClientAuth";

export default function useNotifications() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refresh
  } = useNotificationContext();

  const { user: freelancerUser } = useAuth();
  const { user: clientUser } = useClientAuth();

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

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    getRelativeTime,
    groupNotifications,
    freelancerUser,
    clientUser,
    refresh
  };
}