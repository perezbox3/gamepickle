import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
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
import { getMe, logout, getAnonSteamId, clearAnonSteamId } from './lib/auth'

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

// Accessible when logged in OR when an anonymous Steam ID is stored
function SteamRoute({ user, loading, children }) {
  if (loading) return <LoadingSpinner />
  if (!AUTH_ENABLED) return children
  if (user || getAnonSteamId()) return children
  return <Navigate to="/" replace />
}

export default function App() {
  const { user, loading, setUser } = useAuth()

  async function refreshUser() {
    const u = await getMe()
    setUser(u)
  }

  async function handleSignOut() {
    if (!AUTH_ENABLED) return
    await logout()
    clearAnonSteamId()
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
              {withNav(Settings, { refreshUser })}
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
