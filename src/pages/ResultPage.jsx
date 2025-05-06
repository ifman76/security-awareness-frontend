import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  calculateKnowledgeScore,
  calculateDeviceScore,
  calculateBehaviorScore,
  calculateFinalScore,
} from '../utils/scoring';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export default function ResultPage() {
  const location = useLocation();
  const {
    knowledgeAnswers,
    knowledgeQuestions,
    deviceAnswers,
    deviceQuestions,
    behaviorAnswers,
    behaviorQuestions,
    participantInfo,
  } = location.state || {};

  const knowledge = calculateKnowledgeScore(knowledgeAnswers, knowledgeQuestions);
  const device = calculateDeviceScore(deviceAnswers, deviceQuestions);
  const behavior = calculateBehaviorScore(behaviorAnswers, behaviorQuestions);
  const finalScore = calculateFinalScore(knowledge, device, behavior);

  const chartData = {
    labels: ['Knowledge', 'Device', 'Behavior / Curiosity'],
    datasets: [
      {
        label: 'Security Awareness Score',
        data: [knowledge, device, behavior],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
        },
        pointLabels: {
          font: {
            size: 14,
          },
        },
      },
    },
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">결과 요약 / Final Summary</h2>

      <Radar data={chartData} options={chartOptions} className="mb-6" />

      <ul className="mb-6 space-y-2 text-lg">
        <li><strong>Knowledge:</strong> {knowledge.toFixed(1)} / 100</li>
        <li><strong>Device:</strong> {device.toFixed(1)} / 100</li>
        <li><strong>Behavior / Curiosity:</strong> {behavior.toFixed(1)} / 100</li>
        <li className="font-bold text-xl mt-2">Total Score: {finalScore.toFixed(1)} / 100</li>
      </ul>

      <h3 className="text-xl font-semibold mb-2">참여자 정보 / Participant Info</h3>
      <ul className="space-y-1 text-base">
        <li><strong>연령대 / Age Group:</strong> {participantInfo?.ageGroup}</li>
        <li><strong>성별 / Gender:</strong> {participantInfo?.gender}</li>
        <li><strong>직업군 / Occupation:</strong> {participantInfo?.occupation}</li>
        <li><strong>생성형 AI 사용 경험 / AI Experience:</strong> {participantInfo?.aiExperience === 'yes' ? 'Yes / 예' : 'No / 아니오'}</li>
        <li><strong>보안 자기평가 (1~5) / Self-rated Security Awareness:</strong> {participantInfo?.selfAssessment}</li>
      </ul>
    </div>
  );
}
