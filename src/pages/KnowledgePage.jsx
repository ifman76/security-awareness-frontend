import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionCard from './QuestionCard';

export default function KnowledgePage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true); // ✅ 로딩 상태 추가
  const navigate = useNavigate();

  useEffect(() => {
    console.log("📌 useEffect 실행됨");

    fetch('https://security-awareness-api.onrender.com/questions')
      .then((res) => res.json())
      .then((data) => {
        console.log("📌 전체 질문 데이터:", data);

        const knowledgeQuestions = data.filter(q => q.section === 'Knowledge');

        const grouped = {
          GPT_Low: [], GPT_Medium: [], GPT_High: [],
          Human_Low: [], Human_Medium: [], Human_High: []
        };

        knowledgeQuestions.forEach(q => {
          const key = `${q.source}_${q.difficulty}`;
          if (grouped[key]) grouped[key].push(q);
        });

        const getRandom = (arr, n) => arr.sort(() => 0.5 - Math.random()).slice(0, n);

        const selected = [
          ...getRandom(grouped.GPT_Low, 1),
          ...getRandom(grouped.GPT_Medium, 2),
          ...getRandom(grouped.GPT_High, 1),
          ...getRandom(grouped.Human_Low, 1),
          ...getRandom(grouped.Human_Medium, 2),
          ...getRandom(grouped.Human_High, 1),
        ];

        console.log("✅ 선택된 질문:", selected);
        setQuestions(selected);
        setLoading(false); // ✅ 모든 작업 완료 후 로딩 종료
      })
      .catch((err) => {
        console.error("❌ 질문 불러오기 실패:", err);
        setLoading(false); // 실패해도 false 처리해서 루프 방지
      });
  }, []);

  const handleSubmit = (answers) => {
    navigate('/device', {
      state: {
        knowledgeAnswers: answers,
        knowledgeQuestions: questions,
      },
    });
  };

  if (loading) {
    return <div className="p-6">문항을 불러오는 중입니다...(최초 접속 시 약간의 시간이 걸릴 수 있습니다)</div>;
  }

  return (
    <QuestionCard questions={questions} onSubmit={handleSubmit} />
  );
}
