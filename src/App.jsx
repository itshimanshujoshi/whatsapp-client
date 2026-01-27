import { useEffect, useState, useMemo, useRef } from "react";
import io from "socket.io-client";

const serverUrl = import.meta.env.VITE_SERVER_URL || "localhost:8080";

function App() {
  const { userId, targetUserId } = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      userId: parseInt(params.get("userId")) || 1,
      targetUserId: parseInt(params.get("targetUserId")) || 2,
    };
  }, []);

  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(serverUrl);
    socketRef.current = socket;
    socket.emit("joinChat", { userId, targetUserId });

    socket.on("messageReceived", ({ text, senderId }) => {
      const newMessage = {
        id: Date.now(),
        text: text,
        sender: senderId == userId ? "me" : "other",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId, targetUserId]);

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: "me",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");

    socketRef.current?.emit("sendMessage", {
      userId,
      targetUserId,
      text: inputMessage,
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-3 flex items-center gap-3 border-b border-gray-700">
        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold">
          J
        </div>
        <div>
          <h1 className="text-white font-medium">John Doe</h1>
          <p className="text-gray-400 text-sm">Online</p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${
                message.sender === "me"
                  ? "bg-green-600 text-white rounded-br-none"
                  : "bg-gray-700 text-white rounded-bl-none"
              }`}
            >
              <p>{message.text}</p>
              <p
                className={`text-xs mt-1 ${message.sender === "me" ? "text-green-200" : "text-gray-400"}`}
              >
                {message.time}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <form
        onSubmit={handleSendMessage}
        className="bg-gray-800 px-4 py-3 border-t border-gray-700"
      >
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-full outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400"
          />
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}

export default App;
