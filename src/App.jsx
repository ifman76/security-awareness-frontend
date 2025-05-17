import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import StartPage from './pages/StartPage';
import AdminPage from './pages/AdminPage';
import AdminLogin from './pages/AdminLogin';
// 기타 페이지들...

export default function App() {
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem('admin_logged_in') === 'true';
    setAdminLoggedIn(loggedIn);
  }, []);

  return (
    <Routes>
      <Route path="/" element={<StartPage />} />
      {/* 기타 사용자 페이지들 */}
      <Route
        path="/admin"
        element={
          adminLoggedIn
            ? <AdminPage onLogout={() => {
                localStorage.removeItem('admin_logged_in');
                setAdminLoggedIn(false);
              }} />
            : <AdminLogin onLogin={() => setAdminLoggedIn(true)} />
        }
      />
    </Routes>
  );
}
