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

  // 정답 텍스트 기준 점수 계산
  const getScore = (answers, questions) => {
    if (!answers || !questions) return 0;
    let correct = 0;
    answers.forEach((a, idx) => {
      const q = questions[idx];
      const userAnswer = q?.[`choice${a + 1}`]; // 사용자가 고른 보기 텍스트
      if (userAnswer && userAnswer === q?.answer) correct++;
    });
    return Math.round((correct / questions.length) * 100);
  };

  const knowledgeScore = getScore(knowledgeAnswers, knowledgeQuestions);
  const deviceScore = getScore(deviceAnswers, deviceQuestions);
  const behaviorScore = getScore(behaviorAnswers, behaviorQuestions);
  const totalScore = Math.round((knowledgeScore + deviceScore + behaviorScore) / 3);

  // 점수 저장
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
        <h2 className="text-lg font-semibold mb-2">총점 / Total Score</h2>
        <p className="text-3xl font-bold text-orange-600">{totalScore}점 / {totalScore} points</p>
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

      {/* 점수 카드 3개 */}
      <h1 className="text-2xl font-bold mb-6 text-center">보안 인식 결과 / Security Awareness Result</h1>

      <div className="bg-white shadow-xl rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-2">지식 점수 / Knowledge Score</h2>
        <p className="text-3xl font-bold text-blue-600">{knowledgeScore}점 / {knowledgeScore} points</p>
      </div>

      <div className="bg-white shadow-xl rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-2">기기 점수 / Device Score</h2>
        <p className="text-3xl font-bold text-green-600">{deviceScore}점 / {deviceScore} points</p>
        <p className="text-sm text-gray-500 mt-2">보유 기기: {ownedDevices?.join(', ') || '선택 안함 / Not selected'}</p>
      </div>

      <div className="bg-white shadow-xl rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-2">행동 점수 / Curiosity Score</h2>
        <p className="text-3xl font-bold text-purple-600">{behaviorScore}점 / {behaviorScore} points</p>
      </div>

      {/* 총평 */}
      <div className="bg-white shadow-xl rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-3">총평 / Summary</h2>
        <p className="text-sm text-gray-700">
          지식(Knowledge), 기기(Device), 행동(Curiosity)에 기반한 보안 인식 평가 결과입니다. 각 영역의 점수를 종합적으로 고려하여 개인의 보안 민감도와 리스크 대응 역량을 가늠할 수 있습니다.
        </p>
        <p className="text-sm text-gray-700">
          This security awareness assessment is based on knowledge, device ownership, and behavioral curiosity. Your scores across these areas provide an integrated view of your security sensitivity and risk response capability.
        </p>
      </div>
    </div>
  );
}
