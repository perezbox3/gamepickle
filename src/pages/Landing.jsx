import { useNavigate } from 'react-router-dom'
import { Gamepad2, Shuffle, Star, Zap } from 'lucide-react'
import { supabase } from '../lib/supabase'
import './Landing.css'

export default function Landing({ user }) {
  const navigate = useNavigate()

  async function handleGoogleSignIn() {
    if (!supabase) {
      alert('Auth not configured yet — add your Supabase keys to .env')
      return
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/library` },
    })
    if (error) console.error(error)
  }

  if (user) {
    navigate('/library')
    return null
  }

  return (
    <div className="landing">
      <div className="landing-hero">
        <div className="container">
          <div className="hero-badge">
            <span className="badge badge-pickle">🥒 Weekend project built live</span>
          </div>

          <h1 className="hero-title">
            Stop scrolling.<br />
            <span className="title-accent">Start playing.</span>
          </h1>

          <p className="hero-sub">
            You've got 500 games and no idea what to play.
            GamePickle narrows it down in 60 seconds — so you can get
            back to actually gaming.
          </p>

          <div className="hero-actions">
            <button className="btn btn-primary btn-lg" onClick={handleGoogleSignIn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
            <p className="hero-note">Free. No spam. Unlink anytime.</p>
          </div>
        </div>
      </div>

      <div className="landing-features container">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon" style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>
              <Star size={22} />
            </div>
            <h3>Your full library</h3>
            <p>Link your Steam account and we pull every game you own — downloaded or not.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon" style={{ background: 'var(--pickle-glow)', color: 'var(--pickle-light)' }}>
              <Gamepad2 size={22} />
            </div>
            <h3>Smart picker</h3>
            <p>Answer 5 quick questions about your mood and available time. We surface your top 3 picks.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon" style={{ background: 'rgba(99, 102, 241, 0.12)', color: '#818cf8' }}>
              <Shuffle size={22} />
            </div>
            <h3>F*** around & find out</h3>
            <p>Not in the mood to think? Hit the button. Get a random game from your library. Done.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}>
              <Zap size={22} />
            </div>
            <h3>Preferences</h3>
            <p>Ban genres you're not feeling, set session length defaults, and hide games you've shelved forever.</p>
          </div>
        </div>
      </div>

      <footer className="landing-footer">
        <div className="container">
          <p>
            <span style={{ color: 'var(--accent)' }}>🥒 gamepickle</span>
            {' '}— a tool by{' '}
            <a href="https://perezbox3.com" style={{ color: 'var(--text-secondary)' }}>
              perezbox3
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
