import { useEffect, useState, useRef, useCallback } from "react";
import api from "../services/api";
import echo from "../utils/echo";
import {
  FiSend,
  FiMessageCircle,
  FiCheck,
  FiClock,
  FiAlertCircle,
  FiArrowDown,
} from "react-icons/fi";
import { BsCheckAll } from "react-icons/bs";

/* ─────────────────────────────────────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────────────────────────────────── */
function getCurrentUserId() {
  try {
    const c = localStorage.getItem("client_user");
    const f = localStorage.getItem("freelancer_user");
    if (c) return JSON.parse(c).id;
    if (f) return JSON.parse(f).id;
  } catch (_) {}
  return null;
}

function formatTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr.replace(" ", "T"));
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function StatusIcon({ msg }) {
  if (msg.is_sending) return <FiClock className="text-white/50" size={12} title="Sending…" />;
  if (msg.is_failed)  return <FiAlertCircle className="text-red-300" size={12} title="Failed" />;
  if (msg.is_seen)    return <BsCheckAll className="text-red-300" size={14} title="Seen" />;
  if (msg.is_delivered) return <BsCheckAll className="text-white/60" size={14} title="Delivered" />;
  return <FiCheck className="text-white/50" size={12} title="Sent" />;
}


/* ─────────────────────────────────────────────────────────────────────────────
   ChatBox Component (Production-Ready WebSockets & Pagination)
   ───────────────────────────────────────────────────────────────────────── */
