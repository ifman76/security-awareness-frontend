// utils/getRandomQuestions.js

/**
 * 주어진 조건에 따라 문제 풀에서 필터링 후 무작위로 n개 추출
 * 
 * @param {Array} pool - 전체 문제 pool
 * @param {string} domain - 문제 도메인 ('Knowledge', 'Device', 'Behavior/Curiocity')
 * @param {string} difficulty - 난이도 ('Low', 'Medium', 'High')
 * @param {string} source - 출처 ('GPT', 'Human')
 * @param {number} count - 추출할 문항 수
 * @returns {Array} - 필터링 후 무작위로 선택된 문제 배열
 */
export function getFilteredQuestions(pool, domain, difficulty, source, count) {
  if (!Array.isArray(pool)) throw new Error('문제 pool은 배열이어야 합니다.');
  if (!domain || !difficulty || !source) throw new Error('필터 조건이 누락되었습니다.');
  if (typeof count !== 'number' || count <= 0) return [];

  // 필터링
  const filtered = pool.filter(q =>
    q.domain === domain &&
    q.difficulty === difficulty &&
    q.source === source
  );

  if (filtered.length === 0) {
    console.warn(`조건에 맞는 문항이 없습니다: [${domain}, ${difficulty}, ${source}]`);
    return [];
  }

  // 무작위 셔플 후 n개 추출
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
