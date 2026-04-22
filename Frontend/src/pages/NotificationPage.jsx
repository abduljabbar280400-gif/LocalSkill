import React, { useState, useMemo } from "react";
import {
  FiBell,
  FiUser,
  FiBriefcase,
  FiCheckCircle,
  FiMessageCircle,
  FiTrash2,
  FiCheck,
  FiFilter,
  FiArchive,
  FiInbox,
  FiClock,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useNotifications from "../hooks/useNotifications";

export default function NotificationPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'unread', 'proposals', 'contracts'

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    getRelativeTime,
    freelancerUser,
    clientUser,
  } = useNotifications();

  // Filter notifications based on active tab
  const filteredNotifications = useMemo(() => {
    switch (activeTab) {
      case "unread":
        return notifications.filter((n) => !n.read_at);
      case "proposals":
        return notifications.filter((n) =>
          n.data?.message?.toLowerCase().includes("proposal")
        );
      case "contracts":
        return notifications.filter(
          (n) =>
            n.data?.message?.toLowerCase().includes("submitted") ||
            n.data?.contract_id
        );
      default:
        return notifications;
    }
  }, [notifications, activeTab]);

  const getTypeStyle = (message = "") => {
    const text = message.toLowerCase();

    if (text.includes("proposal"))
      return {
        icon: <FiBriefcase />,
        color: "from-blue-500/20 to-blue-600/20 text-blue-600 dark:text-blue-400",
        bg: "bg-blue-500",
      };

    if (text.includes("submitted") || text.includes("contract"))
      return {
        icon: <FiCheckCircle />,
        color:
          "from-emerald-500/20 to-emerald-600/20 text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-500",
      };

    if (text.includes("message"))
      return {
        icon: <FiMessageCircle />,
        color:
          "from-purple-500/20 to-purple-600/20 text-purple-600 dark:text-purple-400",
        bg: "bg-purple-500",
      };

    return {
      icon: <FiBell />,
      color: "from-slate-500/20 to-slate-600/20 text-slate-600 dark:text-slate-400",
      bg: "bg-slate-500",
    };
  };

  const handleClick = async (n) => {
    const data = await markAsRead(n);

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
      if (freelancerUser) {
        navigate(
          `/freelancer/${freelancerUser.username}/contracts/${data.contract_id}`
        );
      } else if (clientUser) {
        navigate(
          `/hire-freelancer/${clientUser.username}/contracts/${data.contract_id}`
        );
      }
      return;
    }

    if (data?.project_slug) {
      navigate(`/projects/${data.project_slug}`);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-3">
              <FiBell className="text-indigo-600" />
              Notifications
            </h1>
            <p className="text-[var(--text-secondary)] mt-1">
              {unreadCount > 0
                ? `You have ${unreadCount} unread messages`
                : "All caught up! Check back later for updates."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/25 transition-colors text-sm font-medium"
              >
                <FiCheck className="w-4 h-4" />
                Mark all as read
              </motion.button>
            )}
          </div>
        </div>

        {/* TABS / FILTERS */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: "all", label: "All", icon: <FiInbox /> },
            { id: "unread", label: "Unread", icon: <FiClock /> },
            { id: "proposals", label: "Proposals", icon: <FiBriefcase /> },
            { id: "contracts", label: "Contracts", icon: <FiCheckCircle /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] border border-[var(--border-color)]"
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.id === "all" && (
                <span className="ml-1 opacity-60">({notifications.length})</span>
              )}
            </button>
          ))}
        </div>

        {/* NOTIFICATIONS LIST */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          <AnimatePresence mode="popLayout">
            {filteredNotifications.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-20 px-4 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] border-dashed"
              >
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <FiArchive className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--text-primary)]">
                  No notifications found
                </h3>
                <p className="text-[var(--text-secondary)] text-center mt-2 max-w-xs">
                  {activeTab === "all"
                    ? "We'll notify you when something important happens."
                    : `No ${activeTab} notifications at the moment.`}
                </p>
                {activeTab !== "all" && (
                  <button
                    onClick={() => setActiveTab("all")}
                    className="mt-6 text-indigo-600 font-medium hover:underline"
                  >
                    View all notifications
                  </button>
                )}
              </motion.div>
            ) : (
              filteredNotifications.map((n) => {
                const type = getTypeStyle(n.data?.message);
                return (
                  <motion.div
                    key={n.id}
                    variants={itemVariants}
                    layout
                    onClick={() => handleClick(n)}
                    className={`group relative flex gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${
                      !n.read_at
                        ? "bg-indigo-50/50 dark:bg-indigo-500/5 border-indigo-100 dark:border-indigo-500/20"
                        : "bg-[var(--bg-card)] border-[var(--border-color)] hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    {/* ICON */}
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-xl shadow-inner ${type.color}`}
                    >
                      {type.icon}
                    </div>

                    {/* CONTENT */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-sm font-semibold leading-tight ${
                            !n.read_at
                              ? "text-slate-900 dark:text-white"
                              : "text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {n.data?.message}
                        </p>
                        <span className="flex-shrink-0 text-[10px] font-medium text-[var(--text-muted)] bg-[var(--bg-surface)] px-2 py-1 rounded-md uppercase tracking-wider">
                          {getRelativeTime(n.created_at)}
                        </span>
                      </div>

                      {n.data?.project_title && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                          <p className="text-xs text-[var(--text-secondary)] truncate">
                            Project:{" "}
                            <span className="font-medium text-[var(--text-primary)]">
                              {n.data.project_title}
                            </span>
                          </p>
                        </div>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-4">
                        {(n.data?.freelancer_name || n.data?.client_name) && (
                          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] bg-[var(--bg-surface)] px-2 py-1 rounded-lg border border-[var(--border-color)]">
                            <FiUser className="w-3 h-3" />
                            {n.data.freelancer_name || n.data.client_name}
                          </div>
                        )}
                        
                        {!n.read_at && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
                            New Update
                          </span>
                        )}
                      </div>
                    </div>

                    {/* ACTIONS (HOVER ONLY) */}
                    <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      {!n.read_at && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(n);
                          }}
                          title="Mark as read"
                          className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 hover:text-indigo-600 hover:border-indigo-200 shadow-sm transition-all"
                        >
                          <FiCheck className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </motion.div>
      </div>

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