export default function ChatBox({ contractId, currentUserId: propUserId }) {
  const currentUserId = propUserId || getCurrentUserId();

  // States
  const [conversationId, setConversationId] = useState(null);
  const [otherUserId,    setOtherUserId   ] = useState(null);
  const [chatName,       setChatName      ] = useState("Contract Chat");
  const [messages,       setMessages      ] = useState([]);
  const [inputText,      setInputText     ] = useState("");
  const [isOnline,       setIsOnline      ] = useState(null); 
  const [showScrollBtn,  setShowScrollBtn ] = useState(false);
  const [loadingMore,    setLoadingMore   ] = useState(false);
  const [hasMore,        setHasMore       ] = useState(true);

  // Refs
  const containerRef      = useRef(null);
  const isNearBottom      = useRef(true);
  const seenTimer         = useRef(null);
  const previousScrollHeight = useRef(0);

  /* ── 1. Fetch Initial Data ── */
  useEffect(() => {
    if (!contractId) return;

    api.get(`/contracts/${contractId}/conversation`)
      .then((res) => {
        const convId = res.data.id;
        setConversationId(convId);
        if (res.data.other_user) {
          setOtherUserId(res.data.other_user.id);
          setChatName(res.data.other_user.full_name || "Contract Chat");
          setIsOnline(!!res.data.other_user.is_online);
        }

        // Fetch initial last 8 messages
        api.get(`/conversations/${convId}/messages?limit=8`)
          .then((msgRes) => {
            setMessages(msgRes.data);
            setHasMore(msgRes.data.length === 8);
          })
          .catch(() => {});
      })
      .catch(() => {});
  }, [contractId]);

  /* ── 2. Pagination (Load More) ── */
  const loadMoreMessages = useCallback(async () => {
    if (loadingMore || !hasMore || !conversationId || messages.length === 0) return;

    setLoadingMore(true);
    const oldestId = messages[0].id;
    previousScrollHeight.current = containerRef.current?.scrollHeight || 0;

    try {
      const res = await api.get(`/conversations/${conversationId}/messages?limit=8&before_id=${oldestId}`);
      const newMsgs = res.data;
      
      if (newMsgs.length > 0) {
        setMessages(prev => [...newMsgs, ...prev]);
        setHasMore(newMsgs.length === 8);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Failed to load more messages", err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, conversationId, messages]);

  // Adjust scroll after loading more messages to prevent jumping
  useEffect(() => {
    if (loadingMore === false && previousScrollHeight.current > 0 && containerRef.current) {
      const newHeight = containerRef.current.scrollHeight;
      const diff = newHeight - previousScrollHeight.current;
      containerRef.current.scrollTop = diff;
      previousScrollHeight.current = 0;
    }
  }, [loadingMore]);

  /* ── 3. Heartbeat System (60 Seconds) ── */
  useEffect(() => {
    const sendPing = () => api.post("/user/heartbeat").catch(() => {});
    sendPing();
    const interval = setInterval(sendPing, 60000);
    return () => clearInterval(interval);
  }, []);

  /* ── 4. Real-Time WebSockets (Echo) ── */
  useEffect(() => {
    if (!conversationId) return;

    const channel = echo.private(`conversation.${conversationId}`);

    channel
      .listen(".message.sent", (e) => {
        const newMsg = { ...e.message, id: Number(e.message.id) };
        setMessages(prev => {
          const alreadyExists = prev.find(m => 
            m.id === newMsg.id || 
            (m.is_sending && m.message === newMsg.message && Number(m.sender_id) === Number(newMsg.sender_id))
          );

          if (alreadyExists) {
            return prev.map(m => (m.id === alreadyExists.id) ? newMsg : m);
          }
          return [...prev, newMsg];
        });
        
        if (Number(newMsg.sender_id) !== Number(currentUserId)) {
          api.post(`/conversations/${conversationId}/delivered`).catch(() => {});
        }
      })
      .listen(".message.delivered", (e) => {
        setMessages(prev => prev.map(m => Number(m.sender_id) === Number(currentUserId) ? { ...m, is_delivered: true } : m));
      })
      .listen(".message.seen", (e) => {
        setMessages(prev => prev.map(m => Number(m.sender_id) === Number(currentUserId) ? { ...m, is_seen: true, is_delivered: true } : m));
      });

    return () => {
      if (conversationId) echo.leave(`conversation.${conversationId}`);
    };
  }, [conversationId, currentUserId]);

  useEffect(() => {
    if (!otherUserId) return;

    // Reset subscription to pick up new authorization rules
    const channel = echo.private(`user.${otherUserId}`);
    
    channel.listen(".user.status", (e) => {
      setIsOnline(e.isOnline);
    });

    return () => echo.leave(`user.${otherUserId}`);
  }, [otherUserId]);

  /* ── 5. Seen Status Trigger ── */
  useEffect(() => {
    if (!conversationId || messages.length === 0) return;

    const markAsSeen = () => {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.sender_id !== currentUserId && !lastMsg.is_seen && document.visibilityState === "visible") {
        if (seenTimer.current) clearTimeout(seenTimer.current);
        seenTimer.current = setTimeout(() => {
          api.post(`/conversations/${conversationId}/seen`).catch(() => {});
        }, 2000); // 2 seconds of active visibility
      }
    };

    markAsSeen();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        markAsSeen();
      } else {
        if (seenTimer.current) clearTimeout(seenTimer.current);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      if (seenTimer.current) clearTimeout(seenTimer.current);
    };
  }, [messages, conversationId, currentUserId]);


  /* ── 6. Scrolling ── */
  useEffect(() => {
    if (!containerRef.current || !isNearBottom.current || loadingMore) return;
    containerRef.current.scrollTo({ top: containerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loadingMore]);

  /* ── Handlers ── */
  const handleScroll = (e) => {
    const el = e.target;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    isNearBottom.current = nearBottom;
    setShowScrollBtn(!nearBottom);

    // Load more when reaching top
    if (el.scrollTop === 0 && hasMore && !loadingMore) {
      loadMoreMessages();
    }
  };

  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text || !conversationId) return;

    const optimisticId = Date.now();
    const optimistic = {
      id: optimisticId,
      sender_id: currentUserId,
      message: text,
      is_sending: true,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, optimistic]);
    setInputText("");

    try {
      const res = await api.post(`/conversations/${conversationId}/send`, { message: text });
      const realMsg = { ...res.data.data, id: Number(res.data.data.id) };
      setMessages(prev => prev.map(m => m.id === optimisticId ? realMsg : m));
    } catch {
      setMessages(prev => prev.map(m => m.id === optimisticId ? { ...m, is_sending: false, is_failed: true } : m));
    }
  };

  const statusString = isOnline === true ? "online" : isOnline === false ? "offline" : "checking status...";

  return (
    <div className="relative flex flex-col h-full w-full bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-700">
      
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <FiMessageCircle size={20} />
          </div>
          <span
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-blue-600 transition-all duration-300 ${
              isOnline === true ? "bg-green-400 shadow-[0_0_8px_#4ade80]" : 
              isOnline === false ? "bg-red-500 shadow-[0_0_8px_#ef4444]" : "bg-gray-500 animate-pulse"
            }`}
          />
        </div>
        <div className="text-left">
          <h3 className="font-semibold text-base leading-tight">{chatName}</h3>
          <p className={`text-xs font-medium leading-tight transition-colors duration-300 ${
            isOnline === true ? "text-green-300" : isOnline === false ? "text-red-200" : "text-blue-100/70"
          }`}>
            {statusString}
          </p>
        </div>
      </div>

      {/* Message List */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-gradient-to-b from-slate-50 to-gray-100 dark:from-slate-900 dark:to-slate-800"
      >
        {loadingMore && (
          <div className="text-center py-2">
            <div className="inline-block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] text-gray-400 mt-1">Loading older messages...</p>
          </div>
        )}

        {messages.map((msg) => {
          const isMine = Number(msg.sender_id) === Number(currentUserId);
          return (
            <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow-sm ${
                isMine ? "bg-blue-600 text-white rounded-br-none" : "bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-200 rounded-bl-none border border-gray-100 dark:border-slate-600"
              }`}>
                <p className="break-words whitespace-pre-wrap">{msg.message}</p>
                <div className={`flex items-center gap-1 mt-1 text-[10px] ${isMine ? "justify-end text-blue-100" : "text-gray-400"}`}>
                  <time>{formatTime(msg.created_at)}</time>
                  {isMine && <StatusIcon msg={msg} />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollBtn && (
        <button
          onClick={() => containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: "smooth" })}
          className="absolute bottom-24 right-6 bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 p-2 rounded-full shadow-lg border border-gray-100 dark:border-slate-600 hover:scale-110 transition-transform animate-bounce"
        >
          <FiArrowDown size={20} />
        </button>
      )}

      {/* Input Area */}
      <div className="px-4 py-4 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700">
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-900 px-4 py-2 rounded-2xl border border-gray-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-1 resize-none max-h-32 dark:text-slate-200"
            rows={1}
          />
          <button
            onClick={sendMessage}
            disabled={!inputText.trim()}
            className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:bg-gray-400 transition-all active:scale-95"
          >
            <FiSend size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
