// 각 문항 객체: { question, Choice1~4, correctAnswer }

export function calculateKnowledgeScore(answers, questions) {
  if (!answers || !questions || answers.length !== questions.length) return 0;

  let correctCount = 0;

  answers.forEach((ans, i) => {
    if (ans === questions[i].correctAnswer) {
      correctCount += 1;
    }
  });

  return (correctCount / questions.length) * 100;
}

export function calculateDeviceScore(answers, questions) {
  // 현재 구조에서는 객관식 문항 기반 채점 방식 동일
  return calculateKnowledgeScore(answers, questions);
}

export function calculateBehaviorScore(answers, questions) {
  // 리커트 척도 점수: ex. 0~4점 또는 1~5점 척도 기준
  if (!answers || answers.length === 0) return 0;

  // 질문당 최대 점수 추정
  const maxPerQuestion = 4; // 0~4 또는 1~5 기준이면 4
  const totalScore = answers.reduce((sum, val) => sum + val, 0);
  const maxScore = answers.length * maxPerQuestion;

  return (totalScore / maxScore) * 100;
}

export function calculateFinalScore(knowledge, device, behavior) {
  return ((knowledge + device + behavior) / 3);
}
