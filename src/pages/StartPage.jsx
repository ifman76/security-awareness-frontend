import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function StartPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Knowledge 질문 미리 받아오기
    fetch('https://security-awareness-api.onrender.com/questions?section=Knowledge')
      .then(res => res.json())
      .then(data => {
        localStorage.setItem('cachedKnowledgeQuestions', JSON.stringify(data));
        console.log('✅ Knowledge 질문 미리 캐싱 완료');
      })
      .catch(err => console.error('❌ Knowledge 질문 캐싱 실패:', err));
  }, []);

    const handleStart = () => {
      navigate('/info');
    };


  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-gray-50">
      <div className="bg-white shadow-xl rounded-2xl p-6 max-w-md mx-auto text-center">
        <h1 className="text-xl font-bold mb-4">귀하의 보안인식 수준을 측정합니다</h1>
        <p className="text-base text-gray-700 leading-relaxed mb-2">
          이 실험은 생성형 AI 시대의 보안 인식 수준을 평가하기 위한 것입니다.
        </p>
        <p className="text-base text-gray-700 leading-relaxed mb-2">
          총 3개의 영역(지식, 기기, 호기심) 24문항을 측정하며, 예상 소요시간은 5분입니다.
        </p>
        <p className="text-sm text-gray-500 mt-4">
          It evaluates three key areas: Knowledge, Device Ownership, and Curiosity.
        </p>
        <p className="text-sm text-gray-500">
          It measures 24 questions and takes an estimated 5 minutes to complete.
        </p>

        <button
          onClick={handleStart}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-base font-semibold"
        >
          시작하기 / Start
        </button>
      </div>
    </div>
  );
}