import React, { useEffect, useState } from 'react';
import { CSVLink } from 'react-csv';

export default function AdminPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🔐 관리자 페이지 - 실험 결과</h1>

      {/* ✅ CSV 다운로드 버튼 */}
      {!loading && (
        <div className="mb-4">
          <CSVLink
            data={results}
            filename={`security_awareness_results_${new Date().toISOString().slice(0, 10)}.csv`}
            className="inline-block bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            📥 CSV 다운로드
          </CSVLink>
        </div>
      )}

      {loading ? (
        <p className="text-gray-600">불러오는 중입니다...</p>
      ) : (
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
                <th className="px-4 py-2 border text-center">Knowledge</th>
                <th className="px-4 py-2 border text-center">Device</th>
                <th className="px-4 py-2 border text-center">Curiosity</th>
                <th className="px-4 py-2 border text-center">Total</th>
                <th className="px-4 py-2 border">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {results.map((row, idx) => (
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
      )}
    </div>
  );
}
