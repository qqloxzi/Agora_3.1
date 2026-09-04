import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// Landing page for Supabase OAuth redirects (`redirectTo: origin + '/auth/callback'`).
// The Supabase client auto-detects the session from the URL on load; this page
// just waits for that and then sends the user on.
export function AuthCallback() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading) navigate(user ? '/' : '/giris', { replace: true })
  }, [user, loading, navigate])

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <p className="text-ink/50 dark:text-ice-white/50 text-sm">Giriş tamamlanıyor...</p>
    </div>
  )
}
