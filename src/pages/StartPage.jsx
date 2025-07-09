import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function StartPage() {
  const navigate = useNavigate();
  const [alreadyParticipated, setAlreadyParticipated] = useState(false);

  // 

  useEffect(() => {
    // 이미 참여한 경우 홈 또는 안내 페이지로 리디렉션
    const participated = localStorage.getItem('hasParticipated') === 'true';
    if (participated) {
      alert('이미 참여하셨습니다. 재참여는 제한됩니다. You have already participated. Re-participation is restricted.');
      //navigate('/');  // 또는 안내용 '/already-participated'
      setAlreadyParticipated(true);
      return;
    }

    // Knowledge 질문 미리 받아오기
    fetch('https://security-awareness-api.onrender.com/questions?section=Knowledge')
      .then(res => res.json())
      .then(data => {
        localStorage.setItem('cachedKnowledgeQuestions', JSON.stringify(data));
        //console.log('✅ Knowledge 질문 미리 캐싱 완료');
      })
      .catch(err => console.error('❌ Knowledge 질문 캐싱 실패:', err));
  }, []);

  // 2. 시작 버튼 → 참여 상태 기록
  const handleStart = () => {
    if (alreadyParticipated) return;
    localStorage.setItem('hasParticipated', 'true');  // 참여 기록 남김
    navigate('/info');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-gray-50">
      <div className="bg-white shadow-xl rounded-2xl p-6 max-w-md mx-auto text-center">
        <h1 className="text-xl font-bold mb-4">귀하의 보안인식 수준을 측정합니다</h1>
        <p className="text-base text-gray-700 leading-relaxed mb-2">
          이 실험은 생성형 AI 시대의 보안인식 수준을 측정하기 위한 것입니다.
          3개의 영역(지식, 기기, 호기심)에서 총24문항을 측정하며, 
           <span className="text-blue-600 font-semibold">예상 소요시간은 5분</span>입니다.
        </p>
        
        <p className="text-base text-gray-700 leading-relaxed mb-2">
          본 실험에서 개인정보는 수집하지 않으며,<p></p> 
          입력하신 결과는 실험용도 외 사용되지 않습니다.
        </p>
        <p className="text-sm text-gray-500 mt-4">
          It evaluates three key areas: Knowledge, Device Ownership, and Curiosity.
          It measures 24 questions and takes an estimated 5 minutes to complete.
        </p>
        <p className="text-sm text-gray-500">
          No personal information will be collected in this experiment, and the results you enter will not be used for any purpose other than the experiment.
        </p>

        <button
          onClick={handleStart}
          disabled={alreadyParticipated}
          className={`mt-6 w-full py-3 rounded-lg text-base font-semibold ${
            alreadyParticipated
              ? 'bg-gray-300 cursor-not-allowed text-gray-600'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {alreadyParticipated ? '이미 참여 완료됨 / Already participated' : '시작하기 / Start'}
        </button>
      </div>
    </div>
  );
}