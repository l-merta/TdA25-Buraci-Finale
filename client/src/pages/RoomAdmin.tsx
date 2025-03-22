import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";

import RoomCode from "./../sections/RoomCode";
import Error from "./Error"; // Import the Error component

const RoomAdmin = () => {
  const { code } = useParams<{ code?: string }>(); // Get :code from the URL
  const [socket, setSocket] = useState<Socket | null>(null);
  const [users, setUsers] = useState<{ username: string; role: string }[]>([]); // List of users in the room
  const [roomStarted, setRoomStarted] = useState(false); // Room started status
  const [error, setError] = useState<{ code: number; message: string } | null>(null); // Error state

  useEffect(() => {
    if (!code) return; // If no room code, do nothing

    const wsUrl = import.meta.env.VITE_WS_URL || `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;

    // Establish socket connection
    const newSocket = io(wsUrl);
    setSocket(newSocket);

    // Join the room as admin
    newSocket.emit("joinRoomAsAdmin", { room: code });

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

  const startRoom = () => {
    if (socket) {
      socket.emit("startRoom", { room: code });
    }
  };

  if (error) {
    // If an error occurred, display the Error component
    return <Error code={error.code} message={error.message} />;
  }

  if (!code) {
    <main>
      <h1>Zadej kód místnosti jako admin</h1>
      <RoomCode />
    </main>
  }

  if (!roomStarted) { return (
    <main>
      <h1>Admin Room: {code}</h1>
      <button onClick={startRoom} style={{ padding: "10px 20px", marginBottom: "20px" }}>
        Start Room
      </button>
      <div>
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
  );}
  else {
    // If the room has started, display a message
    return (
      <main>
        <h1>Místnost započala</h1>
      </main>
    );
  }
};

export default RoomAdmin;