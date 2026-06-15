import { NavLink, Link } from 'react-router-dom'
import { Gamepad2, Library, Shuffle, Settings, LogOut } from 'lucide-react'

export default function Navbar({ user, onSignOut }) {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="brand-icon">🥒</span>
        <span className="brand-name">gamepickle</span>
      </Link>

      <div className="navbar-nav">
        <NavLink
          to="/library"
          className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
        >
          <Library size={14} style={{ display: 'inline', marginRight: 5 }} />
          Library
        </NavLink>
        <NavLink
          to="/pick"
          className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
        >
          <Gamepad2 size={14} style={{ display: 'inline', marginRight: 5 }} />
          Pick a Game
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
        >
          <Settings size={14} style={{ display: 'inline', marginRight: 5 }} />
          Settings
        </NavLink>
      </div>

      <div className="navbar-right">
        {user ? (
          <>
            <div className="user-avatar" title={user.email}>
              {user.user_metadata?.avatar_url
                ? <img src={user.user_metadata.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : (user.email?.[0] ?? '?').toUpperCase()
              }
            </div>
            <button className="btn btn-ghost btn-sm" onClick={onSignOut}>
              <LogOut size={13} />
              Sign out
            </button>
          </>
        ) : (
          <Link to="/" className="btn btn-primary btn-sm">
            Sign in
          </Link>
        )}
      </div>
    </nav>
  )
}
