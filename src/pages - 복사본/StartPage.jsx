// 실험 시작 안내 페이지 코드
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function StartPage() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/info'); // 다음 페이지로 이동
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 text-center bg-gray-50">
      <div className="max-w-xl w-full">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 leading-snug">
          보안 인식수준 측정 페이지입니다
          <br />
          <span className="text-sm text-gray-500">Page for measuring your security awareness</span>
        </h1>
        <p className="text-base sm:text-lg mb-6 leading-relaxed text-gray-700">
          이 실험은 생성형 AI 시대의 보안 인식 수준을 평가하기 위한 것입니다.
          총 3개의 영역(지식, 기기, 행동/호기심)을 측정합니다.
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