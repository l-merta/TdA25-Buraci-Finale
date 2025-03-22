import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";

import RoomCode from "./../sections/RoomCode";
import Error from "./Error"; // Import the Error component

const Room = () => {
  const { code } = useParams<{ code?: string }>(); // Get :code from the URL
  const [socket, setSocket] = useState<Socket | null>(null);
  const [username, setUsername] = useState(""); // User's name
  const [role, setRole] = useState("spectator"); // User's role (default: spectator)
  const [id, setId] = useState<string | null>(null); // User's unique id
  const [users, setUsers] = useState<{ id: string; username: string; role: string }[]>([]); // List of users in the room
  const [roomStarted, setRoomStarted] = useState(false); // Room started status
  const [currentPresenter, setCurrentPresenter] = useState<{ id: string; username: string } | null>(null); // Current presenter
  const [presenterReady, setPresenterReady] = useState(false); // Ready status of the current presenter
  const [presentersDone, setPresentersDone] = useState(false); // All presenters are done
  const [error, setError] = useState<{ code: number; message: string } | null>(null); // Error state

  useEffect(() => {
    if (!code) return; // If no room code, do nothing

    const wsUrl = import.meta.env.VITE_WS_URL || `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;

    // Establish socket connection
    const newSocket = io(wsUrl);
    setSocket(newSocket);

    // Join the room
    newSocket.emit("joinRoom", { room: code });

    // Listen for the user's id
    newSocket.on("userId", (data: { id: string }) => {
      setId(data.id);
    });

    // Listen for the updated users list
    newSocket.on("roomUsers", (data: { users: { id: string; username: string; role: string }[] }) => {
      setUsers(data.users);
    });

    // Listen for room status updates
    newSocket.on("roomStatus", (data: { roomStarted: boolean }) => {
      setRoomStarted(data.roomStarted);
    });

    // Listen for the current presenter and their ready status
    newSocket.on("currentPresenter", (data: { presenter: { id: string; username: string }; presenterReady: boolean }) => {
      setCurrentPresenter(data.presenter);
      setPresenterReady(data.presenterReady);
    });

    newSocket.on("allPresentersDone", () => {
      setPresentersDone(true);
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

  const markReady = () => {
    if (socket) {
      socket.emit("presenterReady", { room: code });
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

  if (presentersDone) {
    return (
      <main>
        <h1>Prezentace ukončeny</h1>
      </main>
    );
  }

  if (roomStarted) {
    // If the room has started, display the current presenter and their ready status
    return (
      <main>
        <h1>Room: {code}</h1>
        {currentPresenter ? (
          <div>
            <p>Currently presenting: {currentPresenter.username}</p>
            <p>Ready status: {presenterReady ? "Ready" : "Not Ready"}</p>
            {role === "presenter" && currentPresenter.id === id && !presenterReady && (
              <button onClick={markReady} style={{ padding: "10px 20px" }}>
                Mark as Ready
              </button>
            )}
          </div>
        ) : (
          <p>Waiting for presenters...</p>
        )}
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
        <button onClick={() => setRole("spectator")} style={{ marginRight: "10px", padding: "5px 10px" }}>
          Spectator
        </button>
        <button onClick={() => setRole("presenter")} style={{ padding: "5px 10px" }}>
          Presenter
        </button>
        <button onClick={() => socket?.emit("updateUser", { room: code, username, role })} style={{ padding: "5px 10px" }}>
          Pokračovat
        </button>
      </div>
      <div style={{ marginTop: "20px" }}>
        <h2>Users in Room:</h2>
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              {user.username} - {user.role}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
};

export default Room;