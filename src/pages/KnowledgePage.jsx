import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionCard from './QuestionCard';

export default function KnowledgePage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
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

        setQuestions(selected);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ 질문 불러오기 실패:", err);
        setLoading(false);
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

  if (loading || questions.length === 0 || !questions[0]?.choice1) {
    return <div className="p-6">문항을 불러오는 중입니다...(최초 접속 시 약간의 시간이 걸릴 수 있습니다)</div>;
  }

  return (
    <QuestionCard questions={questions} onSubmit={handleSubmit} />
  );
}
