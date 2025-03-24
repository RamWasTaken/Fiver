import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

// Connect to backend with WebSocket
const socket = io("https://your-backend.onrender.com", { 
  transports: ["websocket"], 
  withCredentials: true, 
  reconnection: true,        // Enable auto-reconnection
  reconnectionAttempts: 5,   // Try reconnecting 5 times before failing
  reconnectionDelay: 3000,   // Wait 3 sec before reconnecting
});

const MessageContainer = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    // ✅ Listen for new messages
    socket.on("receive_message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    // ✅ Connection status
    socket.on("connect", () => {
      console.log("✅ Connected to WebSocket server:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.warn("❌ Disconnected from WebSocket:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("⚠️ Connection Error:", error.message);
    });

    // ✅ Cleanup event listeners on unmount
    return () => {
      socket.off("receive_message");
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
    };
  }, []);

  // ✅ Send message to backend
  const sendMessage = () => {
    if (newMessage.trim()) {
      socket.emit("send_message", newMessage);
      setMessages((prev) => [...prev, { text: newMessage, sender: "You" }]);
      setNewMessage("");
    }
  };

  return (
    <div>
      <h2>Live Chat</h2>
      <div>
        {messages.map((msg, index) => (
          <p key={index}><strong>{msg.sender}:</strong> {msg.text}</p>
        ))}
      </div>
      <input 
        type="text" 
        value={newMessage} 
        onChange={(e) => setNewMessage(e.target.value)} 
        placeholder="Type a message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default MessageContainer;
