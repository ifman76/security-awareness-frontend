import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import QuestionCard from './QuestionCard';

// 🔁 파일럿 테스트용 Context: 주석처리 (본실험에선 사용 안함)
// import { useSurvey } from '../contexts/SurveyContext';

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

  // 🔁 파일럿: Context 함수 – 본실험에서는 사용 안함
  // const { setAnsweredQuestions } = useSurvey();

  useEffect(() => {
    fetch('https://security-awareness-api.onrender.com/questions')
      .then((res) => res.json())
      .then((data) => {
        const behaviorQuestions = data.filter(q => q.section === 'Behavior/Curiosity');

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
          if (grouped[key]) grouped[key].push(q);
        });

        const getRandom = (arr, n) => arr.sort(() => 0.5 - Math.random()).slice(0, n);

        const selected = [
          ...getRandom(grouped.GPT_Positive, 2),
          ...getRandom(grouped.GPT_Reverse, 1),
          ...getRandom(grouped.Human_Positive, 2),
          ...getRandom(grouped.Human_Reverse, 1)
        ].filter(Boolean);

        setQuestions(selected);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ 문항 불러오기 실패:", err);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (answers) => {
    const participant = JSON.parse(localStorage.getItem('participant'));

    const finalPayload = {
      participant,
      knowledgeAnswers: knowledgeAnswers || [],
      knowledgeQuestions: knowledgeQuestions || [],
      deviceAnswers: deviceAnswers || [],
      deviceQuestions: deviceQuestions || [],
      ownedDevices: ownedDevices || [],
      certifiedDevices: certifiedDevices || [],
      behaviorAnswers: answers,
      behaviorQuestions: questions,
    };



    // ✅ [본실험용] 최종 결과 서버 저장
    /*
    try {
      await fetch('https://security-awareness-api.onrender.com/final-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalPayload),
      });
    } catch (err) {
      console.error("❌ 결과 저장 중 오류 발생", err);
    }
    */
    // ✅ [본실험용] 결과 페이지로 이동
    navigate('/result', { state: finalPayload });

    // 🔁 [파일럿용] - 아래 블록 전체 주석 처리
    /*
    const allQuestions = [
      ...(knowledgeQuestions || []),
      ...(deviceQuestions || []),
      ...questions
    ];
    const answeredSummary = allQuestions.map((q) => ({
      id: q.id || q.qid || 'unknown',
      text: q.text || q.question || '문항 텍스트 없음'
    }));
    setAnsweredQuestions(answeredSummary);
    navigate('/pilot-feedback', { state: finalPayload });
    */
  };

  if (loading || questions.length === 0) {
    return <div className="p-6">문항을 불러오는 중입니다...(최초 접속 시 약간의 시간이 걸릴 수 있습니다)</div>;
  }

  return (
    <QuestionCard questions={questions} onSubmit={handleSubmit} />
  );
}
