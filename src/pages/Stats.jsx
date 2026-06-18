import { useState, useEffect, useRef } from 'react'
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

// Playtime tier pyramid chart
function TierChart({ tiers, total }) {
  const max = Math.max(...tiers.map(t => t.count), 1)
  return (
    <div className="tier-chart card">
      {tiers.map((t, i) => {
        const pct = max > 0 ? Math.max((t.count / max) * 100, t.count > 0 ? 4 : 0) : 0
        const libPct = total > 0 ? Math.round((t.count / total) * 100) : 0
        const TIER_COLORS = ['#E2622E', '#5FA03A', '#3C6B25', '#F0C23A', '#7B5EA7']
        return (
          <div key={t.label} className="tier-row">
            <div className="tier-label">{t.emoji} {t.label}</div>
            <div className="tier-track">
              <div className="tier-fill" style={{ width: pct + '%', background: TIER_COLORS[i] }} />
              <span className="tier-count">{t.count} games</span>
            </div>
            <div className="tier-pct">{libPct}%</div>
          </div>
        )
      })}
      <div className="tier-note">
        0h · 1–5h · 5–20h · 20–100h · 100h+
      </div>
    </div>
  )
}

// Metacritic vs Hours scatter plot
function ScatterPlot({ data, onDotClick }) {
  const svgRef = useRef(null)
  const [tooltip, setTooltip] = useState(null)

  if (!data || data.length === 0) return null

  const PAD = { top: 20, right: 20, bottom: 40, left: 50 }
  const W = 560, H = 320
  const IW = W - PAD.left - PAD.right
  const IH = H - PAD.top  - PAD.bottom

  const maxHours = Math.max(...data.map(d => d.hours))
  // Log scale for hours so outliers don't crush everything
  const logMax = Math.log1p(maxHours)
  const toX = score  => PAD.left + ((score - 40) / 60) * IW    // score range ~40-100
  const toY = hours  => PAD.top  + IH - (Math.log1p(hours) / logMax) * IH
  const toR = hours  => 4 + Math.min((Math.log1p(hours) / logMax) * 8, 8)

  const GENRE_COLOR = {
    'Action': '#E2622E', 'RPG': '#7B5EA7', 'Strategy': '#3C6B25',
    'Simulation': '#5FA03A', 'Casual': '#F0C23A', 'Adventure': '#2f6d8a',
    'Shooter': '#a8584a', 'Puzzle': '#3a8a8a', 'Racing': '#3a6da8',
  }
  const dotColor = g => GENRE_COLOR[g] || '#5FA03A'

  // Y-axis tick labels
  const yTicks = [0, 1, 5, 20, 100, 500].filter(v => v <= maxHours * 1.1)
  // X-axis ticks
  const xTicks = [40, 50, 60, 70, 80, 90, 100]

  return (
    <div className="scatter-wrap card" style={{ position: 'relative' }}>
      <div className="scatter-title">Metacritic score vs. hours played</div>
      <div className="scatter-sub">Each dot is a game you've played. Higher right = critically good AND you loved it.</div>
      <div style={{ overflowX: 'auto' }}>
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', minWidth: 320, maxWidth: W, display: 'block' }}>
          {/* Grid lines */}
          {xTicks.map(x => (
            <line key={x} x1={toX(x)} y1={PAD.top} x2={toX(x)} y2={PAD.top + IH}
              stroke="var(--ink)" strokeOpacity="0.08" strokeWidth="1" />
          ))}
          {yTicks.map(v => (
            <line key={v} x1={PAD.left} y1={toY(v)} x2={PAD.left + IW} y2={toY(v)}
              stroke="var(--ink)" strokeOpacity="0.08" strokeWidth="1" />
          ))}

          {/* Axes */}
          <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + IH} stroke="var(--ink)" strokeWidth="2" />
          <line x1={PAD.left} y1={PAD.top + IH} x2={PAD.left + IW} y2={PAD.top + IH} stroke="var(--ink)" strokeWidth="2" />

          {/* X labels */}
          {xTicks.map(x => (
            <text key={x} x={toX(x)} y={PAD.top + IH + 16} textAnchor="middle"
              fontSize="11" fontFamily="var(--font-mono)" fill="var(--ink-soft)">{x}</text>
          ))}
          <text x={PAD.left + IW / 2} y={H - 2} textAnchor="middle"
            fontSize="11" fontFamily="var(--font-mono)" fill="var(--ink-soft)">Metacritic score</text>

          {/* Y labels */}
          {yTicks.map(v => (
            <text key={v} x={PAD.left - 6} y={toY(v) + 4} textAnchor="end"
              fontSize="11" fontFamily="var(--font-mono)" fill="var(--ink-soft)">{v >= 100 ? v + 'h' : v + 'h'}</text>
          ))}

          {/* Dots */}
          {data.map((d, i) => (
            <circle key={i}
              cx={toX(Math.max(40, Math.min(100, d.score)))}
              cy={toY(d.hours)}
              r={toR(d.hours)}
              fill={dotColor(d.genre)}
              fillOpacity="0.78"
              stroke="var(--ink)"
              strokeWidth="1.2"
              style={{ cursor: 'pointer' }}
              onMouseEnter={e => setTooltip({ d, x: e.clientX, y: e.clientY })}
              onMouseLeave={() => setTooltip(null)}
              onClick={() => onDotClick(d)}
            />
          ))}
        </svg>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div className="scatter-tooltip" style={{ left: tooltip.x + 12, top: tooltip.y - 8 }}>
          <div className="stt-name">{tooltip.d.name}</div>
          <div className="stt-meta">{tooltip.d.genre} · {fmtHours(tooltip.d.hours)} · MC {tooltip.d.score}</div>
        </div>
      )}
    </div>
  )
}

