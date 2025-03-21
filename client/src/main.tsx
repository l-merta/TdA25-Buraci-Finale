import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import './styles/index.css';
import './styles/main.css';

import App from './pages/App.tsx';
import Features from './pages/Features.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path='/' element={<App />} />
        <Route path='/features' element={<Features />} />
      </Routes>
    </Router>
    <App />
  </StrictMode>,
)
