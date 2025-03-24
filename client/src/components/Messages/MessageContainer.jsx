import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useRouter } from "next/router";

const socket = io("https://your-backend.onrender.com", { 
  transports: ["websocket"], 
  withCredentials: true 
});

const MessageContainer = ({ recipientId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    socket.on("receive_message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);

  const sendMessage = () => {
    if (newMessage.trim()) {
      socket.emit("send_message", { text: newMessage, recipientId });
      setMessages((prev) => [...prev, { text: newMessage, sender: "You" }]);
      setNewMessage("");
    }
  };

  return (
    <div>
      <h2>Live Chat with {recipientId}</h2>
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
