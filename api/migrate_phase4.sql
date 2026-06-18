-- Phase 4: app_type column to filter out DLC / tools / soundtracks from the picker
ALTER TABLE steam_games
  ADD COLUMN app_type VARCHAR(20) DEFAULT NULL AFTER store_fetched;
