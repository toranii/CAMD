// backend/routes/settings.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// 설정 저장 API
router.post('/page-settings', (req, res) => {
  const {
    user_id,
    camera_base_url,
    dashboard_item_count,
    notification_setting,
    alert_item_count,
  } = req.body;
  if (!user_id)
    return res.status(400).json({ message: 'user_id가 필요합니다.' });

  const sql = `
  INSERT INTO user_settings (user_id, camera_base_url, dashboard_item_count, notification_setting, alert_item_count)
  VALUES (?, ?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE
    camera_base_url = VALUES(camera_base_url),
    dashboard_item_count = VALUES(dashboard_item_count),
    notification_setting = VALUES(notification_setting),
    alert_item_count = VALUES(alert_item_count)
`;

  db.query(
    sql,
    [
      user_id,
      camera_base_url,
      dashboard_item_count,
      notification_setting,
      alert_item_count,
    ],
    (err, result) => {
      if (err) {
        console.error('설정 저장 실패:', err);
        return res.status(500).json({ message: '설정 저장 중 오류 발생' });
      }
      return res.json({ message: '설정이 저장되었습니다.' });
    },
  );
});

// 설정 불러오기 API (선택적)
router.get('/page-settings/:user_id', (req, res) => {
  const { user_id } = req.params;

  db.query(
    'SELECT * FROM user_settings WHERE user_id = ?',
    [user_id],
    (err, rows) => {
      if (err) {
        console.error('설정 불러오기 실패:', err);
        return res.status(500).json({ message: '조회 실패' });
      }
      if (rows.length === 0)
        return res.status(404).json({ message: '설정 없음' });
      return res.json(rows[0]);
    },
  );
});

module.exports = router;
