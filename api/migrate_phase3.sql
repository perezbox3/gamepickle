-- Phase 3: Rich game data from Steam Store API
-- Run: sudo mysql gamepickle -e "$(cat api/migrate_phase3.sql)"

ALTER TABLE steam_games
    ADD COLUMN genre         VARCHAR(100) DEFAULT NULL,
    ADD COLUMN metacritic    TINYINT UNSIGNED DEFAULT NULL,
    ADD COLUMN is_multiplayer TINYINT(1) NOT NULL DEFAULT 0,
    ADD COLUMN store_fetched TINYINT(1) NOT NULL DEFAULT 0;
