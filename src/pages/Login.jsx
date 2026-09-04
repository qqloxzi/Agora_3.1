import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
)

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleGoogle() {
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/' } })
    if (error) setError('Giriş başarısız: ' + error.message)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password) {
      setError('E-posta ve şifre gir.')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setLoading(false)
    if (error) {
      setError(error.message === 'Invalid login credentials' ? 'E-posta veya şifre hatalı.' : error.message)
      return
    }
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-3xl bg-white/80 dark:bg-white/5 border border-primary-blue/10 dark:border-white/10 shadow-card p-8 md:p-10">
        <h1 className="text-3xl font-black text-ink dark:text-white text-center mb-2">Tekrar Hoş Geldin</h1>
        <p className="text-sm text-ink/50 dark:text-ice-white/50 text-center mb-8">İlerlemeni, canlarını ve token'larını kaldığın yerden sürdür.</p>

        <button onClick={handleGoogle} className="w-full flex items-center justify-center gap-3 rounded-2xl border-2 border-primary-blue/15 dark:border-white/15 px-4 py-3.5 font-bold text-ink dark:text-white mb-6 hover:bg-primary-blue/5 transition-colors">
          <GoogleIcon /> Google ile Devam Et
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 bg-primary-blue/10 dark:bg-white/10" />
          <span className="text-xs font-bold text-ink/40 uppercase">veya e-posta ile</span>
          <div className="h-px flex-1 bg-primary-blue/10 dark:bg-white/10" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@email.com" autoComplete="email" className="px-4 py-3.5 rounded-2xl border border-primary-blue/15 dark:border-white/15 bg-white/70 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/30" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" className="px-4 py-3.5 rounded-2xl border border-primary-blue/15 dark:border-white/15 bg-white/70 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/30" />
          <button type="submit" disabled={loading} className="press-btn magnetic-btn mt-2 px-4 py-3.5 rounded-2xl bg-primary-blue text-white font-extrabold disabled:opacity-60">
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        {error && <p className="text-xs text-heart text-center mt-4 font-bold">{error}</p>}

        <p className="text-sm text-ink/60 dark:text-ice-white/60 text-center mt-6">
          Hesabın yok mu? <Link to="/kayit" className="text-accent-blue font-bold hover:underline">Hesap Oluştur</Link>
        </p>
      </div>
    </div>
  )
}
