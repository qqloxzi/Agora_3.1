import { useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function LeagueJoinForm({ leagues, defaultLeagueId, onSuccess }) {
  const { user, profile } = useAuth()
  const [leagueId, setLeagueId] = useState(defaultLeagueId ?? leagues[0]?.id ?? '')
  const [fullName, setFullName] = useState(profile?.username || '')
  const [email, setEmail] = useState(user?.email || '')
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | duplicate | error

  async function submit(e) {
    e.preventDefault()
    if (!leagueId || !fullName.trim() || !email.trim()) return
    setStatus('loading')
    const { error } = await supabase.from('league_registrations').insert({
      league_id: leagueId,
      user_id: user?.id ?? null,
      full_name: fullName.trim(),
      email: email.trim(),
      phone: phone.trim() || null,
    })
    if (!error) {
      setStatus('success')
      onSuccess?.()
    } else if (error.code === '23505') {
      setStatus('duplicate')
    } else {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex items-center gap-3 p-5 rounded-2xl bg-success/10 border border-success/25 text-success font-bold">
        <CheckCircle2 size={22} /> Kaydın alındı! Sezon başlarken sana ulaşacağız.
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-ink/50 dark:text-ice-white/50 mb-1.5 block">Lig Seç</label>
        <select
          value={leagueId}
          onChange={(e) => setLeagueId(Number(e.target.value))}
          className="w-full px-4 py-3 rounded-xl border border-primary-blue/15 dark:border-white/15 bg-white/70 dark:bg-white/5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-accent-blue/30"
        >
          {leagues.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name} {l.sub ? `— ${l.sub}` : ''}
            </option>
          ))}
        </select>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-ink/50 dark:text-ice-white/50 mb-1.5 block">Ad Soyad</label>
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-primary-blue/15 dark:border-white/15 bg-white/70 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/30"
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-ink/50 dark:text-ice-white/50 mb-1.5 block">E-posta</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-primary-blue/15 dark:border-white/15 bg-white/70 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/30"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-ink/50 dark:text-ice-white/50 mb-1.5 block">Telefon (opsiyonel)</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-primary-blue/15 dark:border-white/15 bg-white/70 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/30"
        />
      </div>

      {status === 'duplicate' && <p className="text-sm font-bold text-heart">Bu e-posta ile zaten bu lige kayıtlısın.</p>}
      {status === 'error' && <p className="text-sm font-bold text-heart">Bir şeyler ters gitti, tekrar dener misin?</p>}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="press-btn magnetic-btn mt-2 px-6 py-3.5 rounded-2xl bg-primary-blue text-white font-extrabold flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {status === 'loading' && <Loader2 size={18} className="animate-spin" />}
        Lige Katıl
      </button>
    </form>
  )
}
