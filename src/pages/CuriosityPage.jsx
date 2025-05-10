import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import QuestionCard from './QuestionCard';

export default function CuriosityPage() {
  const [questions, setQuestions] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const knowledgeAnswers = location.state?.knowledgeAnswers;
  const knowledgeQuestions = location.state?.knowledgeQuestions;
  const deviceAnswers = location.state?.deviceAnswers;
  const deviceQuestions = location.state?.deviceQuestions;
  const ownedDevices = location.state?.ownedDevices;
  const certifiedDevices = location.state?.certifiedDevices;

  useEffect(() => {
    fetch('https://security-awareness-api.onrender.com/questions')
      .then((res) => res.json())
      .then((data) => {
        const behaviorQuestions = data.filter(q => q.section === 'Behavior/Curiosity');

        const grouped = {
          GPT_Low: [], GPT_Medium: [], GPT_High: [],
          Human_Low: [], Human_Medium: [], Human_High: []
        };

        behaviorQuestions.forEach(q => {
          const key = `${q.source}_${q.difficulty}`;
          if (grouped[key]) grouped[key].push(q);
        });

        const getRandom = (arr, n) => arr.sort(() => 0.5 - Math.random()).slice(0, n);

        const selected = [
          ...getRandom(grouped.GPT_Low, 1),
          ...getRandom(grouped.GPT_Medium, 1),
          ...getRandom(grouped.GPT_High, 1),
          ...getRandom(grouped.Human_Low, 1),
          ...getRandom(grouped.Human_Medium, 1),
          ...getRandom(grouped.Human_High, 1)
        ];

        setQuestions(selected);
      })
      .catch((err) => console.error("문항 불러오기 실패:", err));
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

  if (questions.length === 0) {
    return <div className="p-6">문항을 불러오는 중입니다...</div>;
  }

  return (
    <QuestionCard questions={questions} onSubmit={handleSubmit} />
  );
}
