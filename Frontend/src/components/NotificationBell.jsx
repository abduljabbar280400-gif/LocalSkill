import { useState, useEffect, useRef } from "react";
import {
  FiBell,
  FiUser,
  FiBriefcase,
  FiCheckCircle,
  FiMessageCircle,
  FiCheck,
  FiClock,
  FiArrowRight,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useNotifications from "../hooks/useNotifications";

export default function NotificationBell({ className }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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

  const isMobile = window.innerWidth < 768;
  const { today, yesterday, earlier } = groupNotifications();

  const getTypeStyle = (message = "") => {
    const text = message.toLowerCase();

    if (text.includes("proposal"))
      return {
        icon: <FiBriefcase />,
        color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10",
      };

    if (text.includes("submitted") || text.includes("contract"))
      return {
        icon: <FiCheckCircle />,
        color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10",
      };

    if (text.includes("message"))
      return {
        icon: <FiMessageCircle />,
        color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10",
      };

    return {
      icon: <FiBell />,
      color: "text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-500/10",
    };
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!dropdownRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClick = async (n) => {
    const data = await markAsRead(n);
    setOpen(false);

    // ✅ CLIENT SIDE: Proposal received -> Open View Proposals popup
    if (clientUser && data?.project_id && n.data?.message?.toLowerCase().includes("proposal")) {
      navigate(
        `/hire-freelancer/${clientUser.username}/projects?view_proposals=${data.project_id}`
      );
      return;
    }

    // ✅ FREELANCER SIDE: Proposal accepted -> Open Preview Contract popup
    if (freelancerUser && data?.contract_id && (n.data?.message?.toLowerCase().includes("accepted") || n.data?.message?.toLowerCase().includes("contract"))) {
      navigate(
        `/freelancer/${freelancerUser.username}/my-projects?preview_contract=${data.contract_id}`
      );
      return;
    }

    if (data?.contract_id) {
      const path = freelancerUser 
        ? `/freelancer/${freelancerUser.username}/contracts/${data.contract_id}`
        : `/hire-freelancer/${clientUser.username}/contracts/${data.contract_id}`;
      navigate(path);
      return;
    }

    if (data?.project_slug) {
      navigate(`/projects/${data.project_slug}`);
    }
  };

  const renderGroup = (title, items) => {
    if (items.length === 0) return null;

    return (
      <div className="py-2">
        <div className="px-4 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
          {title}
        </div>

        {items.map((n) => {
          const type = getTypeStyle(n.data?.message);
          return (
            <div
              key={n.id}
              onClick={() => handleClick(n)}
              className={`flex gap-3 px-4 py-3 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-700/50 relative group ${
                !n.read_at ? "bg-indigo-50/30 dark:bg-indigo-500/5" : ""
              }`}
            >
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg ${type.color}`}
              >
                {type.icon}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-snug truncate ${!n.read_at ? "font-semibold text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-300"}`}>
                  {n.data?.message}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <FiClock className="w-3 h-3 text-slate-400" />
                  <span className="text-[11px] text-slate-400">
                    {getRelativeTime(n.created_at)}
                  </span>
                </div>
              </div>

              {!n.read_at && (
                <div className="flex-shrink-0 flex flex-col items-center justify-center">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          if (isMobile) {
            const path = freelancerUser
              ? `/freelancer/${freelancerUser.username}/notifications`
              : `/hire-freelancer/${clientUser.username}/notifications`;
            navigate(path);
          } else {
            setOpen(!open);
          }
        }}
        className={`${className || ""} relative flex items-center justify-center transition-all duration-300 ${
          open 
            ? "text-blue-600 dark:text-blue-400 shadow-[inset_3px_3px_6px_#d1d5db,inset_-3px_-3px_6px_#ffffff] dark:shadow-[inset_3px_3px_6px_#1e293b,inset_-3px_-3px_6px_#334155]" 
            : "text-slate-600 dark:text-slate-300"
        }`}
      >
        <FiBell size={18} aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-[9px] font-bold items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-3 w-[360px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-[100] overflow-hidden"
          >
            {/* HEADER */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50">
              <span className="font-bold text-sm text-slate-800 dark:text-white">
                Notifications
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    markAllAsRead();
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold flex items-center gap-1 transition-colors"
                >
                  <FiCheck className="w-3 h-3" />
                  Mark all as read
                </button>
              )}
            </div>

            {/* LIST */}
            <div className="max-h-[380px] overflow-y-auto scrollbar-hide">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
                    <FiBell className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">All caught up!</p>
                  <p className="text-xs text-slate-500 mt-1">No new notifications at the moment.</p>
                </div>
              ) : (
                <>
                  {renderGroup("Today", today)}
                  {renderGroup("Yesterday", yesterday)}
                  {renderGroup("Earlier", earlier)}
                </>
              )}
            </div>

            {/* FOOTER */}
            <div className="p-3 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700/50">
              <button
                onClick={() => {
                  setOpen(false);
                  const path = freelancerUser
                    ? `/freelancer/${freelancerUser.username}/notifications`
                    : `/hire-freelancer/${clientUser.username}/notifications`;
                  navigate(path);
                }}
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 transition-all shadow-sm"
              >
                View all notifications
                <FiArrowRight className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}

