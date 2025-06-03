//backend/routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../db');
require('dotenv').config();

// POST /api/auth/login
router.post('/login', (req, res) => {
  console.log('[DEBUG] /login 엔드포인트 진입, body =', req.body);
  const { email, password: plainPwd } = req.body;
  // 실제 클라이언트 IP(포트포워딩된 뒤에도 최종 원격 IP)를 req.ip로 읽는다.
  const ip = req.ip;

  db.getConnection((err, conn) => {
    if (err) return res.status(500).send('DB 연결 오류');

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

      proceedToLogin(conn, email, plainPwd, ip);
    });

    async function proceedToLogin(conn, email, plainPwd, ip) {
      console.log('[DEBUG] proceedToLogin 호출됨:', email);
      const selSql = 'SELECT * FROM users WHERE email = ?';
      conn.query(selSql, [email], async (selErr, rows) => {
        if (selErr) {
          conn.release();
          return res.status(500).send('쿼리 오류');
        }

        const userRow = rows[0] || null;
        const success = userRow
          ? await bcrypt.compare(plainPwd, userRow.password)
          : false;

        const insSql =
          'INSERT INTO login_logs (user_id, email, ip_address, success) VALUES (?,?,?,?)';
        conn.query(
          insSql,
          [userRow?.id || null, email, ip, success],
          (insErr) => {
            conn.release();
            if (insErr) console.error('로그 기록 오류:', insErr);
            console.log('[DEBUG] 로그인 실패? success=', success);

            // — 실패 시 연속 실패 카운트 체크 & 알림 생성
            if (!success && userRow) {
              console.log('[DEBUG] 알림 생성 로직 진입, user_id=', userRow.id);
              db.getConnection((e2, c2) => {
                if (e2) return console.error(e2);
                c2.query(
                  `SELECT success
                   FROM login_logs
                   WHERE user_id = ?
                   ORDER BY login_time DESC
                   LIMIT 10`,
                  [userRow.id],
                  (e3, rows3) => {
                    if (e3) {
                      c2.release();
                      return console.error(e3);
                    }
                    let cnt = 0;
                    for (const r of rows3) {
                      if (r.success === 0) cnt++;
                      else break;
                    }
                    let msg = null;
                    if (cnt === 5)
                      msg = '로그인 5회 실패하였습니다. 계정이 1분 잠금됩니다.';
                    else if (cnt === 8)
                      msg = '로그인 8회 실패하였습니다. 계정이 5분 잠금됩니다.';
                    else if (cnt === 10)
                      msg =
                        '로그인 10회 실패하였습니다. 계정을 사용할 수 없습니다. 관리자에게 문의하여주십시오.';
                    if (msg) {
                      // 알림 설정이 'on'인 사용자만 알림 저장
                      c2.query(
                        'SELECT notification_setting FROM user_settings WHERE user_id = ?',
                        [userRow.id],
                        (e5, rows5) => {
                          if (e5) {
                            console.error('알림 설정 조회 실패:', e5);
                            c2.release();
                            return;
                          }

                          const setting = rows5[0]?.notification_setting;
                          if (setting === 'on') {
                            c2.query(
                              'INSERT INTO alerts (user_id, message) VALUES (?, ?)',
                              [userRow.id, msg],
                              (e4) => {
                                if (e4) console.error('알림 생성 오류:', e4);
                                else
                                  console.log(
                                    `[알림 저장] user_id=${userRow.id}, msg="${msg}"`,
                                  );
                                c2.release();
                              },
                            );
                          } else {
                            console.log(
                              `[알림 저장 생략] 설정 off 상태 - user_id=${userRow.id}`,
                            );
                            c2.release(); // 연결 해제는 반드시!
                          }
                        },
                      );
                    } else {
                      c2.release(); // msg가 null인 경우에도 해제
                    }
                  },
                );
              });
            }
          },
        );

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
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);

    db.getConnection((err, conn) => {
      if (err) return res.status(500).json({ message: 'DB 연결 오류' });

      const sql =
        'INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)';
      conn.query(sql, [name, email, hash, phone || null], (dbErr, result) => {
        conn.release();
        if (dbErr) {
          console.error('회원가입 오류:', dbErr);
          if (dbErr.code === 'ER_DUP_ENTRY') {
            const field = dbErr.sqlMessage.includes('email')
              ? '이메일'
              : '전화번호';
            return res
              .status(409)
              .json({ message: `이미 존재하는 ${field}입니다.` });
          }
          return res.status(500).json({ message: '회원가입 실패' });
        }
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

// POST /api/auth/check_email
router.post('/check_email', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: '이메일이 필요합니다.' });

  db.query('SELECT id FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ message: '서버 오류' });
    return res.json({ exists: results.length > 0 });
  });
});

// POST /api/auth/check_phone
router.post('/check_phone', (req, res) => {
  const { phone } = req.body;
  if (!phone)
    return res.status(400).json({ message: '전화번호가 필요합니다.' });

  db.query('SELECT id FROM users WHERE phone = ?', [phone], (err, results) => {
    if (err) return res.status(500).json({ message: '서버 오류' });
    return res.json({ exists: results.length > 0 });
  });
});

// POST /api/user/change-password
router.post('/change-password', (req, res) => {
  const { user_id, current_password, new_password } = req.body;

  if (!user_id || !current_password || !new_password) {
    return res.status(400).json({ message: '모든 항목이 필요합니다.' });
  }

  db.getConnection((err, conn) => {
    if (err) return res.status(500).json({ message: 'DB 연결 오류' });

    const getSql = 'SELECT password FROM users WHERE id = ?';
    conn.query(getSql, [user_id], async (err1, rows) => {
      if (err1 || rows.length === 0) {
        conn.release();
        return res.status(500).json({ message: '사용자 조회 실패' });
      }

      const passwordMatch = await bcrypt.compare(
        current_password,
        rows[0].password,
      );
      if (!passwordMatch) {
        conn.release();
        return res
          .status(401)
          .json({ message: '현재 비밀번호가 일치하지 않습니다.' });
      }

      const newHash = await bcrypt.hash(new_password, 10);
      const updateSql = 'UPDATE users SET password = ? WHERE id = ?';
      conn.query(updateSql, [newHash, user_id], (err2) => {
        conn.release();
        if (err2)
          return res.status(500).json({ message: '비밀번호 변경 실패' });
        return res.json({ message: '비밀번호가 변경되었습니다.' });
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
  db.getConnection((err, conn) => {
    if (err) return res.status(500).send('DB 연결 오류');

    const insertSql = 'INSERT INTO devices (device_name, token) VALUES (?, ?)';
    conn.query(insertSql, [device_name, newToken], (queryErr, result) => {
      conn.release();
      if (queryErr) return res.status(500).send('서버 내부 오류');

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
  db.getConnection((err, conn) => {
    if (err) return res.status(500).send('DB 연결 오류');

    const sql = 'SELECT * FROM devices WHERE token = ?';
    conn.query(sql, [token], (queryErr, rows) => {
      conn.release();
      if (queryErr) return res.status(500).send('서버 내부 오류');

      if (rows.length === 0) {
        return res.status(401).json({ message: '유효하지 않은 토큰' });
      }
      return res.json({ message: '인증 성공', device: rows[0] });
    });
  });
});

module.exports = router;
