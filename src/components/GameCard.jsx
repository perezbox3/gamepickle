function IconClock(p) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="9"/>
      <path d="M12 7v5l3 2"/>
    </svg>
  )
}

export function CoverArt({ game, className }) {
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

export default function GameCard({ game, rank }) {
  return (
    <div className="game-card">
      <div className="game-card-art">
        <CoverArt game={game} />
        {rank && <span className={`rank-chip rank-${rank}`}>#{rank}</span>}
        {game.installed && <span className="installed-dot" title="Installed" />}
      </div>
      <div className="game-card-body">
        <div className="game-card-name" title={game.name}>{game.name}</div>
        <div className="game-card-meta">
          <span className="gc-genre">{game.genre}</span>
          <span className="gc-hours">
            <IconClock style={{ width: 13, height: 13 }} />
            {fmtHours(game.hours)}
          </span>
        </div>
      </div>
    </div>
  )
}