// Outrageous fun facts
function FunFacts({ hours, games, unplayed }) {
  if (hours < 1) return null
  const days      = (hours / 24).toFixed(1)
  const weeks     = (hours / 168).toFixed(1)
  const books     = Math.floor(hours / 8)
  const flights   = Math.floor(hours / 20)   // ~20h to fly around the world
  const workweeks = (hours / 40).toFixed(1)
  const sleepNights = Math.floor(hours / 8)
  const coffees   = Math.floor(hours * 2)    // avg 2 cups per gaming session hour
  const yearPct   = ((hours / 8760) * 100).toFixed(1)

  const facts = [
    { emoji: '😴', text: `${days} days of your life`, sub: 'in total gaming hours' },
    { emoji: '💼', text: `${workweeks} work weeks`, sub: 'your boss would not approve' },
    { emoji: '📚', text: `${books} books`, sub: 'you could have read instead' },
    { emoji: '✈️', text: `${flights}× around the world`, sub: 'by flight time' },
    { emoji: '☕', text: `~${coffees} coffees`, sub: 'consumed powering these sessions' },
    { emoji: '📅', text: `${yearPct}% of a year`, sub: 'of your total waking life' },
  ]

  return (
    <div className="funfacts-grid">
      {facts.map(f => (
        <div key={f.emoji} className="funfact-card card">
          <div className="ff-emoji">{f.emoji}</div>
          <div className="ff-val">{f.text}</div>
          <div className="ff-sub">{f.sub}</div>
        </div>
      ))}
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
    ? Math.round((stats.unplayed / stats.total_games) * 100) : 0
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
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

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
  const personas      = getPersonality(stats)
  const profile       = stats.steam_profile

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
              {profile.created && <span>Member since {new Date(profile.created * 1000).getFullYear()}</span>}
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
        <StatCard
          value={stats.total_hours >= 1000 ? (stats.total_hours / 1000).toFixed(1) + 'k' : stats.total_hours + 'h'}
          label="Hours logged"
          sub={`${stats.recent_hours}h last 2 weeks`}
        />
        <StatCard value={stats.played_games} label="Games played" sub={`${Math.round(stats.played_games / stats.total_games * 100)}% of library`} color="var(--pickle-deep)" />
        <StatCard value={stats.avg_hours + 'h'} label="Avg per game" sub="for games you've played" />
      </div>

      {/* Outrageous fun facts */}
      <div className="section-bar">
        <h2>Time well spent?</h2><div className="rule" />
      </div>
      <FunFacts hours={stats.total_hours} games={stats.total_games} unplayed={stats.unplayed} />

      {/* Play personality */}
      {personas.length > 0 && (
        <>
          <div className="section-bar" style={{ marginTop: 32 }}>
            <h2>Play personality</h2><div className="rule" />
          </div>
          <div className="persona-grid">
            {personas.map(p => <PersonaCard key={p.label} {...p} />)}
          </div>
        </>
      )}

      {/* Engagement tier chart */}
      {stats.tiers && (
        <>
          <div className="section-bar">
            <h2>How deep do you go?</h2><div className="rule" />
          </div>
          <TierChart tiers={stats.tiers} total={stats.total_games} />
        </>
      )}

      {/* Metacritic scatter */}
      {stats.scatter?.length > 2 && (
        <>
          <div className="section-bar" style={{ marginTop: 32 }}>
            <h2>Do you play good games?</h2><div className="rule" />
          </div>
          <ScatterPlot
            data={stats.scatter}
            onDotClick={d => navigate(`/game/${d.app_id}`, { state: { game: { id: String(d.app_id), app_id: d.app_id, name: d.name, hours: d.hours, genre: d.genre }, from: '/stats' } })}
          />
        </>
      )}

      {/* Genre breakdown */}
      {stats.genres.length > 0 && (
        <>
          <div className="section-bar" style={{ marginTop: 32 }}>
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
          <div className="section-bar" style={{ marginTop: 32 }}>
            <IconTrophy style={{ width: 15, height: 15, color: 'var(--brine)' }} />
            <h2>Most played</h2><div className="rule" />
          </div>
          <div className="top-games">
            {stats.top_games.map((g, i) => (
              <div
                key={g.app_id}
                className="top-game-row card"
                onClick={() => navigate(`/game/${g.app_id}`, { state: { game: { ...g, id: String(g.app_id), recent: g.hours_2w > 0 }, from: '/stats' } })}
              >
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

      {/* Walk of shame */}
      {stats.shame_list.length > 0 && (
        <>
          <div className="section-bar" style={{ marginTop: 32 }}>
            <h2>The walk of shame</h2>
            <span className="count">{stats.shame_list.length}</span>
            <div className="rule" />
          </div>
          <p className="section-desc">Highly rated games you own but have never touched.</p>
          <div className="shame-grid">
            {stats.shame_list.map(g => (
              <div
                key={g.app_id}
                className="shame-card card"
                onClick={() => navigate(`/game/${g.app_id}`, { state: { game: { ...g, id: String(g.app_id), hours: 0 }, from: '/stats' } })}
              >
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
