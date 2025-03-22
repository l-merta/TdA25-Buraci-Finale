//import { useState } from "react";

import BackgroundEffect from './../components/BackgroundEffect';
import RoomCode from './../sections/RoomCode';

const Home = () => {
  return (
    <>
    <main>
      <BackgroundEffect />
      <img src="/images/TdA-logo-bile-full.png" className='logo-tda'/>
      <RoomCode />
    </main>
    </>
  );
};

export default Home;