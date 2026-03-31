import { useState, useEffect, useRef } from "react";
import {
  FiBell,
  FiUser,
  FiBriefcase,
  FiCheckCircle,
  FiMessageCircle,
} from "react-icons/fi";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/useAuth";
import { useClientAuth } from "../context/client/useClientAuth";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  const { user: freelancerUser } = useAuth();
  const { user: clientUser } = useClientAuth();

  const currentUser = freelancerUser || clientUser;

  // console.log(currentUser.username);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // MARK SINGLE AS READ
  const markAsRead = async (notification) => {
    try {
      await api.post(`/notifications/${notification.id}/read`);

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id
            ? { ...n, read_at: new Date().toISOString() }
            : n,
        ),
      );

      setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));

      setOpen(false);

      const data = notification.data;

      // console.log("Na pota clg", notification.data);

      console.log("Clicked notification:", data);

      // 🔥 1. PRIORITY: CONTRACT REDIRECT
      if (data?.contract_id) {
        if (freelancerUser) {
          navigate(
            `/freelancer/${freelancerUser.username}/contracts/${data.contract_id}`,
          );
        } else if (clientUser) {
          navigate(
            `/hire-freelancer/${clientUser.username}/contracts/${data.contract_id}`,
          );
        }
        return; // ⛔ IMPORTANT: stop further execution
      }
      // 🔥 2. FALLBACK: PROJECT PAGE
      if (data?.project_slug) {
        navigate(`/projects/${data.project_slug}`);
        return;
      }
    } catch (err) {
      console.error("Error marking notification read", err);
    }
  };

  // MARK ALL READ
  const markAllAsRead = async () => {
    try {
      await api.post("/notifications/mark-all-read");

      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          read_at: new Date().toISOString(),
        })),
      );

      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all read", err);
    }
  };

  // RELATIVE TIME
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

  // GROUP
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

  // TYPE STYLE
  const getTypeStyle = (message = "") => {
    const text = message.toLowerCase();

    if (text.includes("proposal"))
      return { icon: <FiBriefcase />, color: "bg-blue-100 text-blue-600" };

    if (text.includes("submitted"))
      return { icon: <FiCheckCircle />, color: "bg-green-100 text-green-600" };

    if (text.includes("message"))
      return {
        icon: <FiMessageCircle />,
        color: "bg-purple-100 text-purple-600",
      };

    return { icon: <FiBell />, color: "bg-gray-100 text-gray-600" };
  };

  // CLICK OUTSIDE
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!dropdownRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // FETCH NOTIFICATIONS
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

    // 🔁 Run async function
    loadNotifications();

    const interval = setInterval(loadNotifications, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentUser]);

  const { today, yesterday, earlier } = groupNotifications();

  const renderGroup = (title, items) => {
    if (items.length === 0) return null;

    return (
      <div>
        <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase">
          {title}
        </div>

        {items.map((n) => {
          const type = getTypeStyle(n.data?.message);

          return (
            <div
              key={n.id}
              onClick={() => markAsRead(n)}
              className={`flex gap-3 px-4 py-3 cursor-pointer transition hover:bg-gray-100
              ${!n.read_at ? "bg-blue-50/40" : ""}`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center ${type.color}`}
              >
                {type.icon}
              </div>

              <div className="flex-1">
                {n.data?.message && (
                  <p className="text-sm font-medium text-gray-800">
                    {n.data.message}
                  </p>
                )}

                {n.data?.project_title && (
                  <p className="text-sm text-gray-600">
                    Project:{" "}
                    <span className="font-semibold text-gray-800">
                      {n.data.project_title}
                    </span>
                  </p>
                )}

                {n.data?.freelancer_name && (
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <FiUser size={12} />
                    Freelancer: {n.data.freelancer_name}
                  </p>
                )}

                {n.data?.client_name && (
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <FiUser size={12} />
                    Client: {n.data.client_name}
                  </p>
                )}

                <div className="text-[11px] text-gray-400 mt-1">
                  {getRelativeTime(n.created_at)}
                </div>
              </div>

              {!n.read_at && (
                <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* BELL */}
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition"
      >
        <FiBell className="text-gray-700 text-xl" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[11px] font-semibold px-1.5 py-0.5 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* DROPDOWN */}
      <div
        className={`absolute right-0 mt-3 w-[380px] bg-white border border-gray-200 rounded-xl shadow-2xl z-50
        flex flex-col
        transform transition-all duration-200
        ${open ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"}`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-3  flex-shrink-0">
          <span className="font-semibold text-sm text-gray-800">
            Notifications
          </span>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* SCROLL AREA */}
        <div className="max-h-[420px] overflow-y-auto">
          {notifications.length === 0 && (
            <div className="p-6 text-center text-gray-500 text-sm">
              You're all caught up 🎉
            </div>
          )}

          {renderGroup("Today", today)}
          {renderGroup("Yesterday", yesterday)}
          {renderGroup("Earlier", earlier)}
        </div>
      </div>
    </div>
  );
}
