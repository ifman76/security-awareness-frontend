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

  const ownedNormalized = (ownedDevices || []).map(normalize);


  // certifiedDevices가 객체 형태일 경우 product 이름만 추출
  const certifiedProductNames = (certifiedDevices || []).map(cd => {
    return typeof cd === 'string' ? cd : cd.product || '';
  });
  const certifiedNormalized = certifiedProductNames.map(normalize);


  const matchedDevices = (ownedDevices || []).map(normalize).filter(od =>
    certifiedNormalized.includes(od)
  );

  //console.log("✅ normalizedOwnedDevices:", ownedNormalized);
  //console.log("✅ normalizedCertifiedDevices:", certifiedNormalized);
  //console.log("✅ matchedDevices:", matchedDevices);

  const bonusScore = matchedDevices.length > 0 ? 5 : 0;

  // ✅ 각 점수 가중치 반영 (Knowledge: 40, Device: 40, Curiosity: 20)
  const weightedKnowledge = Math.round((knowledgeScore / 100) * 40);
  const weightedDevice = Math.round((deviceScore / 100) * 40);
  const weightedBehavior = Math.round((behaviorScore / 100) * 20);

  // ✅ 최종 점수 계산 (보너스 포함)
  const totalScore = weightedKnowledge + weightedDevice + weightedBehavior + bonusScore;

  const percentKnowledge = (weightedKnowledge / 40) * 100;
  const percentDevice = (weightedDevice / 40) * 100;
  const percentBehavior = (weightedBehavior / 20) * 100;

  const getOverallRating = (score) => {
    if (score >= 90) return { stars: '★★★★☆', comment: '매우 우수한 보안 인식 수준입니다.' };
    if (score >= 70) return { stars: '★★★☆☆', comment: '양호한 보안 인식이지만, 개선할 여지가 있습니다.' };
    if (score >= 50) return { stars: '★★☆☆☆', comment: '보안 인식이 다소 부족합니다. 학습이 필요합니다.' };
    return { stars: '★☆☆☆☆', comment: '보안에 취약합니다. 반드시 교육이 필요합니다.' };
  };

  const overall = getOverallRating(totalScore);

  const getKnowledgeInterpretation = (score) => {
    if (score >= 31) return '이론적인 보안 지식이 매우 우수하며, 다양한 상황에 대응할 수 있습니다.';
    if (score >= 21) return '기초적인 보안 개념은 이해하고 있으나 실제 응용에는 개선이 필요합니다.';
    return '보안 기본 개념에 대한 이해가 부족합니다. 추가적인 교육이 요구됩니다.';
  };

  const getDeviceInterpretation = (score) => {
    if (score >= 31) return '기기 선택 시 보안 인증 여부까지 고려하는 수준입니다.';
    if (score >= 21) return '보안에 대한 인식이 있지만 일부 취약한 기기를 사용할 수 있습니다.';
    return '기기 보안에 대한 인식이 낮습니다. 인증 여부를 고려하는 습관이 필요합니다.';
  };

  const getCuriosityInterpretation = (score) => {
    if (score >= 16) return '보안과 기술에 대해 적극적으로 탐구하고 실천하려는 경향이 있습니다.';
    if (score >= 11) return '보안에 대한 평균적인 관심을 보이며, 상황에 따라 경각심을 가질 수 있습니다.';
    return '보안 경고나 기술 변화에 무관심할 수 있으며, 적극적인 학습이 필요합니다.';
  };


  const chartConfig = {
    type: 'radar',
    data: {
      labels: ['Knowledge (40)', 'Device (40)', 'Curiosity (20)'],
      datasets: [{
        label: 'Score',
        data: [weightedKnowledge, weightedDevice, weightedBehavior],
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgb(255, 99, 132)'
      }]
    },
    options: {
      scales: {
        r: {
          suggestedMax: 40
        }
      }
    }
  };

  const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}`;
  
  useEffect(() => {
    const participant = JSON.parse(localStorage.getItem('participant')) || {};
    const participantId = participant.id;

      if (!participantId || !knowledgeAnswers || !deviceAnswers || !behaviorAnswers) {
        console.warn('❌ 저장 중단: 데이터가 아직 준비되지 않음');
        return;
      }

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

    //console.log('📌 ResultPage에서 질문 객체:', knowledgeQuestions?.[0]);

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
        //console.log('✅ 점수 저장 완료');
      } else {
        //console.error('❌ 점수 저장 실패');
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
          const choices = [q.choice1, q.choice2, q.choice3, q.choice4, q.choice5].filter(Boolean);

          // O/X 문항인 경우 강제로 보기 구성
          if (choices.length === 0 && q.type === 'O/X') {
            choices.push('O', 'X');
          }

          // 다양한 입력값을 인덱스로 변환
          let choiceIndex = null;

          if (typeof ans === 'number' && !isNaN(ans)) {
            choiceIndex = ans;
          } else if (typeof ans === 'string' && !isNaN(Number(ans))) {
            choiceIndex = Number(ans);
          } else if (typeof ans === 'boolean') {
            choiceIndex = ans ? 1 : 0;
          }

          // 유효하지 않은 응답이면 로그 출력 후 저장 생략
          if (choiceIndex === null || choiceIndex < 0 || choiceIndex >= choices.length) {
            console.warn(`⚠️ 유효하지 않은 응답 - section=${name}, idx=${idx}, ans=${ans}, choices=${choices}`);
            return;
          }

          // 선택한 보기 텍스트 추출
          const selectedText = choices[choiceIndex];

          // 응답 저장
          responses.push({
            participant_id: participantId,
            section: name,
            no: q.no || q.id || `Q-${idx + 1}`,
            answer: selectedText,  // ⬅️ 보기 텍스트 저장
            timestamp: new Date().toISOString(),
            ...(typeof q.answer_index === 'number' ? { answer_index: q.answer_index } : {})
          });
        });
      });

      // ✅ 응답 수집 후 누락된 항목 확인
      responses.forEach((r, i) => {
        if (!r.no || typeof r.answer !== 'number') {
          //console.warn(`⚠️ ${i + 1}번 응답 누락 또는 오류 - no: ${r.no}, answer: ${r.answer}`);
        }
      });

      //console.log("📦 최종 responses 전송 데이터:", JSON.stringify(responses, null, 2));

      try {
        //console.log("📦 전송될 payload:", JSON.stringify({ responses }, null, 2));
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
      {/* 총평 */}
      <div className="bg-white shadow-xl rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-3">설문이 종료되었습니다. 참여해주셔서 감사합니다.</h2>
  
      </div>

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

      <div className="bg-white shadow-xl rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-2">보안 인식 종합 평가</h2>
        <p className="text-2xl font-bold mb-1">{overall.stars}</p>
        <p className="text-gray-700">{overall.comment}</p>
      </div>

      {/* 레이더 차트 */}
      {/*
      <div className="bg-white shadow-xl rounded-2xl p-6 mb-6">

        <h2 className="text-lg font-semibold mb-2">Radar Chart</h2>
        <div className="mt-4">
          <img
            src={`https://quickchart.io/chart?c={
              type:'radar',
              data:{
                labels:['Knowledge','Device','Curiosity'],
                datasets:[{
                  label:'Score',
                  data:[${percentKnowledge},${percentDevice},${percentBehavior}],
                  backgroundColor:'rgba(255, 99, 132, 0.2)',
                  borderColor:'rgb(255, 99, 132)',
                  pointBackgroundColor:'rgb(255, 99, 132)'
                }]
              },
              options: {
                scales: {
                  r: {
                    suggestedMin: 0,
                    suggestedMax: 100,
                    ticks: {
                      stepSize: 20
                    }
                  }
                }
              }
            }`}
          />
        </div>
      </div>
     */}
      {/* 개별 점수 */}
      <h1 className="text-2xl font-bold mb-6 text-center">분야별 점수</h1>

      <div className="bg-white shadow-xl rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-2">Knowledge</h2>
        <p className="text-3xl font-bold text-blue-600">
          {weightedKnowledge} / 40점
        </p>
        <h2 className="text-lg font-semibold mb-2">Knowledge 해석</h2>
        <p className="text-sm text-gray-700">{getKnowledgeInterpretation(weightedKnowledge)}</p>
      </div>

      <div className="bg-white shadow-xl rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-2">Device</h2>
        <p className="text-3xl font-bold text-green-600">
         {weightedDevice} / 40점
        </p>
        <p className="text-sm text-gray-500 mt-2">
          보유 기기: {ownedDevices?.join(', ') || '선택 안함'}
        </p>
        <h2 className="text-lg font-semibold mb-2">Device 해석</h2>
        <p className="text-sm text-gray-700">{getDeviceInterpretation(weightedDevice)}</p>
      </div>

      <div className="bg-white shadow-xl rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-2">Curiosity</h2>
        <p className="text-3xl font-bold text-purple-600">
          {weightedBehavior} / 20점
        </p>
        <p className="text-sm text-gray-500 mt-2">리커트 5점 척도 기반 점수화</p>
        <h2 className="text-lg font-semibold mb-2">Curiosity 해석</h2>
        <p className="text-sm text-gray-700">{getCuriosityInterpretation(weightedBehavior)}</p>
      </div>

      
    </div>
  );
}
