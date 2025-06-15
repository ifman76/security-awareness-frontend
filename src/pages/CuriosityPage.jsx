import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import QuestionCard from './QuestionCard';
import { useSurvey } from '../contexts/SurveyContext'; // ✅ 추가 파일럿테스트

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

  const { setAnsweredQuestions } = useSurvey(); // ✅ context 함수 불러오기, 파일럿테스트

  useEffect(() => {
    console.log("📌 CuriosityPage useEffect 실행됨");

    fetch('https://security-awareness-api.onrender.com/questions')
      .then((res) => res.json())
      .then((data) => {
        console.log("📌 전체 질문 수:", data.length);

        const behaviorQuestions = data.filter(q => q.section === 'Behavior/Curiosity');
        console.log("📌 Behavior/Curiosity 문항 수:", behaviorQuestions.length);

        const grouped = {
          GPT_Positive: [], GPT_Reverse: [],
          Human_Positive: [], Human_Reverse: []
        };

        const normalizeKey = (source, difficulty) => {
          const s = source?.trim().toLowerCase();
          const d = difficulty?.trim().toLowerCase();

          const mappedSource = s === 'gpt' ? 'GPT' : s === 'human' ? 'Human' : '';
          const mappedDifficulty = d === 'positive' ? 'Positive' :
                                   d === 'reverse' ? 'Reverse' : '';

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
          ...getRandom(grouped.GPT_Positive, 2),
          ...getRandom(grouped.GPT_Reverse, 1),
          ...getRandom(grouped.Human_Positive, 2),
          ...getRandom(grouped.Human_Reverse, 1)
        ].filter(Boolean);

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
    // 파일럿테스트용 - 전체 문항 모아서 answeredQuestions에 저장
    const allQuestions = [
      ...(location.state?.knowledgeQuestions || []),
      ...(location.state?.deviceQuestions || []),
      ...questions
    ];

    const answeredSummary = allQuestions.map((q) => ({
      id: q.id || q.qid || 'unknown',
      text: q.text || q.question || '문항 텍스트 없음'
    }));

    setAnsweredQuestions(answeredSummary); // ✅ 저장.파일럿테스트용
    
    navigate('/pilot-feedback', {
      state: {
        behaviorAnswers: answers,
        behaviorQuestions: questions, 
        knowledgeAnswers: location.state?.knowledgeAnswers || [],
        knowledgeQuestions: location.state?.knowledgeQuestions || [],
        deviceAnswers: location.state?.deviceAnswers || [],
        deviceQuestions: location.state?.deviceQuestions || [],
        ownedDevices: location.state?.ownedDevices || []
      },
    });
  };    
/*파일럿 테스트 후 복구    
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
*/  

  if (loading || questions.length === 0) {
    return <div className="p-6">문항을 불러오는 중입니다...(최초 접속 시 약간의 시간이 걸릴 수 있습니다)</div>;
  }

  return (
    <QuestionCard questions={questions} onSubmit={handleSubmit} />
  );
}
