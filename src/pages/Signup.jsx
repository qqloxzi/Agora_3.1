import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleGoogle() {
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/onboarding' } })
    if (error) setError('Kayıt başarısız: ' + error.message)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalı.')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email: email.trim(), password })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    navigate('/onboarding', { replace: true })
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-3xl bg-white/80 dark:bg-white/5 border border-primary-blue/10 dark:border-white/10 shadow-card p-8 md:p-10">
        <h1 className="text-3xl font-black text-ink dark:text-white text-center mb-2">Agora'ya Katıl</h1>
        <p className="text-sm text-ink/50 dark:text-ice-white/50 text-center mb-8">50 token ve 5 can ile başla, ilk atölyene hemen dal.</p>

        <button onClick={handleGoogle} className="w-full flex items-center justify-center gap-3 rounded-2xl border-2 border-primary-blue/15 dark:border-white/15 px-4 py-3.5 font-bold text-ink dark:text-white mb-6 hover:bg-primary-blue/5 transition-colors">
          Google ile Devam Et
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 bg-primary-blue/10 dark:bg-white/10" />
          <span className="text-xs font-bold text-ink/40 uppercase">veya e-posta ile</span>
          <div className="h-px flex-1 bg-primary-blue/10 dark:bg-white/10" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@email.com" autoComplete="email" className="px-4 py-3.5 rounded-2xl border border-primary-blue/15 dark:border-white/15 bg-white/70 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/30" />
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="En az 6 karakter" autoComplete="new-password" className="px-4 py-3.5 rounded-2xl border border-primary-blue/15 dark:border-white/15 bg-white/70 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/30" />
          <button type="submit" disabled={loading} className="press-btn magnetic-btn mt-2 px-4 py-3.5 rounded-2xl bg-primary-blue text-white font-extrabold disabled:opacity-60">
            {loading ? 'Hesap oluşturuluyor...' : 'Ücretsiz Hesap Oluştur'}
          </button>
        </form>

        {error && <p className="text-xs text-heart text-center mt-4 font-bold">{error}</p>}

        <p className="text-sm text-ink/60 dark:text-ice-white/60 text-center mt-6">
          Zaten hesabın var mı? <Link to="/giris" className="text-accent-blue font-bold hover:underline">Giriş Yap</Link>
        </p>
      </div>
    </div>
  )
}
