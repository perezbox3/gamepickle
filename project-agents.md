# project-agents.md — gamepickle

## Identity

**Name:** gamepickle  
**URL:** https://gamepickle.perezbox3.com  
**Purpose:** Game-picker web app — links your Steam library, runs a 5-question preference quiz, and recommends what to play tonight.  
**Current phase:** Phase 8 complete (friends leaderboard). Phase 9 (dashboard card on my.perezbox3.com) is next.

---

## Stack

- **Frontend:** React 19 + Vite 8, react-router-dom v7, plain CSS with custom properties
- **Backend:** PHP 8.3, raw PDO — no Composer, no framework, no ORM
- **Auth:** Google OAuth 2.0 via PHP redirect flow — httpOnly session cookie (`gp_sid`), no Supabase, no JWT
- **Database:** MySQL, database name `gamepickle`, PDO with `ERRMODE_EXCEPTION` and `FETCH_ASSOC`
- **External APIs:** Steam Web API (server-side only, key in env), SteamSpy (unauthenticated), Google OAuth2 + userinfo
- **HTTP client:** Raw `curl_*` functions in `api/config.php` — no Guzzle, no Composer packages
- **Fonts:** Press Start 2P (display), Outfit (UI), VT323 (mono labels) — loaded from Google Fonts
- **Design system:** INDIE ARCADE / neo-brutalist — `--paper` cream palette, hard drop shadows, pixel fonts
- **Build:** Vite (`npm run build` → `dist/`), Nginx serves `dist/` as SPA, routes `/api/` to php8.3-fpm
- **Node:** use `npm`, not `yarn` or `pnpm`
- **NOT used:** Supabase, Composer, any PHP framework, any CSS framework, TypeScript

---

## Commands

```bash
npm run dev      # Dev server at http://localhost:5173
npm run build    # Production build → dist/
npm run preview  # Preview production build locally
```

Local dev requires `VITE_AUTH_ENABLED=false` (or unset) to bypass PHP auth. Set `VITE_AUTH_ENABLED=true` to run against a local PHP server.

---

## Deployment

**Server:** Linode VPS — SSH alias `personal` (perezbox3@45.33.119.137)  
**Server path:** `/var/www/gamepickle.perezbox3.com`  
**Nginx:** serves `dist/` as SPA; all `/api/*` requests proxy to php8.3-fpm  
**Logs:** `api/logs/error.log` (written by the global exception handler in `api/config.php`)

**Full deploy sequence:**
```
1. npm run build         # verify clean locally
2. git add / commit / push
3. ssh -o ServerAliveInterval=60 personal \
     "cd /var/www/gamepickle.perezbox3.com && git pull && npm install && npm run build"
```

Run one SSH session for the entire deploy — multiple connections can trigger rate limits.  
No schema migrations run automatically — manual SQL on the server is required for schema changes (see diagnostic-engineer section).

---

## Agents

### tech-lead

**Phase roadmap (all phases, current marked):**
- [x] Phase 0: Scaffold + INDIE ARCADE design system
- [x] Phase 1: Google OAuth (PHP + MySQL sessions)
- [x] Phase 2: Steam account linking + library sync
- [x] Phase 3: Rich game data (genres, weighted scoring) + picker improvements
- [x] Phase 4: Stats & data page
- [x] Phase 5: Rich game detail on picker results
- [x] Phase 6: FAFO mode — random game from all of Steam via SteamSpy
- [x] Phase 7: Persist settings (genre bans, defaults) to MySQL
- [x] Phase 8: Friends leaderboard — compare playtime on shared games
- [ ] **Phase 9 (current):** Dashboard card on my.perezbox3.com
- [ ] Phase 10+: TBD

**In scope for current work:** Dashboard card integration with my.perezbox3.com. Likely a read-only embed or API endpoint gamepickle exposes.

**Explicitly out of scope unless promoted:** multiplayer, notifications, Steam achievements, mobile app, subscription/payments.

**Re-plan trigger:** After Phase 9 ships, re-plan for Phase 10.

---

### senior-dev-mentor

**Established architectural decisions (do not relitigate):**
- No Composer — raw curl is deliberate. Adding Composer introduces dependency management overhead not justified for this scale.
- No Supabase — auth migrated to PHP sessions in Phase 1. `src/lib/supabase.js` exists but is unused; kept to avoid import errors.
- SameSite=Lax on `gp_sid` cookie — not Strict. Strict breaks OAuth redirects (the callback from Google would drop the cookie). This is a known, accepted tradeoff.
- No TypeScript — plain JS + JSX. Adding types is out of scope unless Anthony decides to refactor.
- PDO singleton via `db()` static — one connection per request lifecycle, which is correct for PHP's share-nothing model.

**Patterns to follow:**
- All DB access through `db()` helper in `api/config.php`. Parameterized queries every time.
- All API responses via `json_out()` helper — never `echo json_encode()` + `exit` inline.
- All external HTTP via `http_get()`, `http_post()`, or `curl_get()` from `api/config.php`. Never inline curl.
- Auth check at the top of every protected endpoint: `$user = get_session_user(); if (!$user) json_out(['error' => 'Unauthorized'], 401);`
- React pages fetch from `/api/*.php` directly — no abstraction layer beyond what's already in `src/lib/`.

