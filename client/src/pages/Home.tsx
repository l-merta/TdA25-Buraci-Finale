//import { useState } from "react";

import BackgroundEffect from './../components/BackgroundEffect';
import RoomCode from './../sections/RoomCode';
import Footer from './../components/Footer';

const Home = () => {
  return (
    <>
    <main>
      <BackgroundEffect />
      <img src="/images/TdA-logo-bile-full.png" className='logo-tda'/>
      <RoomCode />
      <Footer />
    </main>
    </>
  );
};

export default Home;