import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSurvey } from '../contexts/SurveyContext';

export default function ResultPage() {
  const location = useLocation();
  const {
    knowledgeAnswers,
    knowledgeQuestions,
    deviceAnswers,
    deviceQuestions,
    behaviorAnswers,
    behaviorQuestions,
    ownedDevices,
    certifiedDevices
  } = location.state || {};

  const { setAnsweredQuestions } = useSurvey();

  const getScore = (answers, questions) => {
    if (!answers || !questions || questions.length === 0) return { score: 0, correct: 0, total: 0 };
    let correct = 0;
    answers.forEach((a, idx) => {
      const q = questions[idx];
      if (a + 1 === q.answer_index) correct++;
    });
    const score = Math.round((correct / questions.length) * 100);
    return { score, correct, total: questions.length };
  };

  const getCuriosityScore = (answers, questions) => {
    if (!answers || !questions || answers.length !== questions.length) return 0;
    let total = 0;
    answers.forEach((a, idx) => {
      const q = questions[idx];
      if (q.difficulty === 'reverse') {
        total += a !== null ? (a + 1) * -1 + 6 : 0;
      } else {
        total += a !== null ? 5 - a : 0;
      }
    });
    return Math.round((total / questions.length) * 100 / 5);
  };

  const { score: knowledgeScore, correct: knowledgeCorrect, total: knowledgeTotal } =
    getScore(knowledgeAnswers, knowledgeQuestions);
  const { score: deviceScore, correct: deviceCorrect, total: deviceTotal } =
    getScore(deviceAnswers, deviceQuestions);
  const behaviorScore = getCuriosityScore(behaviorAnswers, behaviorQuestions);
  const totalScore = Math.round((knowledgeScore + deviceScore + behaviorScore) / 3);

  useEffect(() => {
    const participant = JSON.parse(localStorage.getItem('participant')) || {};
    const participantId = participant.id || 'anonymous';

    const allQuestions = [
      ...(knowledgeQuestions || []),
      ...(deviceQuestions || []),
      ...(behaviorQuestions || [])
    ];
    const answeredSummary = allQuestions.map(q => ({
      id: q.id || q.qid || q.question_id || 'unknown',
      text: q.text || q.question || q.title || '질문 텍스트 없음'
    }));
    setAnsweredQuestions(answeredSummary);

    // ✅ 1. 점수 저장
    fetch('https://security-awareness-api.onrender.com/final-results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        participant_id: participantId,
        ageGroup: participant.ageGroup || '',
        gender: participant.gender || '',
        occupation: participant.occupation || '',
        aiExperience: participant.aiExperience || '',
        selfAssessment: participant.selfAssessment || '',
        knowledgeScore,
        deviceScore,
        behaviorScore,
        totalScore,
        ownedDevices,
        timestamp: new Date().toISOString()
      })
    }).then(res => {
      if (res.ok) {
        console.log('✅ 점수 저장 완료');
      } else {
        console.error('❌ 점수 저장 실패');
      }
    }).catch(err => console.error('❌ 점수 저장 오류:', err));

    // ✅ 2. 응답 저장
    const saveResponses = async () => {
      const responses = [];

      knowledgeAnswers.forEach((ans, idx) => {
        const q = knowledgeQuestions[idx];
        responses.push({
          participant_id: participantId,
          question_id: q.id,
          answer_index: ans,
        });
      });

      deviceAnswers.forEach((ans, idx) => {
        const q = deviceQuestions[idx];
        responses.push({
          participant_id: participantId,
          question_id: q.id,
          answer_index: ans,
        });
      });

      behaviorAnswers.forEach((ans, idx) => {
        const q = behaviorQuestions[idx];
        responses.push({
          participant_id: participantId,
          question_id: q.id,
          answer_index: ans,
        });
      });

      try {
        await fetch('https://security-awareness-api.onrender.com/responses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ responses }),
        });
        console.log('✅ responses 저장 완료');
      } catch (err) {
        console.error('❌ responses 저장 실패:', err);
      }
    };

    saveResponses();
  }, []);

  return (
    <div className="p-6 max-w-xl mx-auto">
      {/* 총점 카드 */}
      <div className="bg-white shadow-xl rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-2">총점 (Total Score)</h2>
        <p className="text-3xl font-bold text-orange-600">{totalScore}점</p>
      </div>

      {/* 레이더 차트 */}
      <div className="bg-white shadow-xl rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-2">Radar Chart</h2>
        <div className="mt-4">
          <img
            src={`https://quickchart.io/chart?c={
              type:'radar',
              data:{
                labels:['Knowledge','Device','Curiosity'],
                datasets:[{
                  label:'Score',
                  data:[${knowledgeScore},${deviceScore},${behaviorScore}]
                }]
              }
            }`}
            alt="Radar Chart"
            className="w-full rounded-lg"
          />
        </div>
      </div>

      {/* 개별 점수 */}
      <h1 className="text-2xl font-bold mb-6 text-center">Security Awareness Result</h1>

      <div className="bg-white shadow-xl rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-2">Knowledge</h2>
        <p className="text-3xl font-bold text-blue-600">
          {knowledgeScore}점 ({knowledgeCorrect} / {knowledgeTotal})
        </p>
      </div>

      <div className="bg-white shadow-xl rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-2">Device</h2>
        <p className="text-3xl font-bold text-green-600">
          {deviceScore}점 ({deviceCorrect} / {deviceTotal})
        </p>
        <p className="text-sm text-gray-500 mt-2">
          보유 기기: {ownedDevices?.join(', ') || '선택 안함'}
        </p>
      </div>

      <div className="bg-white shadow-xl rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-2">Curiosity</h2>
        <p className="text-3xl font-bold text-purple-600">{behaviorScore}점</p>
        <p className="text-sm text-gray-500 mt-2">리커트 5점 척도 기반 점수화</p>
      </div>

      {/* 총평 */}
      <div className="bg-white shadow-xl rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-3">총평</h2>
        <p className="text-sm text-gray-700">
          본 결과는 지식, 기기, 행동 기반의 보안 인식 수준을 평가한 것입니다.
        </p>
      </div>
    </div>
  );
}
