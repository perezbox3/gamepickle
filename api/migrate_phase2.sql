-- Phase 2: Steam account linking
-- Run: mysql -u gamepickle_user -p gamepickle < api/migrate_phase2.sql

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS steam_id     VARCHAR(20)  DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS steam_name   VARCHAR(100) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS steam_avatar VARCHAR(255) DEFAULT NULL;

CREATE TABLE IF NOT EXISTS steam_games (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    app_id          INT NOT NULL,
    name            VARCHAR(255) NOT NULL,
    playtime_mins   INT DEFAULT 0,
    playtime_2weeks INT DEFAULT 0,
    img_icon_url    VARCHAR(64),
    UNIQUE KEY uq_user_game (user_id, app_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
