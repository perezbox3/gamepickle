-- Phase 5: persistent user settings (genre bans + picker defaults)
CREATE TABLE IF NOT EXISTS user_settings (
  user_id         INT          NOT NULL,
  genre_bans      JSON         DEFAULT NULL,
  default_session VARCHAR(10)  NOT NULL DEFAULT 'mid',
  updated_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