**Patterns to avoid:**
- Do not add `display_errors = 1` anywhere — the global exception handler in `api/config.php` owns error output.
- Do not use `$_POST` for JSON payloads — use `json_decode(file_get_contents('php://input'), true)`.
- Do not trust `cover_url` from the DB to be populated — fallback to Steam CDN URL constructed from `app_id`.

---

### code-reviewer

**SQL:** All queries use PDO prepared statements. Flag any string interpolation in SQL immediately — it is never acceptable in this codebase. Watch for missing `execute()` calls and unchecked `fetch()` results.

**PHP danger zones:**
- `api/steam/sync.php` does a bulk upsert of the full Steam library — check for memory limits on large libraries (some users own 1000+ games).
- `api/steam/enrich.php` calls external APIs per game — watch for timeout handling and partial failure leaving inconsistent enrichment state.
- `api/friends.php` resolves a user-supplied SteamID64 — confirm it goes through `resolve_steam_id()` and not raw user input.
- `api/steam/fafo-global.php` calls SteamSpy unauthenticated — the response schema can change; check for defensive null handling.

**JS danger zones:**
- `src/lib/games.js` contains the quiz scoring logic (`scoreGame()`) — any changes to scoring must be tested against mock games before real library.
- `src/components/PickleField.jsx` renders on a canvas — check for memory leaks (animation frame cleanup on unmount).

**Conventions:**
- CSS uses custom properties from `src/index.css` (`--paper`, `--pickle`, `--ink`, etc.) — no hardcoded hex colors in component CSS.
- React components are function components with hooks only — no class components.
- File naming: pages are `PageName.jsx` + `PageName.css` co-located in `src/pages/`.

---

### security-reviewer

**Auth surface:**
- Session cookie: `gp_sid`, 64-char hex (32 random bytes), httpOnly, Secure, SameSite=Lax, 30-day expiry
- Session validation: `get_session_user()` in `api/config.php` — checks cookie length (must be 64), queries `sessions` JOIN `users`, verifies `expires_at > NOW()`
- OAuth CSRF: `oauth_state` stored in PHP session, verified with `hash_equals()` in `api/auth/callback.php`
- Session pruning: ~1% of requests prune expired sessions via `DELETE FROM sessions WHERE expires_at < NOW()`

**Always trigger security review when touching:**
- Any file under `api/auth/`
- `api/config.php` (session helpers, cookie flags)
- `api/steam/link.php` (user-supplied Steam ID input)
- `api/friends.php` (user-supplied friend SteamID64)
- `api/auth/delete.php` (account deletion — irreversible, must be authenticated)
- Any new endpoint that writes to the DB on behalf of a user

**Input entry points:**
- `api/steam/link.php` — user-supplied Steam ID or vanity URL → goes through `resolve_steam_id()`
- `api/friends.php` — user-supplied friend SteamID64 — confirm validation
- `api/auth/callback.php` — `$_GET['code']` and `$_GET['state']` from Google redirect
- `api/settings.php` — user-supplied genre bans and session length defaults
- All endpoints read `$_COOKIE['gp_sid']` — confirm length check before any DB use

