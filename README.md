# gamepickle 🥒

You own 500 games and play the same 3. **gamepickle** picks your next session in 60 seconds.

Link your Steam library, answer 5 questions about your mood and time, and get a smart recommendation from the games you already own. Or smash the FAFO button and let fate decide.

Live at **[gamepickle.perezbox3.com](https://gamepickle.perezbox3.com)**

---

## Features

- **Browse any Steam library** — search by username, profile URL, or SteamID64, no account needed
- **Smart picker** — 5-question quiz (mood, time, play style, genre, effort) with real scoring against your library
- **Game detail pages** — click any game for description, developer info, screenshots, playtime, and Metacritic score
- **Stats page** — library overview, genre breakdown chart, play personality cards, most played list, and walk of shame
- **F*** Around & Find Out** — skip the quiz and get a random pick from your library
- **Sign in with Google** — saves your library to the database for persistent access

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 19 + Vite 8, react-router-dom v7 |
| Auth | Google OAuth via PHP, httpOnly session cookie |
| Database | MySQL — users, sessions, steam_games tables |
| Backend | PHP 8.3 REST API at `/api/` — no Composer, raw cURL |
| Styles | Plain CSS with custom properties, no framework |
| Fonts | Press Start 2P (display), Outfit (UI), VT323 (mono) |
| Server | Linode VPS, Nginx serving `/dist` as SPA + php8.3-fpm |

---

## Local Development

**Prerequisites:** Node 18+, a running PHP/MySQL stack if testing auth features.

```bash
# Clone
git clone https://github.com/perezbox3/gamepickle.git
cd gamepickle

# Install deps
npm install

# Copy env and fill in values
cp .env.example .env

# Start dev server (http://localhost:5173)
npm run dev
```

Without PHP/MySQL running locally, set `VITE_AUTH_ENABLED=false` in `.env` to use the mock game library and bypass login.

---

## Environment Variables

```env
# Vite build-time
VITE_AUTH_ENABLED=true          # false = dev bypass, no PHP needed

# PHP runtime (never exposed to browser)
DB_HOST=localhost
DB_NAME=gamepickle
DB_USER=gamepickle_user
DB_PASS=your_db_password

GOOGLE_CLIENT_ID=...            # console.cloud.google.com
GOOGLE_CLIENT_SECRET=...

STEAM_API_KEY=...               # steamcommunity.com/dev/apikey

APP_URL=https://gamepickle.perezbox3.com
```

> **Never commit `.env`** — it is gitignored.

---

## Database Setup

```bash
# Initial schema (users + sessions)
mysql -u gamepickle_user -p gamepickle < api/schema.sql

# Phase 2: Steam account linking
mysql -u gamepickle_user -p gamepickle < api/migrate_phase2.sql

# Phase 3: Genre + Metacritic enrichment columns
mysql -u gamepickle_user -p gamepickle < api/migrate_phase3.sql
```

---

## Deployment

```bash
# 1. Build locally and verify clean
npm run build

# 2. Commit and push
git add .
git commit -m "feat: your change"
git push origin main

# 3. Pull and rebuild on server
ssh personal "cd /var/www/gamepickle.perezbox3.com && git pull && npm run build"
```

---

## Project Structure

```
api/
├── config.php          — DB, session helpers, cURL wrappers, resolve_steam_id()
├── schema.sql          — Initial tables (users, sessions)
├── migrate_phase2.sql  — Steam ID columns + steam_games table
├── migrate_phase3.sql  — Genre/Metacritic/multiplayer columns
├── games.php           — GET library (own DB or Steam API via ?steam_id param)
├── game.php            — GET single game detail from Steam Store API
├── stats.php           — GET aggregated library stats + Steam profile
├── auth/
│   ├── login.php       — Google OAuth redirect
│   ├── callback.php    — OAuth code exchange, session creation
│   ├── me.php          — Current user JSON (401 if unauthenticated)
│   └── logout.php      — Delete session, clear cookie
└── steam/
    ├── link.php        — POST link Steam account (two-step: preview then confirm)
    ├── preview.php     — GET non-destructive Steam account lookup
    ├── sync.php        — POST fetch GetOwnedGames, upsert steam_games
    ├── enrich.php      — POST fetch genre/Metacritic from Store API (50/batch, loops)
    └── unlink.php      — POST remove Steam account + games from DB

src/
├── lib/
│   ├── auth.js         — getMe(), logout(), anon Steam ID helpers
│   └── games.js        — QUIZ, scoreGame(), GENRES, genre inference maps
├── pages/
│   ├── Landing.jsx     — Hero Steam search + Google sign-in
│   ├── Library.jsx     — Browse any Steam library with search + filter
│   ├── GameDetail.jsx  — Single game: store info, playtime, screenshots, tags
│   ├── Stats.jsx       — Library stats, genre chart, play personality, top 10
│   ├── Picker.jsx      — 5-question quiz + FAFO random picker
│   └── Settings.jsx    — Steam link/sync/unlink, genre bans, picker defaults
└── components/
    ├── Navbar.jsx
    ├── GameCard.jsx    — Clickable card linking to /game/:appId
    └── PickleField.jsx — Canvas floating pickle animation (image-based sprite)
```

---

## Roadmap

| Phase | Status | Description |
|---|---|---|
| 0 | ✅ | Scaffold + INDIE ARCADE design system |
| 1 | ✅ | Google OAuth + MySQL sessions |
| 2 | ✅ | Steam linking, library sync, browse any account, data integrity |
| 3 | ✅ | Genre/Metacritic enrichment, real picker scoring |
| 4 | ✅ | Game detail page + Stats/patterns page |
| 5 | Planned | Richer picker results — descriptions, tags, screenshots on result cards |
| 6 | Planned | FAFO from all of Steam (not just your library) |
| 7 | Planned | Persist settings (genre bans, session defaults) to MySQL |
| 8 | Planned | Friends leaderboard — compare playtime on shared games |
| 9 | Planned | Dashboard card on my.perezbox3.com |

---

Built by [perezbox3](https://perezbox3.com)
