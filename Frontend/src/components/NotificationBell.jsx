import { useState, useEffect, useRef } from "react";
import {
  FiBell,
  FiUser,
  FiBriefcase,
  FiCheckCircle,
  FiMessageCircle,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import useNotifications from "../hooks/useNotifications";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    getRelativeTime,
    groupNotifications,
    freelancerUser,
    clientUser,
  } = useNotifications();

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const isMobile = window.innerWidth < 768;

  // GROUP DATA
  const { today, yesterday, earlier } = groupNotifications();

  // TYPE STYLE (same as your original)
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

  // HANDLE CLICK ON NOTIFICATION
  const handleClick = async (n) => {
    const data = await markAsRead(n);
    setOpen(false);

    // CONTRACT REDIRECT
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
      return;
    }

    // PROJECT REDIRECT
    if (data?.project_slug) {
      navigate(`/projects/${data.project_slug}`);
    }
  };

  // RENDER GROUP
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
              onClick={() => handleClick(n)}
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
        onClick={() => {
          if (isMobile) {
            if (freelancerUser) {
              navigate(`/freelancer/${freelancerUser.username}/notifications`);
            } else if (clientUser) {
              navigate(`/hire-freelancer/${clientUser.username}/notifications`);
            }
          } else {
            setOpen(!open);
          }
        }}
        className="relative flex items-center justify-center"
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
        ${
          open
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        }`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
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

        {/* LIST */}
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

        {/* FOOTER */}
        <div className="p-3 border-t text-center">
          <button
            onClick={() => {
              setOpen(false);
              if (freelancerUser) {
                navigate(
                  `/freelancer/${freelancerUser.username}/notifications`,
                );
              } else if (clientUser) {
                navigate(
                  `/hire-freelancer/${clientUser.username}/notifications`,
                );
              }
            }}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            View All Notifications →
          </button>
        </div>
      </div>
    </div>
  );
}
