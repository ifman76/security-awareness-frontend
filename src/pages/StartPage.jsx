// 실험 시작 안내 페이지 코드
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function StartPage() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/participant-info'); // 다음 페이지로 이동
  };

  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">보안 인식수준 측정을 위한 페이지입니다 / Page for measuring your security awareness</h1>
      <p className="mb-6">
        이 실험은 생성형 AI 시대의 보안 인식 수준을 평가하기 위한 것입니다. 총 3개의 영역(지식, 기기, 행동/호기심)을 측정합니다.
        / This experiment aims to assess the level of security awareness in the era of generative AI. It measures three domains: knowledge, devices, and behavior/curiosity.
      </p>
      <button
        onClick={handleStart}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        시작하기 / Start
      </button>
    </div>
  );
}