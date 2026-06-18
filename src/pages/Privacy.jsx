import { Link } from 'react-router-dom'

export default function Privacy() {
  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 20px 80px', fontFamily: 'var(--font-ui)', color: 'var(--ink)', lineHeight: 1.7 }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 8 }}>Privacy Policy</h1>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-soft)', marginBottom: 32 }}>Last updated: June 2026</p>

      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 13, marginBottom: 8 }}>What we store</h2>
      <p>When you sign in with Google we store your Google account ID, email address, display name, and avatar URL. When you link a Steam account we store your SteamID64, Steam display name, Steam avatar URL, and the list of games in your Steam library (app IDs, game names, and playtime in minutes). We store your picker settings (excluded genres, default session length) and a session token in an httpOnly cookie.</p>

      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 13, marginTop: 28, marginBottom: 8 }}>What we do not store</h2>
      <p>We never store your Google password. We never store your Steam password or Steam API credentials. Your Steam API key is held server-side only and is never sent to your browser. We do not sell, share, or transfer your data to any third party beyond the external APIs described below.</p>

      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 13, marginTop: 28, marginBottom: 8 }}>Third-party services</h2>
      <p><strong>Google OAuth</strong> — used for sign-in only. We request read-only access to your public profile (name, email, avatar). We do not request access to Gmail, Drive, or any other Google service.</p>
      <p style={{ marginTop: 8 }}><strong>Steam Web API</strong> — used server-side to fetch your game library and playtime. Your Steam API key is never exposed to the browser. We read your public library; we never write to Steam on your behalf.</p>
      <p style={{ marginTop: 8 }}><strong>SteamSpy</strong> — used anonymously (no account, no key) to power the "F*** around &amp; find out" global random game feature.</p>
      <p style={{ marginTop: 8 }}><strong>Steam CDN</strong> — game cover images are loaded directly from <code>cdn.akamai.steamstatic.com</code>.</p>

      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 13, marginTop: 28, marginBottom: 8 }}>Data deletion</h2>
      <p>You can permanently delete your account and all associated data at any time from <Link to="/settings" style={{ color: 'var(--pickle-deep)' }}>Settings → Danger zone</Link>. Deletion removes your Google identity, email, Steam library, settings, and all active sessions immediately. This cannot be undone.</p>
      <p style={{ marginTop: 8 }}>If you cannot access Settings, email <a href="mailto:perezbox3@gmail.com" style={{ color: 'var(--pickle-deep)' }}>perezbox3@gmail.com</a> and we will delete your data manually within 30 days.</p>

      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 13, marginTop: 28, marginBottom: 8 }}>Cookies</h2>
      <p>We set one session cookie (<code>gp_sid</code>) after you sign in. It is httpOnly, Secure, and SameSite=Lax. It contains a random session ID — not your personal data. It expires after 30 days or when you sign out.</p>

      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 13, marginTop: 28, marginBottom: 8 }}>Contact</h2>
      <p>Questions or data requests: <a href="mailto:perezbox3@gmail.com" style={{ color: 'var(--pickle-deep)' }}>perezbox3@gmail.com</a></p>

      <p style={{ marginTop: 40 }}><Link to="/" style={{ color: 'var(--pickle-deep)', fontFamily: 'var(--font-mono)' }}>← Back to gamepickle</Link></p>
    </div>
  )
}
