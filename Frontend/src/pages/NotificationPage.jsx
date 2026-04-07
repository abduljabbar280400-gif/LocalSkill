import {
  FiBell,
  FiUser,
  FiBriefcase,
  FiCheckCircle,
  FiMessageCircle,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import useNotifications from "../hooks/useNotifications";

export default function NotificationPage() {
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

  const { today, yesterday, earlier } = groupNotifications();

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

  const handleClick = async (n) => {
    const data = await markAsRead(n);

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

    if (data?.project_slug) {
      navigate(`/projects/${data.project_slug}`);
    }
  };

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
              className={`flex gap-3 px-4 py-4 border-b cursor-pointer hover:bg-gray-50 transition ${
                !n.read_at ? "bg-blue-50/40" : ""
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${type.color}`}
              >
                {type.icon}
              </div>

              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                  {n.data?.message}
                </p>

                {n.data?.project_title && (
                  <p className="text-sm text-gray-600">
                    Project:{" "}
                    <span className="font-semibold">
                      {n.data.project_title}
                    </span>
                  </p>
                )}

                {n.data?.freelancer_name && (
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <FiUser size={12} /> {n.data.freelancer_name}
                  </p>
                )}

                {n.data?.client_name && (
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <FiUser size={12} /> {n.data.client_name}
                  </p>
                )}

                <div className="text-xs text-gray-400 mt-1">
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
    <div className="max-w-5xl mx-auto border border-gray-200 p-8 m-5 overflow-y-auto bg-white rounded-xl shadow-2xl transform transition-all duration-300 scale-100 animate-[fadeIn_.25s_ease]">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b pb-4 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-indigo-600 font-medium"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* LIST */}
      <div className="max-w-2xl mx-auto bg-white mt-3 rounded-xl shadow">
        {notifications.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            You're all caught up 🎉
          </div>
        )}

        {renderGroup("Today", today)}
        {renderGroup("Yesterday", yesterday)}
        {renderGroup("Earlier", earlier)}
      </div>
    </div>
  );
}
