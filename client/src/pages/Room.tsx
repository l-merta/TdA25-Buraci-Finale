import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import RoomCode from "./../sections/RoomCode";

const Room = () => {
  const { code } = useParams<{ code?: string }>(); // Get :code from the URL
  const [socket, setSocket] = useState<Socket | null>(null);
  const [username, setUsername] = useState(""); // User's name
  const [users, setUsers] = useState<string[]>([]); // List of users in the room

  useEffect(() => {
    if (!code) return; // If no room code, do nothing

    const wsUrl = import.meta.env.VITE_WS_URL || `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;

    // Establish socket connection
    const newSocket = io(wsUrl);
    setSocket(newSocket);

    // Join the room
    newSocket.emit("joinRoom", { room: code });

    // Listen for the updated users list
    newSocket.on("roomUsers", (data: { users: string[] }) => {
      setUsers(data.users);
    });

    // Cleanup on component unmount
    return () => {
      newSocket.disconnect();
    };
  }, [code]);

  const handleSetUsername = () => {
    if (socket && username.trim()) {
      // Send the username to the server
      socket.emit("setUsername", { room: code, username });
    }
  };

  if (!code) {
    // If no code is present, display the RoomCode component
    return (
      <main>
        <h1>Zadej kód místnosti</h1>
        <RoomCode />
      </main>
    );
  }

  return (
    <main>
      <h1>Room: {code}</h1>
      <div>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your name"
          style={{ marginRight: "10px", padding: "5px" }}
        />
        <button onClick={handleSetUsername} style={{ padding: "5px 10px" }}>
          Join Room
        </button>
      </div>
      <div style={{ marginTop: "20px" }}>
        <h2>Users in Room:</h2>
        <ul>
          {users.map((user, index) => (
            <li key={index}>{user}</li>
          ))}
        </ul>
      </div>
    </main>
  );
};

export default Room;