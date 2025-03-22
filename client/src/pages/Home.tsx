import { useState } from "react";
import { Link } from "react-router-dom";

const Home = () => {
  const [roomCode, setRoomCode] = useState("");

  return (
    <main>
      <h1>Home stránka</h1>
      <div style={{ marginTop: "20px" }}>
        <input
          type="text"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
          placeholder="Enter room code"
          style={{ marginRight: "10px", padding: "5px" }}
        />
        <Link to={`/mistnost/${roomCode}`}style={{ padding: "5px 10px" }}>Go to Room</Link>
      </div>
    </main>
  );
};

export default Home;