import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'

function IconLibrary(p) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 5h4v14H3zM10 5h4v14h-4z"/>
      <path d="m17 5 4 13-3.7 1.3L13.5 6z"/>
    </svg>
  )
}
function IconDice(p) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="3" width="18" height="18" rx="3"/>
      <circle cx="8.5" cy="8.5" r="1.2" fill="currentColor"/>
      <circle cx="15.5" cy="15.5" r="1.2" fill="currentColor"/>
      <circle cx="15.5" cy="8.5" r="1.2" fill="currentColor"/>
      <circle cx="8.5" cy="15.5" r="1.2" fill="currentColor"/>
    </svg>
  )
}
function IconSettings(p) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>
    </svg>
  )
}
function IconLogout(p) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
    </svg>
  )
}
function IconMenu(p) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}>
      <path d="M4 6h16M4 12h16M4 18h16"/>
    </svg>
  )
}

export default function Navbar({ user, onSignOut }) {
  const [open, setOpen] = useState(false)

  const navItems = [
    { to: '/library', label: 'Library', Icon: IconLibrary },
    { to: '/pick', label: 'Pick a Game', Icon: IconDice },
    { to: '/settings', label: 'Settings', Icon: IconSettings },
  ]

  const initial = user?.user_metadata?.full_name?.[0]
    ?? user?.email?.[0]
    ?? 'A'

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link to="/" className="nav-brand">
          <span className="em">🥒</span> gamepickle
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
          <button className="btn btn-outline btn-sm" onClick={onSignOut}>
            <IconLogout style={{ width: 14, height: 14 }} /> Sign out
          </button>
          <div className="nav-avatar" title={user?.email}>
            {user?.user_metadata?.avatar_url
              ? <img src={user.user_metadata.avatar_url} alt="" />
              : initial.toUpperCase()
            }
          </div>
        </div>
      </div>
    </nav>
  )
}
