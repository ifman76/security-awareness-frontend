import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StartPage from './pages/StartPage';
import AdminPage from './pages/AdminPage';
// 기타 페이지들 import...

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<StartPage />} />
      {/* 기타 사용자 페이지들 */}
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}
