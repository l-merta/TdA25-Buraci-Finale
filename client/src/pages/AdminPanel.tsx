import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";

const AdminPanel = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [rooms, setRooms] = useState<{ code: string; userCount: number }[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;

    // Establish socket connection
    const newSocket = io(wsUrl);
    setSocket(newSocket);

    // Listen for the list of rooms
    newSocket.on("roomsList", (data: { code: string; userCount: number }[]) => {
      setRooms(data);
    });

    // Cleanup on component unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  const createRoom = () => {
    if (socket) {
      socket.emit("createRoom"); // Request the server to create a new room
    }
  };

  const deleteRoom = (roomCode: string) => {
    if (socket) {
      socket.emit("deleteRoom", { room: roomCode });
    }
  };

  const goToRoom = (roomCode: string) => {
    navigate(`/mistnost/${roomCode}`);
  };

  return (
    <main>
      <h1>Admin Panel</h1>

      {/* Create Room */}
      <div style={{ marginBottom: "20px" }}>
        <button onClick={createRoom} style={{ padding: "5px 10px" }}>
          Create Room
        </button>
      </div>

      {/* List of Rooms */}
      <div>
        <h2>Rooms</h2>
        <ul>
          {rooms.map((room) => (
            <li key={room.code} style={{ marginBottom: "10px" }}>
              <span>
                <strong>Room Code:</strong> {room.code} | <strong>Users:</strong> {room.userCount}
              </span>
              <button
                onClick={() => goToRoom(room.code)}
                style={{ marginLeft: "10px", padding: "5px 10px" }}
              >
                Go to Room
              </button>
              <button
                onClick={() => deleteRoom(room.code)}
                style={{ marginLeft: "10px", padding: "5px 10px", backgroundColor: "red", color: "white" }}
              >
                Delete Room
              </button>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
};

export default AdminPanel;