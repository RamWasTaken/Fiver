import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useRouter } from "next/router";

const socket = io("https://fiver-21iw.onrender.com", { 
  transports: ["websocket"], 
  withCredentials: true,
  path: "/socket.io/"
});

const MessageContainer = ({ recipientId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    console.log("📡 Connecting to WebSocket...");

    socket.on("connect", () => {
      console.log(`✅ WebSocket connected! ID: ${socket.id}`);
    });

    socket.on("receive_message", (message) => {
      console.log("📩 Message received:", message);
      setMessages((prev) => [...prev, message]);
    });

    socket.on("disconnect", () => {
      console.log("❌ WebSocket disconnected.");
    });

    socket.on("connect_error", (err) => {
      console.error("⚠️ WebSocket connection error:", err);
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);

  const sendMessage = () => {
    if (newMessage.trim()) {
      socket.emit("send_message", { text: newMessage, recipientId });
      console.log("📤 Sending message:", { text: newMessage, recipientId });
      setMessages((prev) => [...prev, { text: newMessage, sender: "You" }]);
      setNewMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white shadow-lg rounded-lg p-4">
      <h2 className="text-lg font-semibold text-center mb-4">Chat with {recipientId}</h2>
      <div className="h-64 overflow-y-auto border p-3 rounded-lg bg-gray-100">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`mb-2 p-2 rounded-md text-sm ${
              msg.sender === "You" ? "bg-green-500 text-white self-end ml-auto" : "bg-gray-200 text-black"
            } max-w-[80%]`}
          >
            <strong>{msg.sender}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <div className="flex items-center mt-3">
        <input 
          type="text" 
          value={newMessage} 
          onChange={(e) => setNewMessage(e.target.value)} 
          onKeyDown={handleKeyPress} 
          placeholder="Type a message..." 
          className="flex-1 border rounded-l-md p-2 focus:outline-none"
        />
        <button 
          onClick={sendMessage} 
          className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default MessageContainer;
