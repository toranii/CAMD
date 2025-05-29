const mysql = require('mysql');

const connection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root', // 비밀번호 확인 후 입력
  database: 'ip_camera',
  port: 3306,
  connectionLimit: 10, // 최대 연결 개수 설정
  waitForConnections: true,
  queueLimit: 0,
});

module.exports = connection;
