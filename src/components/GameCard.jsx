import { Link } from 'react-router-dom'

function IconClock(p) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="9"/>
      <path d="M12 7v5l3 2"/>
    </svg>
  )
}

// Handles both real Steam cover images and gradient fallbacks for mock data
export function CoverArt({ game, className }) {
  if (game.cover_url) {
    return (
      <div className={`cover ${className || ''}`}>
        <img src={game.cover_url} alt={game.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
    )
  }
  return (
    <div className={`cover ${className || ''}`} style={{ background: game.coverBg }}>
      <span className="cover-mark">{game.mark}</span>
      <span className="cover-title">{game.name}</span>
    </div>
  )
}

export const fmtHours = h => h >= 100 ? Math.round(h) + 'h' : h.toFixed(1) + 'h'

export function Badge({ kind = 'muted', children, icon: Icon }) {
  return (
    <span className={`badge badge-${kind}`}>
      {Icon && <Icon style={{ width: 13, height: 13 }} />}
      {children}
    </span>
  )
}

export default function GameCard({ game, rank, linkState }) {
  const inner = (
    <>
      <div className="game-card-art">
        <CoverArt game={game} />
        {rank && <span className={`rank-chip rank-${rank}`}>#{rank}</span>}
        {game.recent && <span className="installed-dot" title="Played recently" />}
      </div>
      <div className="game-card-body">
        <div className="game-card-name" title={game.name}>{game.name}</div>
        <div className="game-card-meta">
          <span className="gc-genre">{game.genre || '—'}</span>
          <span className="gc-hours">
            <IconClock style={{ width: 13, height: 13 }} />
            {fmtHours(game.hours)}
          </span>
        </div>
      </div>
    </>
  )

  if (game.id && game.app_id) {
    return (
      <Link to={`/game/${game.app_id}`} state={linkState ?? { game, from: '/library' }} className="game-card game-card-link">
        {inner}
      </Link>
    )
  }
  return <div className="game-card">{inner}</div>
}
