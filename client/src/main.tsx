import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home.tsx';
//import Chat from './pages/Chat.tsx';
import Room from './pages/Room.tsx';
import Features from './pages/Features.tsx';
import Team from './pages/Team.tsx';

import './styles/index.css';
import './styles/main.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/mistnost' element={<Room />} />
        <Route path='/mistnost/:code' element={<Room />} />
        <Route path='/team' element={<Team />} />
        <Route path='/features' element={<Features />} />
      </Routes>
    </Router>
  </StrictMode>,
)
