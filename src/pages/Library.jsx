import { useState } from 'react'
import { Search, RefreshCw, Link2 } from 'lucide-react'
import GameCard from '../components/GameCard'
import './Library.css'

const DEMO_GAMES = [
  { appid: 570, name: 'Dota 2', playtime_forever: 12340, img_icon_url: null },
  { appid: 730, name: 'CS2', playtime_forever: 8900, img_icon_url: null, installed: true },
  { appid: 1091500, name: 'Cyberpunk 2077', playtime_forever: 4500, img_icon_url: null, installed: true },
  { appid: 1172470, name: 'Apex Legends', playtime_forever: 3200, img_icon_url: null },
  { appid: 578080, name: 'PUBG', playtime_forever: 2100, img_icon_url: null },
  { appid: 1245620, name: 'Elden Ring', playtime_forever: 9800, img_icon_url: null, installed: true },
]

export default function Library({ steamLinked }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const games = steamLinked ? [] : DEMO_GAMES

  const filtered = games.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      filter === 'all' ||
      (filter === 'installed' && g.installed) ||
      (filter === 'not-installed' && !g.installed)
    return matchSearch && matchFilter
  })

  return (
    <div className="library-page">
      <div className="container">
        <div className="library-header">
          <div>
            <h1 className="page-title">My Library</h1>
            <p className="page-sub">
              {games.length > 0
                ? `${games.length} games`
                : 'Link your Steam account in Settings to populate your library'}
            </p>
          </div>
          <button className="btn btn-ghost btn-sm">
            <RefreshCw size={14} />
            Sync
          </button>
        </div>

        {!steamLinked && (
          <div className="library-connect-banner">
            <Link2 size={18} />
            <div>
              <strong>Connect Steam to get started</strong>
              <p>Head to Settings and link your Steam account to load your real library.</p>
            </div>
            <a href="/settings" className="btn btn-primary btn-sm">Go to Settings</a>
          </div>
        )}

        <div className="library-controls">
          <div className="search-box">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              placeholder="Search your library..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-tabs">
            {['all', 'installed', 'not-installed'].map(f => (
              <button
                key={f}
                className={`filter-tab${filter === f ? ' active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All' : f === 'installed' ? 'Installed' : 'Not Installed'}
              </button>
            ))}
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="games-grid">
            {filtered.map(game => (
              <GameCard key={game.appid} game={game} />
            ))}
          </div>
        ) : (
          <div className="library-empty">
            <p>🎮 No games match your search.</p>
          </div>
        )}
      </div>
    </div>
  )
}
