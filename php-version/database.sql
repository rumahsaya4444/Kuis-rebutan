-- ========================================================
-- SKEMA DATABASE KILATQUIZ UNTUK MYSQL / MARIADB (aaPanel)
-- ========================================================

CREATE DATABASE IF NOT EXISTS `kilatquiz` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `kilatquiz`;

-- 1. Tabel Kategori & Paket Kuis
CREATE TABLE IF NOT EXISTS `quizzes` (
    `id` VARCHAR(64) PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `category` VARCHAR(100) NOT NULL,
    `difficulty` ENUM('Mudah', 'Menengah', 'Sulit') DEFAULT 'Menengah',
    `cover_image` VARCHAR(500),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Tabel Butir Soal Kuis
CREATE TABLE IF NOT EXISTS `questions` (
    `id` VARCHAR(64) PRIMARY KEY,
    `quiz_id` VARCHAR(64) NOT NULL,
    `question_text` TEXT NOT NULL,
    `media_type` ENUM('none', 'image', 'video') DEFAULT 'none',
    `media_url` VARCHAR(500),
    `option_a` VARCHAR(255) NOT NULL,
    `option_b` VARCHAR(255) NOT NULL,
    `option_c` VARCHAR(255) NOT NULL,
    `option_d` VARCHAR(255) NOT NULL,
    `correct_index` TINYINT NOT NULL COMMENT '0=A, 1=B, 2=C, 3=D',
    `time_limit_sec` INT DEFAULT 15,
    `explanation` TEXT,
    `order_num` INT DEFAULT 1,
    FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Tabel Sesi Room Kuis Aktif
CREATE TABLE IF NOT EXISTS `quiz_rooms` (
    `room_code` VARCHAR(16) PRIMARY KEY,
    `quiz_id` VARCHAR(64) NOT NULL,
    `host_token` VARCHAR(64) NOT NULL,
    `status` ENUM('LOBBY', 'QUESTION', 'REVEAL', 'LEADERBOARD', 'PODIUM', 'FINISHED') DEFAULT 'LOBBY',
    `current_question_idx` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`)
) ENGINE=InnoDB;

-- 4. Tabel Peserta Kuis di Room
CREATE TABLE IF NOT EXISTS `room_players` (
    `id` VARCHAR(64) PRIMARY KEY,
    `room_code` VARCHAR(16) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `avatar_icon` VARCHAR(50) DEFAULT 'cat',
    `avatar_color` VARCHAR(50) DEFAULT 'indigo',
    `avatar_accessory` VARCHAR(50) DEFAULT 'crown',
    `avatar_title` VARCHAR(100) DEFAULT 'Si Kilat ⚡',
    `score` INT DEFAULT 0,
    `streak` INT DEFAULT 0,
    `best_streak` INT DEFAULT 0,
    `total_correct` INT DEFAULT 0,
    `total_answered` INT DEFAULT 0,
    `joined_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`room_code`) REFERENCES `quiz_rooms`(`room_code`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Tabel Papan Peringkat Global
CREATE TABLE IF NOT EXISTS `global_leaderboard` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `player_name` VARCHAR(100) NOT NULL,
    `avatar_json` JSON NOT NULL,
    `xp_score` INT DEFAULT 0,
    `games_played` INT DEFAULT 1,
    `win_count` INT DEFAULT 0,
    `accuracy` INT DEFAULT 0,
    `tier` VARCHAR(50) DEFAULT 'Pejuang Trivia',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 6. Tabel Akun & Profil Sinkronisasi Lintas Perangkat
CREATE TABLE IF NOT EXISTS `user_accounts` (
    `sync_token` VARCHAR(64) PRIMARY KEY,
    `player_name` VARCHAR(100) NOT NULL,
    `avatar_json` JSON NOT NULL,
    `stats_json` JSON NOT NULL,
    `custom_quizzes_json` JSON,
    `last_synced` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ========================================================
-- DATA SEED CONTOH KUIS AWAL
-- ========================================================

INSERT INTO `quizzes` (`id`, `title`, `description`, `category`, `difficulty`, `cover_image`) VALUES
('quiz-budaya-1', 'Pesona Nusantara & Warisan Dunia', 'Uji wawasan seputar keajaiban alam dan warisan budaya Indonesia.', 'Budaya & Alam', 'Menengah', '/assets/quiz_borobudur.jpg'),
('quiz-sains-1', 'Sains Eksplorasi: Antariksa & Quantum', 'Tantangan fisika kosmologi dan komputasi kuantum masa depan.', 'Sains & Teknologi', 'Sulit', '/assets/quiz_space.jpg');

INSERT INTO `questions` (`id`, `quiz_id`, `question_text`, `media_type`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_index`, `time_limit_sec`, `explanation`, `order_num`) VALUES
('q1', 'quiz-budaya-1', 'Candi megah Borobudur didirikan pada abad ke-8 oleh wangsa apakah?', 'image', 'Wangsa Syailendra', 'Wangsa Sanjaya', 'Kerajaan Majapahit', 'Kerajaan Singasari', 0, 15, 'Candi Borobudur didirikan pada masa kejayaan Wangsa Syailendra.', 1),
('q2', 'quiz-budaya-1', 'Di manakah habitat asli satwa purba langka Komodo?', 'image', 'Taman Nasional Komodo, NTT', 'Taman Nasional Way Kambas', 'Taman Nasional Ujung Kulon', 'Taman Nasional Baluran', 0, 15, 'Komodo adalah reptil purba endemik di kepulauan Nusa Tenggara Timur.', 2);
