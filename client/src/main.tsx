import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home.tsx';
//import Chat from './pages/Chat.tsx';
import Features from './pages/Features.tsx';

import './styles/index.css';
import './styles/main.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/features' element={<Features />} />
      </Routes>
    </Router>
  </StrictMode>,
)
