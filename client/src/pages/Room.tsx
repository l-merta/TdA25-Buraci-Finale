import { useParams } from "react-router-dom";

import RoomCode from "./../sections/RoomCode";

const Room = () => {
  const { code } = useParams<{ code?: string }>(); // Get :code from the URL

  // Room nemá kód
  if (!code) {
    return (
      <>
      <main>
        <h1>Zadej kód místnosti</h1>
        <RoomCode />
      </main>
      </>
    );
  }

  // Room má kód
  return (
    <>
    <main>
      <h1>Room: {code}</h1>
    </main>
    </>
  );
};

export default Room;