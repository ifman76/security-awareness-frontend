import React, { useState } from 'react';

export default function QuestionCard({ questions, onSubmit }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const participant = JSON.parse(localStorage.getItem('participant')) || {};
  const participantId = participant.id || 'anonymous';


  const handleChoice = (choiceIndex) => {
    const updated = [...answers];
    updated[current] = choiceIndex;
    setAnswers(updated);

    const q = questions[current];

    // ✅ 보기 배열 생성 (객관식 또는 O/X)
    let choices = [];
    if (q.choice1 || q.choice2 || q.choice3 || q.choice4 || q.choice5) {
      choices = [q.choice1, q.choice2, q.choice3, q.choice4, q.choice5].filter(Boolean);
    } else if (q.type === 'O/X') {
      choices = ['O', 'X'];
    }

    const choiceText = choices[choiceIndex];

/*
    fetch("https://security-awareness-api.onrender.com/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        participant_id: participantId,
        section: q.section,
        question: q.question,
        answer: choiceText,
        answer_index: choiceIndex + 1
      })
    }).catch(err => console.error("응답 저장 실패:", err));
*/
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else {
      onSubmit(answers);
    }
  };

  const handleBack = () => {
    if (current > 0) {
      setCurrent(current - 1);
    }
  };

  const q = questions[current];

  let choices = [];
  if (q.choice1 || q.choice2 || q.choice3 || q.choice4 || q.choice5) {
    choices = [q.choice1, q.choice2, q.choice3, q.choice4, q.choice5].filter(Boolean);
  } else if (q.type === 'O/X') {
    choices = ['O', 'X'];
  }

  const progressPercent = Math.round(((current + 1) / questions.length) * 100);

  return (
    <div className="max-w-md mx-auto p-4 text-center">
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      <div className="bg-white shadow-2xl border border-gray-200 rounded-2xl p-6 transition-all">
        <div className="text-xs text-gray-500 mb-2">
          Q {current + 1} / {questions.length}
        </div>
        <p className="text-lg font-semibold text-gray-800 mb-6 whitespace-pre-line">
          {q.question}
        </p>

        <div className="space-y-3">
          {choices.map((choice, idx) => (
            <button
              key={idx}
              onClick={() => handleChoice(idx)}
              className={`w-full px-4 py-2 border rounded-xl transition-all duration-150 text-sm font-medium
                ${answers[current] === idx ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 hover:bg-blue-50'}`}
            >
              {choice}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-between items-center">
        <button
          onClick={handleBack}
          disabled={current === 0}
          className="text-sm text-gray-500 hover:text-gray-800 disabled:text-gray-300"
        >
          이전/Prev
        </button>

        <div className="text-xs text-gray-400">
          응답 완료 / Answer Completed : {answers.filter(a => a !== null).length} / {questions.length}
        </div>

        <button
          onClick={handleNext}
          disabled={answers[current] === null}
          className={`px-4 py-2 rounded-lg text-white text-sm font-medium 
            ${answers[current] === null ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {current === questions.length - 1 ? '제출/Submit' : '다음/Next'}
        </button>
      </div>
    </div>
  );
}
