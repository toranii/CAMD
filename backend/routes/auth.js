/*backend/routes/auth.js
    ──────────────────────────────────────────────────────────
    ▷  역할
       -  POST /api/auth/login  :  로그인 요청 처리
       -  사용자 인증 성공/실패 여부를 login_logs 테이블에 기록
       -  성공 시 JWT 토큰(1 h 만료)을 발급해 클라이언트로 반환
    ──────────────────────────────────────────────────────────
*/

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db');
const normalizeIp = require('../utils/normalizeIp');
require('dotenv').config();

//  POST  /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  console.log('[LOGIN] 요청 →', email);

  /* 1. 요청 IP(프록시 환경 고려) */
  const rawIp =
    req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
  const ip = normalizeIp(rawIp);

  db.getConnection((err, conn) => {
    if (err) return res.status(500).send('DB 연결 오류');

    /* 2. 사용자 SELECT */
    const selectSql = 'SELECT * FROM users WHERE email = ? AND password = ?';
    conn.query(selectSql, [email, password], (selErr, rows) => {
      if (selErr) {
        conn.release();
        return res.status(500).send('쿼리 오류');
      }

      const success = rows.length > 0; // 1 = 성공 · 0 = 실패
      const userRow = success ? rows[0] : { id: null };

      /* 3. 로그인 로그 INSERT  (성공·실패 모두 기록) */
      const logSql =
        'INSERT INTO login_logs (user_id, email, ip_address, success) VALUES (?,?,?,?)';
      conn.query(logSql, [userRow.id, email, ip, success], (logErr) => {
        conn.release(); // ←  반드시 해제
        if (logErr) console.error('로그 기록 오류:', logErr);

        /* 4. SELECT 결과에 따른 응답  (INSERT 후에 보냄) */
        if (!success) {
          return res
            .status(401)
            .json({ message: '이메일 또는 비밀번호가 틀립니다' });
        }

        // ── 로그인 성공 ────────────────────────────
        const token = jwt.sign(
          { id: userRow.id, email: userRow.email },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }, // ▶ 토큰 만료 1 시간
        );

        return res.json({
          token,
          user: {
            id: userRow.id,
            name: userRow.name,
            email: userRow.email,
          },
        });
      });
    });
  });
});

// POST /api/auth/verify_token
router.post('/verify_token', (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: '토큰이 없습니다.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({ valid: true, user: decoded });
  } catch (err) {
    return res.status(401).json({ message: '토큰이 유효하지 않거나 만료됨' });
  }
});

// POST /api/auth/verify_device
router.post('/verify_device', (req, res) => {
  const { token } = req.body;
  console.log('[DEVICE VERIFY] 요청 →', token);

  db.getConnection((err, conn) => {
    if (err) {
      console.error('DB 연결 오류:', err);
      return res.status(500).send('DB 연결 오류');
    }

    // 토큰이 devices 테이블에 존재하는지 확인
    const sql = 'SELECT * FROM devices WHERE token = ?';
    conn.query(sql, [token], (queryErr, rows) => {
      conn.release();

      if (queryErr) {
        console.error('쿼리 오류:', queryErr);
        return res.status(500).send('서버 내부 오류');
      }

      if (rows.length === 0) {
        return res.status(401).json({ message: '유효하지 않은 토큰' });
      }

      // 인증 성공
      return res.json({ message: '인증 성공', device: rows[0] });
    });
  });
});

// POST /api/auth/register_device
router.post('/register_device', (req, res) => {
  const { device_name } = req.body;
  if (!device_name) {
    return res.status(400).json({ message: 'device_name이 필요합니다.' });
  }

  // 랜덤한 토큰 생성 (32자리)
  const generateToken = () => {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  };

  const newToken = generateToken();
  console.log(
    `[DEVICE REGISTER] 디바이스 등록 요청 → 이름: ${device_name}, 토큰: ${newToken}`,
  );

  db.getConnection((err, conn) => {
    if (err) {
      console.error('DB 연결 오류:', err);
      return res.status(500).send('DB 연결 오류');
    }

    // devices 테이블에 등록
    const insertSql = 'INSERT INTO devices (device_name, token) VALUES (?, ?)';
    conn.query(insertSql, [device_name, newToken], (queryErr, result) => {
      conn.release();

      if (queryErr) {
        console.error('쿼리 오류:', queryErr);
        return res.status(500).send('서버 내부 오류');
      }

      return res.json({
        message: '디바이스 등록 성공',
        device: {
          id: result.insertId,
          device_name,
          token: newToken,
        },
      });
    });
  });
});

module.exports = router;
