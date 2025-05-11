import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import QuestionCard from './QuestionCard';

export default function CuriosityPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const knowledgeAnswers = location.state?.knowledgeAnswers;
  const knowledgeQuestions = location.state?.knowledgeQuestions;
  const deviceAnswers = location.state?.deviceAnswers;
  const deviceQuestions = location.state?.deviceQuestions;
  const ownedDevices = location.state?.ownedDevices;
  const certifiedDevices = location.state?.certifiedDevices;

  useEffect(() => {
    console.log("📌 CuriosityPage useEffect 실행됨");

    fetch('https://security-awareness-api.onrender.com/questions')
      .then((res) => res.json())
      .then((data) => {
        console.log("📌 전체 질문 수:", data.length);

        const behaviorQuestions = data.filter(q => q.section === 'Behavior/Curiosity');
        console.log("📌 Behavior/Curiosity 문항 수:", behaviorQuestions.length);

        const grouped = {
          GPT_Low: [], GPT_Medium: [], GPT_High: [],
          Human_Low: [], Human_Medium: [], Human_High: []
        };

        const normalizeKey = (source, difficulty) => {
          const s = source?.trim().toLowerCase();
          const d = difficulty?.trim().toLowerCase();

          const mappedSource = s === 'gpt' ? 'GPT' : s === 'human' ? 'Human' : '';
          const mappedDifficulty =
            d === 'low' ? 'Low' :
            d === 'medium' ? 'Medium' :
            d === 'high' ? 'High' : '';

          return `${mappedSource}_${mappedDifficulty}`;
        };

        behaviorQuestions.forEach(q => {
          const key = normalizeKey(q.source, q.difficulty);
          if (grouped[key]) {
            grouped[key].push(q);
          } else {
            console.warn(`❗ 분류되지 않은 문항: ${key}`, q);
          }
        });

        const getRandom = (arr, n) => arr.sort(() => 0.5 - Math.random()).slice(0, n);

        const selected = [
          ...getRandom(grouped.GPT_Low, 1),
          ...getRandom(grouped.GPT_Medium, 1),
          ...getRandom(grouped.GPT_High, 1),
          ...getRandom(grouped.Human_Low, 1),
          ...getRandom(grouped.Human_Medium, 1),
          ...getRandom(grouped.Human_High, 1)
        ].filter(Boolean); // null 방지

        console.log("📌 최종 선택된 문항 수:", selected.length);
        setQuestions(selected);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ 문항 불러오기 실패:", err);
        setLoading(false);
      });
  }, []);

  const handleSubmit = (answers) => {
    navigate('/result', {
      state: {
        knowledgeAnswers,
        knowledgeQuestions,
        deviceAnswers,
        deviceQuestions,
        ownedDevices,
        certifiedDevices,
        behaviorAnswers: answers,
        behaviorQuestions: questions,
      },
    });
  };

  if (loading || questions.length === 0) {
    return <div className="p-6">문항을 불러오는 중입니다...(최초 접속 시 약간의 시간이 걸릴 수 있습니다)</div>;
  }

  return (
    <QuestionCard questions={questions} onSubmit={handleSubmit} />
  );
}
