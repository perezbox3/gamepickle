import { useState } from 'react'
import { Link2, CheckCircle, AlertCircle, Save } from 'lucide-react'
import './Settings.css'

const GENRE_OPTIONS = [
  'Action', 'Adventure', 'RPG', 'Strategy', 'Simulation',
  'Sports', 'Racing', 'Horror', 'Puzzle', 'Platformer',
  'Shooter', 'Fighting', 'MOBA', 'Battle Royale',
]

export default function Settings({ user }) {
  const [steamId, setSteamId] = useState('')
  const [steamLinked, setSteamLinked] = useState(false)
  const [bannedGenres, setBannedGenres] = useState([])
  const [sessionDefault, setSessionDefault] = useState('medium')
  const [saved, setSaved] = useState(false)

  function toggleGenre(genre) {
    setBannedGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    )
  }

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleLinkSteam() {
    if (!steamId.trim()) return
    setSteamLinked(true)
  }

  return (
    <div className="settings-page">
      <div className="container">
        <div className="settings-header">
          <h1 className="page-title">Settings</h1>
          <p className="page-sub">Manage your connected accounts and preferences</p>
        </div>

        <div className="settings-sections">

          {/* Steam */}
          <section className="settings-section">
            <div className="section-header">
              <h2>Steam Account</h2>
              <p>Link your Steam account to pull your full game library.</p>
            </div>
            {steamLinked ? (
              <div className="steam-linked">
                <CheckCircle size={18} style={{ color: 'var(--pickle-light)' }} />
                <div>
                  <strong>Steam linked</strong>
                  <p>Steam ID: {steamId}</p>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setSteamLinked(false)}>
                  Unlink
                </button>
              </div>
            ) : (
              <div className="steam-connect">
                <div className="steam-input-row">
                  <input
                    type="text"
                    className="settings-input"
                    placeholder="Enter your Steam ID or vanity URL"
                    value={steamId}
                    onChange={e => setSteamId(e.target.value)}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={handleLinkSteam}
                    disabled={!steamId.trim()}
                  >
                    <Link2 size={15} />
                    Link Steam
                  </button>
                </div>
                <p className="settings-hint">
                  <AlertCircle size={12} />
                  Your Steam profile must be set to public for library sync to work.
                  Find your Steam ID at{' '}
                  <span style={{ color: 'var(--accent)' }}>steamcommunity.com/id/yourname</span>
                </p>
              </div>
            )}
          </section>

          {/* Default session */}
          <section className="settings-section">
            <div className="section-header">
              <h2>Default Session Length</h2>
              <p>Pre-fill the time question in the picker.</p>
            </div>
            <div className="session-options">
              {[
                { value: 'short', label: 'Quick', sub: '~30 min' },
                { value: 'medium', label: 'A couple hours', sub: '1–3 hrs' },
                { value: 'long', label: 'Going all in', sub: '3+ hrs' },
              ].map(opt => (
                <button
                  key={opt.value}
                  className={`session-option${sessionDefault === opt.value ? ' active' : ''}`}
                  onClick={() => setSessionDefault(opt.value)}
                >
                  <span className="session-label">{opt.label}</span>
                  <span className="session-sub">{opt.sub}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Genre bans */}
          <section className="settings-section">
            <div className="section-header">
              <h2>Excluded Genres</h2>
              <p>Games in these genres won't show up in picker results.</p>
            </div>
            <div className="genre-grid">
              {GENRE_OPTIONS.map(genre => (
                <button
                  key={genre}
                  className={`genre-chip${bannedGenres.includes(genre) ? ' banned' : ''}`}
                  onClick={() => toggleGenre(genre)}
                >
                  {bannedGenres.includes(genre) && '✕ '}
                  {genre}
                </button>
              ))}
            </div>
          </section>

          <div className="settings-save">
            <button className="btn btn-primary" onClick={handleSave}>
              {saved ? (
                <>
                  <CheckCircle size={15} />
                  Saved!
                </>
              ) : (
                <>
                  <Save size={15} />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
