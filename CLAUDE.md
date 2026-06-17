# CLAUDE.md — gamepickle

A game-picker web app at gamepickle.perezbox3.com. Links your Steam library, runs a 5-question preference quiz, and recommends what to play tonight. Design system: INDIE ARCADE / neo-brutalist (brine cream palette, hard drop shadows, pixel fonts).

## Stack

- **Frontend**: React 19 + Vite 8, react-router-dom v7
- **Auth**: Google OAuth via PHP — httpOnly session cookie, no Supabase
- **Database**: MySQL (`gamepickle` DB, users + sessions + steam_games tables)
- **Backend**: PHP 8.3 API at `/api/` (no Composer — raw curl for external HTTP)
- **Styling**: Plain CSS with custom properties, no framework
- **Fonts**: Press Start 2P (display), Outfit (UI), VT323 (mono labels)
- **Server**: Linode VPS, SSH alias `personal` (perezbox3@45.33.119.137)
- **Server path**: `/var/www/gamepickle.perezbox3.com`
- **Nginx**: serves `/dist` as SPA, routes `/api/` to php8.3-fpm

## Commands (run from this directory)

```bash
npm run dev      # Dev server at http://localhost:5173
npm run build    # Production build → dist/
npm run preview  # Preview production build
```

## Environment variables

```
# .env (gitignored — never commit)
VITE_AUTH_ENABLED=true       # false/unset = dev bypass (no PHP needed locally)

DB_HOST=localhost
DB_NAME=gamepickle
DB_USER=gamepickle_user
DB_PASS=...

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

STEAM_API_KEY=...            # steamcommunity.com/dev/apikey

APP_URL=https://gamepickle.perezbox3.com
```

## Project structure

```
api/
├── config.php           # Env loader, PDO, session helpers, curl helpers
├── schema.sql           # Initial DB schema (users, sessions)
├── migrate_phase2.sql   # Phase 2: steam_id/name/avatar on users, steam_games table
├── games.php            # GET — user's Steam library from DB
├── auth/
│   ├── login.php        # GET  — redirect to Google OAuth
│   ├── callback.php     # GET  — exchange code, set session cookie
│   ├── me.php           # GET  — return current user JSON (401 if not authed)
│   └── logout.php       # POST — delete session, clear cookie
└── steam/
    ├── link.php         # POST — validate Steam ID or vanity URL, save to user
    ├── sync.php         # POST — fetch GetOwnedGames, upsert steam_games
    └── unlink.php       # POST — clear steam_id, delete steam_games

src/
├── lib/
│   ├── auth.js          # getMe(), logout() — wraps /api/auth/*.php
│   ├── games.js         # QUIZ questions, scoreGame() scorer, GENRES list (mock fallback)
│   └── supabase.js      # UNUSED — kept to avoid breaking imports during transition
├── pages/
│   ├── Landing.jsx/.css
│   ├── Library.jsx/.css
│   ├── Picker.jsx/.css
│   └── Settings.jsx/.css
├── components/
│   ├── Navbar.jsx
│   ├── GameCard.jsx     # CoverArt (real img or gradient fallback), Badge, fmtHours
│   └── PickleField.jsx  # Canvas pickle background animation
├── App.jsx              # Router, useAuth (fetches /api/auth/me.php), AuthedRoute
├── App.css              # Shared component styles
└── index.css            # Design tokens (--paper, --pickle, --brine, --spicy, --ink, etc.)
```

## Game object shape

Games from the API (`/api/games.php`) look like:
```js
{
  id: "440",          // string (app_id)
  app_id: 440,        // number
  name: "Team Fortress 2",
  hours: 20.6,        // float, playtime_mins / 60
  cover_url: "https://cdn.akamai.steamstatic.com/steam/apps/440/header.jpg",
  genre: null,        // populated in Phase 3
  recent: true,       // played in last 2 weeks
  installed: false,   // unknown from Web API; Phase 3
  // mock-only fields (not present for real games):
  coverBg: null,
  mark: null,
}
```

Mock games in `src/lib/games.js` use `coverBg` (CSS gradient) and `mark` (2-letter). `CoverArt` handles both.

## Design tokens (index.css)

```css
--paper: #F4E7BE   --paper-2: #EEDFA8   --card: #FCF7E6
--ink: #1B2A14     --ink-soft: #46512f
--pickle: #5FA03A  --pickle-deep: #3C6B25  --pickle-bright: #8FCB46
--dill: #B6D85A    --brine: #F0C23A     --spicy: #E2622E
--shadow: 5px 5px 0 var(--ink)
--font-display: 'Press Start 2P'
--font-ui: 'Outfit'
--font-mono: 'VT323'
```

## Auth flow

1. Landing → "Continue with Google" → `window.location.href = '/api/auth/login.php'`
2. PHP redirects to Google OAuth consent
3. Google → `/api/auth/callback.php?code=...&state=...`
4. PHP validates, upserts user, creates DB session, sets `gp_sid` httpOnly cookie
5. Redirect to `/library`
6. On each load, `App.jsx` calls `getMe()` → `GET /api/auth/me.php` (reads cookie)

## Steam API notes

- Free REST API, no OAuth — just a key at steamcommunity.com/dev/apikey
- All calls are server-side (PHP) — key never hits the browser
- Key endpoints: `GetPlayerSummaries` (validate ID/get profile), `GetOwnedGames` (library + playtime), `ResolveVanityURL` (username → SteamID64)
- SteamID64 = 17-digit number starting with 7656119
- Cover art: `https://cdn.akamai.steamstatic.com/steam/apps/{appid}/header.jpg`
- Playtime is returned in minutes; divide by 60 for hours

## Phases

- [x] Phase 0: Scaffold + INDIE ARCADE design system
- [x] Phase 1: Google OAuth (PHP + MySQL sessions, no Supabase)
- [ ] Phase 2: Steam account linking + library sync (current)
- [ ] Phase 3: Rich game data (genres, Metacritic, last played) + real picker scoring
- [ ] Phase 4: Stats & data page — graphs, play patterns, genre breakdown (from improvements.txt)
- [ ] Phase 5: Rich game detail on picker results — expandable cards (from improvements.txt)
- [ ] Phase 6: Random game from ALL of Steam FAFO mode (from improvements.txt)
- [ ] Phase 7: Persist settings (genre bans, defaults) to MySQL
- [ ] Phase 8: Friends leaderboard — compare playtime on shared games (from improvements.txt)
- [ ] Phase 9: Dashboard card on my.perezbox3.com

## Deployment workflow

```
1. Implement + test locally (npm run dev)
2. npm run build — verify clean
3. git add / commit / push
4. ssh personal "cd /var/www/gamepickle.perezbox3.com && git pull && npm install && npm run build"
```

## What NOT to do

- Never commit .env (gitignored)
- Never expose STEAM_API_KEY or DB credentials in frontend code
- Do not use Supabase — auth is PHP sessions, DB is MySQL
- Do not introduce Composer dependencies — use raw PHP curl
- Do not touch dist/ directly — always rebuild from source
