import { useEffect, useState, useRef } from "react";
import api from "../services/api";
import echo from "../utils/echo";
import { useAuth } from "../context/useAuth";
import { useClientAuth } from "../context/client/useClientAuth";
import ChatBox from "../components/ChatBox";
import { FiMessageSquare, FiClock, FiChevronLeft, FiSearch } from "react-icons/fi";

function getCurrentUserId() {
  try {
    const c = localStorage.getItem("client_user");
    const f = localStorage.getItem("freelancer_user");
    if (c) return JSON.parse(c).id;
    if (f) return JSON.parse(f).id;
  } catch (_) {}
  return null;
}

function formatSidebarTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr.replace(" ", "T"));
  const now = new Date();
  
  const isToday = d.getDate() === now.getDate() &&
                  d.getMonth() === now.getMonth() &&
                  d.getFullYear() === now.getFullYear();

  if (isToday) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  return d.toLocaleDateString([], { day: '2-digit', month: 'short' });
}

export default function Messages() {
  const { isAuthenticated: freelancerAuthenticated } = useAuth();
  const { isAuthenticated: clientAuthenticated } = useClientAuth();
  
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContractId, setSelectedContractId] = useState(null);
  const [userId, setUserId] = useState(getCurrentUserId());
  const [searchQuery, setSearchQuery] = useState("");

  const sortConversations = (list) => {
    return [...list].sort((a, b) => {
      const timeA = a.last_message?.created_at ? new Date(a.last_message.created_at.replace(" ", "T")).getTime() : 0;
      const timeB = b.last_message?.created_at ? new Date(b.last_message.created_at.replace(" ", "T")).getTime() : 0;
      return timeB - timeA;
    });
  };

  useEffect(() => {
    if (!freelancerAuthenticated && !clientAuthenticated) return;
    setUserId(getCurrentUserId());

    api.get("/conversations")
      .then((res) => {
        setConversations(sortConversations(res.data.data));
      })
      .catch((err) => console.error("Error fetching conversations:", err))
      .finally(() => setLoading(false));
  }, [freelancerAuthenticated, clientAuthenticated]);

  useEffect(() => {
    if (!userId) return;
    const channel = echo.private(`user.${userId}`);
    channel.listen(".conversation.updated", (e) => {
      setConversations((prev) => {
        const index = prev.findIndex((c) => Number(c.id) === Number(e.conversationId));
        if (index === -1) {
          api.get("/conversations").then(res => setConversations(sortConversations(res.data.data)));
          return prev;
        }
        const updatedList = [...prev];
        updatedList[index] = { ...updatedList[index], last_message: e.lastMessage, unread_count: e.unreadCount };
        return sortConversations(updatedList);
      });
    });
    return () => echo.leave(`user.${userId}`);
  }, [userId]);

  const filteredConversations = conversations.filter(c => 
    c.project_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.other_user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!freelancerAuthenticated && !clientAuthenticated) {
    return (
      <div className="flex h-[80vh] items-center justify-center text-gray-500 dark:text-slate-400">
        Please log in to view messages.
      </div>
    );
  }

  const selectedConv = conversations.find(c => c.contract_id === selectedContractId);

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-80px)] sm:h-[calc(100vh-120px)] flex flex-col md:flex-row gap-0 md:gap-6 md:p-6 lg:p-8">
      
      {/* ── Left Sidebar: Conversation List ── */}
      <div className={`w-full md:w-[380px] lg:w-[420px] flex flex-col bg-white dark:bg-slate-900 md:rounded-3xl shadow-xl border-r md:border border-gray-100 dark:border-slate-800 overflow-hidden transition-all duration-300 ${selectedContractId ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Sidebar Header */}
        <div className="p-6 pb-4 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Messages
              {conversations.some(c => c.unread_count > 0) && (
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </h1>
          </div>

          {/* Search Box */}
          <div className="relative group">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 dark:bg-slate-800 border-none rounded-2xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 dark:text-slate-200 transition-all"
            />
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto px-3 pb-6 space-y-1">
          {loading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="p-4 flex gap-3 animate-pulse">
                <div className="w-12 h-12 bg-gray-200 dark:bg-slate-800 rounded-2xl"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded w-2/3"></div>
                </div>
              </div>
            ))
          ) : filteredConversations.length === 0 ? (
            <div className="p-10 text-center text-sm text-gray-500 dark:text-slate-500">
              <FiMessageSquare className="mx-auto mb-3 opacity-20" size={40} />
              <p>{searchQuery ? "No matches found" : "No conversations yet"}</p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isActive = selectedContractId === conv.contract_id;
              const hasUnread = conv.unread_count > 0;
              const initials = conv.other_user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

              return (
                <button
                  key={conv.id}
                  onClick={() => {
                    setSelectedContractId(conv.contract_id);
                    setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unread_count: 0 } : c));
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 group ${
                    isActive 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                      : "hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300"
                  }`}
                >
                  {/* Avatar */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 shadow-sm transition-transform group-active:scale-95 ${
                    isActive ? "bg-white/20" : "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 text-blue-600 dark:text-blue-400"
                  }`}>
                    {initials}
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3 className={`font-semibold text-sm truncate ${isActive ? "text-white" : "text-gray-900 dark:text-slate-100"}`}>
                        {conv.other_user.name}
                      </h3>
                      <span className={`text-[10px] shrink-0 ${isActive ? "text-blue-100" : "text-gray-400"}`}>
                        {formatSidebarTime(conv.last_message?.created_at)}
                      </span>
                    </div>
                    <p className={`text-xs truncate font-medium mb-1 ${isActive ? "text-blue-100" : "text-blue-600 dark:text-blue-400"}`}>
                      {conv.project_title}
                    </p>
                    <p className={`text-xs truncate ${isActive ? "text-blue-50/80" : "text-gray-500 dark:text-slate-400"}`}>
                      {conv.last_message ? conv.last_message.message : "Start chatting..."}
                    </p>
                  </div>

                  {/* Badge */}
                  {hasUnread && !isActive && (
                    <span className="w-5 h-5 bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center rounded-lg shadow-lg shadow-blue-500/30">
                      {conv.unread_count}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Right Area: ChatBox ── */}
      <div className={`flex-1 bg-white dark:bg-slate-900 md:rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden relative transition-all duration-300 ${!selectedContractId ? 'hidden md:flex' : 'flex flex-col'}`}>
        
        {selectedContractId ? (
          <div className="w-full h-full flex flex-col" key={selectedContractId}>
            {/* Mobile Header (Hidden on Desktop) */}
            <div className="md:hidden flex items-center gap-3 p-4 border-b border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
              <button 
                onClick={() => setSelectedContractId(null)}
                className="p-2 -ml-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <FiChevronLeft size={24} />
              </button>
              <div className="flex-1 min-w-0 text-left">
                <h2 className="font-bold text-gray-900 dark:text-white truncate">
                  {selectedConv?.other_user.name}
                </h2>
                <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium truncate uppercase tracking-wider">
                  {selectedConv?.project_title}
                </p>
              </div>
            </div>
            
            {/* Chat Content */}
            <div className="flex-1 relative overflow-hidden">
              <ChatBox contractId={selectedContractId} currentUserId={userId} />
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-10 bg-gray-50/30 dark:bg-slate-900/30">
            <div className="w-24 h-24 bg-blue-50 dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center text-blue-500 mb-6 shadow-inner">
              <FiMessageSquare size={40} className="opacity-40" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Your Conversations</h2>
            <p className="text-gray-500 dark:text-slate-400 max-w-xs text-sm leading-relaxed">
              Select a chat from the sidebar to view messages and project details.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
