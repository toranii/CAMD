const mysql = require('mysql');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json()); // JSON 요청을 파싱

let db;

const createDBConnection = () => {
    db = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    db.connect((err) => {
        if (err) {
            console.error('MySQL 연결 실패:', err);
            setTimeout(createDBConnection, 5000);  // 5초 후에 재시도
        } else {
            console.log('MySQL 연결 성공!');
        }
    });

    // 연결이 끊어졌을 때 재연결
    db.on('error', (err) => {
        console.error('MySQL 연결 에러:', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            createDBConnection(); // 연결이 끊어지면 재연결 시도
        } else {
            throw err;
        }
    });
};

// MySQL 연결 생성
createDBConnection();

// 기본 경로
app.get('/', (req, res) => {
    res.send('Express 서버 정상 작동 중!');
});

// 사용자 정보 가져오는 API
app.get('/users', (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) {
            console.log('사용자 정보 조회 실패:', err);
            res.status(500).send('서버 오류');
            return;
        }
        res.json(results);
    });
});

// 서버 실행
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT}에서 실행 중입니다.`);
});
