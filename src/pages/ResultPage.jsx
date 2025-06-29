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

 const getWeightedScore = (answers, questions) => {
    if (!answers || !questions || questions.length === 0) return { score: 0, correct: 0, total: 0 };

    const difficultyWeight = {
      Low: 1,
      Medium: 2,
      High: 3
    };

    let weightedCorrect = 0;
    let weightedTotal = 0;
    let correct = 0;

    answers.forEach((a, idx) => {
      const q = questions[idx];
      const weight = difficultyWeight[q.difficulty?.trim()] || 1;
      weightedTotal += weight;
      if (a + 1 === q.answer_index) {
        weightedCorrect += weight;
        correct++;
      }
    });

    const score = Math.round((weightedCorrect / weightedTotal) * 100);
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
    getWeightedScore(knowledgeAnswers, knowledgeQuestions);
  const { score: deviceScore, correct: deviceCorrect, total: deviceTotal } =
    getWeightedScore(deviceAnswers, deviceQuestions);
  const behaviorScore = getCuriosityScore(behaviorAnswers, behaviorQuestions);

  // ✅ 인증기기 보유 여부 → 보너스 점수 계산
  // 🔧 문자열 정규화 함수: 공백 제거 + 소문자화


  const normalize = (str) =>
    typeof str === 'string' ? str.toLowerCase().replace(/[\s\-()]/g, '').trim() : '';

  const matchedDevices = ownedDevices?.filter(od =>
    certifiedDevices?.some(cd => normalize(cd) === normalize(od))
  ) || [];

  console.log("🎯 ownedDevices:", ownedDevices);
  console.log("🎯 certifiedDevices:", certifiedDevices);
  console.log("🧪 normalize(owned):", ownedDevices.map(normalize));
  console.log("🧪 normalize(certified):", certifiedDevices.map(normalize));
  console.log("✅ matchedDevices:", matchedDevices);

  console.log("🎯 ownedDevices:", ownedDevices);
  console.log("🎯 certifiedDevices (products):", certifiedDevices.map(cd => cd));
  console.log("✅ matchedDevices:", matchedDevices);

  const bonusScore = matchedDevices.length > 0 ? 5 : 0;
  // ✅ 각 점수 가중치 반영 (Knowledge: 40, Device: 40, Curiosity: 20)
  const weightedKnowledge = Math.round((knowledgeScore / 100) * 40);
  const weightedDevice = Math.round((deviceScore / 100) * 40);
  const weightedBehavior = Math.round((behaviorScore / 100) * 20);

  // ✅ 최종 점수 계산 (보너스 포함)
  const totalScore = weightedKnowledge + weightedDevice + weightedBehavior + bonusScore;


  
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

    console.log('📌 ResultPage에서 질문 객체:', knowledgeQuestions?.[0]);

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
        knowledgeScore: weightedKnowledge,
        deviceScore: weightedDevice,
        behaviorScore: weightedBehavior,
        bonusScore,
        totalScore,
        ownedDevices: ownedDevices?.join(', ') || '',
        matchedCertifiedDevices: matchedDevices?.join(', ') || '',
        timestamp: new Date().toISOString()
      })
    }).then(res => {
      if (res.ok) {
        console.log('✅ 점수 저장 완료');
      } else {
        console.error('❌ 점수 저장 실패');
      }
    }).catch(err => console.error('❌ 점수 저장 오류:', err));

   


    // ✅ 2. 응답 저장------------------------------------
    const saveResponses = async () => {
      const responses = [];

      const sections = [
        { name: 'Knowledge', questions: knowledgeQuestions, answers: knowledgeAnswers },
        { name: 'Device', questions: deviceQuestions, answers: deviceAnswers },
        { name: 'Behavior', questions: behaviorQuestions, answers: behaviorAnswers }
      ];

      sections.forEach(({ name, questions, answers }) => {
        answers?.forEach((ans, idx) => {
          const q = questions?.[idx];
          if (!q || typeof ans !== 'number' || isNaN(ans)) return;

          const selectedChoice = ans + 1; // 1~5

          const item = {
            participant_id: participantId,
            section: name,
            no: q.no || q.id || `Q-${idx + 1}`,
            answer: selectedChoice,  // ✅ 정답이 아니라 응답 선택 번호
            timestamp: new Date().toISOString()
          };

          if (typeof q.answer_index === 'number') {
            item.answer_index = q.answer_index;
          }
          console.log("🔍 개별 응답:", item);  
          responses.push({
            participant_id: participantId,
            section: name,
            no: q.no || q.id || `Q-${idx + 1}`,
            answer: Number(ans + 1),
            timestamp: new Date().toISOString(),
            ...(typeof q.answer_index === 'number' ? { answer_index: q.answer_index } : {})
          });
        });
      });

      // ✅ 응답 수집 후 누락된 항목 확인
      responses.forEach((r, i) => {
        if (!r.no || typeof r.answer !== 'number') {
          console.warn(`⚠️ ${i + 1}번 응답 누락 또는 오류 - no: ${r.no}, answer: ${r.answer}`);
        }
      });

      console.log("📦 최종 responses 전송 데이터:", JSON.stringify(responses, null, 2));

      try {
        console.log("📦 전송될 payload:", JSON.stringify({ responses }, null, 2));
        const res = await fetch('https://security-awareness-api.onrender.com/responses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ responses })
        });
        if (res.ok) {
          console.log('✅ responses 저장 완료');
        } else {
          const errText = await res.text();
          console.error('❌ responses 저장 실패:', res.status, errText);
        }
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
        {bonusScore > 0 && (
          <p className="text-sm text-gray-500 mt-1">
            보너스 점수 +{bonusScore} (인증 기기 보유: {matchedDevices.join(', ')})
          </p>
        )}
      </div>

      {/* 레이더 차트 */}
      <div className="bg-white shadow-xl rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-2">Radar Chart</h2>
        <div className="mt-4">
          <img
            src={`https://quickchart.io/chart?c={
              type:'radar',
              data:{
                labels:['Knowledge (40)', 'Device (40)', 'Curiosity (20)'],
                datasets:[{
                  label:'Score',
                  data:[${weightedKnowledge},${weightedDevice},${weightedBehavior}],
                  backgroundColor:'rgba(255, 99, 132, 0.2)',
                  borderColor:'rgb(255, 99, 132)'
                }]
              },
              options: {
                scales: {
                  r: {
                    suggestedMax: 40
                  }
                }
              }
            }`}
            alt="Radar Chart"
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
        <h2 className="text-lg font-semibold mb-3">종료</h2>
        <p className="text-sm text-gray-700">
          설문이 종료되었습니다. 참여해주셔서 감사합니다.
        </p>
      </div>
    </div>
  );
}
