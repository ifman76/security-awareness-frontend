import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import QuestionCard from './QuestionCard';

export default function DevicePage() {
  const [questions, setQuestions] = useState([]);
  const [devices, setDevices] = useState([]);
  const [ownedDevices, setOwnedDevices] = useState([]);
  const [deviceAnswers, setDeviceAnswers] = useState([]);
  const [surveyDone, setSurveyDone] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMaker, setSelectedMaker] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  const knowledgeAnswers = location.state?.knowledgeAnswers;
  const knowledgeQuestions = location.state?.knowledgeQuestions;

  useEffect(() => {
    fetch('https://security-awareness-api.onrender.com/questions')
      .then(res => res.json())
      .then(data => {
        const deviceQuestions = data.filter(q => q.section === 'Device');

        const grouped = {
          GPT_Low: [], GPT_Medium: [], GPT_High: [],
          Human_Low: [], Human_Medium: [], Human_High: []
        };

        deviceQuestions.forEach(q => {
          const key = `${q.source}_${q.difficulty}`;
          if (grouped[key]) grouped[key].push(q);
        });

        const getRandom = (arr, n) => arr.sort(() => 0.5 - Math.random()).slice(0, n);

        const selected = [
          ...getRandom(grouped.GPT_Low, 1),
          ...getRandom(grouped.GPT_Medium, 2),
          ...getRandom(grouped.GPT_High, 1),
          ...getRandom(grouped.Human_Low, 1),
          ...getRandom(grouped.Human_Medium, 2),
          ...getRandom(grouped.Human_High, 1)
        ];

        setQuestions(selected);
      })
      .catch(err => console.error("문항 로딩 실패", err));

    fetch('https://security-awareness-api.onrender.com/certified-devices')
      .then(res => res.json())
      .then(data => setDevices(data))
      .catch(err => console.error("기기 데이터 로딩 실패", err));
  }, []);

  const handleSurveyComplete = (answers) => {
    setDeviceAnswers(answers);
    setSurveyDone(true);
  };

const handleFinalSubmit = async () => {
  const participant = JSON.parse(localStorage.getItem('participant'));

  // ✅ responses 저장
  try {
    await fetch('https://security-awareness-api.onrender.com/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        participant_id: participant.id,
        section: 'Device',
        answers: deviceAnswers,
      }),
    });
  } catch (err) {
    console.error('❌ Device 응답 저장 실패:', err);
  }

  // ✅ 다음 페이지 이동
  navigate('/curiosity', {
    state: {
      knowledgeAnswers,
      knowledgeQuestions,
      deviceAnswers,
      deviceQuestions: questions,
      ownedDevices,
      certifiedDevices: devices,
    },
  });
};


  const categories = [...new Set(devices.map(d => d.category))];
  const makers = devices.filter(d => d.category === selectedCategory).map(d => d.maker);
  const uniqueMakers = [...new Set(makers)];
  const products = devices.filter(d => d.category === selectedCategory && d.maker === selectedMaker);

  return (
    <div className="p-6">
      {!surveyDone ? (
        questions.length === 0 ? (
          <div>문항을 불러오는 중입니다.../ please wait ..</div>
        ) : (
          <QuestionCard questions={questions} onSubmit={handleSurveyComplete} />
        )
      ) : (
        <div className="mt-10 max-w-md mx-auto bg-white shadow-2xl border border-gray-200 rounded-2xl p-6 transition-all">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">보유 기기 선택 / Owned Device Selection</h2>

          <p className="text-sm text-gray-600 mb-3">
            소유하고 있는 기기를 선택해 주세요. 이 정보는 보안인식 수준 평가에 반영되며, 원치 않을 경우 '선택하지 않음' 버튼을 선택하실 수 있습니다.
          </p>
          <p className="text-sm text-gray-600 mb-6">
            Please select the devices you currently own. This information will be used to assess your security awareness level. If you prefer not to answer, you may select the "Do not select" button.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">카테고리 / Category:</label>
              <select value={selectedCategory} onChange={e => {
                setSelectedCategory(e.target.value);
                setSelectedMaker('');
                setSelectedProduct('');
              }} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option value="">선택하세요 / Please select</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {selectedCategory && (
              <div>
                <label className="block text-sm font-medium mb-1">메이커 / Maker:</label>
                <select value={selectedMaker} onChange={e => {
                  setSelectedMaker(e.target.value);
                  setSelectedProduct('');
                }} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option value="">선택하세요 / Please select</option>
                  {uniqueMakers.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            )}

            {selectedMaker && (
              <div>
                <label className="block text-sm font-medium mb-1">제품 / Product:</label>
                <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option value="">선택하세요 / Please select</option>
                  {products.map(p => <option key={p.product} value={p.product}>{p.product}</option>)}
                </select>
              </div>
            )}

            <button
              onClick={() => {
                if (selectedProduct && !ownedDevices.includes(selectedProduct)) {
                  setOwnedDevices([...ownedDevices, selectedProduct]);
                }
              }}
              className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition"
            >
              기기 추가 / Add device
            </button>

            {ownedDevices.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 text-gray-800">선택한 기기 / Selected Device:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  {ownedDevices.map((dev, idx) => (
                    <li key={idx} className="flex justify-between items-center">
                      {dev}
                      <button onClick={() => setOwnedDevices(ownedDevices.filter(d => d !== dev))} className="ml-4 text-red-500 text-xs hover:underline">삭제</button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => {
                  setOwnedDevices([]);
                  handleFinalSubmit();
                }}
                className="flex-1 py-2 px-4 bg-gray-400 hover:bg-gray-500 text-white rounded-lg text-sm"
              >
                선택하지 않음 / Do not Select
              </button>

              <button
                onClick={handleFinalSubmit}
                className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
              >
                다음 / Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
