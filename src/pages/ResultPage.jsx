import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

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

  // ✅ 정답 기반 점수 계산 (지식/기기)
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

  // ✅ 리커트 기반 점수 계산 (호기심/행동)
  const getCuriosityScore = (answers, questions) => {
    if (!answers || !questions || answers.length !== questions.length) return 0;
    let total = 0;
    answers.forEach((a, idx) => {
      const q = questions[idx];
      if (q.difficulty === 'reverse') {
        total += a !== null ? (a + 1) * -1 + 6 : 0; // 역방향
      } else {
        total += a !== null ? 5 - a : 0; // 정방향
      }
    });
    return Math.round((total / questions.length) * 100 / 5); // 백분율
  };

  // ✅ 점수 계산
  const { score: knowledgeScore, correct: knowledgeCorrect, total: knowledgeTotal } =
    getScore(knowledgeAnswers, knowledgeQuestions);
  const { score: deviceScore, correct: deviceCorrect, total: deviceTotal } =
    getScore(deviceAnswers, deviceQuestions);
  const behaviorScore = getCuriosityScore(behaviorAnswers, behaviorQuestions);

  const totalScore = Math.round((knowledgeScore + deviceScore + behaviorScore) / 3);

  // ✅ 결과 저장
  useEffect(() => {
    const participant = JSON.parse(localStorage.getItem('participant')) || {};

    fetch('https://security-awareness-api.onrender.com/final-results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        participant_id: participant.id || 'anonymous',
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
    })
      .then(res => res.ok ? console.log('✅ 결과 저장 완료') : console.error('❌ 저장 실패'))
      .catch(err => console.error('❌ 저장 오류:', err));
  }, []);

  return (
    <div className="p-6 max-w-xl mx-auto">
      {/* 총점 카드 */}
      <div className="bg-white shadow-xl rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-2">총점 (Total Score : 100점 만점 중)</h2>
        <p className="text-3xl font-bold text-orange-600">{totalScore}점(points) </p>
      </div>

      {/* 레이더 차트 */}
      <div className="bg-white shadow-xl rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-2">그래프 / Radar Chart</h2>
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
            alt="Security Awareness Radar Chart"
            className="w-full rounded-lg"
          />
        </div>
      </div>

      {/* 점수 카드 */}
      <h1 className="text-2xl font-bold mb-6 text-center">보안 인식 결과 / Security Awareness Result</h1>

      <div className="bg-white shadow-xl rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-2">지식 점수 (Knowledge Score : 100점 만점)</h2>
        <p className="text-3xl font-bold text-blue-600">
          {knowledgeScore}점 ({knowledgeCorrect} / {knowledgeTotal})
        </p>
      </div>

      <div className="bg-white shadow-xl rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-2">기기 점수 (Device Score : 100점 만점)</h2>
        <p className="text-3xl font-bold text-green-600">
          {deviceScore}점 ({deviceCorrect} / {deviceTotal})
        </p>
        <p className="text-sm text-gray-500 mt-2">
          보유 기기(추가점수): {ownedDevices?.join(', ') || '선택 안함 / Not selected'}
        </p>
      </div>

      <div className="bg-white shadow-xl rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-2">행동 점수 (Curiosity Score : 100점 만점)</h2>
        <p className="text-3xl font-bold text-purple-600">{behaviorScore}점</p>
        <p className="text-sm text-gray-500 mt-2">리커트 5점 척도 기반 점수화</p>
      </div>

      {/* 총평 */}
      <div className="bg-white shadow-xl rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-3">총평 (Summary)</h2>
        <p className="text-sm text-gray-700">
          지식(Knowledge), 기기(Device), 행동(Curiosity)에 기반한 보안 인식 평가 결과입니다.
          각 영역의 점수를 종합적으로 고려하여 개인의 보안 민감도와 리스크 대응 역량을 가늠할 수 있습니다.
        </p>
        <p className="text-sm text-gray-700">
          This security awareness assessment is based on knowledge, device ownership, and behavioral curiosity.
          Your scores across these areas provide an integrated view of your security sensitivity and risk response capability.
        </p>
      </div>
    </div>
  );
}
