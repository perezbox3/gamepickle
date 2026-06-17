import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './App.css'
import PickleField from './components/PickleField'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Library from './pages/Library'
import Picker from './pages/Picker'
import Settings from './pages/Settings'
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

function AuthedRoute({ user, loading, children }) {
  if (loading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
        <div className="spin" style={{ width: 32, height: 32, border: '3px solid var(--ink)', borderTopColor: 'var(--pickle)', borderRadius: '50%', animation: 'gp-spin 0.6s linear infinite' }} />
      </div>
    )
  }
  if (!AUTH_ENABLED) return children
  if (!user) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const { user, loading, setUser } = useAuth()

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
              <div className="gp-main">
                <Landing user={user} />
              </div>
            </div>
          }
        />
        <Route
          path="/library"
          element={
            <AuthedRoute user={user} loading={loading}>
              {withNav(Library)}
            </AuthedRoute>
          }
        />
        <Route
          path="/pick"
          element={
            <AuthedRoute user={user} loading={loading}>
              {withNav(Picker)}
            </AuthedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <AuthedRoute user={user} loading={loading}>
              {withNav(Settings)}
            </AuthedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
