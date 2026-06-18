import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Friends.css'

function fmtH(h) {
  if (!h || h === 0) return '0h'
  return h >= 1 ? `${h.toFixed(h < 10 ? 1 : 0)}h` : `${Math.round(h * 60)}m`
}

// ── Icons ────────────────────────────────────────────────────────────────────

function IconSearch(p) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
}
function IconArrowLeft(p) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m12 19-7-7 7-7M5 12h14"/></svg>
}
function IconUsers(p) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
}

// ── Friend card (list view) ──────────────────────────────────────────────────

function FriendCard({ friend, onCompare }) {
  return (
    <div className={`fc-card${friend.online ? ' online-card' : ''}`}>
      <div className="fc-avatar">
        {friend.avatar
          ? <img src={friend.avatar} alt="" />
          : <div className="fc-avatar-fallback">{friend.name[0].toUpperCase()}</div>}
        <div className={`fc-dot${friend.online ? ' online' : ''}`} />
      </div>
      <div className="fc-info">
        <div className="fc-name">{friend.name}</div>
        <div className="fc-status">{friend.online ? 'Online' : 'Offline'}</div>
      </div>
      <button className="btn btn-primary btn-sm fc-btn" onClick={() => onCompare(friend)}>
        Compare →
      </button>
    </div>
  )
}

// ── Single game row in comparison ───────────────────────────────────────────

function ComparisonRow({ game, friendName, onClick }) {
  const total = game.user_hours + game.friend_hours
  const userPct = total > 0 ? (game.user_hours / total) * 100 : 50
  const userWins = game.user_hours > game.friend_hours
  const friendWins = game.friend_hours > game.user_hours
  const tied = !userWins && !friendWins

  return (
    <div className="cg-row" onClick={onClick} style={{ cursor: 'pointer' }}>
      <img
        className="cg-cover"
        src={game.cover_url}
        alt=""
        loading="lazy"
        onError={e => { e.target.style.display = 'none' }}
      />
      <div className="cg-info">
        <div className="cg-name">{game.name}</div>
        {game.genre && <div className="cg-genre">{game.genre}</div>}
      </div>
      <div className={`cg-side cg-you ${userWins ? 'win' : ''}`}>
        {fmtH(game.user_hours)}
        {userWins && <span className="cg-trophy">YOU</span>}
      </div>
      <div className="cg-bar">
        <div className="cg-bar-user" style={{ width: `${userPct}%` }} />
        <div className="cg-bar-friend" style={{ width: `${100 - userPct}%` }} />
      </div>
      <div className={`cg-side cg-them ${friendWins ? 'win' : ''}`}>
        {friendWins && <span className="cg-trophy">THEM</span>}
        {fmtH(game.friend_hours)}
      </div>
    </div>
  )
}

// ── Comparison view ──────────────────────────────────────────────────────────

function ComparisonView({ friend, data, onBack }) {
  const navigate = useNavigate()
  const [showAll, setShowAll] = useState(false)

  const INITIAL = 30
  const games = data.games || []
  const visible = showAll ? games : games.slice(0, INITIAL)
  const hidden = games.length - INITIAL

  const userWinner = data.overall_winner === 'user'
  const friendWinner = data.overall_winner === 'friend'
  const tied = data.overall_winner === 'tie'

  return (
    <div className="container">
      <button className="btn btn-ghost btn-sm fr-back" onClick={onBack}>
        <IconArrowLeft style={{ width: 14, height: 14 }} /> Back to friends
      </button>

      {/* Scoreboard */}
      <div className="card fr-scoreboard">
        {/* User side */}
        <div className={`fr-side fr-side-you ${userWinner ? 'winner' : ''}`}>
          <div className="fr-av">
            <div className="fr-av-ring you-ring" />
            <div className="fr-av-fallback">YOU</div>
          </div>
          <div className="fr-side-name">You</div>
          <div className="fr-side-hours">{fmtH(data.user_total)}</div>
          <div className="fr-side-wins">{data.user_wins} wins</div>
          {userWinner && <div className="fr-winner-badge">WINNER</div>}
        </div>

        {/* VS */}
        <div className="fr-vs">
          <div className="fr-vs-label">VS</div>
          <div className="fr-shared-count">{data.shared_count} shared {data.shared_count === 1 ? 'game' : 'games'}</div>
          {data.ties > 0 && <div className="fr-ties">{data.ties} {data.ties === 1 ? 'tie' : 'ties'}</div>}
          {tied && <div className="fr-winner-badge draw">DRAW</div>}
        </div>

        {/* Friend side */}
        <div className={`fr-side fr-side-them ${friendWinner ? 'winner' : ''}`}>
          <div className="fr-av">
            <div className="fr-av-ring them-ring" />
            {friend.avatar
              ? <img src={friend.avatar} alt="" className="fr-av-img" />
              : <div className="fr-av-fallback">{friend.name[0].toUpperCase()}</div>}
          </div>
          <div className="fr-side-name">{friend.name}</div>
          <div className="fr-side-hours">{fmtH(data.friend_total)}</div>
          <div className="fr-side-wins">{data.friend_wins} wins</div>
          {friendWinner && <div className="fr-winner-badge">WINNER</div>}
        </div>
      </div>

      {/* Game list header */}
      {games.length > 0 && (
        <div className="fr-list-head">
          <div className="fr-list-title">Head-to-Head</div>
          <div className="fr-list-sub">Sorted by combined hours played</div>
          <div className="fr-col-labels">
            <span>YOU</span>
            <span />
            <span>{friend.name.split(' ')[0]}</span>
          </div>
        </div>
      )}

      {/* Game rows */}
      <div className="fr-game-list">
        {visible.map(g => (
          <ComparisonRow
            key={g.app_id}
            game={g}
            friendName={friend.name}
            onClick={() => navigate(`/game/${g.app_id}`, { state: { game: { ...g, app_id: g.app_id, hours: g.user_hours }, from: '/friends' } })}
          />
        ))}
      </div>

      {!showAll && hidden > 0 && (
        <div className="fr-show-more">
          <button className="btn btn-outline" onClick={() => setShowAll(true)}>
            Show {hidden} more game{hidden !== 1 ? 's' : ''}
          </button>
        </div>
      )}

      {games.length === 0 && (
        <div className="fr-empty-list">
          <div className="fr-empty-icon"><IconUsers style={{ width: 32, height: 32 }} /></div>
          <div className="fr-empty-msg">No shared games found.</div>
          <div className="fr-empty-sub">You and {friend.name} don&apos;t have any games in common — yet.</div>
        </div>
      )}
    </div>
  )
}

