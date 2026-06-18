import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'

function IconLibrary(p) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 5h4v14H3zM10 5h4v14h-4z"/><path d="m17 5 4 13-3.7 1.3L13.5 6z"/></svg>
}
function IconDice(p) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.2" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.2" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1.2" fill="currentColor"/><circle cx="8.5" cy="15.5" r="1.2" fill="currentColor"/></svg>
}
function IconBarChart(p) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
}
function IconSettings(p) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/></svg>
}
function IconLogout(p) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
}
function IconMenu(p) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><path d="M4 6h16M4 12h16M4 18h16"/></svg>
}
function IconGoogle(p) {
  return <svg viewBox="0 0 24 24" {...p}><path fill="#4285F4" d="M22.5 12.2c0-.7-.06-1.4-.18-2H12v3.8h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-2 3.3-4.9 3.3-7.8z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .67-2.3 1.05-3.7 1.05-2.85 0-5.27-1.92-6.13-4.5H2.2v2.8A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.87 14.15a6.6 6.6 0 0 1 0-4.3V7.05H2.2a11 11 0 0 0 0 9.9z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3 .55 4.13 1.62l3.1-3.1A11 11 0 0 0 2.2 7.05l3.67 2.8C6.73 7.32 9.15 5.4 12 5.4z"/></svg>
}

export default function Navbar({ user, onSignOut }) {
  const [open, setOpen] = useState(false)

  const navItems = [
    { to: '/library',  label: 'Library',    Icon: IconLibrary  },
    { to: '/pick',     label: 'Pick a Game', Icon: IconDice     },
    ...(user ? [{ to: '/stats',    label: 'Stats',    Icon: IconBarChart }] : []),
    ...(user ? [{ to: '/settings', label: 'Settings', Icon: IconSettings }] : []),
  ]

  const initial = user?.name?.[0] ?? user?.email?.[0] ?? '?'

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link to="/" className="nav-brand">
          <img src="/logo-green.png" alt="gamepickle" style={{ height: 30, width: 'auto', imageRendering: 'pixelated' }} />
        </Link>

        <div className={`nav-links${open ? ' open' : ''}`}>
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              onClick={() => setOpen(false)}
            >
              <Icon style={{ width: 16, height: 16 }} />
              {label}
            </NavLink>
          ))}
        </div>

        <button className="nav-mobile-toggle" onClick={() => setOpen(o => !o)}>
          <IconMenu style={{ width: 22, height: 22 }} />
        </button>

        <div className="nav-right">
          {user ? (
            <>
              <button className="btn btn-outline btn-sm" onClick={onSignOut}>
                <IconLogout style={{ width: 14, height: 14 }} /> Sign out
              </button>
              <div className="nav-avatar" title={user.email}>
                {user.avatar
                  ? <img src={user.avatar} alt="" />
                  : initial.toUpperCase()}
              </div>
            </>
          ) : (
            <a href="/api/auth/login.php" className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, textDecoration: 'none' }}>
              <IconGoogle style={{ width: 15, height: 15 }} /> Sign in to save
            </a>
          )}
        </div>
      </div>
    </nav>
  )
}
