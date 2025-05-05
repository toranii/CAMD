-- ▶️ ip_camera DB 에서 생성할 테이블

-- 1. users 테이블 생성
CREATE TABLE `users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `password` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `phone` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- 2. login_logs 테이블 생성
CREATE TABLE `login_logs` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) DEFAULT NULL,
  `email` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ip_address` VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `login_time` DATETIME DEFAULT CURRENT_TIMESTAMP(),
  `success` TINYINT(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_logs_user` (`user_id`),
  CONSTRAINT `fk_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 3. devices 테이블 생성
CREATE TABLE `devices` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `device_name` varchar(100) DEFAULT NULL,
    `token` varchar(255) NOT NULL,
    `created_at` timestamp NULL DEFAULT current_timestamp(),
    `mac_address` varchar(50) DEFAULT NULL,
    `ip_address` varchar(255) DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 6 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- 4. 기본 디바이스 등록 (예시)
INSERT INTO `devices` (`device_name`, `token`) 
VALUES ('MyESP32CAM', 'esp32_secure_token_123');

SELECT * FROM devices;

ALTER TABLE devices ADD COLUMN mac_address VARCHAR(50);

ALTER TABLE devices MODIFY device_name VARCHAR(100) DEFAULT 'ESP32CAM';

ALTER TABLE devices MODIFY device_name VARCHAR(100) NULL;
