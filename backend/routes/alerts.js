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
      `SELECT id, message, created_at
       FROM alerts
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId],
      (e, rows) => {
        conn.release();
        if (e) return res.status(500).send('알림 조회 실패');
        res.json(
          rows.map((r) => ({
            id: r.id,
            time: r.created_at,
            message: r.message,
          })),
        );
      },
    );
  });
});

router.post('/alerts/delete', (req, res) => {
  const { alert_ids } = req.body;
  if (!Array.isArray(alert_ids) || alert_ids.length === 0) {
    return res.status(400).json({ message: 'alert_ids 배열이 필요합니다.' });
  }

  const placeholders = alert_ids.map(() => '?').join(',');
  const sql = `DELETE FROM alerts WHERE id IN (${placeholders})`;

  db.query(sql, alert_ids, (err, result) => {
    if (err) {
      console.error('알림 삭제 실패:', err);
      return res.status(500).json({ message: '삭제 실패' });
    }
    res.json({ message: '삭제 완료' });
  });
});

module.exports = router;
