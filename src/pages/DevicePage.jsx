import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import QuestionCard from './QuestionCard';

export default function DevicePage() {
  const [questions, setQuestions] = useState([]);
  const [devices, setDevices] = useState([]);
  const [ownedDevices, setOwnedDevices] = useState([]);
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

  const handleSubmit = (answers) => {
    navigate('/curiosity', {
      state: {
        knowledgeAnswers,
        knowledgeQuestions,
        deviceAnswers: answers,
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
      {questions.length === 0 ? (
        <div>문항을 불러오는 중입니다...</div>
      ) : (
        <QuestionCard questions={questions} onSubmit={handleSubmit} />
      )}

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-2">보유 기기 선택</h2>

        <div className="mb-2">
          <label className="block mb-1">카테고리:</label>
          <select value={selectedCategory} onChange={e => {
            setSelectedCategory(e.target.value);
            setSelectedMaker('');
            setSelectedProduct('');
          }} className="border p-2 w-full">
            <option value="">선택하세요</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {selectedCategory && (
          <div className="mb-2">
            <label className="block mb-1">메이커:</label>
            <select value={selectedMaker} onChange={e => {
              setSelectedMaker(e.target.value);
              setSelectedProduct('');
            }} className="border p-2 w-full">
              <option value="">선택하세요</option>
              {uniqueMakers.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        )}

        {selectedMaker && (
          <div className="mb-2">
            <label className="block mb-1">제품:</label>
            <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} className="border p-2 w-full">
              <option value="">선택하세요</option>
              {products.map(p => <option key={p.product} value={p.product}>{p.product}</option>)}
            </select>
          </div>
        )}

        <button onClick={() => {
          if (selectedProduct && !ownedDevices.includes(selectedProduct)) {
            setOwnedDevices([...ownedDevices, selectedProduct]);
          }
        }} className="px-4 py-2 bg-green-600 text-white rounded-lg mt-2">기기 추가</button>

        {ownedDevices.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">선택한 기기:</h3>
            <ul className="list-disc list-inside">
              {ownedDevices.map((dev, idx) => (
                <li key={idx} className="flex justify-between items-center">
                  {dev}
                  <button onClick={() => setOwnedDevices(ownedDevices.filter(d => d !== dev))} className="ml-4 text-red-500 text-sm">삭제</button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
