import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import GameCard, { Badge, fmtHours, CoverArt } from '../components/GameCard'
import { GAMES } from '../lib/games'
import './Library.css'

function IconSearch(p) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
    </svg>
  )
}
function IconDice(p) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="3" width="18" height="18" rx="3"/>
      <circle cx="8.5" cy="8.5" r="1.2" fill="currentColor"/>
      <circle cx="15.5" cy="15.5" r="1.2" fill="currentColor"/>
      <circle cx="15.5" cy="8.5" r="1.2" fill="currentColor"/>
      <circle cx="8.5" cy="15.5" r="1.2" fill="currentColor"/>
    </svg>
  )
}
function IconClock(p) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
    </svg>
  )
}
function IconStar(p) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="m12 3 2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.8L6.6 19.6l1-6L3.3 9.4l6-.9z"/>
    </svg>
  )
}
function IconCheck(p) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  )
}
function IconSteam(p) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M11.98 2C6.65 2 2.28 6.13 2 11.4l5.37 2.22a2.86 2.86 0 0 1 1.62-.5l2.39-3.46v-.05a3.8 3.8 0 1 1 3.8 3.8h-.09l-3.41 2.43a2.86 2.86 0 0 1-5.7.2l-3.84-1.6A10 10 0 1 0 11.98 2zM8.5 17.6l-1.23-.5a2.15 2.15 0 0 0 3.97-1.66 2.15 2.15 0 0 0-2.85-1.13l1.27.53a1.58 1.58 0 1 1-1.16 2.93zm8.8-7.8a2.53 2.53 0 1 0-5.06 0 2.53 2.53 0 0 0 5.06 0zm-4.43 0a1.9 1.9 0 1 1 3.8 0 1.9 1.9 0 0 1-3.8 0z"/>
    </svg>
  )
}

function SkeletonCard() {
  return (
    <div className="game-card">
      <div className="skeleton" style={{ aspectRatio: '1/1', borderRadius: '8px' }} />
      <div className="game-card-body">
        <div className="skeleton" style={{ height: 13, width: '80%', margin: '4px 0' }} />
        <div className="skeleton" style={{ height: 11, width: '55%' }} />
      </div>
    </div>
  )
}

export default function Library() {
  const navigate = useNavigate()
  const games = GAMES
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all')
  const [syncing, setSyncing] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setSyncing(false), 1200)
    return () => clearTimeout(t)
  }, [])

  const sorted = [...games].sort((a, b) => b.hours - a.hours)
  const [top1, top2, top3] = sorted

  const ql = q.trim().toLowerCase()
  const match = g => !ql || g.name.toLowerCase().includes(ql) || g.genre.toLowerCase().includes(ql)
  const pool = games.filter(g => match(g) && (filter === 'all' || g.installed))
  const installed = pool.filter(g => g.installed)
  const notInstalled = pool.filter(g => !g.installed)
  const showHero = !ql && filter === 'all'

  return (
    <div className="container">
      <div className="page-head">
        <div className="mono-label">~/steam/library</div>
        <h1 className="page-title">Your library</h1>
        <div className="page-sub">
          {games.length} games · {games.filter(g => g.installed).length} installed · {Math.round(games.reduce((s, g) => s + g.hours, 0))}h logged
        </div>
      </div>

      <div className="lib-toolbar">
        <div className="lib-search">
          <IconSearch style={{ width: 18, height: 18, color: 'var(--ink-soft)', flexShrink: 0 }} />
          <input placeholder="Search games or genres…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <div className="seg">
          <button className={filter === 'all' ? 'on' : ''} onClick={() => setFilter('all')}>All</button>
          <button className={filter === 'installed' ? 'on' : ''} onClick={() => setFilter('installed')}>Installed</button>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/pick')}>
          <IconDice style={{ width: 15, height: 15 }} /> Pick for me
        </button>
      </div>

      {syncing ? (
        <>
          <div className="section-bar">
            <IconClock style={{ width: 15, height: 15, color: 'var(--pickle)' }} className="spin" />
            <h2>Syncing with Steam…</h2>
            <div className="rule" />
          </div>
          <div className="game-grid">
            {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </>
      ) : pool.length === 0 ? (
        <div className="empty fade-up">
          <div className="empty-emoji">🥒</div>
          <h3>Nothing matches "{q}"</h3>
          <p>No games in your library fit that search. Try a different name or genre.</p>
          <button className="btn btn-outline" onClick={() => { setQ(''); setFilter('all') }}>Clear filters</button>
        </div>
      ) : (
        <div className="fade-up">
          {showHero && (
            <>
              <div className="section-bar">
                <IconStar style={{ width: 15, height: 15, color: 'var(--brine)' }} />
                <h2>Most played</h2>
                <div className="rule" />
              </div>
              <div className="lib-hero">
                <div className="lib-hero-main" style={{ background: top1.coverBg }} onClick={() => navigate('/pick')}>
                  <div className="scrim" />
                  <span className="mk">{top1.mark}</span>
                  <div className="lib-hero-content">
                    <div className="tag">#1 · most hours</div>
                    <h3>{top1.name}</h3>
                    <div className="row">
                      <Badge kind="accent" icon={IconClock}>{fmtHours(top1.hours)}</Badge>
                      <Badge kind="muted">{top1.genre}</Badge>
                      {top1.installed && <Badge kind="pickle" icon={IconCheck}>Installed</Badge>}
                    </div>
                  </div>
                </div>
                <div className="lib-hero-side">
                  {[top2, top3].map((g, i) => (
                    <div key={g.id} className="lib-hero-mini" onClick={() => navigate('/pick')}>
                      <div className="thumb" style={{ background: g.coverBg }}>
                        <span style={{ position: 'absolute', bottom: -8, right: -2, fontSize: 34, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.1)' }}>{g.mark}</span>
                      </div>
                      <div className="info">
                        <div className="nm">{g.name}</div>
                        <div className="mt">{g.genre} · {fmtHours(g.hours)}</div>
                      </div>
                      <div className="pos">#{i + 2}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {filter === 'all' && installed.length > 0 && (
            <>
              <div className="section-bar">
                <span className="installed-dot" style={{ position: 'static' }} />
                <h2>Installed</h2>
                <span className="count">{installed.length}</span>
                <div className="rule" />
              </div>
              <div className="game-grid">
                {installed.map(g => <GameCard key={g.id} game={g} />)}
              </div>
            </>
          )}

          {filter === 'all' && notInstalled.length > 0 && (
            <>
              <div className="section-bar">
                <h2>Not installed</h2>
                <span className="count">{notInstalled.length}</span>
                <div className="rule" />
              </div>
              <div className="game-grid">
                {notInstalled.map(g => <GameCard key={g.id} game={g} />)}
              </div>
            </>
          )}

          {filter === 'installed' && (
            <>
              <div className="section-bar">
                <h2>Installed games</h2>
                <span className="count">{installed.length}</span>
                <div className="rule" />
              </div>
              <div className="game-grid">
                {installed.map(g => <GameCard key={g.id} game={g} />)}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
