import React, { useEffect, useState } from 'react';
import AdminNav from '../components/AdminNav'; //
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export default function AdminQuestionStatsPage() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, gpt, human

  useEffect(() => {
    fetch('https://security-awareness-api.onrender.com/admin/question-stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('❌ 문항 통계 불러오기 실패:', err);
        setLoading(false);
      });
  }, []);

  const filteredStats = stats.filter(row => {
    if (filter === 'all') return true;
    return row.source?.toLowerCase() === filter;
  });

  const getAccuracy = (row) => {
    const correct = Number(row.correct_count || 0);
    const total = Number(row.total_responses || 0);
    return total === 0 ? 0 : Math.round((correct / total) * 100);
  };

  // ✅ GPT/Human 평균 정답률 계산
  const getAverages = () => {
    const gpt = stats.filter(q => q.source === 'gpt');
    const human = stats.filter(q => q.source === 'human');

    const avg = (list) => {
      if (list.length === 0) return 0;
      const rates = list.map(q => Number(q.correct_count) / Number(q.total_responses || 1));
      return Math.round((rates.reduce((a, b) => a + b, 0) / rates.length) * 100);
    };

    return {
      gpt: avg(gpt),
      human: avg(human)
    };
  };

  const averages = getAverages();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <AdminNav />
      <h1 className="text-2xl font-bold mb-4">📊 문항별 정답률 통계</h1>

      {/* ✅ GPT vs Human 평균 비교 차트 */}
      <div className="bg-white p-4 mb-6 rounded-xl border shadow">
        <h2 className="text-lg font-semibold mb-3">🤖 GPT vs Human 평균 정답률 비교</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={[
            { source: 'GPT', accuracy: averages.gpt },
            { source: 'Human', accuracy: averages.human }
          ]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="source" />
            <YAxis domain={[0, 100]} unit="%" />
            <Tooltip />
            <Legend />
            <Bar dataKey="accuracy" fill="#8884d8" name="정답률" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mb-4 flex gap-3">
        <button
          className={`px-4 py-1 rounded border ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white'}`}
          onClick={() => setFilter('all')}
        >
          전체
        </button>
        <button
          className={`px-4 py-1 rounded border ${filter === 'gpt' ? 'bg-purple-600 text-white' : 'bg-white'}`}
          onClick={() => setFilter('gpt')}
        >
          GPT 출제
        </button>
        <button
          className={`px-4 py-1 rounded border ${filter === 'human' ? 'bg-green-600 text-white' : 'bg-white'}`}
          onClick={() => setFilter('human')}
        >
          인간 출제
        </button>
      </div>

      {loading ? (
        <p className="text-gray-600">불러오는 중입니다...</p>
      ) : (
        <div className="overflow-x-auto border rounded-xl shadow">
          <table className="table-auto w-full text-sm border-collapse">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-2 border">출제자</th>
                <th className="px-4 py-2 border">영역</th>
                <th className="px-4 py-2 border">문항</th>
                <th className="px-4 py-2 border text-center">응답 수</th>
                <th className="px-4 py-2 border text-center">정답 수</th>
                <th className="px-4 py-2 border text-center">정답률</th>
              </tr>
            </thead>
            <tbody>
              {filteredStats.map((row, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 border text-center font-semibold capitalize">{row.source}</td>
                  <td className="px-4 py-2 border text-center">{row.section}</td>
                  <td className="px-4 py-2 border whitespace-pre-line">{row.question}</td>
                  <td className="px-4 py-2 border text-center">{row.total_responses}</td>
                  <td className="px-4 py-2 border text-center">{row.correct_count}</td>
                  <td className="px-4 py-2 border text-center font-bold text-blue-600">
                    {getAccuracy(row)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
