import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionCard from './QuestionCard';

export default function KnowledgePage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("📌 useEffect 실행됨");

    fetch('https://security-awareness-api.onrender.com/questions?section=Knowledge')
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

  // ✅ 조건부 렌더링: 로딩 중 또는 첫 질문에 선택지 없음
  const firstQuestion = questions[0];
  const hasChoices =
    firstQuestion?.choice1 ||
    firstQuestion?.choice2 ||
    firstQuestion?.choice3 ||
    firstQuestion?.choice4 ||
    firstQuestion?.type === 'O/X';

  if (loading || questions.length === 0 || !firstQuestion || !hasChoices) {
    return 
      <div className="p-6">
        문항을 불러오는 중입니다...(최초 접속 시 약간의 시간이 걸릴 수 있습니다)
        / Please Wait...</div>;
  }

  return (
    <QuestionCard questions={questions} onSubmit={handleSubmit} />
  );
}
