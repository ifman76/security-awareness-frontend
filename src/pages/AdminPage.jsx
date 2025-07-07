import React, { useEffect, useState } from 'react';
import { CSVLink } from 'react-csv';
import AdminNav from '../components/AdminNav';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer
} from 'recharts';

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [results, setResults] = useState([]);
  const [allResults, setAllResults] = useState([]); // ✅ 전체 final_results
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genderFilter, setGenderFilter] = useState('전체');
  const [ageFilter, setAgeFilter] = useState('전체');
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    const stored = localStorage.getItem('admin_logged_in');
    if (stored === 'true') setIsLoggedIn(true);
  }, []);

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

  // 필터용 데이터
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

  // 전체 final_results 데이터
  useEffect(() => {
    if (!isLoggedIn) return;
    fetch('https://security-awareness-api.onrender.com/admin/final-results')
      .then(res => res.json())
      .then(data => setAllResults(data))
      .catch(err => console.error('❌ 전체 final_results 불러오기 실패:', err));
  }, [isLoggedIn]);

  useEffect(() => {
    let data = [...results];
    if (genderFilter !== '전체') data = data.filter(row => row.gender === genderFilter);
    if (ageFilter !== '전체') data = data.filter(row => row.age_group === ageFilter);
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <AdminNav />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">🔐 관리자 페이지</h1>
        <div className="text-sm text-gray-600">
          전체 참여자 수: <span className="font-semibold text-blue-700">{allResults.length}</span>명
        </div>
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

      {!loading && (
        <div className="mb-4 flex flex-wrap gap-4 items-center">
          <CSVLink
            data={allResults}
            filename={`security_awareness_final_results_${new Date().toISOString().slice(0, 10)}.csv`}
            className="bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            📥 전체 결과 CSV 다운로드
          </CSVLink>

          <CSVLink
            data={filteredResults}
            filename="filtered_results.csv"
            className="bg-gray-500 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-700 transition"
          >
            🎯 필터 적용된 CSV
          </CSVLink>

          <select className="border px-3 py-2 rounded" value={genderFilter} onChange={e => setGenderFilter(e.target.value)}>
            <option value="전체">전체 성별</option>
            <option value="male">남성</option>
            <option value="female">여성</option>
          </select>

          <select className="border px-3 py-2 rounded" value={ageFilter} onChange={e => setAgeFilter(e.target.value)}>
            <option value="전체">전체 연령대</option>
            <option value="10s">10대</option>
            <option value="20s">20대</option>
            <option value="30s">30대</option>
            <option value="40s">40대</option>
            <option value="50s">50대</option>
            <option value="60s">60대 이상</option>
          </select>
        </div>
      )}

      {duplicateIds.length > 0 && (
        <div className="mb-4 p-4 bg-yellow-100 text-sm rounded-lg border border-yellow-300 text-yellow-800">
          ⚠️ 중복 응답 감지됨: {duplicateIds.join(', ')}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-xl border">
          <h2 className="text-lg font-bold mb-2">📊 평균 / 표준편차</h2>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>Knowledge: 평균 {knowledgeStats.avg} / 표준편차 {knowledgeStats.stddev}</li>
            <li>Device: 평균 {deviceStats.avg} / 표준편차 {deviceStats.stddev}</li>
            <li>Curiosity: 평균 {behaviorStats.avg} / 표준편차 {behaviorStats.stddev}</li>
            <li>Total: 평균 {totalStats.avg} / 표준편차 {totalStats.stddev}</li>
          </ul>
        </div>

        <div className="bg-white p-4 rounded-xl border">
          <h2 className="text-lg font-bold mb-2">📈 Radar 차트</h2>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={[
              { subject: 'Knowledge', A: Number(knowledgeStats.avg) },
              { subject: 'Device', A: Number(deviceStats.avg) },
              { subject: 'Curiosity', A: Number(behaviorStats.avg) },
              { subject: 'Total', A: Number(totalStats.avg) },
            ]}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar name="평균" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.5} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="overflow-x-auto border rounded-xl shadow-md">
        <table className="table-auto w-full text-sm text-left border-collapse">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-2 border">ID</th>
              <th className="px-4 py-2 border">Age</th>
              <th className="px-4 py-2 border">Gender</th>
              <th className="px-4 py-2 border">Occupation</th>
              <th className="px-4 py-2 border">AI</th>
              <th className="px-4 py-2 border">SelfEval</th>
              {['knowledge_score', 'device_score', 'behavior_score', 'total_score'].map(key => (
                <th
                  key={key}
                  className="px-4 py-2 border text-center cursor-pointer"
                  onClick={() => toggleSort(key)}
                >
                  {key.replace('_score', '').replace(/^./, c => c.toUpperCase())}
                  {sortKey === key ? (sortOrder === 'asc' ? ' 🔼' : ' 🔽') : ''}
                </th>
              ))}
              <th className="px-4 py-2 border">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {filteredResults.map((row, idx) => (
              <tr key={idx} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2 border text-xs text-gray-500">{row.participant_id}</td>
                <td className="px-4 py-2 border">{row.age_group}</td>
                <td className="px-4 py-2 border">{row.gender}</td>
                <td className="px-4 py-2 border">{row.occupation}</td>
                <td className="px-4 py-2 border">{row.ai_experience}</td>
                <td className="px-4 py-2 border">{row.self_assessment}</td>
                <td className="px-4 py-2 border text-center">{row.knowledge_score}</td>
                <td className="px-4 py-2 border text-center">{row.device_score}</td>
                <td className="px-4 py-2 border text-center">{row.behavior_score}</td>
                <td className="px-4 py-2 border text-center font-semibold">{row.total_score}</td>
                <td className="px-4 py-2 border text-gray-500 text-xs">
                  {new Date(row.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
