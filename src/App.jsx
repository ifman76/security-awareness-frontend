import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import StartPage from './pages/StartPage';
import ParticipantInfoPage from './pages/ParticipantInfoPage';
import KnowledgePage from './pages/KnowledgePage';
import DevicePage from './pages/DevicePage';
import CuriosityPage from './pages/CuriosityPage';
import ResultPage from './pages/ResultPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/info" element={<ParticipantInfoPage />} />
        <Route path="/knowledge" element={<KnowledgePage />} />
        <Route path="/device" element={<DevicePage />} />
        <Route path="/curiosity" element={<CuriosityPage />} />
        <Route path="/result" element={<ResultPage />} />
      </Routes>
    </BrowserRouter>
  );
}
