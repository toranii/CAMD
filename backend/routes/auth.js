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

  const rawIp =
    req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
  const ip = normalizeIp(rawIp);

  db.getConnection((err, conn) => {
    if (err) return res.status(500).send('DB 연결 오류');

    // 1. 최근 로그인 로그 조회 (최대 20개)
    const logSql = `
      SELECT success, login_time
      FROM login_logs
      WHERE ip_address = ?
      ORDER BY login_time DESC
      LIMIT 20
    `;
    conn.query(logSql, [ip], (logErr, rows) => {
      if (logErr) {
        conn.release();
        return res.status(500).send('로그 기록 조회 실패');
      }

      let failCount = 0;
      let latestFailTime = null;

      for (const row of rows) {
        if (row.success === 1) break;
        failCount++;
        if (!latestFailTime) latestFailTime = row.login_time;
      }

      // 차단 조건 확인
      if (failCount >= 10) {
        conn.release();
        return res.status(429).json({
          message:
            '보안상의 이유로 로그인이 제한되었습니다.<br><br>관리자에게 문의하세요.',
        });
      }

      if (failCount === 8) {
        const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
        if (new Date(latestFailTime) >= fiveMinAgo) {
          conn.release();
          return res.status(429).json({
            message:
              '로그인 시도가 너무 많습니다.<br><br>5분 후 다시 시도해 주세요.',
          });
        }
      }

      if (failCount === 5) {
        const oneMinAgo = new Date(Date.now() - 60 * 1000);
        if (new Date(latestFailTime) >= oneMinAgo) {
          conn.release();
          return res.status(429).json({
            message:
              '로그인 시도가 너무 많습니다.<br><br>1분 후 다시 시도해 주세요.',
          });
        }
      }

      // 로그인 시도
      proceedToLogin(conn, email, password, ip);
    });

    // 실제 로그인 처리
    function proceedToLogin(conn, email, password, ip) {
      const selectSql = 'SELECT * FROM users WHERE email = ? AND password = ?';
      conn.query(selectSql, [email, password], (selErr, rows) => {
        const success = rows.length > 0;
        const userRow = success ? rows[0] : { id: null };

        const logSql =
          'INSERT INTO login_logs (user_id, email, ip_address, success) VALUES (?,?,?,?)';
        conn.query(logSql, [userRow.id, email, ip, success], (logErr) => {
          conn.release();
          if (logErr) console.error('로그 기록 오류:', logErr);

          if (!success) {
            return res
              .status(401)
              .json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
          }

          const token = jwt.sign(
            { id: userRow.id, email: userRow.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
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
    }
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

// POST /api/auth/register_device
router.post('/register_device', (req, res) => {
  const { device_name } = req.body;
  if (!device_name) {
    return res.status(400).json({ message: 'device_name이 필요합니다.' });
  }

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

// POST /api/auth/verify_device
router.post('/verify_device', (req, res) => {
  const { token } = req.body;
  console.log('[DEVICE VERIFY] 요청 →', token);

  db.getConnection((err, conn) => {
    if (err) {
      console.error('DB 연결 오류:', err);
      return res.status(500).send('DB 연결 오류');
    }

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

      return res.json({ message: '인증 성공', device: rows[0] });
    });
  });
});

module.exports = router;
