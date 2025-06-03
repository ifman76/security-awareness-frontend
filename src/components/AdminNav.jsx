// src/components/AdminNav.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function AdminNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { label: '요약 통계', path: '/admin' },
    { label: '문항 정답률', path: '/admin/question-stats' },
    { label: '응답 상세', path: '/admin/responses' },
  ];

  return (
    <div className="flex gap-2 mb-6">
      {tabs.map(tab => (
        <button
          key={tab.path}
          onClick={() => navigate(tab.path)}
          className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
            location.pathname === tab.path
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
