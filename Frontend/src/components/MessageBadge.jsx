import { useState, useEffect } from "react";
import api from "../services/api";
import echo from "../utils/echo";

function getCurrentUserId() {
  try {
    const c = localStorage.getItem("client_user");
    const f = localStorage.getItem("freelancer_user");
    if (c) return JSON.parse(c).id;
    if (f) return JSON.parse(f).id;
  } catch (_) {}
  return null;
}

export default function MessageBadge({ variant = "corner" }) {
  const [count, setCount] = useState(0);
  const userId = getCurrentUserId();

  const fetchCount = () => {
    api.get("/conversations/unread-count")
      .then((res) => {
        setCount(res.data.unread_count);
      })
      .catch(() => {});
  };

  useEffect(() => {
    // Initial fetch
    fetchCount();

    // 1. WebSocket listener for instant updates
    if (userId) {
      const channel = echo.private(`user.${userId}`);
      channel.listen(".conversation.updated", () => {
        fetchCount(); // Just re-fetch when any conversation updates
      });

      return () => echo.leave(`user.${userId}`);
    }

    // 2. Polling fallback (every 60s)
    const interval = setInterval(fetchCount, 60000);
    return () => clearInterval(interval);
  }, [userId]);

  if (count === 0) return null;

  if (variant === "inline") {
    return (
      <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
        {count > 99 ? "99+" : count}
      </span>
    );
  }

  return (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[11px] font-semibold px-1.5 py-0.5 rounded-full">
      {count > 99 ? "99+" : count}
    </span>
  );
}
