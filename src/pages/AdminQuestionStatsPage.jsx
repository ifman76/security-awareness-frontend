import React, { useEffect, useState } from 'react';

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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📊 문항별 정답률 통계</h1>

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
                  <td className="px-4 py-2 border text-center font-semibold capitalize">
                    {row.source}
                  </td>
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
