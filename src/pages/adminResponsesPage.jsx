const express = require('express');
const router = express.Router();
const db = require('../db');

// 모든 응답자 응답 불러오기
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        r.participant_id,
        r.section,
        r.question,
        r.answer_index,
        r.answer,
        q.answer AS correct_answer,
        q.source AS author
      FROM responses r
      LEFT JOIN questions q ON r.question = q.question
      ORDER BY r.participant_id, r.section, r.id
    `);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('❌ 응답 상세 조회 실패:', err);
    res.status(500).json({ error: '응답 데이터를 불러오는 데 실패했습니다.' });
  }
});

module.exports = router;
