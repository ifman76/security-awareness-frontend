import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StartPage from './pages/StartPage';
import AdminPage from './pages/AdminPage';
import AdminQuestionStatsPage from './pages/AdminQuestionStatsPage'; // ✅ 추가
import ParticipantInfoPage from './pages/ParticipantInfoPage'; // ✅ 추가
import AdminResponsesPage from './pages/AdminResponsesPage';
import PilotFeedbackPage from './pages/PilotFeedbackPage';


// 기타 페이지들 import...

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<StartPage />} />
      <Route path="/info" element={<ParticipantInfoPage />} /> {/* ✅ 추가 */}
      {/* 기타 사용자 페이지들 */}
      <Route path="/admin/responses" element={<AdminResponsesPage />} /> 
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/admin/question-stats" element={<AdminQuestionStatsPage />} /> {/* ✅ 추가 */}
      <Route path="/pilot-feedback" element={<PilotFeedbackPage />} />
    </Routes>
  );
}
