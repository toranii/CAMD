// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db');
require('dotenv').config();

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  console.log('[로그인 요청]', email, password);

  db.getConnection((err, connection) => {
    if (err) return res.status(500).send('DB 연결 오류');

    connection.query(
      'SELECT * FROM users WHERE email = ? AND password = ?',
      [email, password],
      (err, results) => {
        connection.release();

        if (err) return res.status(500).send('쿼리 오류');

        console.log('쿼리 결과:', results);

        if (results.length === 0) {
          return res
            .status(401)
            .json({ message: '이메일 또는 비밀번호가 틀립니다' });
        }

        const user = results[0];
        const token = jwt.sign(
          { id: user.id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: '1h' },
        );

        res.json({
          token,
          user: { id: user.id, name: user.name, email: user.email },
        });
      },
    );
  });
});

module.exports = router;
