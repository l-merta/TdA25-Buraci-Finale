import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [roomCode, setRoomCode] = useState(""); // State for the room code input
  const navigate = useNavigate(); // Hook for navigation

  const redirectToRoom = () => {
    if (roomCode.trim()) {
      navigate(`/mistnost/${roomCode}`); // Redirect to the room
    }
  };

  return (
    <main>
      <h1>Home stránka</h1>

      {/* Room Code Input and Redirect */}
      <div style={{ marginTop: "20px" }}>
        <input
          type="text"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
          placeholder="Enter room code"
          style={{ marginRight: "10px", padding: "5px" }}
        />
        <button onClick={redirectToRoom} style={{ padding: "5px 10px" }}>
          Go to Room
        </button>
      </div>
    </main>
  );
};

export default Home;