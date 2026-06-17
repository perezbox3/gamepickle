export async function getMe() {
  try {
    const res = await fetch('/api/auth/me.php')
    if (!res.ok) return null
    return await res.json()
  } catch { return null }
}

export async function logout() {
  await fetch('/api/auth/logout.php', { method: 'POST' })
}

const ANON_KEY = 'gp_steam_id'
export const getAnonSteamId  = () => localStorage.getItem(ANON_KEY)
export const setAnonSteamId  = (id) => localStorage.setItem(ANON_KEY, id)
export const clearAnonSteamId = () => localStorage.removeItem(ANON_KEY)
