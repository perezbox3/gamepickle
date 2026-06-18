import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import GameCard, { Badge, fmtHours } from '../components/GameCard'
import { getAnonSteamId } from '../lib/auth'
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
      <circle cx="8.5" cy="8.5" r="1.2" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.2" fill="currentColor"/>
      <circle cx="15.5" cy="8.5" r="1.2" fill="currentColor"/><circle cx="8.5" cy="15.5" r="1.2" fill="currentColor"/>
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
function IconSteam(p) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M11.98 2C6.65 2 2.28 6.13 2 11.4l5.37 2.22a2.86 2.86 0 0 1 1.62-.5l2.39-3.46v-.05a3.8 3.8 0 1 1 3.8 3.8h-.09l-3.41 2.43a2.86 2.86 0 0 1-5.7.2l-3.84-1.6A10 10 0 1 0 11.98 2z"/>
    </svg>
  )
}

function SkeletonCard() {
  return (
    <div className="game-card">
      <div className="game-card-art">
        <div className="cover">
          <div className="skeleton" style={{ position: 'absolute', inset: 0, borderRadius: 0 }} />
        </div>
      </div>
      <div className="game-card-body">
        <div className="skeleton" style={{ height: 13, width: '80%', margin: '4px 0', borderRadius: 4 }} />
        <div className="skeleton" style={{ height: 11, width: '55%', borderRadius: 4 }} />
      </div>
    </div>
  )
}

