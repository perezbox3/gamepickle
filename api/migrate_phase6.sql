-- Phase 6: per-user sync/enrich rate-limit timestamps
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_sync_at    TIMESTAMP NULL DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_enrich_at  TIMESTAMP NULL DEFAULT NULL;
