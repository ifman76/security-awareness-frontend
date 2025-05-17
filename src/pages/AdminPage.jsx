import React, { useEffect, useState } from 'react';
import { CSVLink } from 'react-csv';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer
} from 'recharts';

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genderFilter, setGenderFilter] = useState('전체');
  const [ageFilter, setAgeFilter] = useState('전체');
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc');

  // 로그인 유지 상태 체크
  useEffect(() => {
    const stored = localStorage.getItem('admin_logged_in');
    if (stored === 'true') setIsLoggedIn(true);
  }, []);

  // 비밀번호 확인
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === import.meta.env.VITE_ADMIN_PASSWORD) {
      localStorage.setItem('admin_logged_in', 'true');
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('비밀번호가 올바르지 않습니다.');
    }
  };

  // 데이터 로드
  useEffect(() => {
    if (!isLoggedIn) return;
    fetch('https://security-awareness-api.onrender.com/admin/results')
      .then(res => res.json())
      .then(data => {
        setResults(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('❌ 관리자 데이터 불러오기 실패:', err);
        setLoading(false);
      });
  }, [isLoggedIn]);

  // 필터 + 정렬
  useEffect(() => {
    let data = [...results];

    if (genderFilter !== '전체') {
      data = data.filter(row => row.gender === genderFilter);
    }

    if (ageFilter !== '전체') {
      data = data.filter(row => row.age_group === ageFilter);
    }

    if (sortKey) {
      data.sort((a, b) => {
        const valA = a[sortKey] ?? 0;
        const valB = b[sortKey] ?? 0;
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      });
    }

    setFilteredResults(data);
  }, [results, genderFilter, ageFilter, sortKey, sortOrder]);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  const getStats = (key) => {
    const values = filteredResults.map(r => r[key]).filter(v => v !== null && v !== undefined);
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length || 0;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length || 0;
    const stddev = Math.sqrt(variance);
    return { avg: avg.toFixed(1), stddev: stddev.toFixed(1) };
  };

  const knowledgeStats = getStats('knowledge_score');
  const deviceStats = getStats('device_score');
  const behaviorStats = getStats('behavior_score');
  const totalStats = getStats('total_score');

  const duplicateIds = [...new Set(
    results.map(r => r.participant_id).filter((id, i, arr) => arr.indexOf(id) !== i)
  )];

  // 로그인 화면
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-md max-w-sm w-full">
          <h1 className="text-xl font-bold mb-4">🔐 관리자 로그인</h1>
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border px-4 py-2 mb-3 rounded-lg"
          />
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            로그인
          </button>
        </form>
      </div>
    );
  }

  // 관리자 대시보드
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">🔐 관리자 페이지</h1>
        <button
          onClick={() => {
            localStorage.removeItem('admin_logged_in');
            window.location.reload();
          }}
          className="text-sm text-red-600 border border-red-600 px-3 py-1 rounded-lg hover:bg-red-50"
        >
          로그아웃
        </button>
      </div>

      {/* 이하 분석 및 테이블 영역 그대로 유지 */}
      {/* CSV 다운로드, 필터링, 정렬, 요약 통계, Radar Chart, 테이블 등 포함 */}
      {/* 기존 AdminPage 기능을 그대로 아래에 붙이면 됩니다 */}
    </div>
  );
}