function coverStyle(game) {
  if (game.cover_url) return { backgroundImage: `url(${game.cover_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
  return { background: game.coverBg }
}

export default function Library({ user }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // URL param (signed-in user browsing another account) takes priority over localStorage
  const paramSteamId = searchParams.get('steam_id')
  const anonId       = !user ? getAnonSteamId() : null
  // browseId is the external Steam ID being viewed (either signed-in browse or anon)
  const browseId     = paramSteamId || anonId
  const isAnon       = !user && !!anonId       // not signed in, using localStorage
  const isBrowsing   = !!paramSteamId && !!user // signed-in user browsing another account

  const [games, setGames]     = useState([])
  const [profile, setProfile] = useState(null) // browsed account info (name + avatar)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [q, setQ]             = useState('')
  const [filter, setFilter]   = useState('all')

  useEffect(() => {
    const url = browseId
      ? `/api/games.php?steam_id=${encodeURIComponent(browseId)}`
      : user?.steam_id
        ? '/api/games.php'
        : null

    // Reset everything when the target account changes
    setGames([])
    setProfile(null)
    setError('')
    setQ('')
    setFilter('all')

    if (!url) { setLoading(false); return }
    setLoading(true)

    fetch(url)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Own library (authenticated, no steam_id param)
          setGames(data)
        } else if (data.games) {
          // Browsed library — includes profile info
          setGames(data.games)
          setProfile(data.profile || null)
        } else {
          setError(data.error || 'Failed to load library.')
        }
      })
      .catch(() => setError('Could not reach server.'))
      .finally(() => setLoading(false))
  }, [user, browseId])

  const sorted    = [...games].sort((a, b) => b.hours - a.hours)
  const [top1, top2, top3] = sorted

  const ql   = q.trim().toLowerCase()
  const match = g => !ql || g.name.toLowerCase().includes(ql) || (g.genre || '').toLowerCase().includes(ql)
  const pool  = games.filter(g => match(g) && (filter === 'all' || g.recent))
  const showHero = !ql && filter === 'all' && sorted.length >= 3
  const totalHours = Math.round(games.reduce((s, g) => s + g.hours, 0))

  if (loading) {
    return (
      <div className="container">
        <div className="page-head">
          <div className="mono-label">~/steam/library</div>
          <h1 className="page-title">{browseId ? 'Loading library…' : 'Your library'}</h1>
        </div>
        <div className="section-bar">
          <IconClock style={{ width: 15, height: 15, color: 'var(--pickle)' }} className="spin" />
          <h2>Loading library…</h2><div className="rule" />
        </div>
        <div className="game-grid">{Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}</div>
      </div>
    )
  }

  // No games — different message for anonymous vs authenticated
  if (!loading && games.length === 0) {
    return (
      <div className="container">
        <div className="page-head">
          <div className="mono-label">~/steam/library</div>
          <h1 className="page-title">Your library</h1>
        </div>
        <div className="empty fade-up">
          <div className="empty-emoji"><IconSteam style={{ width: 48, height: 48 }} /></div>
          <h3>{error || 'No games found'}</h3>
          {(isAnon || isBrowsing)
            ? <p>Make sure that Steam profile is set to <strong>Public</strong> at steamcommunity.com → Edit Profile → Privacy Settings.</p>
            : <p>Link your Steam account in Settings and sync your library to see your games here.</p>}
          {(isAnon || isBrowsing)
            ? <button className="btn btn-outline" onClick={() => navigate('/')}>Try a different Steam ID</button>
            : <button className="btn btn-primary" onClick={() => navigate('/settings')}>Go to Settings</button>}
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      {isBrowsing && (
        <div className="anon-banner">
          Browsing another Steam library ·{' '}
          <button className="anon-banner-btn" onClick={() => navigate('/library')}>View your library</button>
          {' '}·{' '}
          <button className="anon-banner-btn" onClick={() => navigate('/')}>Search another</button>
        </div>
      )}
      {isAnon && (
        <div className="anon-banner">
          Previewing a Steam library ·{' '}
          <a href="/api/auth/login.php" className="anon-banner-link">Sign in to save permanently + unlock stats</a>
          {' '}·{' '}
          <button className="anon-banner-btn" onClick={() => navigate('/')}>Change Steam ID</button>
        </div>
      )}
      <div className="page-head">
        <div className="mono-label">~/steam/library</div>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {profile?.avatar && (
            <img src={profile.avatar} alt="" style={{ width: 36, height: 36, borderRadius: 8, border: 'var(--bd)', flexShrink: 0, imageRendering: 'pixelated' }} />
          )}
          {profile ? `${profile.name}'s library` : 'Your library'}
        </h1>
        <div className="page-sub">
          {games.length} games · {games.filter(g => g.recent).length} played recently · {totalHours}h logged
        </div>
      </div>

      <div className="lib-toolbar">
        <div className="lib-search">
          <IconSearch style={{ width: 18, height: 18, color: 'var(--ink-soft)', flexShrink: 0 }} />
          <input placeholder="Search games…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <div className="seg">
          <button className={filter === 'all' ? 'on' : ''} onClick={() => setFilter('all')}>All</button>
          <button className={filter === 'recent' ? 'on' : ''} onClick={() => setFilter('recent')}>Recent</button>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/pick')}>
          <IconDice style={{ width: 15, height: 15 }} /> Pick for me
        </button>
      </div>

      {pool.length === 0 ? (
        <div className="empty fade-up">
          <div className="empty-emoji">🥒</div>
          <h3>Nothing matches "{q}"</h3>
          <p>Try a different name or clear the filter.</p>
          <button className="btn btn-outline" onClick={() => { setQ(''); setFilter('all') }}>Clear filters</button>
        </div>
      ) : (
        <div className="fade-up">
          {showHero && (
            <>
              <div className="section-bar">
                <IconStar style={{ width: 15, height: 15, color: 'var(--brine)' }} />
                <h2>Most played</h2><div className="rule" />
              </div>
              <div className="lib-hero">
                <div className="lib-hero-main" style={coverStyle(top1)} onClick={() => navigate(`/game/${top1.app_id}`, { state: { game: top1, from: '/library' } })}>
                  <div className="scrim" />
                  {!top1.cover_url && <span className="mk">{top1.mark}</span>}
                  <div className="lib-hero-content">
                    <div className="tag">#1 · most hours</div>
                    <h3>{top1.name}</h3>
                    <div className="row">
                      <Badge kind="accent" icon={IconClock}>{fmtHours(top1.hours)}</Badge>
                      {top1.genre && <Badge kind="muted">{top1.genre}</Badge>}
                      {top1.recent && <Badge kind="pickle">Played recently</Badge>}
                    </div>
                  </div>
                </div>
                <div className="lib-hero-side">
                  {[top2, top3].map((g, i) => (
                    <div key={g.id} className="lib-hero-mini" onClick={() => navigate(`/game/${g.app_id}`, { state: { game: g, from: '/library' } })}>
                      <div className="thumb" style={coverStyle(g)}>
                        {!g.cover_url && <span style={{ position: 'absolute', bottom: -8, right: -2, fontSize: 34, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.1)' }}>{g.mark}</span>}
                      </div>
                      <div className="info">
                        <div className="nm">{g.name}</div>
                        <div className="mt">{g.genre || '—'} · {fmtHours(g.hours)}</div>
                      </div>
                      <div className="pos">#{i + 2}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="section-bar">
            <h2>{filter === 'recent' ? 'Recently played' : 'All games'}</h2>
            <span className="count">{pool.length}</span>
            <div className="rule" />
          </div>
          <div className="game-grid">
            {pool.map(g => <GameCard key={g.id} game={g} />)}
          </div>
        </div>
      )}
    </div>
  )
}
