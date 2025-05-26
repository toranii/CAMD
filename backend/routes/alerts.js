//backend/routes/alerts.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/alerts?user_id=#
router.get('/alerts', (req, res) => {
  const userId = req.query.user_id;
  if (!userId)
    return res.status(400).json({ message: 'user_id가 필요합니다.' });

  db.getConnection((err, conn) => {
    if (err) return res.status(500).send('DB 연결 오류');
    conn.query(
      `SELECT message, created_at
       FROM alerts
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId],
      (e, rows) => {
        conn.release();
        if (e) return res.status(500).send('알림 조회 실패');
        res.json(
          rows.map((r) => ({
            time: r.created_at,
            message: r.message,
          })),
        );
      },
    );
  });
});

module.exports = router;
