import { useEffect, useState, useRef } from "react";
import api from "../../src/services/api";
import {
  FiSend,
  FiMessageCircle,
  FiCheck,
  FiClock,
  FiAlertCircle,
  FiArrowDown,
} from "react-icons/fi";

import echo from "../utils/echo";

function ChatBox({ contractId }) {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const [currentUserId] = useState(() => {
    const clientUser = localStorage.getItem("client_user");
    const freelancerUser = localStorage.getItem("freelancer_user");

    if (clientUser) return JSON.parse(clientUser).id;
    if (freelancerUser) return JSON.parse(freelancerUser).id;
    return null;
  });

  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);

  const [isTyping, setIsTyping] = useState(false);

  const [showScrollButton, setShowScrollButton] = useState(false);
  const [newMessageCount, setNewMessageCount] = useState(0);

  const typingTimeoutRef = useRef(null);
  const isNearBottomRef = useRef(true);

  const messagesContainerRef = useRef(null);

  /* ================= SAFE ADD FUNCTION ================= */

  const addMessageSafely = (prev, newMsg) => {
    const newId = Number(newMsg.id);

    const exists = prev.some(
      (msg) => Number(msg.id) === newId && msg.created_at === newMsg.created_at,
    );

    if (exists) return prev;

    return [...prev, { ...newMsg, id: newId }];
  };

  /* ================= LOAD CONVERSATION ================= */

  useEffect(() => {
    const loadConversation = async () => {
      try {
        const res = await api.get(`/contracts/${contractId}/conversation`);
        setConversationId(res.data.id);
      } catch (err) {
        console.error("Conversation load error", err);
      }
    };

    if (contractId) loadConversation();
  }, [contractId]);

  /* ================= LOAD INITIAL MESSAGES ================= */

  useEffect(() => {
    if (!conversationId) return;

    const loadMessages = async () => {
      try {
        const res = await api.get(`/conversations/${conversationId}/messages`);

        let unique = [];

        res.data.forEach((msg) => {
          unique = addMessageSafely(unique, msg);
        });

        setMessages(unique);

        const otherUser = unique.find((msg) => msg.sender_id !== currentUserId);

        if (otherUser && otherUser.sender_last_seen) {
          const lastSeenDate = new Date(otherUser.sender_last_seen + "Z");
          const now = new Date();
          const diff = (now - lastSeenDate) / 1000;

          setIsOnline(diff < 30);
          setLastSeen(lastSeenDate);
        }
      } catch (err) {
        console.error("Message load error", err);
      }
    };

    loadMessages();
  }, [conversationId]);

  /* ================= REALTIME LISTENER ================= */

  useEffect(() => {
    if (!conversationId) return;

    const channel = echo.private(`conversation.${conversationId}`);

    // ✅ MESSAGE LISTENER
    channel.listen(".message.sent", (e) => {
      setMessages((prev) => {
        const updated = prev.map((msg) =>
          msg.client_temp_id === e.client_temp_id
            ? { ...e, is_sending: false, is_delivered: true }
            : msg,
        );

        const exists = updated.some((msg) => msg.id === e.id);
        if (exists) return updated;

        return [...updated, e];
      });

      if (!isNearBottomRef.current) {
        setShowScrollButton(true);
        setNewMessageCount((prev) => prev + 1);
      }
    });

    // ✅ TYPING
    channel.listen(".user.typing", (e) => {
      if (e.user_id === currentUserId) return;

      setIsTyping(true);

      clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 2000);
    });

    // ✅ SEEN
    channel.listen(".message.seen", () => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.sender_id === currentUserId ? { ...msg, is_seen: true } : msg,
        ),
      );
    });

    // ✅ ONLINE
    channel.listen(".user.online", (e) => {
      if (e.user_id === currentUserId) return;
      setIsOnline(e.is_online);
    });

    channel.listen(".message.delivered", () => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.sender_id === currentUserId
            ? { ...msg, is_delivered: true }
            : msg,
        ),
      );
    });

    return () => {
      echo.leave(`conversation.${conversationId}`);
    };
  }, [conversationId]);

  // Deliverd API

  const deliveredOnceRef = useRef(false);

  useEffect(() => {
    if (!conversationId || deliveredOnceRef.current) return;

    api.post(`/conversations/${conversationId}/delivered`);
    deliveredOnceRef.current = true;
  }, [conversationId]);

  /* ================= MARK SEEN ================= */

  const seenTimeoutRef = useRef(null);

  useEffect(() => {
    if (!conversationId) return;

    if (seenTimeoutRef.current) {
      clearTimeout(seenTimeoutRef.current);
    }

    seenTimeoutRef.current = setTimeout(() => {
      api.post(`/conversations/${conversationId}/seen`);
    }, 2000); // wait 2 sec
  }, [messages]);

  /* ================= AUTO SCROLL ================= */

  useEffect(() => {
    if (conversationId && messagesContainerRef.current) {
      const timeout = setTimeout(() => {
        messagesContainerRef.current.scrollTo({
          top: messagesContainerRef.current.scrollHeight,
          behavior: "auto",
        });
      }, 150);

      return () => clearTimeout(timeout);
    }
  }, [conversationId]);

  /* ================= SMART SCROLL ================= */

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    if (isNearBottomRef.current) {
      const timeout = setTimeout(() => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: "smooth",
        });
      }, 100);

      return () => clearTimeout(timeout);
    }
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });

    isNearBottomRef.current = true;

    setShowScrollButton(false);
    setNewMessageCount(0); // ✅ reset count
  };

  /* ================= SEND MESSAGE ================= */

  const sendMessage = async () => {
    if (!message.trim()) return;

    const tempId = Date.now();

    const tempMessage = {
      id: tempId,
      client_temp_id: tempId,
      conversation_id: conversationId,
      sender_id: currentUserId,
      message,
      is_seen: false,
      is_delivered: false,
      is_sending: true,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);
    setMessage("");

    try {
      await api.post(`/conversations/${conversationId}/send`, {
        message,
        client_temp_id: tempId,
      });
    } catch (err) {
      console.log(err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.client_temp_id === tempId ? { ...msg, is_failed: true } : msg,
        ),
      );
    }
  };

  /* ================= LAST SEEN ================= */

  useEffect(() => {
    api.post(`/chat/last-seen`);
  }, []);

  /* ================= ONLINE STATUS ================= */

  useEffect(() => {
    if (!conversationId) return;

    api.post("/chat/online", { conversation_id: conversationId });

    return () => {
      api.post("/chat/offline", { conversation_id: conversationId });
    };
  }, [conversationId]);

  /* ================= FORMAT LAST SEEN ================= */

  const formatLastSeen = (date) => {
    if (!date) return "";

    const now = new Date();
    const diffSeconds = Math.floor((now - date) / 1000);

    if (diffSeconds < 60) return "Online";

    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60)
      return `Last seen ${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24)
      return `Last seen ${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Last seen yesterday";

    return `Last seen ${diffDays} days ago`;
  };

  const lastTypingTime = useRef(0);

  const handleTyping = (e) => {
    setMessage(e.target.value);

    const now = Date.now();

    if (now - lastTypingTime.current > 2000) {
      lastTypingTime.current = now;

      api.post("/chat/typing", {
        conversation_id: conversationId,
      });
    }
  };

  /* ================= UI ================= */

  return (
    <div className="relative mt-6 flex flex-col h-[520px] bg-white rounded-3xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-50 to-white shadow-sm">
        <div className="flex items-center gap-3">
          <FiMessageCircle className="text-blue-500 text-2xl" />
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">
              Contract Chat
            </h3>
            <p
              className={`text-xs ${
                isOnline ? "text-green-500" : "text-gray-400"
              }`}
            >
              {isOnline ? "Online" : formatLastSeen(lastSeen)}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={() => {
          const container = messagesContainerRef.current;
          if (!container) return;

          const isNearBottom =
            container.scrollHeight -
              container.scrollTop -
              container.clientHeight <
            100;

          isNearBottomRef.current = isNearBottom;

          setShowScrollButton(!isNearBottom);

          if (isNearBottom) {
            setNewMessageCount(0);
          }
        }}
        className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-gradient-to-b from-gray-50 to-gray-100"
      >
        {messages.length === 0 && (
          <p className="text-center text-gray-400 text-sm italic mt-10">
            Start conversation...
          </p>
        )}

        {messages.map((msg) => {
          const isMine = msg.sender_id === currentUserId;

          return (
            <div
              key={`${msg.id}-${msg.created_at}`}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`relative max-w-[75%] px-4 py-3 rounded-2xl text-sm shadow-md transition-all
              ${
                isMine
                  ? "bg-blue-500 text-white rounded-br-sm"
                  : "bg-white text-gray-700 rounded-bl-sm"
              }`}
              >
                <p className="break-words leading-relaxed">{msg.message}</p>

                {/* Time + Status */}
                <div
                  className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${
                    isMine ? "text-blue-100" : "text-gray-400"
                  }`}
                >
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}

                  {/* Status Icons */}
                  {isMine && (
                    <>
                      {msg.is_sending && <FiClock />}

                      {msg.is_failed && (
                        <FiAlertCircle className="text-red-400" />
                      )}

                      {!msg.is_sending && !msg.is_failed && (
                        <>
                          <FiCheck className="text-gray-300" />
                          {msg.is_delivered && (
                            <FiCheck className="text-gray-400 -ml-1" />
                          )}
                          {msg.is_seen && (
                            <FiCheck className="text-blue-400 -ml-1" />
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-gray-500 text-sm px-2">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></span>
            </div>
            <span>Typing...</span>
          </div>
        )}
      </div>

      {/* Scroll Button */}
      {showScrollButton && (
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-20">
          <button
            onClick={scrollToBottom}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
          >
            <FiArrowDown />
            {newMessageCount > 0
              ? `${newMessageCount} New Message`
              : "New messages"}
          </button>
        </div>
      )}

      {/* Input */}
      <div className="bg-white px-4 py-3 flex items-center gap-3 shadow-inner">
        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={handleTyping}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          onClick={sendMessage}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition transform hover:scale-105"
        >
          <FiSend size={16} />
        </button>
      </div>
    </div>
  );
}

export default ChatBox;
