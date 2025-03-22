import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home.tsx';
//import Chat from './pages/Chat.tsx';
import Room from './pages/Room.tsx';
import RoomAdmin from './pages/RoomAdmin.tsx';
import AdminPanel from './pages/AdminPanel.tsx';
import Features from './pages/Features.tsx';
import Error from './pages/Error.tsx';

import './styles/index.css';
import './styles/main.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/mistnost' element={<Room />} />
        <Route path='/mistnost/:code' element={<Room />} />
        <Route path='/admin' element={<AdminPanel />} />
        <Route path='/admin/mistnost' element={<RoomAdmin />} />
        <Route path='/admin/mistnost/:code' element={<RoomAdmin />} />
        <Route path='/features' element={<Features />} />
        <Route path='/error' element={<Error code={404} message='Tato stránka neexistuje' />} />
        <Route path='/*' element={<Error code={404} message='Tato stránka neexistuje' />} />
      </Routes>
    </Router>
  </StrictMode>,
)