// ── Main Friends page ────────────────────────────────────────────────────────

export default function Friends({ user }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [friends, setFriends] = useState([])
  const [search, setSearch] = useState('')

  // Comparison state
  const [activeFriend, setActiveFriend] = useState(null)
  const [comparison, setComparison] = useState(null)
  const [compLoading, setCompLoading] = useState(false)
  const [compError, setCompError] = useState('')

  useEffect(() => {
    fetch('/api/friends.php')
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.message || data.error); return }
        setFriends(data.friends || [])
      })
      .catch(() => setError('Could not reach server.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleCompare(friend) {
    setActiveFriend(friend)
    setComparison(null)
    setCompError('')
    setCompLoading(true)

    try {
      const res  = await fetch(`/api/friends.php?compare=${encodeURIComponent(friend.steam_id)}`)
      const data = await res.json()
      if (data.error) { setCompError(data.message || data.error); setActiveFriend(null); return }
      setComparison(data)
    } catch {
      setCompError('Could not reach server.')
      setActiveFriend(null)
    } finally {
      setCompLoading(false)
    }
  }

  function handleBack() {
    setActiveFriend(null)
    setComparison(null)
    setCompError('')
  }

  // ── Loading comparison ──────────────────────────────────────────────────
  if (compLoading && activeFriend) {
    return (
      <div className="container">
        <div className="fr-comp-loading">
          <div className="fr-cl-avatars">
            <div className="fr-cl-av you-ring"><div className="fr-cl-av-inner">YOU</div></div>
            <div className="fr-cl-vs">VS</div>
            <div className="fr-cl-av them-ring">
              {activeFriend.avatar
                ? <img src={activeFriend.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                : <div className="fr-cl-av-inner">{activeFriend.name[0].toUpperCase()}</div>}
            </div>
          </div>
          <div className="fr-cl-msg">Loading shared library…</div>
          <div className="fr-cl-sub">Fetching {activeFriend.name}&apos;s games from Steam</div>
        </div>
      </div>
    )
  }

  // ── Comparison result ──────────────────────────────────────────────────
  if (comparison && activeFriend) {
    return <ComparisonView friend={activeFriend} data={comparison} onBack={handleBack} />
  }

  // ── Friend list ────────────────────────────────────────────────────────
  const filtered = friends.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
  const online   = filtered.filter(f => f.online)
  const offline  = filtered.filter(f => !f.online)

  return (
    <div className="container">
      <div className="page-head">
        <div className="mono-label">~/friends</div>
        <h1 className="page-title">Friends</h1>
        <div className="page-sub">Compare your playtime on shared games.</div>
      </div>

      {loading && (
        <div className="fr-loading">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="fc-card skeleton" style={{ height: 180 }} />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="card fr-error-card">
          <div className="fr-error-icon"><IconUsers style={{ width: 28, height: 28 }} /></div>
          <div className="fr-error-msg">{error}</div>
          {error.toLowerCase().includes('private') && (
            <div className="fr-error-sub">
              Go to Steam → Edit Profile → Privacy Settings and set &quot;Friend list&quot; to Public.
            </div>
          )}
          {!user?.steam_id && (
            <div className="fr-error-sub">
              Link your Steam account in <a href="/settings">Settings</a> first.
            </div>
          )}
        </div>
      )}

      {compError && (
        <div className="fr-error-card card" style={{ marginBottom: 16 }}>
          {compError}
        </div>
      )}

      {!loading && !error && friends.length === 0 && (
        <div className="card fr-error-card">
          <div className="fr-error-icon"><IconUsers style={{ width: 28, height: 28 }} /></div>
          <div className="fr-error-msg">No friends found.</div>
          <div className="fr-error-sub">Add some friends on Steam, then come back.</div>
        </div>
      )}

      {!loading && !error && friends.length > 0 && (
        <>
          <div className="fr-search-wrap">
            <div className="fr-search-ic"><IconSearch style={{ width: 16, height: 16 }} /></div>
            <input
              className="lib-search fr-search"
              placeholder={`Search ${friends.length} friends…`}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {online.length > 0 && (
            <>
              <div className="fr-section-label">Online — {online.length}</div>
              <div className="fr-grid">
                {online.map(f => <FriendCard key={f.steam_id} friend={f} onCompare={handleCompare} />)}
              </div>
            </>
          )}

          {offline.length > 0 && (
            <>
              <div className="fr-section-label">Offline — {offline.length}</div>
              <div className="fr-grid">
                {offline.map(f => <FriendCard key={f.steam_id} friend={f} onCompare={handleCompare} />)}
              </div>
            </>
          )}

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', fontFamily: 'var(--font-mono)', color: 'var(--ink-soft)' }}>
              No friends match &quot;{search}&quot;
            </div>
          )}
        </>
      )}
    </div>
  )
}
