import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FiSend, FiMessageCircle } from "react-icons/fi";

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

  const messagesContainerRef = useRef(null);

  const token =
    localStorage.getItem("client_token") ||
    localStorage.getItem("freelancer_token");

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };

  /* ================= LOAD CONVERSATION ================= */

  useEffect(() => {
    const loadConversation = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/contracts/${contractId}/conversation`,
          { headers },
        );
        setConversationId(res.data.id);
      } catch (err) {
        console.error("Conversation load error", err);
      }
    };

    if (contractId) loadConversation();
  }, [contractId]);

  /* ================= LOAD MESSAGES ================= */

  useEffect(() => {
    if (!conversationId) return;

    const loadMessages = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/conversations/${conversationId}/messages`,
          { headers },
        );

        setMessages(res.data);

        const otherUser = res.data.find(
          (msg) => msg.sender_id !== currentUserId,
        );

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
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [conversationId]);

  /* ================= AUTO SCROLL WHEN CHAT OPENS ================= */

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

  /* ================= SMART AUTO SCROLL FOR NEW MESSAGES ================= */

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      100;

    if (isNearBottom) {
      const timeout = setTimeout(() => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: "smooth",
        });
      }, 100);

      return () => clearTimeout(timeout);
    }
  }, [messages]);

  /* ================= SEND MESSAGE ================= */

  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      await axios.post(
        `http://localhost:8000/api/conversations/${conversationId}/send`,
        { message },
        { headers },
      );

      setMessage("");

      const res = await axios.get(
        `http://localhost:8000/api/conversations/${conversationId}/messages`,
        { headers },
      );

      setMessages(res.data);
    } catch (err) {
      console.error("Send message error", err);
    }
  };

  /* ================= LAST SEEN UPDATE ================= */

  useEffect(() => {
    const updateLastSeen = async () => {
      try {
        await axios.post(
          "http://localhost:8000/api/chat/last-seen",
          {},
          { headers },
        );
      } catch (err) {
        console.error("Last seen update error", err);
      }
    };

    updateLastSeen();
    const interval = setInterval(updateLastSeen, 10000);
    return () => clearInterval(interval);
  }, []);

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

  /* ================= UI ================= */

  return (
    <div className="mt-6 flex flex-col h-[520px] bg-white rounded-2xl shadow-xl border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white rounded-t-2xl">
        <div className="flex items-center gap-3">
          <FiMessageCircle className="text-blue-300 text-2xl" />
          <div>
            <h3 className="font-semibold text-gray-700 text-lg">
              Contract Chat
            </h3>
            <p
              className={`text-xs font-medium ${
                isOnline ? "text-green-600" : "text-gray-500"
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
        className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-gray-50 to-gray-100"
      >
        {messages.length === 0 && (
          <p className="text-center text-gray-400 text-sm italic">
            Start discussing your project
          </p>
        )}

        {messages.map((msg) => {
          const isMine = msg.sender_id === currentUserId;

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-3 ${
                isMine ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] px-5 py-3 rounded-3xl text-sm shadow-md 
                ${
                  isMine
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none"
                    : "bg-white text-gray-600 border border-gray-200 rounded-bl-none"
                }`}
              >
                <p className="wrap-break-word">{msg.message}</p>

                <div
                  className={`text-[10px] mt-1 ${
                    isMine ? "text-blue-100" : "text-gray-400"
                  }`}
                >
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4 flex gap-3 bg-white rounded-b-2xl">
        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={sendMessage}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition transform hover:scale-105 shadow-lg"
        >
          <FiSend size={18} />
        </button>
      </div>
    </div>
  );
}

export default ChatBox;
