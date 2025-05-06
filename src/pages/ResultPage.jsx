import React from 'react';
import { useLocation } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function ResultPage() {
  const location = useLocation();
  const {
    knowledgeAnswers,
    knowledgeQuestions,
    deviceAnswers,
    deviceQuestions,
    ownedDevices,
    certifiedDevices,
    behaviorAnswers,
    behaviorQuestions
  } = location.state || {};

  // -------------------------
  // Knowledge 점수 계산
  // -------------------------
  const difficultyWeight = { Low: 1, Medium: 2, High: 3 };

  let knowledgeScore = 0;
  let knowledgeMax = 0;

  knowledgeQuestions?.forEach((q, idx) => {
    const weight = difficultyWeight[q.difficulty] || 1;
    knowledgeMax += weight;
    if (q.answer_index === (knowledgeAnswers[idx] + 1)) {
      knowledgeScore += weight;
    }
  });

  // -------------------------
  // Device 점수 계산
  // -------------------------
  let deviceScore = 0;
  let deviceMax = 0;

  deviceQuestions?.forEach((q, idx) => {
    const weight = difficultyWeight[q.difficulty] || 1;
    deviceMax += weight;
    if (q.answer_index === (deviceAnswers[idx] + 1)) {
      deviceScore += weight;
    }
  });

  const certifiedOwned = ownedDevices?.filter(productName =>
    certifiedDevices?.some(d => d.product === productName && d.cc_certified === true)
  ) || [];

  const deviceBonus = certifiedOwned.length >= 2 ? 4 : (certifiedOwned.length >= 1 ? 2 : 0);

  const totalDeviceScore = ((deviceScore + deviceBonus) / (deviceMax + 4)) * 100;

  // -------------------------
  // Behavior 점수 계산 (단순 평균)
  // -------------------------
  const behaviorScore = behaviorAnswers?.reduce((sum, val) => sum + (val + 1), 0) || 0;
  const behaviorMax = (behaviorAnswers?.length || 0) * 5;
  const behaviorPercent = behaviorMax ? (behaviorScore / behaviorMax) * 100 : 0;

  const chartData = [
    { name: 'Knowledge', score: ((knowledgeScore / knowledgeMax) * 100).toFixed(1) },
    { name: 'Device', score: totalDeviceScore.toFixed(1) },
    { name: 'Behavior', score: behaviorPercent.toFixed(1) },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">보안 인식 결과 / Security Awareness Result</h1>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 100]} />
          <Tooltip formatter={(value) => `${value}%`} />
          <Bar dataKey="score" fill="#3182CE" />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold">📘 지식 영역 (Knowledge)</h2>
          <p>정답 점수: {knowledgeScore} / {knowledgeMax}</p>
          <p>정답률: {((knowledgeScore / knowledgeMax) * 100).toFixed(1)}%</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">💻 기기 영역 (Device)</h2>
          <p>문제 점수: {deviceScore} / {deviceMax}</p>
          <p>보유 인증 기기 수: {certifiedOwned.length}개 (가산점: {deviceBonus}점)</p>
          <p>최종 Device 점수: {totalDeviceScore.toFixed(1)}%</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">🧠 행동/호기심 영역 (Behavior/Curiosity)</h2>
          <p>응답 합계: {behaviorScore} / {behaviorMax}</p>
          <p>점수율: {behaviorPercent.toFixed(1)}%</p>
        </div>
      </div>

      <div className="mt-6 text-lg font-bold">
        총합 기반의 개별 분석은 추후 제공 예정입니다.
      </div>
    </div>
  );
}
