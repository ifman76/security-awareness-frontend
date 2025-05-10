import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ParticipantInfoPage() {
  const navigate = useNavigate();

  const [ageGroup, setAgeGroup] = useState('');
  const [gender, setGender] = useState('');
  const [occupation, setOccupation] = useState('');
  const [aiExperience, setAiExperience] = useState(null);
  const [selfAssessment, setSelfAssessment] = useState(null);

  const handleSubmit = () => {
    if (!ageGroup || !gender || !occupation || aiExperience === null || selfAssessment === null) {
      alert('모든 항목을 입력해 주세요. / Please complete all required fields.');
      return;
    }

    const participantInfo = {
      ageGroup,
      gender,
      occupation,
      aiExperience,
      selfAssessment,
    };

    navigate('/knowledge', { state: { participantInfo } });
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-xl rounded-xl p-6">
        <h1 className="text-xl font-bold mb-6 text-center">참여자 정보 입력 / Participant Information</h1>

        {/* 연령대 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">연령대 / Age Group</label>
          <select
            value={ageGroup}
            onChange={(e) => setAgeGroup(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="">선택하세요 / Select</option>
            <option value="10s">10대 / Teens (10~19)</option>
            <option value="20s">20대 / 20s</option>
            <option value="30s">30대 / 30s</option>
            <option value="40s">40대 / 40s</option>
            <option value="50s">50대 / 50s</option>
            <option value="60s+">60대 이상 / 60+</option>
          </select>
        </div>

        {/* 성별 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">성별 / Gender</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="">선택하세요 / Select</option>
            <option value="male">남성 / Male</option>
            <option value="female">여성 / Female</option>
            <option value="other">기타 / Other</option>
          </select>
        </div>

        {/* 직업군 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">직업군 / Occupation</label>
          <select
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="">선택하세요 / Select</option>
            <option value="student">학생 / Student</option>
            <option value="public">공공기관 종사자 / Public Sector</option>
            <option value="it">IT/보안 종사자 / IT & Security</option>
            <option value="office">일반 사무직 / Office Worker</option>
            <option value="service">제조/서비스업 / Manufacturing & Service</option>
            <option value="freelance">프리랜서/자영업 / Freelance or Self-employed</option>
            <option value="none">무직/기타 / None or Other</option>
          </select>
        </div>

        {/* AI 사용 경험 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">생성형 AI 사용 경험 / Experience with Generative AI</label>
          <div className="space-x-4 text-sm">
            <label>
              <input
                type="radio"
                name="aiExperience"
                value="yes"
                checked={aiExperience === 'yes'}
                onChange={() => setAiExperience('yes')}
                className="mr-1"
              />
              예 / Yes
            </label>
            <label>
              <input
                type="radio"
                name="aiExperience"
                value="no"
                checked={aiExperience === 'no'}
                onChange={() => setAiExperience('no')}
                className="ml-4 mr-1"
              />
              아니오 / No
            </label>
          </div>
        </div>

        {/* 자기평가 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">본인의 보안 인식 수준 (1~5점 자기평가) / Your own security awareness level (1~5)</label>
          <div className="space-x-2 text-sm">
            {[1, 2, 3, 4, 5].map((val) => (
              <label key={val}>
                <input
                  type="radio"
                  name="selfAssessment"
                  value={val}
                  checked={selfAssessment === val}
                  onChange={() => setSelfAssessment(val)}
                  className="mr-1"
                />
                {val}
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
        >
          다음 / Next
        </button>
      </div>
    </div>
  );
}
