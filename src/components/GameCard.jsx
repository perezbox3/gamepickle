import { Clock, Download, ExternalLink } from 'lucide-react'

export default function GameCard({ game, rank }) {
  const hours = game.playtime_forever
    ? Math.round(game.playtime_forever / 60)
    : null

  return (
    <div className="game-card">
      {rank && (
        <div className={`game-rank rank-${rank}`}>
          #{rank}
        </div>
      )}
      <div className="game-art">
        {game.img_icon_url ? (
          <img
            src={`https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`}
            alt={game.name}
          />
        ) : (
          <div className="game-art-placeholder">🎮</div>
        )}
      </div>
      <div className="game-info">
        <p className="game-name">{game.name}</p>
        <div className="game-meta">
          {hours !== null && (
            <span className="game-hours">
              <Clock size={11} />
              {hours}h played
            </span>
          )}
          {game.installed && (
            <span className="badge badge-pickle">
              <Download size={10} />
              Installed
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
