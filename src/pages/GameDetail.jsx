import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { fmtHours } from '../components/GameCard'
import './GameDetail.css'

function IconArrowLeft(p) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
}
function IconClock(p) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
}
function IconUsers(p) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
}
function IconUser(p) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
}
function IconStar(p) {
  return <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" {...p}><path d="m12 3 2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.8L6.6 19.6l1-6L3.3 9.4l6-.9z"/></svg>
}
function IconExternal(p) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
}
function IconCalendar(p) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
}

export default function GameDetail({ user }) {
  const { appId }   = useParams()
  const navigate    = useNavigate()
  const location    = useLocation()

  // Data passed from Library/Picker via navigation state — used immediately
  const passedGame  = location.state?.game || null
  const from        = location.state?.from || '/library'

  const [detail, setDetail]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [imgErr, setImgErr]   = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0 })
    fetch(`/api/game.php?app_id=${appId}`)
      .then(r => r.json())
      .then(data => { if (data.error) setError(data.error); else setDetail(data) })
      .catch(() => setError('Could not reach server.'))
      .finally(() => setLoading(false))
  }, [appId])

  // Prefer detail data; fall back to what was passed via state
  const name        = detail?.name        ?? passedGame?.name        ?? 'Loading…'
  const coverUrl    = detail?.cover_url   ?? passedGame?.cover_url   ?? null
  const genre       = detail?.genres?.[0] ?? passedGame?.genre       ?? null
  const metacritic  = detail?.metacritic  ?? passedGame?.metacritic  ?? null
  const hours       = passedGame?.hours   ?? null
  const hours2w     = passedGame?.hours_2w ?? null
  const isRecent    = passedGame?.recent   ?? false
  const isMulti     = detail?.categories?.some(c => /multi|co.op/i.test(c)) ?? passedGame?.is_multiplayer ?? false
  const steamUrl    = detail?.steam_url   ?? `https://store.steampowered.com/app/${appId}`

  const fromLabel = from === '/pick' ? 'Back to picker' : from === '/stats' ? 'Back to stats' : 'Back to library'

  return (
    <div className="container gd-page">

      {/* Back nav */}
      <button className="gd-back btn btn-ghost btn-sm" onClick={() => navigate(from)}>
        <IconArrowLeft style={{ width: 16, height: 16 }} /> {fromLabel}
      </button>

      {/* Hero image */}
      <div className="gd-hero">
        {coverUrl && !imgErr
          ? <img src={coverUrl} alt={name} className="gd-cover" onError={() => setImgErr(true)} />
          : <div className="gd-cover gd-cover-fallback"><span>{name.slice(0, 2).toUpperCase()}</span></div>}
      </div>

      {/* Title + Steam link */}
      <div className="gd-title-row">
        <h1 className="gd-title">{name}</h1>
        <a href={steamUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm gd-steam-btn">
          Open in Steam <IconExternal style={{ width: 13, height: 13 }} />
        </a>
      </div>

      {/* Badge row */}
      <div className="gd-badges">
        {genre     && <span className="gd-badge gd-badge-genre">{genre}</span>}
        {metacritic && (
          <span className={`gd-badge gd-badge-meta ${metacritic >= 75 ? 'good' : metacritic >= 60 ? 'mid' : 'low'}`}>
            <IconStar style={{ width: 12, height: 12 }} /> {metacritic}
          </span>
        )}
        {isMulti
          ? <span className="gd-badge gd-badge-play"><IconUsers style={{ width: 13, height: 13 }} /> Multiplayer</span>
          : <span className="gd-badge gd-badge-play"><IconUser  style={{ width: 13, height: 13 }} /> Single-player</span>}
        {isRecent && <span className="gd-badge gd-badge-recent">Played recently</span>}
      </div>

      {/* Playtime row — only shown if we have data */}
      {hours !== null && (
        <div className="gd-playtime">
          <div className="gd-stat">
            <IconClock style={{ width: 18, height: 18 }} />
            <div>
              <div className="gd-stat-val">{fmtHours(hours)}</div>
              <div className="gd-stat-lbl">total played</div>
            </div>
          </div>
          {hours2w > 0 && (
            <div className="gd-stat">
              <IconClock style={{ width: 18, height: 18, color: 'var(--pickle)' }} />
              <div>
                <div className="gd-stat-val">{fmtHours(hours2w)}</div>
                <div className="gd-stat-lbl">last 2 weeks</div>
              </div>
            </div>
          )}
          {hours === 0 && <span className="gd-unplayed">You own this but haven't played it yet.</span>}
        </div>
      )}

      <div className="gd-body">
        {/* Description */}
        {loading && !detail && (
          <div className="gd-loading">
            <div className="skeleton" style={{ height: 14, width: '90%', borderRadius: 4, marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 14, width: '75%', borderRadius: 4, marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 14, width: '82%', borderRadius: 4 }} />
          </div>
        )}
        {error && <p className="gd-error">{error}</p>}
        {detail?.description && <p className="gd-description">{detail.description}</p>}

        {/* Screenshots */}
        {detail?.screenshots?.length > 0 && (
          <div className="gd-section">
            <div className="gd-section-label">Screenshots</div>
            <div className="gd-screenshots">
              {detail.screenshots.map((src, i) => (
                <a key={i} href={src.replace('116x65', '1920x1080').replace('thumb', 'full')} target="_blank" rel="noopener noreferrer">
                  <img src={src} alt={`Screenshot ${i + 1}`} className="gd-screenshot" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
        {detail?.categories?.length > 0 && (
          <div className="gd-section">
            <div className="gd-section-label">Features</div>
            <div className="gd-tags">
              {detail.categories.slice(0, 8).map(c => <span key={c} className="gd-tag">{c}</span>)}
            </div>
          </div>
        )}

        {/* Meta info */}
        {detail && (
          <div className="gd-meta-grid">
            {detail.developers?.length > 0 && (
              <div className="gd-meta-item">
                <div className="gd-meta-key">Developer</div>
                <div className="gd-meta-val">{detail.developers.join(', ')}</div>
              </div>
            )}
            {detail.publishers?.length > 0 && (
              <div className="gd-meta-item">
                <div className="gd-meta-key">Publisher</div>
                <div className="gd-meta-val">{detail.publishers.join(', ')}</div>
              </div>
            )}
            {detail.release_date && (
              <div className="gd-meta-item">
                <div className="gd-meta-key"><IconCalendar style={{ width: 13, height: 13, display: 'inline', marginRight: 4 }} />Released</div>
                <div className="gd-meta-val">{detail.release_date}</div>
              </div>
            )}
            {detail.genres?.length > 0 && (
              <div className="gd-meta-item">
                <div className="gd-meta-key">Genres</div>
                <div className="gd-meta-val">{detail.genres.join(', ')}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
