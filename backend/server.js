const express = require('express');
const cors = require('cors');
const db = require('./db');
const authRoutes = require('./routes/auth');
const loginLogsRoutes = require('./routes/login-logs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ 기본 경로 추가 (Cannot GET / 오류 해결)
app.get('/', (req, res) => {
  res.send('Express 서버 정상 작동 중!');
});

// 로그인 라우트 등록
app.use('/api/auth', authRoutes);
// 로그인 로그 라우트 등록
app.use('/api/auth', loginLogsRoutes);

// ✅ 사용자 조회 API (db.getConnection 사용)
app.get('/users', (req, res) => {
  db.getConnection((err, connection) => {
    if (err) {
      console.error('MySQL 연결 오류:', err);
      return res.status(500).send('MySQL 연결 오류');
    }

    connection.query('SELECT * FROM users', (err, results) => {
      connection.release(); // ✅ 연결 해제 (중요!)

      if (err) {
        console.error('쿼리 실행 오류:', err);
        return res.status(500).send('서버 내부 오류');
      }
      res.json(results);
    });
  });
});

// ✅ 서버 실행
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중`);
});
