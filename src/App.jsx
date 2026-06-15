import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Library from './pages/Library'
import Picker from './pages/Picker'
import Settings from './pages/Settings'

const SUPABASE_CONFIGURED =
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY

function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!SUPABASE_CONFIGURED) {
      setLoading(false)
      return
    }

    import('./lib/supabase').then(({ supabase }) => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null)
        setLoading(false)
      })

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
      })

      return () => subscription.unsubscribe()
    })
  }, [])

  return { user, loading }
}

function AuthedRoute({ user, loading, children }) {
  if (loading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
        <div className="spinner" />
      </div>
    )
  }
  if (!user) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const { user, loading } = useAuth()

  async function handleSignOut() {
    if (!SUPABASE_CONFIGURED) return
    const { supabase } = await import('./lib/supabase')
    await supabase.auth.signOut()
  }

  const withNav = (Component, props = {}) => (
    <div className="app">
      <Navbar user={user} onSignOut={handleSignOut} />
      <div className="page">
        <Component user={user} {...props} />
      </div>
    </div>
  )

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="app">
            <div className="page">
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
  )
}
