import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";

import RoomCode from "./../sections/RoomCode";
import Error from "./Error"; // Import the Error component

const Room = () => {
  const { code } = useParams<{ code?: string }>(); // Get :code from the URL
  const [socket, setSocket] = useState<Socket | null>(null);
  const [username, setUsername] = useState(""); // User's name
  //@ts-ignore
  const [role, setRole] = useState("spectator"); // User's role (default: spectator)
  const [users, setUsers] = useState<{ username: string; role: string }[]>([]); // List of users in the room
  const [roomStarted, setRoomStarted] = useState(false); // Room started status
  const [error, setError] = useState<{ code: number; message: string } | null>(null); // Error state

  useEffect(() => {
    if (!code) return; // If no room code, do nothing

    const wsUrl = import.meta.env.VITE_WS_URL || `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;

    // Establish socket connection
    const newSocket = io(wsUrl);
    setSocket(newSocket);

    // Join the room
    newSocket.emit("joinRoom", { room: code });

    // Listen for the updated users list
    newSocket.on("roomUsers", (data: { users: { username: string; role: string }[] }) => {
      setUsers(data.users);
    });

    // Listen for room status updates
    newSocket.on("roomStatus", (data: { roomStarted: boolean }) => {
      setRoomStarted(data.roomStarted);
    });

    // Listen for errors
    newSocket.on("error", (data: { code: number; message: string }) => {
      setError(data); // Set the error state
    });

    // Cleanup on component unmount
    return () => {
      newSocket.disconnect();
    };
  }, [code]);

  const updateUser = (newRole: string) => {
    if (socket) {
      setRole(newRole); // Update role locally
      // Send the updated username and role to the server
      socket.emit("updateUser", { room: code, username, role: newRole });
    }
  };

  if (error) {
    // If an error occurred, display the Error component
    return <Error code={error.code} message={error.message} />;
  }

  if (!code) {
    // If no code is present, display the RoomCode component
    return (
      <main>
        <h1>Zadej kód místnosti</h1>
        <RoomCode />
      </main>
    );
  }

  if (roomStarted) {
    // If the room has started, display a message
    return (
      <main>
        <h1>Room: {code}</h1>
        <p>The room has started!</p>
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
        <button onClick={() => updateUser("spectator")} style={{ marginRight: "10px", padding: "5px 10px" }}>
          Spectator
        </button>
        <button onClick={() => updateUser("presenter")} style={{ padding: "5px 10px" }}>
          Presenter
        </button>
      </div>
      <div style={{ marginTop: "20px" }}>
        <h2>Users in Room:</h2>
        <ul>
          {users.map((user, index) => (
            <li key={index}>
              {user.username} - {user.role}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
};

export default Room;