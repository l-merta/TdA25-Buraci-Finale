import { useState } from 'react'
import { Link } from "react-router-dom";

const RoomCode = () => {
  const [roomCode, setRoomCode] = useState("");

  return (
    <div className='room-code'>
      <h3>Přidej se do místnosti</h3>
      <input
        type="text"
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value)}
        placeholder="6 místní kód"
      />
      <Link to={`/mistnost/${roomCode}`}>Připojit se</Link>
    </div>
  )
}

export default RoomCode