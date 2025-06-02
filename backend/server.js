//backend/server.js
const express = require('express');
const cors = require('cors');
const db = require('./db');
const authRoutes = require('./routes/auth');
const deviceRoutes = require('./routes/device');
const loginLogsRoutes = require('./routes/login-logs');
const alertsRoutes = require('./routes/alerts');
const settingsRoutes = require('./routes/settings');

require('dotenv').config();

const app = express();
app.use(
  cors({
    origin: '*',
    credentials: true,
  }),
);
app.use(express.json());

// ✅ 기본 경로 추가 (Cannot GET / 오류 해결)
app.get('/', (req, res) => {
  res.send('Express 서버 정상 작동 중!');
});

// GET /users/:id
app.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  db.query(
    'SELECT id, name, email FROM users WHERE id = ?',
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'DB 오류' });
      if (rows.length === 0)
        return res.status(404).json({ message: '사용자 없음' });
      res.json(rows[0]);
    },
  );
});

// 로그인 라우트 등록
app.use('/api/auth', authRoutes);
// 알림 라우트 등록
app.use('/api', alertsRoutes);
// 로그인 로그 라우트 등록
app.use('/api/auth', loginLogsRoutes);
app.use('/api/device', deviceRoutes);
// 설정 라우트 등록
app.use('/api/user', settingsRoutes);
// 알림 라우트 등록
app.use('/api/alerts', alertsRoutes);

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
app.listen(PORT, '0.0.0.0', () => {
  console.log(`서버가 http://0.0.0.0:${PORT} 에서 실행 중`);
});
