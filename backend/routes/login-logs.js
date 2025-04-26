const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/auth/login-logs
router.get('/login-logs', (req, res) => {
  db.getConnection((err, connection) => {
    if (err) {
      console.error('MySQL 연결 오류:', err);
      return res.status(500).send('MySQL 연결 오류');
    }

    const sql = `
      SELECT email, ip_address, success, login_time
      FROM login_logs
      ORDER BY login_time DESC
      LIMIT 50
    `;
    connection.query(sql, (err, results) => {
      connection.release();

      if (err) {
        console.error('쿼리 실행 오류:', err);
        return res.status(500).send('서버 내부 오류');
      }
      res.json(results);
    });
  });
});

module.exports = router;
