# CLAUDE.md — gamepickle

A game-picker web app living at gamepickle.perezbox3.com. Helps users decide what game to play by linking their Steam library and running a short preference quiz.

## Stack

- **Frontend**: React 18 + Vite, react-router-dom, lucide-react
- **Auth + DB**: Supabase (Google OAuth, Postgres)
- **Styling**: Plain CSS with custom properties (no CSS framework)
- **Icons**: lucide-react

## Commands (run from this directory via WSL or terminal with Node)

```bash
npm run dev      # Dev server at http://localhost:5173
npm run build    # Production build → dist/
npm run preview  # Preview production build
```

## Project structure

```
src/
├── lib/
│   ├── supabase.js      # Supabase client (reads VITE_SUPABASE_* env vars)
│   └── questions.js     # Picker quiz question definitions
├── pages/
│   ├── Landing.jsx/.css # Sign-in page (unauthenticated home)
│   ├── Library.jsx/.css # Full game library view
│   ├── Picker.jsx/.css  # Step-by-step game picker quiz + results
│   └── Settings.jsx/.css# Steam linking + genre exclusions + preferences
├── components/
│   ├── Navbar.jsx       # Top nav (brand, links, user avatar, sign out)
│   └── GameCard.jsx     # Reusable game tile used in Library + Picker
├── App.jsx              # Router, auth state, protected route wrapper
├── App.css              # Shared component styles (btn, card, badge, etc.)
└── index.css            # Global reset + CSS custom properties (design tokens)
```

## Design tokens (index.css)

- `--accent` / `--accent-light`: mustard gold (#c9a84c / #e3c47a)
- `--pickle` / `--pickle-light`: pickle green (#5e8c31 / #7ab340)
- Dark backgrounds: `--bg-primary` (#0a0a0b), `--bg-card` (#16161a)
- Fonts: Inter (body), JetBrains Mono (brand/code)

## Environment

Requires a `.env` file (copy from `.env.example`) with Supabase credentials.
App gracefully degrades if Supabase env vars are missing — auth is skipped,
useful for viewing UI without a configured project.

## Deployment

Built as a static SPA. Deploy `dist/` to server. Nginx must serve `index.html`
for all routes (SPA fallback). See nginx config in server setup notes.

## Phases

- [x] Phase 0: Scaffold + theme
- [ ] Phase 1: Supabase project + Google OAuth wired up
- [ ] Phase 2: Steam account linking + library sync (PHP proxy)
- [ ] Phase 3: Real picker logic against Steam library data
- [ ] Phase 4: Persist settings to Supabase DB
- [ ] Phase 5: Dashboard card on my.perezbox3.com
