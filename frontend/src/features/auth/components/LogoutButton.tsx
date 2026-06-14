'use client'

import { useState } from 'react'
import { logout } from '../api'

export default function LogoutButton() {
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    await logout()
    // logout() redirects to /login; setLoading(false) is unreachable
  }

  return (
    <button onClick={handleLogout} disabled={loading} aria-busy={loading}>
      {loading ? 'Logging out…' : 'Log out'}
    </button>
  )
}
