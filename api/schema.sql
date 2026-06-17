CREATE DATABASE IF NOT EXISTS gamepickle CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gamepickle;

CREATE TABLE IF NOT EXISTS users (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    google_id  VARCHAR(255) UNIQUE NOT NULL,
    email      VARCHAR(255) UNIQUE NOT NULL,
    name       VARCHAR(255),
    avatar     VARCHAR(512),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
    id         CHAR(64) PRIMARY KEY,
    user_id    INT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
