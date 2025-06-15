// src/pages/PilotFeedbackPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSurvey } from '../contexts/SurveyContext';

export default function PilotFeedbackPage() {
  const navigate = useNavigate();
  const { answeredQuestions } = useSurvey();

  const [difficultQuestions, setDifficultQuestions] = useState(new Set());
  const [freeFeedback, setFreeFeedback] = useState('');

  const handleToggle = (questionId, checked) => {
    const updated = new Set(difficultQuestions);
    checked ? updated.add(questionId) : updated.delete(questionId);
    setDifficultQuestions(updated);
  };

  const handleSubmit = async () => {
    const payload = {
      difficult_question_ids: Array.from(difficultQuestions),
      additional_feedback: freeFeedback,
      timestamp: new Date().toISOString(),
    };

    try {
      const res = await fetch('https://security-awareness-api.onrender.com/api/pilot-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert('피드백이 제출되었습니다. 감사합니다!');
        navigate('/'); // 홈 또는 결과페이지로 리다이렉트
      } else {
        alert('제출 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error(error);
      alert('서버 연결 오류');
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto text-sm">
      <h2 className="text-xl font-bold mb-4">파일럿 피드백 (Pilot Feedback)</h2>
      <p className="mb-3 text-gray-700">
        아래는 방금 응답하신 문항들입니다. 이해가 어려웠던 문항을 선택해 주세요.
      </p>

      <div className="space-y-2 mb-6">
        {answeredQuestions.map((q, idx) => (
          <div key={q.id} className="flex items-start gap-2">
            <input
              type="checkbox"
              id={q.id}
              onChange={(e) => handleToggle(q.id, e.target.checked)}
            />
            <label htmlFor={q.id}>
              {idx + 1}. {q.text.slice(0, 80)}...
            </label>
          </div>
        ))}
      </div>

      <textarea
        className="w-full border border-gray-300 rounded p-2"
        rows={4}
        placeholder="그 외 추가로 어려웠던 점이나 의견이 있다면 입력해 주세요"
        value={freeFeedback}
        onChange={(e) => setFreeFeedback(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        피드백 제출하기
      </button>
    </div>
  );
}
