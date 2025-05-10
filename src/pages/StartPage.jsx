import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function StartPage() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/info');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-red-500">

    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-gray-50">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-lg p-6 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 leading-snug">
          보안 인식수준 측정 페이지입니다
        </h1>
        <p className="text-sm text-gray-500 mb-4">
          Page for measuring your security awareness
        </p>
        <p className="text-base sm:text-lg leading-relaxed text-gray-700 mb-6">
          이 실험은 생성형 AI 시대의 보안 인식 수준을 평가하기 위한 것입니다.
          <br />
          <span className="text-sm text-gray-500">
            This experiment aims to assess your security awareness in the era of Generative AI.
          </span>
          <br />
          총 3개의 영역(지식, 기기, 행동/호기심)을 측정합니다.
          <br />
          <span className="text-sm text-gray-500">
            It evaluates three key areas: Knowledge, Device Ownership, and Curiosity/Behavior.
          </span>
        </p>
        <button
          onClick={handleStart}
          className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-semibold shadow"
        >
          시작하기 / Start
        </button>
      </div>
    </div>
  );
}