**Secrets:** `STEAM_API_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `DB_PASS` — all in `.env` (gitignored), loaded by `api/config.php`. Never in PHP source, never in JS bundles, never in logs.

---

### diagnostic-engineer

**Request entry points:**
- React SPA: `dist/index.html` served by Nginx for all non-API routes
- API: Nginx routes `/api/*` to php8.3-fpm; each PHP file is its own endpoint (no router)
- PHP entry: every API file starts with `require_once dirname(__DIR__) . '/config.php';`

**Key config files:**
- `api/config.php` — env loader, PDO singleton, session helpers, curl helpers, Steam URL builder
- `.env` — all secrets and DB connection (not in git)
- `vite.config.js` — build config, `/api` proxy for local dev
- `nginx` config on server — serves `dist/` as SPA, proxies `/api/`

**DB schema:**
- `api/schema.sql` — initial schema: `users` (id, google_id, email, name, avatar), `sessions` (id, user_id, expires_at)
- `api/migrate_phase2.sql` — adds `steam_id`, `steam_name`, `steam_avatar` to `users`; creates `steam_games` table (app_id, user_id, name, playtime_mins, cover_url, last_played, genre, metacritic)
- Schema changes must be applied manually on the server before deploying code that depends on them

**Known tricky areas:**
- Steam library sync (`api/steam/sync.php`) uses `INSERT ... ON DUPLICATE KEY UPDATE` — if the schema changes, verify the upsert columns match.
- `src/lib/supabase.js` is imported but unused — it is a stub kept to avoid breaking imports. Do not remove without checking all import sites.
- `PickleField.jsx` uses a canvas animation with `requestAnimationFrame` — check `useEffect` cleanup on unmount if diagnosing visual glitches.
- SteamSpy calls (`api/steam/fafo-global.php`, `api/steam/enrich.php`) are unauthenticated and rate-limited externally — transient failures are expected.

---

### devops-engineer

**Server:** Linode VPS, `personal` alias = `perezbox3@45.33.119.137`  
**Server-side path:** `/var/www/gamepickle.perezbox3.com`  
**Process manager:** php8.3-fpm (managed by systemd)  
**Web server:** Nginx — config at `/etc/nginx/sites-available/gamepickle.perezbox3.com` (confirm on server)

**Required env vars on server (in `.env` at project root):**
- `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS` — MySQL connection
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — Google OAuth app credentials
- `STEAM_API_KEY` — from steamcommunity.com/dev/apikey
- `APP_URL=https://gamepickle.perezbox3.com`
- `VITE_AUTH_ENABLED=true`

**Health check:** `GET /api/health.php` returns JSON with DB connectivity status.

**Log location:** `api/logs/error.log` (relative to project root on server)

**Verify deploy:** After `git pull && npm run build`, check `/api/health.php` responds 200, then load the landing page and verify `/api/auth/me.php` returns 401 (not a PHP error).

**Schema change protocol:** SSH in → run SQL manually → `DESCRIBE <table>` to confirm → then `git pull`.

---

## File Map

```
api/config.php              → Env loader, PDO singleton, session helpers, curl helpers, Steam URL builder
api/schema.sql              → Initial DB schema (users, sessions)
api/migrate_phase2.sql      → Phase 2 migration (Steam fields on users, steam_games table)
api/auth/login.php          → Redirect to Google OAuth
api/auth/callback.php       → Exchange OAuth code, upsert user, create session, set cookie
api/auth/me.php             → Return current user JSON (401 if not authed)
api/auth/logout.php         → DELETE session, clear cookie
api/auth/delete.php         → Delete account + all data (authenticated, irreversible)
api/steam/link.php          → Validate and save Steam ID to user
api/steam/sync.php          → Fetch GetOwnedGames, upsert steam_games
api/steam/unlink.php        → Clear steam_id, delete steam_games
api/steam/enrich.php        → Fetch genre/metacritic data from SteamSpy per game
api/steam/preview.php       → Preview Steam profile before linking
api/steam/fafo-global.php   → Random game from SteamSpy top 1000 (FAFO mode)
api/games.php               → GET user's Steam library from DB
api/game.php                → GET single game detail
api/stats.php               → GET aggregated play stats for the user
api/friends.php             → GET friend leaderboard (shared game playtime comparison)
api/settings.php            → GET/POST genre bans and session defaults
api/health.php              → Health check — DB connectivity
src/App.jsx                 → Router, useAuth hook (fetches /api/auth/me.php), AuthedRoute
src/index.css               → Design tokens (--paper, --pickle, --ink, etc.)
src/App.css                 → Shared component styles
src/lib/auth.js             → getMe(), logout() — wraps /api/auth/*.php
src/lib/games.js            → QUIZ questions, scoreGame() scorer, GENRES list
src/lib/supabase.js         → UNUSED stub — kept to avoid import errors
src/pages/Landing.jsx       → Home/login page — Google OAuth entry point
src/pages/Library.jsx       → Steam library browser with filter/sort
src/pages/Picker.jsx        → 5-question quiz + recommendation result
src/pages/Settings.jsx      → Steam link/unlink, genre bans, account deletion
src/pages/Stats.jsx         → Play stats dashboard
src/pages/Friends.jsx       → Friends leaderboard
src/pages/GameDetail.jsx    → Single game detail view
src/pages/Privacy.jsx       → Privacy policy
src/components/Navbar.jsx   → Top nav with logo + auth state
src/components/GameCard.jsx → Game card with cover art, hours, badges
src/components/PickleField.jsx → Canvas pickle background animation
public/logo-cream.png       → Landing page logo (transparent PNG)
public/logo-green.png       → Navbar logo (transparent PNG)
public/pickle-sprite.png    → Sprite sheet for PickleField animation
```

---

## Environment Variables

| Key | Purpose | Source |
|-----|---------|--------|
| `VITE_AUTH_ENABLED` | `true` = require PHP auth; unset/`false` = dev bypass | Set manually per environment |
| `DB_HOST` | MySQL host | Server config (usually `localhost`) |
| `DB_NAME` | MySQL database name | `gamepickle` |
| `DB_USER` | MySQL user | Server config |
| `DB_PASS` | MySQL password | Server config |
| `GOOGLE_CLIENT_ID` | Google OAuth app client ID | Google Cloud Console → Credentials |
| `GOOGLE_CLIENT_SECRET` | Google OAuth app secret | Google Cloud Console → Credentials |
| `STEAM_API_KEY` | Steam Web API key | steamcommunity.com/dev/apikey |
| `APP_URL` | Canonical app URL (no trailing slash) | `https://gamepickle.perezbox3.com` |
