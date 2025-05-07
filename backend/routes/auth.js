const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../db');
const normalizeIp = require('../utils/normalizeIp');
require('dotenv').config();

//  POST  /api/auth/login
router.post('/login', (req, res) => {
  const { email, password: plainPwd } = req.body;
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
      proceedToLogin(conn, email, plainPwd, ip);
    });

    // 실제 로그인 처리
    async function proceedToLogin(conn, email, plainPwd, ip) {
      // 이메일로 사용자 조회 (비밀번호는 해시 비교)
      const selSql = 'SELECT * FROM users WHERE email = ?';
      conn.query(selSql, [email], async (selErr, rows) => {
        if (selErr) {
          conn.release();
          return res.status(500).send('쿼리 오류');
        }

        const userRow = rows[0] || null;
        const success =
          userRow !== null
            ? await bcrypt.compare(plainPwd, userRow.password)
            : false;

        // 로그인 로그 Insert (성공/실패 모두)
        const insSql =
          'INSERT INTO login_logs (user_id, email, ip_address, success) VALUES (?,?,?,?)';
        conn.query(
          insSql,
          [userRow?.id || null, email, ip, success],
          (insErr) => {
            conn.release();
            if (insErr) console.error('로그 기록 오류:', insErr);
          },
        );

        // 인증 결과 응답
        if (!success) {
          return res
            .status(401)
            .json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
        }

        // JWT 토큰 발급 (1시간)
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
    }
  });
});

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: '필수 항목(name, email, password)이 누락되었습니다.' });
  }

  try {
    // 1) 비밀번호 해시화
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);

    // 2) DB에 사용자 저장
    db.getConnection((err, conn) => {
      if (err) return res.status(500).json({ message: 'DB 연결 오류' });

      const sql = `
        INSERT INTO users (name, email, password, phone)
        VALUES (?, ?, ?, ?)
      `;
      conn.query(sql, [name, email, hash, phone || null], (dbErr, result) => {
        conn.release();
        if (dbErr) {
          console.error('회원가입 오류:', dbErr);
          // 중복 이메일 등 제약 조건 위반 처리
          if (dbErr.code === 'ER_DUP_ENTRY') {
            return res
              .status(409)
              .json({ message: '이미 사용 중인 이메일입니다.' });
          }
          return res.status(500).json({ message: '회원가입 실패' });
        }
        // 성공
        return res.status(201).json({
          message: '회원가입 성공',
          userId: result.insertId,
        });
      });
    });
  } catch (hashErr) {
    console.error('bcrypt 해시 오류:', hashErr);
    return res.status(500).json({ message: '서버 내부 오류' });
  }
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
