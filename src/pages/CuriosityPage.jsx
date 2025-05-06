import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function CuriosityPage() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const knowledgeAnswers = location.state?.knowledgeAnswers;
  const knowledgeQuestions = location.state?.knowledgeQuestions;
  const deviceAnswers = location.state?.deviceAnswers;
  const deviceQuestions = location.state?.deviceQuestions;

  useEffect(() => { 
    fetch('https://security-awareness-api.onrender.com/questions')
      .then((res) => res.json())
      .then((data) => {
        console.log("전체 수신된 문항 수:", data.length);

        const filtered = data.filter(q => q.section === 'Behavior/Curiocity');
        console.log("Behavior/Curiocity 문항 수:", filtered.length);
    
        filtered.forEach(q => {
          console.log(`[${q.source}_${q.difficulty}] ${q.question}`);
        });
        console.log("선택된 최종 문항 수:", selected.length);


        
        const filtered = data.filter(q => q.section === 'Behavior/Curiocity');

        const grouped = {
          GPT_Low: [],
          GPT_Medium: [],
          GPT_High: [],
          Human_Low: [],
          Human_Medium: [],
          Human_High: []
        };

        filtered.forEach(q => {
          const key = `${q.source}_${q.difficulty}`;
          if (grouped[key]) grouped[key].push(q);
        });

        const getRandom = (arr, n) => arr.sort(() => 0.5 - Math.random()).slice(0, n);

        const selected = [
          ...getRandom(grouped.GPT_Low, 1),
          ...getRandom(grouped.GPT_Medium, 1),
          ...getRandom(grouped.GPT_High, 1),
          ...getRandom(grouped.Human_Low, 1),
          ...getRandom(grouped.Human_Medium, 1),
          ...getRandom(grouped.Human_High, 1),
        ];

        setQuestions(selected);
        setAnswers(Array(selected.length).fill(null));
      })
      .catch((err) => console.error("문항 불러오기 실패:", err));
  }, []);

  const handleSelect = (questionIndex, choiceIndex) => {
    const updatedAnswers = [...answers];
    updatedAnswers[questionIndex] = choiceIndex;
    setAnswers(updatedAnswers);

    const q = questions[questionIndex];

    // 자동 보기 생성 대응
    let choices = [];
    if (q.choice1 || q.choice2 || q.choice3 || q.choice4 || q.choice5) {
      choices = [q.choice1, q.choice2, q.choice3, q.choice4, q.choice5].filter(Boolean);
    } else if (q.type === 'O/X') {
      choices = ['O', 'X'];
    }

    const choiceText = choices[choiceIndex];

    fetch("https://security-awareness-api.onrender.com/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        participant_id: "user001",
        section: q.section,
        question: q.question,
        answer: choiceText,
        answer_index: choiceIndex + 1
      }),
    }).catch(err => console.error("응답 저장 실패:", err));
  };

  const handleNext = () => {
    navigate('/result', {
      state: {
        knowledgeAnswers,
        knowledgeQuestions,
        deviceAnswers,
        deviceQuestions,
        behaviorAnswers: answers,
        behaviorQuestions: questions,
      },
    });
  };

  if (questions.length === 0) {
    return <div className="p-6">문항을 불러오는 중입니다...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Behavior / Curiosity Questions</h1>
      {questions.map((q, idx) => {
        let choices = [];
        if (q.choice1 || q.choice2 || q.choice3 || q.choice4 || q.choice5) {
          choices = [q.choice1, q.choice2, q.choice3, q.choice4, q.choice5].filter(Boolean);
        } else if (q.type === 'O/X') {
          choices = ['O', 'X'];
        }

        if (!choices.length) {
          console.warn(`⚠️ ${idx + 1}번 문항 보기 없음. 렌더링 생략`, q);
          return null;
        }

        return (
          <div key={idx} className="mb-4">
            <p className="font-semibold mb-2">{idx + 1}. {q.question}</p>
            <ul className="space-y-1">
              {choices.map((choice, cidx) => (
                <li key={cidx}>
                  <label className="cursor-pointer">
                    <input
                      type="radio"
                      name={`question-${idx}`}
                      value={cidx}
                      checked={answers[idx] === cidx}
                      onChange={() => handleSelect(idx, cidx)}
                      className="mr-2"
                    />
                    {choice}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
      <button
        onClick={handleNext}
        disabled={answers.includes(null)}
        className={`mt-6 px-6 py-2 rounded-lg text-white ${answers.includes(null) ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
      >
        결과 보기 / See Results
      </button>
    </div>
  );
}
