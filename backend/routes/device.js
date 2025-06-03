const express = require('express');
const router = express.Router();
const db = require('../db');
const crypto = require('crypto');
const fetch = require('node-fetch').default;
const externalStreamIP = '203.234.19.95:82';

// 디바이스 등록 API
router.post('/register', (req, res) => {
  console.log('[요청 수신] /api/device/register');
  const { mac, token, device_name, ip_address } = req.body;
  // const ip_address = externalStreamIP;

  res.setHeader('Content-Type', 'application/json');

  if (!mac || !token) {
    return res
      .status(400)
      .json({ success: false, message: 'MAC 주소와 토큰이 필요합니다.' });
  }

  db.getConnection((err, connection) => {
    if (err) {
      console.error('DB 연결 실패:', err);
      return res.status(500).json({ success: false, message: 'DB 연결 실패' });
    }

    // MAC 주소 중복 확인
    const checkSql = 'SELECT * FROM devices WHERE mac_address = ?';
    connection.query(checkSql, [mac], (checkErr, results) => {
      if (checkErr) {
        connection.release();
        return res
          .status(500)
          .json({ success: false, message: 'DB 조회 실패' });
      }

      if (results.length > 0) {
        // 이미 존재 → 토큰만 갱신하고 is_deleted 해제
        const existingDevice = results[0];
        const updateSql = `
      UPDATE devices
      SET token = ?, ip_address = ?, device_name = ?
      WHERE mac_address = ?`;
        connection.query(
          updateSql,
          [token, ip_address, device_name, mac],
          (updateErr) => {
            connection.release();
            if (updateErr) {
              return res
                .status(500)
                .json({ success: false, message: 'DB 업데이트 실패' });
            }
            return res.status(200).json({
              success: true,
              message: '디바이스 토큰 업데이트 완료',
            });
          },
        );
      } else {
        // 새로 등록
        const insertSql =
          'INSERT INTO devices (mac_address, token, device_name, ip_address) VALUES (?, ?, ?, ?)';
        connection.query(
          insertSql,
          [mac, token, device_name, ip_address],
          (insertErr) => {
            connection.release();
            if (insertErr) {
              console.error('DB 등록 실패:', insertErr);
              return res
                .status(500)
                .json({ success: false, message: 'DB 등록 실패' });
            }
            return res.status(200).json({
              success: true,
              message: '디바이스 등록 완료',
              // streamUrl: `http://203.234.19.95:8882/stream`,
              mac,
              token,
              device_name: device_name || 'ESP32CAM',
              ip_address,
            });
          },
        );
      }
    });
  });
});

// 등록된 장치 목록 조회
router.get('/list', (req, res) => {
  db.query(
    'SELECT mac_address, token, device_name, ip_address FROM devices ',
    (err, results) => {
      if (err) {
        console.error('DB 조회 실패:', err);
        return res
          .status(500)
          .json({ success: false, message: 'DB 조회 실패' });
      }
      res.setHeader('Content-Type', 'application/json');
      res.json({ success: true, devices: results });
    },
  );
});

// ESP32 토큰 인증 API (웹에서 등록 요청할 때 사용)
// verifyRoute.js

router.post('/verify', async (req, res) => {
  console.log('[요청 수신] /api/device/verify');
  const { ip } = req.body;

  if (!ip) {
    return res.status(400).json({ success: false, message: 'IP 주소 누락됨' });
  }

  try {
    const response = await fetch(`http://${ip}:81/token`);

    if (!response.ok) {
      console.error('HTTP 오류:', response.status);
      return res.status(500).json({
        success: false,
        message: `장치 응답 오류: ${response.status}`,
      });
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Content-Type 오류:', contentType);
      return res.status(500).json({
        success: false,
        message: '장치가 JSON을 반환하지 않았습니다.',
      });
    }

    const data = await response.json();

    if (data && data.token) {
      const token = data.token;

      // DB에서 해당 토큰이 등록된 MAC과 일치하는지 확인
      db.query(
        'SELECT * FROM devices WHERE token = ? ',
        [token],
        (err, results) => {
          if (err) {
            console.error('DB 조회 실패:', err);
            return res
              .status(500)
              .json({ success: false, message: 'DB 조회 실패' });
          }

          if (results.length > 0) {
            const device = results[0];
            return res.status(200).json({
              success: true,
              message: '인증 성공',
              streamUrl: `http://${ip}:82/stream`,
              mac: device.mac_address,
              token: device.token,
              deviceName: device.device_name,
              ipAddress: device.ip_address,
            });
          } else {
            return res
              .status(401)
              .json({ success: false, message: '등록되지 않은 장치입니다' });
          }
        },
      );
    } else {
      return res.status(400).json({
        success: false,
        message: '장치에서 토큰을 가져오지 못했습니다',
      });
    }
  } catch (err) {
    console.error('장치 통신 실패:', err);
    return res
      .status(500)
      .json({ success: false, message: '장치와 통신 실패' });
  }
});

// 디바이스 삭제 API
router.post('/delete', (req, res) => {
  return res.json({ success: true, message: '삭제 완료' });
  //const { mac_addresses } = req.body;

  //if (!Array.isArray(mac_addresses) || mac_addresses.length === 0) {
  // return res
  //   .status(400)
  //   .json({ success: false, message: 'MAC 주소 배열이 필요합니다.' });
  //}

  //const placeholders = mac_addresses.map(() => '?').join(',');
  // const deleteSql = `UPDATE devices SET is_deleted = TRUE WHERE mac_address IN (${placeholders})`;

  //db.query(deleteSql, mac_addresses, (err, results) => {
  //   if (err) {
  //   console.error('디바이스 삭제 실패:', err);
  //  return res.status(500).json({ success: false, message: 'DB 삭제 실패' });
  // }

  //return res.json({ success: true, message: '디바이스 삭제 완료' });
  // });
});

module.exports = router;
