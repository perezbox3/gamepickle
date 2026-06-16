import { useState } from 'react'
import { GENRES } from '../lib/games'
import './Settings.css'

function IconSteam(p) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M11.98 2C6.65 2 2.28 6.13 2 11.4l5.37 2.22a2.86 2.86 0 0 1 1.62-.5l2.39-3.46v-.05a3.8 3.8 0 1 1 3.8 3.8h-.09l-3.41 2.43a2.86 2.86 0 0 1-5.7.2l-3.84-1.6A10 10 0 1 0 11.98 2zM8.5 17.6l-1.23-.5a2.15 2.15 0 0 0 3.97-1.66 2.15 2.15 0 0 0-2.85-1.13l1.27.53a1.58 1.58 0 1 1-1.16 2.93zm8.8-7.8a2.53 2.53 0 1 0-5.06 0 2.53 2.53 0 0 0 5.06 0zm-4.43 0a1.9 1.9 0 1 1 3.8 0 1.9 1.9 0 0 1-3.8 0z"/>
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

const sessions = [
  { v: 'fast',  label: '< 30 min' },
  { v: 'mid',   label: '1–2 hours' },
  { v: 'long',  label: 'All evening' },
  { v: 'chill', label: 'No clock' },
]

export default function Settings() {
  const [linked, setLinked] = useState(false)
  const [banned, setBanned] = useState(() => new Set())
  const [session, setSession] = useState('mid')
  const [hideShelved, setHideShelved] = useState(true)
  const [includeUninstalled, setIncludeUninstalled] = useState(true)
  const [saved, setSaved] = useState(false)

  function toggleBan(g) {
    setBanned(prev => {
      const n = new Set(prev)
      n.has(g) ? n.delete(g) : n.add(g)
      return n
    })
  }

  function save() {
    setSaved(true)
    setTimeout(() => setSaved(false), 1600)
  }

  return (
    <div className="container">
      <div className="page-head">
        <div className="mono-label">~/settings</div>
        <h1 className="page-title">Settings</h1>
        <div className="page-sub">Connect Steam, tune your picks, set defaults.</div>
      </div>

      <div className="settings">
        {/* Steam account */}
        <div className="card set-card">
          <div className="sc-head"><h3>Steam account</h3></div>
          <p className="sc-desc">We read your owned games and playtime. We never post or modify anything.</p>
          <div className={`steam-link${linked ? ' linked' : ''}`}>
            <div className="steam-ic"><IconSteam style={{ width: 25, height: 25 }} /></div>
            <div className="sl-body">
              <div className="sl-title">{linked ? 'Connected' : 'Not connected'}</div>
              <div className="sl-sub">{linked ? 'steam: anthony_p · 24 games synced' : 'Link to pull your library'}</div>
            </div>
            {linked
              ? <button className="btn btn-outline btn-sm" onClick={() => setLinked(false)}>Unlink</button>
              : <button className="btn btn-primary btn-sm" onClick={() => setLinked(true)}><IconSteam style={{ width: 14, height: 14 }} /> Link Steam</button>}
          </div>
          {linked && (
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--pickle-deep)' }}>
              <IconCheck style={{ width: 14, height: 14 }} /> Last synced just now
            </div>
          )}
        </div>

        {/* Genre bans */}
        <div className="card set-card">
          <div className="sc-head"><h3>Excluded genres</h3></div>
          <p className="sc-desc">Tap a genre to ban it. Banned genres never show up in picks or the FAFO button.</p>
          <div className="genre-chips">
            {GENRES.map(g => (
              <button key={g} className={`gchip${banned.has(g) ? ' banned' : ''}`} onClick={() => toggleBan(g)}>
                {g}{banned.has(g) && <span className="x"> ✕</span>}
              </button>
            ))}
          </div>
          {banned.size > 0 && (
            <div style={{ marginTop: 14, fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--ink-soft)' }}>
              {banned.size} genre{banned.size > 1 ? 's' : ''} hidden from picks
            </div>
          )}
        </div>

        {/* Picker defaults */}
        <div className="card set-card">
          <div className="sc-head"><h3>Picker defaults</h3></div>
          <p className="sc-desc">Pre-fill the picker so you can get to a recommendation faster.</p>

          <div className="set-row">
            <div>
              <div className="sr-label">Default session length</div>
              <div className="sr-hint">Used as the starting answer in the picker quiz.</div>
            </div>
            <div className="sessions">
              {sessions.map(s => (
                <button key={s.v} className={session === s.v ? 'on' : ''} onClick={() => setSession(s.v)}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="set-row">
            <div>
              <div className="sr-label">Include uninstalled games</div>
              <div className="sr-hint">Let picks suggest games you own but haven't downloaded.</div>
            </div>
            <button
              className={`toggle${includeUninstalled ? ' on' : ''}`}
              onClick={() => setIncludeUninstalled(v => !v)}
              aria-label="toggle include uninstalled"
            />
          </div>

          <div className="set-row">
            <div>
              <div className="sr-label">Hide shelved games</div>
              <div className="sr-hint">Games you've marked "done" stay out of recommendations.</div>
            </div>
            <button
              className={`toggle${hideShelved ? ' on' : ''}`}
              onClick={() => setHideShelved(v => !v)}
              aria-label="toggle hide shelved"
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 60 }}>
          <button className="btn btn-primary" onClick={save}>
            <IconCheck style={{ width: 17, height: 17 }} /> Save changes
          </button>
          {saved && (
            <span className="fade-up" style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--pickle-deep)' }}>
              ✓ Saved
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
