export async function getMe() {
  try {
    const res = await fetch('/api/auth/me.php')
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function logout() {
  await fetch('/api/auth/logout.php', { method: 'POST' })
}
