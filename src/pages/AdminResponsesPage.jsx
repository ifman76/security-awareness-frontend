import React, { useEffect, useState } from 'react';
import AdminNav from '../components/AdminNav';

export default function AdminResponsesPage() {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://security-awareness-api.onrender.com/admin/responses')
      .then(res => res.json())
      .then(data => {
        setResponses(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('❌ 응답 조회 실패:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <AdminNav />
      <h1 className="text-2xl font-bold mb-6">🧾 응답자별 응답 상세 보기</h1>

      {loading ? (
        <p className="text-gray-600">불러오는 중입니다...</p>
      ) : (
        <div className="overflow-x-auto border rounded-xl shadow">
          <table className="table-auto w-full text-sm border-collapse">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-2 border">참여자 ID</th>
                <th className="px-4 py-2 border">영역</th>
                <th className="px-4 py-2 border">문항</th>
                <th className="px-4 py-2 border">선택 보기 번호</th>
                <th className="px-4 py-2 border">응답 내용</th>
                <th className="px-4 py-2 border">출제자</th>
                <th className="px-4 py-2 border">정답 여부</th>
              </tr>
            </thead>
            <tbody>
              {responses.map((row, idx) => {
                const isCorrect =
                  row.correct_answer &&
                  row.answer &&
                  row.answer.trim() === row.correct_answer.trim();

                return (
                  <tr key={idx} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 border text-xs text-gray-500">{row.participant_id}</td>
                    <td className="px-4 py-2 border">{row.section}</td>
                    <td className="px-4 py-2 border whitespace-pre-line">{row.question}</td>
                    <td className="px-4 py-2 border text-center">{row.answer_index}</td>
                    <td className="px-4 py-2 border">{row.answer}</td>
                    <td className="px-4 py-2 border text-center">{row.author || '-'}</td>
                    <td className={`px-4 py-2 border text-center font-semibold ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>
                      {row.correct_answer ? (isCorrect ? 'O' : 'X') : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
