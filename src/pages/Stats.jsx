import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fmtHours } from '../components/GameCard'
import './Stats.css'

function IconSteam(p) {
  return <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M11.98 2C6.65 2 2.28 6.13 2 11.4l5.37 2.22a2.86 2.86 0 0 1 1.62-.5l2.39-3.46v-.05a3.8 3.8 0 1 1 3.8 3.8h-.09l-3.41 2.43a2.86 2.86 0 0 1-5.7.2l-3.84-1.6A10 10 0 1 0 11.98 2z"/></svg>
}
function IconTrophy(p) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 9H4a2 2 0 0 1-2-2V5h4M18 9h2a2 2 0 0 0 2-2V5h-4"/><path d="M12 17v4M8 21h8M6 9a6 6 0 0 0 12 0V3H6v6z"/></svg>
}
function IconStar(p) {
  return <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="m12 3 2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.8L6.6 19.6l1-6L3.3 9.4l6-.9z"/></svg>
}
function IconClock(p) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
}
function IconPackage(p) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M16.5 9.4 7.55 4.24M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
}

function StatCard({ value, label, sub, color }) {
  return (
    <div className="stat-card card">
      <div className="stat-val" style={color ? { color } : {}}>{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  )
}

function GenreBar({ genre, hours, maxHours, count }) {
  const pct = maxHours > 0 ? Math.max((hours / maxHours) * 100, 2) : 0
  return (
    <div className="genre-row">
      <div className="genre-row-name">{genre}</div>
      <div className="genre-row-track">
        <div className="genre-row-fill" style={{ width: pct + '%' }} />
        <span className="genre-row-hours">{fmtHours(hours)}</span>
      </div>
      <div className="genre-row-count">{count}g</div>
    </div>
  )
}

function PersonaCard({ icon, label, desc }) {
  return (
    <div className="persona-card card">
      <div className="persona-icon">{icon}</div>
      <div className="persona-label">{label}</div>
      <div className="persona-desc">{desc}</div>
    </div>
  )
}

function getPersonality(stats) {
  const cards = []

  if (stats.multi_pct > 55) {
    cards.push({ icon: '🎮', label: 'Team Player', desc: `${stats.multi_pct}% of your hours are in multiplayer — you don't game alone.` })
  } else if (stats.multi_pct < 20) {
    cards.push({ icon: '🧙', label: 'Solo Adventurer', desc: `${100 - stats.multi_pct}% solo play. You like your own company.` })
  } else {
    cards.push({ icon: '⚖️', label: 'Flexible', desc: 'Solo or co-op depending on the mood. You go either way.' })
  }

  const backlogPct = stats.total_games > 0
    ? Math.round((stats.unplayed / stats.total_games) * 100)
    : 0
  if (backlogPct > 70) {
    cards.push({ icon: '📦', label: 'Backlog Hoarder', desc: `${backlogPct}% of your library is untouched. Classic Steam sale behavior.` })
  } else if (backlogPct > 40) {
    cards.push({ icon: '🗂️', label: 'Collector', desc: `${backlogPct}% unplayed — you love owning games more than playing them.` })
  } else {
    cards.push({ icon: '🏃', label: 'Active Player', desc: `Only ${backlogPct}% unplayed. You actually play your games. Respect.` })
  }

  if (stats.genres?.length > 0 && stats.total_hours > 0) {
    const top = stats.genres[0]
    const topPct = Math.round((top.hours / stats.total_hours) * 100)
    if (topPct > 50) {
      cards.push({ icon: '🎯', label: 'Genre Loyalist', desc: `${topPct}% of your hours are in ${top.genre}. You know what you like.` })
    } else {
      cards.push({ icon: '🗺️', label: 'Genre Explorer', desc: `You spread your time across ${stats.genres.length} different genres.` })
    }
  }

  if (stats.avg_hours > 50) {
    cards.push({ icon: '🕳️', label: 'Deep Diver', desc: `${stats.avg_hours}h average per played game. You don't do surface level.` })
  } else if (stats.avg_hours < 8 && stats.avg_hours > 0) {
    cards.push({ icon: '🦋', label: 'Game Hopper', desc: `${stats.avg_hours}h average per game. Quick to pick up, quick to move on.` })
  }

  return cards
}

export default function Stats({ user }) {
  const navigate = useNavigate()
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  useEffect(() => {
    fetch('/api/stats.php')
      .then(r => r.json())
      .then(data => { if (data.error) setError(data.error); else setStats(data) })
      .catch(() => setError('Could not load stats.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="container">
        <div className="page-head">
          <div className="mono-label">~/stats</div>
          <h1 className="page-title">Your Stats</h1>
        </div>
        <div className="stats-skeleton">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 10 }} />)}
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="container">
        <div className="page-head"><h1 className="page-title">Stats</h1></div>
        <div className="empty">
          <div className="empty-emoji"><IconSteam style={{ width: 48, height: 48 }} /></div>
          <h3>{error || 'No data yet'}</h3>
          <p>Link your Steam account and sync your library first.</p>
          <button className="btn btn-primary" onClick={() => navigate('/settings')}>Go to Settings</button>
        </div>
      </div>
    )
  }

  const maxGenreHours = stats.genres[0]?.hours ?? 1
  const personas = getPersonality(stats)
  const profile  = stats.steam_profile

  return (
    <div className="container stats-page">
      <div className="page-head">
        <div className="mono-label">~/stats</div>
        <h1 className="page-title">Your Stats</h1>
      </div>

      {/* Account card */}
      {profile && (
        <div className="account-card card">
          <img src={profile.avatar} alt={profile.name} className="account-avatar" />
          <div className="account-info">
            <div className="account-name">{profile.name}</div>
            <div className="account-meta">
              {profile.country && <span>📍 {profile.country}</span>}
              {profile.created && (
                <span>Member since {new Date(profile.created * 1000).getFullYear()}</span>
              )}
              <a href={profile.profile_url} target="_blank" rel="noopener noreferrer" className="account-link">
                <IconSteam style={{ width: 14, height: 14 }} /> View Steam profile
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Overview stats */}
      <div className="section-bar">
        <IconPackage style={{ width: 15, height: 15, color: 'var(--pickle)' }} />
        <h2>Library overview</h2><div className="rule" />
      </div>
      <div className="stats-grid">
        <StatCard value={stats.total_games.toLocaleString()} label="Games owned" sub={`${stats.unplayed} unplayed`} />
        <StatCard value={stats.total_hours >= 1000 ? (stats.total_hours / 1000).toFixed(1) + 'k' : stats.total_hours + 'h'} label="Hours logged" sub={`${stats.recent_hours}h last 2 weeks`} />
        <StatCard value={stats.played_games} label="Games played" sub={`${Math.round(stats.played_games / stats.total_games * 100)}% of library`} color="var(--pickle-deep)" />
        <StatCard value={stats.avg_hours + 'h'} label="Avg per game" sub="for games you've played" />
      </div>

      {/* Play personality */}
      {personas.length > 0 && (
        <>
          <div className="section-bar">
            <h2>Play personality</h2><div className="rule" />
          </div>
          <div className="persona-grid">
            {personas.map(p => <PersonaCard key={p.label} {...p} />)}
          </div>
        </>
      )}

      {/* Genre breakdown */}
      {stats.genres.length > 0 && (
        <>
          <div className="section-bar">
            <h2>Genre breakdown</h2><div className="rule" />
          </div>
          <div className="genre-chart card">
            {stats.genres.map(g => (
              <GenreBar key={g.genre} genre={g.genre} hours={g.hours} count={g.count} maxHours={maxGenreHours} />
            ))}
          </div>
        </>
      )}

      {/* Top 10 most played */}
      {stats.top_games.length > 0 && (
        <>
          <div className="section-bar">
            <IconTrophy style={{ width: 15, height: 15, color: 'var(--brine)' }} />
            <h2>Most played</h2><div className="rule" />
          </div>
          <div className="top-games">
            {stats.top_games.map((g, i) => (
              <div key={g.app_id} className="top-game-row card" onClick={() => navigate(`/game/${g.app_id}`, { state: { game: { ...g, id: String(g.app_id), hours: g.hours, hours_2w: g.hours_2w, recent: g.hours_2w > 0 }, from: '/stats' } })}>
                <div className="tg-rank">#{i + 1}</div>
                <div className="tg-art">
                  <img src={g.cover_url} alt={g.name} onError={e => { e.target.style.display = 'none' }} />
                </div>
                <div className="tg-info">
                  <div className="tg-name">{g.name}</div>
                  <div className="tg-meta">{g.genre || '—'}{g.metacritic ? ` · ${g.metacritic} MC` : ''}</div>
                </div>
                <div className="tg-hours">
                  <IconClock style={{ width: 13, height: 13 }} /> {fmtHours(g.hours)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Walk of shame — high rated unplayed games */}
      {stats.shame_list.length > 0 && (
        <>
          <div className="section-bar">
            <h2>The walk of shame</h2>
            <span className="count">{stats.shame_list.length}</span>
            <div className="rule" />
          </div>
          <p className="section-desc">Highly rated games you own but have never touched.</p>
          <div className="shame-grid">
            {stats.shame_list.map(g => (
              <div key={g.app_id} className="shame-card card" onClick={() => navigate(`/game/${g.app_id}`, { state: { game: { ...g, id: String(g.app_id), hours: 0 }, from: '/stats' } })}>
                <img src={g.cover_url} alt={g.name} className="shame-cover" onError={e => { e.target.style.display = 'none' }} />
                <div className="shame-body">
                  <div className="shame-name">{g.name}</div>
                  <div className="shame-meta">
                    {g.genre && <span>{g.genre}</span>}
                    <span className="shame-mc"><IconStar style={{ width: 11, height: 11 }} /> {g.metacritic}</span>
                  </div>
                  <div className="shame-badge">0 hours played</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
