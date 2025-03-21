import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

function Chat() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<{ username: string; message: string }[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  //@ts-ignore
  const [username, setUsername] = useState(() => `User${Math.floor(1000 + Math.random() * 9000)}`);

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || `http://${window.location.hostname}:5200`;

    // Establish socket connection
    const newSocket = io(wsUrl);
    setSocket(newSocket);

    // Listen for incoming chat messages
    newSocket.on("chatMessage", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    // Cleanup on component unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (socket && inputMessage.trim()) {
      socket.emit("chatMessage", { username, message: inputMessage });
      setInputMessage(""); // Clear input field
    }
  };

  return (
    <div>
      <h1>Chatovací aplikace</h1>

      {/* Username Input */}
      {/* <div>
        <label>
          Username:{" "}
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
          />
        </label>
      </div> */}

      {/* Chat Messages */}
      <div style={{ border: "1px solid #ccc", padding: "10px", height: "300px", overflowY: "scroll" }}>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.username}:</strong> {msg.message}
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type a message"
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default Chat;