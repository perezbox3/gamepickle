import { useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import './Landing.css'

function IconGoogle(p) {
  return <svg viewBox="0 0 24 24" {...p}><path fill="#4285F4" d="M22.5 12.2c0-.7-.06-1.4-.18-2H12v3.8h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-2 3.3-4.9 3.3-7.8z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .67-2.3 1.05-3.7 1.05-2.85 0-5.27-1.92-6.13-4.5H2.2v2.8A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.87 14.15a6.6 6.6 0 0 1 0-4.3V7.05H2.2a11 11 0 0 0 0 9.9z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3 .55 4.13 1.62l3.1-3.1A11 11 0 0 0 2.2 7.05l3.67 2.8C6.73 7.32 9.15 5.4 12 5.4z"/></svg>
}
function IconLibrary(p) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 5h4v14H3zM10 5h4v14h-4z"/><path d="m17 5 4 13-3.7 1.3L13.5 6z"/></svg>
}
function IconDice(p) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.2" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.2" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1.2" fill="currentColor"/><circle cx="8.5" cy="15.5" r="1.2" fill="currentColor"/></svg>
}
function IconShuffle(p) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>
}
function IconZap(p) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M13 2 3 14h9l-1 8 10-12h-9z"/></svg>
}
function IconArrow(p) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
}

const features = [
  { Icon: IconLibrary, green: false, h: 'Your full jar',          p: 'Link Steam and we pull every game you own — installed or not — into one shelf.' },
  { Icon: IconDice,    green: false, h: 'Smart picker',           p: 'Answer 5 quick questions about your mood and time. We surface your top 3.' },
  { Icon: IconShuffle, green: true,  h: 'F*** around & find out', p: "Not in the mood to think? Smash the button. Random game. Go play it." },
  { Icon: IconZap,     green: false, h: 'Make it yours',          p: "Ban genres you're not feeling, set session defaults, shelve the duds." },
]

export default function Landing({ user, onSignOut }) {
  const navigate = useNavigate()
  const [input, setInput] = useState('')

  function handleGoogleSignIn() {
    if (import.meta.env.VITE_AUTH_ENABLED !== 'true') {
      navigate('/library')
      return
    }
    window.location.href = '/api/auth/login.php'
  }

  function handleSearch(e) {
    e.preventDefault()
    const val = input.trim()
    if (!val) return
    if (user) {
      navigate(`/library?steam_id=${encodeURIComponent(val)}`)
    } else {
      // Browsing requires a session — send them through Google sign-in
      window.location.href = '/api/auth/login.php'
    }
  }

  return (
    <div className="landing">
      <div className="container">
        <div className="landing-hero">

          {/* Logo */}
          <img src="/logo-cream.png" alt="gamepickle" className="landing-logo" />

          {/* Lede */}
          <p className="landing-lede">
            You own 500 games and play the same 3. gamepickle picks your next session in 60 seconds.
          </p>

          {/* Steam search — primary CTA for everyone */}
          <div className="hero-steam">
            <form className="hero-form" onSubmit={handleSearch}>
              <input
                className="hero-input"
                placeholder="Steam ID, username, or profile URL…"
                value={input}
                onChange={e => setInput(e.target.value)}
                autoFocus
              />
              <button className="hero-btn" type="submit" disabled={!input.trim()}>
                Browse library <IconArrow style={{ width: 18, height: 18 }} />
              </button>
            </form>
            <div className="hero-hint">
              Accepts steamcommunity.com/id/username, /profiles/ID, or a plain username
            </div>
            <div className="anon-perks">
              <span className="perk-yes">✓ Browse any library</span>
              <span className="perk-yes">✓ Use the picker</span>
              <span className="perk-yes">✓ Stats &amp; Settings</span>
            </div>
          </div>

          {/* Auth section — changes based on signed-in state */}
          {user ? (
            <div className="landing-signin">
              <div className="anon-divider">
                <div className="rule" /> signed in as {user.name} <div className="rule" />
              </div>
              <div className="landing-auth-btns">
                <Link to="/library" className="gbtn">
                  View your library
                </Link>
                <button className="gbtn gbtn-ghost" onClick={onSignOut}>
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <div className="landing-signin">
              <div className="anon-divider">
                <div className="rule" /> or sign in to save your library <div className="rule" />
              </div>
              <button className="gbtn" onClick={handleGoogleSignIn}>
                <IconGoogle style={{ width: 21, height: 21 }} /> Continue with Google
              </button>
              <span className="landing-note">free · saves your library · unlocks stats &amp; settings</span>
            </div>
          )}

        </div>

        {/* Feature cards */}
        <div className="feature-grid">
          {features.map((f, i) => (
            <div key={i} className="card feature">
              <div className={`feature-ic${f.green ? ' green' : ''}`}>
                <f.Icon style={{ width: 22, height: 22 }} />
              </div>
              <h3>{f.h}</h3>
              <p>{f.p}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="landing-foot">
        <span>Find more of my projects at <a href="https://perezbox3.com" target="_blank" rel="noopener noreferrer" className="b">perezbox3.com</a></span>
        <span style={{ margin: '0 10px', opacity: 0.4 }}>·</span>
        <Link to="/privacy" style={{ color: 'var(--ink-soft)', fontSize: 12 }}>Privacy policy</Link>
      </div>
    </div>
  )
}
