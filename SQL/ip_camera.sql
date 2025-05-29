-- ✅ 데이터베이스: ip_camera
-- 이 파일은 IP 카메라 프로젝트용 전체 테이블을 구성합니다.

-- 1. users 테이블
CREATE TABLE `users` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    `email` varchar(255) NOT NULL,
    `password` varchar(255) NOT NULL,
    `phone` varchar(255) DEFAULT NULL,
    `token_version` int(11) NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`),
    UNIQUE KEY `email` (`email`)
) ENGINE = InnoDB AUTO_INCREMENT = 12 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci


-- 2. login_logs 테이블
CREATE TABLE `login_logs` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `user_id` int(11) DEFAULT NULL,
    `email` varchar(255) NOT NULL,
    `ip_address` varchar(100) DEFAULT NULL,
    `login_time` datetime DEFAULT current_timestamp(),
    `success` tinyint(1) DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `fk_logs_user` (`user_id`),
    CONSTRAINT `fk_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
    CONSTRAINT `login_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 148 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci

-- 3. devices 테이블
CREATE TABLE `devices` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `device_name` varchar(100) DEFAULT NULL,
    `token` varchar(255) NOT NULL,
    `created_at` timestamp NULL DEFAULT current_timestamp(),
    `mac_address` varchar(50) DEFAULT NULL,
    `ip_address` varchar(255) DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 12 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci


-- 4. user_settings 테이블
CREATE TABLE `user_settings` (
    `user_id` int NOT NULL,
    `camera_base_url` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
    `dashboard_item_count` int DEFAULT NULL,
    `notification_setting` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
    `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `alert_item_count` int DEFAULT NULL,
    PRIMARY KEY (`user_id`),
    CONSTRAINT `fk_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci

-- 5. alerts 테이블
CREATE TABLE `alerts` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `user_id` int(11) NOT NULL,
    `message` varchar(255) NOT NULL,
    `created_at` datetime NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`),
    KEY `user_id` (`user_id`),
    CONSTRAINT `alerts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 8 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci

-- 6. refresh_tokens 테이블
CREATE TABLE `refresh_tokens` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `user_id` int(11) NOT NULL,
    `token` varchar(255) NOT NULL,
    `expires_at` datetime NOT NULL,
    PRIMARY KEY (`id`),
    KEY `user_id` (`user_id`),
    CONSTRAINT `refresh_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci


-- (선택) 5. 예시 디바이스 등록
INSERT INTO `devices` (`id`, `device_name`, `token`, `created_at`, `mac_address`, `ip_address`)
VALUES ('4', 'MyESP32CAM', ',ARMyABPArz04nV30NgJ64z1qpyLiukF2', '2025-05-29 15:28:29', 'A4:CF:12:2F:85:64', '192.168.0.7');

-- 확인용
SELECT * FROM devices;
