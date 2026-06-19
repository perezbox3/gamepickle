import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { trackPageview } from './lib/analytics'
import './App.css'
import PickleField from './components/PickleField'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Library from './pages/Library'
import Picker from './pages/Picker'
import Settings from './pages/Settings'
import GameDetail from './pages/GameDetail'
import Stats from './pages/Stats'
import Friends from './pages/Friends'
import Privacy from './pages/Privacy'
import { getMe, logout } from './lib/auth'

const AUTH_ENABLED = import.meta.env.VITE_AUTH_ENABLED === 'true'

function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!AUTH_ENABLED) { setLoading(false); return }
    getMe().then(u => { setUser(u); setLoading(false) })
  }, [])

  return { user, loading, setUser }
}

function LoadingSpinner() {
  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
      <div className="spin" style={{ width: 32, height: 32, border: '3px solid var(--ink)', borderTopColor: 'var(--pickle)', borderRadius: '50%', animation: 'gp-spin 0.6s linear infinite' }} />
    </div>
  )
}

// Requires Google login (settings, future stats)
function AuthedRoute({ user, loading, children }) {
  if (loading) return <LoadingSpinner />
  if (!AUTH_ENABLED) return children
  if (!user) return <Navigate to="/" replace />
  return children
}

// Accessible when logged in (Steam routes require auth now that anon browse is removed)
function SteamRoute({ user, loading, children }) {
  if (loading) return <LoadingSpinner />
  if (!AUTH_ENABLED) return children
  if (user) return children
  return <Navigate to="/" replace />
}

export default function App() {
  const { user, loading, setUser } = useAuth()
  const location = useLocation()

  useEffect(() => {
    trackPageview(location.pathname)
  }, [location.pathname])

  async function refreshUser() {
    const u = await getMe()
    setUser(u)
  }

  async function handleSignOut() {
    if (!AUTH_ENABLED) return
    await logout()
    setUser(null)
    window.location.href = '/'
  }

  const withNav = (Component, props = {}) => (
    <div className="gp-app">
      <Navbar user={user} onSignOut={handleSignOut} />
      <div className="gp-main">
        <Component user={user} {...props} />
      </div>
    </div>
  )

  return (
    <>
      <PickleField />
      <Routes>
        <Route
          path="/"
          element={
            <div className="gp-app">
              {user && <Navbar user={user} onSignOut={handleSignOut} />}
              <div className="gp-main">
                <Landing user={user} onSignOut={handleSignOut} />
              </div>
            </div>
          }
        />
        <Route
          path="/library"
          element={
            <SteamRoute user={user} loading={loading}>
              {withNav(Library)}
            </SteamRoute>
          }
        />
        <Route
          path="/pick"
          element={
            <SteamRoute user={user} loading={loading}>
              {withNav(Picker)}
            </SteamRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <AuthedRoute user={user} loading={loading}>
              {withNav(Settings, { refreshUser, onSignOut: handleSignOut })}
            </AuthedRoute>
          }
        />
        <Route
          path="/stats"
          element={
            <AuthedRoute user={user} loading={loading}>
              {withNav(Stats)}
            </AuthedRoute>
          }
        />
        <Route
          path="/friends"
          element={
            <AuthedRoute user={user} loading={loading}>
              {withNav(Friends)}
            </AuthedRoute>
          }
        />
        <Route
          path="/game/:appId"
          element={
            <SteamRoute user={user} loading={loading}>
              {withNav(GameDetail)}
            </SteamRoute>
          }
        />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
