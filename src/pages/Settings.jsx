import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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
function IconRefresh(p) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5"/>
    </svg>
  )
}

const sessions = [
  { v: 'fast',  label: '< 30 min' },
  { v: 'mid',   label: '1–2 hours' },
  { v: 'long',  label: 'All evening' },
  { v: 'chill', label: 'No clock' },
]

export default function Settings({ user, refreshUser, onSignOut }) {
  // Steam link state
  const [steamInput, setSteamInput]     = useState('')
  const [steamLinked, setSteamLinked]   = useState(!!user?.steam_id)
  const [steamProfile, setSteamProfile] = useState(
    user?.steam_id ? { name: user.steam_name, avatar: user.steam_avatar } : null
  )
  const [previewing, setPreviewing]   = useState(false)
  const [previewData, setPreviewData] = useState(null)
  const [linking, setLinking]         = useState(false)
  const [syncing, setSyncing]         = useState(false)
  const [enriching, setEnriching]     = useState(false)
  const [linkError, setLinkError]     = useState('')
  const [syncMsg, setSyncMsg]         = useState('')

  // Account deletion
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting]           = useState(false)
  const [deleteError, setDeleteError]     = useState('')

  async function handleDeleteAccount() {
    if (deleteConfirm !== 'DELETE') return
    setDeleting(true)
    setDeleteError('')
    try {
      const res = await fetch('/api/auth/delete.php', { method: 'POST' })
      if (!res.ok) throw new Error()
      onSignOut()
    } catch {
      setDeleteError('Could not delete account. Please try again.')
      setDeleting(false)
    }
  }

  // Picker settings — loaded from DB on mount
  const [banned, setBanned]     = useState(() => new Set())
  const [session, setSession]   = useState('mid')
  const [settingsLoading, setSettingsLoading] = useState(true)
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const [saveError, setSaveError] = useState('')

  // Load settings from DB on mount
  useEffect(() => {
    fetch('/api/settings.php')
      .then(r => r.json())
      .then(data => {
        if (data.genre_bans)      setBanned(new Set(data.genre_bans))
        if (data.default_session) setSession(data.default_session)
      })
      .catch(() => {}) // non-fatal — defaults are fine
      .finally(() => setSettingsLoading(false))
  }, [])

  function toggleBan(g) {
    setBanned(prev => {
      const n = new Set(prev)
      n.has(g) ? n.delete(g) : n.add(g)
      return n
    })
  }

  async function saveSettings() {
    setSaving(true); setSaveError(''); setSaved(false)
    try {
      const res = await fetch('/api/settings.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          genre_bans:      [...banned],
          default_session: session,
        }),
      })
      const data = await res.json()
      if (!res.ok || data.error) { setSaveError(data.error || 'Save failed.'); return }
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      setSaveError('Could not reach server.')
    } finally {
      setSaving(false)
    }
  }

  async function handlePreview() {
    if (!steamInput.trim()) return
    setPreviewing(true); setLinkError(''); setPreviewData(null)
    try {
      const res  = await fetch(`/api/steam/preview.php?steam_id=${encodeURIComponent(steamInput.trim())}`)
      const data = await res.json()
      if (!res.ok) { setLinkError(data.error || 'Could not find that account.'); return }
      setPreviewData(data)
    } finally {
      setPreviewing(false)
    }
  }

  async function handleConfirmLink() {
    if (!previewData) return
    setLinking(true); setLinkError('')
    try {
      const fd = new FormData(); fd.append('steam_id', previewData.steam_id)
      const res = await fetch('/api/steam/link.php', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) { setLinkError(data.error || 'Something went wrong.'); return }
      setSteamLinked(true)
      setSteamProfile({ name: data.steam_name, avatar: data.steam_avatar })
      setSteamInput(''); setPreviewData(null)
      await refreshUser()
      await handleSync()
    } finally {
      setLinking(false)
    }
  }

  async function handleSync() {
    setSyncing(true); setSyncMsg('')
    try {
      const res  = await fetch('/api/steam/sync.php', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setSyncMsg(data.error || 'Sync failed.'); return }
      setSyncMsg(`${data.synced} games synced — fetching genres…`)
      await handleEnrich(data.synced)
    } finally {
      setSyncing(false)
    }
  }

  async function handleEnrich(synced) {
    setEnriching(true)
    let total = 0
    try {
      while (true) {
        setSyncMsg(`${synced ?? '?'} games synced · fetching genres… (${total} done)`)
        const res  = await fetch('/api/steam/enrich.php', { method: 'POST' })
        const data = await res.json()
        if (!res.ok) break
        total += data.enriched || 0
        if (!data.enriched) break
      }
      const note = synced && total < synced ? ` (${synced - total} have no store page)` : ''
      setSyncMsg(`${synced ?? '?'} games synced · ${total} genres fetched${note}`)
      setTimeout(() => setSyncMsg(''), 10000)
    } finally {
      setEnriching(false)
    }
  }

  async function handleUnlink() {
    if (!confirm('Unlink Steam? Your synced game library will be removed.')) return
    await fetch('/api/steam/unlink.php', { method: 'POST' })
    setSteamLinked(false); setSteamProfile(null); setSyncMsg('')
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

          {steamLinked ? (
            <div className="steam-link linked">
              {steamProfile?.avatar
                ? <img src={steamProfile.avatar} alt="" style={{ width: 40, height: 40, borderRadius: 4, border: '2px solid var(--ink)' }} />
                : <div className="steam-ic"><IconSteam style={{ width: 25, height: 25 }} /></div>}
              <div className="sl-body">
                <div className="sl-title">Connected</div>
                <div className="sl-sub">{steamProfile?.name || 'Steam account'}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-outline btn-sm" onClick={handleSync} disabled={syncing || enriching}>
                  <IconRefresh style={{ width: 14, height: 14 }} />
                  {syncing ? 'Syncing…' : enriching ? 'Enriching…' : 'Sync'}
                </button>
                <button className="btn btn-outline btn-sm" onClick={handleUnlink}>Unlink</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {!previewData ? (
                <>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      className="lib-search"
                      style={{ flex: 1, padding: '8px 12px', fontFamily: 'var(--font-ui)' }}
                      placeholder="Your Steam ID, username, or profile URL…"
                      value={steamInput}
                      onChange={e => { setSteamInput(e.target.value); setLinkError('') }}
                      onKeyDown={e => e.key === 'Enter' && handlePreview()}
                    />
                    <button className="btn btn-primary btn-sm" onClick={handlePreview} disabled={previewing || !steamInput.trim()}>
                      <IconSteam style={{ width: 14, height: 14 }} /> {previewing ? 'Looking up…' : 'Look up →'}
                    </button>
                  </div>
                  {linkError && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--spicy)' }}>{linkError}</div>}
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-soft)' }}>
                    Find your ID at <strong>steamid.io</strong> — or paste your full Steam profile URL
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-soft)', marginBottom: 2 }}>
                    Is this your Steam account?
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--paper-2)', border: 'var(--bd-thick)', borderRadius: 8 }}>
                    {previewData.steam_avatar && (
                      <img src={previewData.steam_avatar} alt="" style={{ width: 44, height: 44, borderRadius: 6, border: '2px solid var(--ink)', flexShrink: 0 }} />
                    )}
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 16 }}>{previewData.steam_name}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-soft)' }}>{previewData.steam_id}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-primary btn-sm" onClick={handleConfirmLink} disabled={linking}>
                      <IconCheck style={{ width: 14, height: 14 }} /> {linking ? 'Linking…' : 'Yes, link this account'}
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => { setPreviewData(null); setLinkError('') }} disabled={linking}>
                      No, try again
                    </button>
                  </div>
                  {linkError && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--spicy)' }}>{linkError}</div>}
                </div>
              )}
            </div>
          )}

          {syncMsg && (
            <div style={{ marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--pickle-deep)' }}>
              <IconCheck style={{ width: 14, height: 14, display: 'inline', marginRight: 6 }} />{syncMsg}
            </div>
          )}
        </div>

        {/* Genre bans */}
        <div className="card set-card">
          <div className="sc-head"><h3>Excluded genres</h3></div>
          <p className="sc-desc">
            Tap a genre to ban it. Banned genres never appear in quiz picks or the FAFO button.
            {banned.size > 0 && <span className="sc-ban-count"> · {banned.size} banned</span>}
          </p>
          {settingsLoading ? (
            <div className="genre-chips">
              {GENRES.map(g => <div key={g} className="gchip skeleton" style={{ minWidth: 70, height: 36 }} />)}
            </div>
          ) : (
            <div className="genre-chips">
              {GENRES.map(g => (
                <button key={g} className={`gchip${banned.has(g) ? ' banned' : ''}`} onClick={() => toggleBan(g)}>
                  {g}{banned.has(g) && <span className="x"> ✕</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Picker defaults */}
        <div className="card set-card">
          <div className="sc-head"><h3>Picker defaults</h3></div>
          <p className="sc-desc">Pre-select your usual session length so the quiz remembers your preference.</p>
          <div className="set-row">
            <div>
              <div className="sr-label">Default session length</div>
              <div className="sr-hint">Pre-filled in the quiz — you can still change it each time.</div>
            </div>
            <div className="sessions">
              {sessions.map(s => (
                <button key={s.v} className={session === s.v ? 'on' : ''} onClick={() => setSession(s.v)}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Save */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button className="btn btn-primary" onClick={saveSettings} disabled={saving || settingsLoading}>
            <IconCheck style={{ width: 17, height: 17 }} />
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          {saved && (
            <span className="fade-up" style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--pickle-deep)' }}>
              Settings saved
            </span>
          )}
          {saveError && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--spicy)' }}>
              {saveError}
            </span>
          )}
        </div>

        {/* Danger zone */}
        <div className="card set-card" style={{ borderColor: 'var(--spicy)', marginTop: 32, marginBottom: 60 }}>
          <div className="sc-head"><h3 style={{ color: 'var(--spicy)' }}>Danger zone</h3></div>
          <p className="sc-desc">
            Permanently deletes your account, all sessions, your Steam library data, and all settings.
            This cannot be undone. See our <Link to="/privacy" style={{ color: 'var(--spicy)' }}>privacy policy</Link> for details on what data we store.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 400 }}>
            <input
              className="lib-search"
              style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: 13 }}
              placeholder='Type DELETE to confirm'
              value={deleteConfirm}
              onChange={e => { setDeleteConfirm(e.target.value); setDeleteError('') }}
            />
            <button
              className="btn btn-sm"
              style={{ background: 'var(--spicy)', color: '#fff', border: '2px solid var(--ink)', boxShadow: '3px 3px 0 var(--ink)', alignSelf: 'flex-start' }}
              onClick={handleDeleteAccount}
              disabled={deleteConfirm !== 'DELETE' || deleting}
            >
              {deleting ? 'Deleting…' : 'Delete my account'}
            </button>
            {deleteError && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--spicy)' }}>
                {deleteError}
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
