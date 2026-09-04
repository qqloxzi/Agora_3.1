import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, ExternalLink, Loader2, Users, Sparkles } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const OGS_GROUP_URL = 'https://online-go.com/group/15895'

function OgsCommunityCard() {
  return (
    <div className="rounded-3xl bg-white/70 dark:bg-white/5 border border-primary-blue/10 dark:border-white/10 shadow-card p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6">
      <div className="w-16 h-16 rounded-2xl bg-ink flex items-center justify-center shrink-0 p-3">
        <img src="/goyabaslarken/ogs.svg" alt="OGS" className="w-full h-full object-contain" />
      </div>
      <div className="flex-1 text-center sm:text-left">
        <h3 className="font-extrabold text-lg text-ink dark:text-white mb-1">OGS Topluluk Grubumuz</h3>
        <p className="text-sm text-ink/60 dark:text-ice-white/60 leading-relaxed">
          Maçlarını Online-Go Server üzerinden oynuyoruz. Gruba katıl, rakip bul, sonuçlarını paylaş.
        </p>
      </div>
      <a
        href={OGS_GROUP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="magnetic-btn press-btn shrink-0 px-5 py-3 rounded-2xl bg-primary-blue text-white font-extrabold text-sm flex items-center gap-2"
      >
        Gruba Katıl <ExternalLink size={15} />
      </a>
    </div>
  )
}

function RegistrationForm({ onSuccess }) {
  const { user, profile } = useAuth()
  const [phone, setPhone] = useState('')
  const [ogsNickname, setOgsNickname] = useState('')
  const [egfLevel, setEgfLevel] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | duplicate | error

  async function submit(e) {
    e.preventDefault()
    if (!phone.trim() || !ogsNickname.trim() || !egfLevel.trim()) return
    setStatus('loading')
    const { error } = await supabase.from('online_league_registrations').insert({
      user_id: user.id,
      full_name: profile?.username || user.email,
      email: user.email,
      phone: phone.trim(),
      ogs_nickname: ogsNickname.trim(),
      egf_level: egfLevel.trim(),
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

  if (status === 'success' || status === 'duplicate') {
    return (
      <div className="flex items-center gap-3 p-5 rounded-2xl bg-success/10 border border-success/25 text-success font-bold">
        <CheckCircle2 size={22} /> Kaydın alındı! Aşağıdaki listede görünüyorsun.
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-ink/50 dark:text-ice-white/50 mb-1.5 block">Telefon</label>
          <input
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="05xx xxx xx xx"
            className="w-full px-4 py-3 rounded-xl border border-primary-blue/15 dark:border-white/15 bg-white/70 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/30"
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-ink/50 dark:text-ice-white/50 mb-1.5 block">OGS Nickin</label>
          <input
            required
            value={ogsNickname}
            onChange={(e) => setOgsNickname(e.target.value)}
            placeholder="online-go.com kullanıcı adın"
            className="w-full px-4 py-3 rounded-xl border border-primary-blue/15 dark:border-white/15 bg-white/70 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/30"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-ink/50 dark:text-ice-white/50 mb-1.5 block">Gerçek Seviyen (EGF)</label>
        <input
          required
          value={egfLevel}
          onChange={(e) => setEgfLevel(e.target.value)}
          placeholder="ör. 5 kyu, 1 dan"
          className="w-full px-4 py-3 rounded-xl border border-primary-blue/15 dark:border-white/15 bg-white/70 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/30"
        />
      </div>

      {status === 'error' && <p className="text-sm font-bold text-heart">Bir şeyler ters gitti, tekrar dener misin?</p>}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="press-btn magnetic-btn mt-2 px-6 py-3.5 rounded-2xl bg-primary-blue text-white font-extrabold flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {status === 'loading' && <Loader2 size={18} className="animate-spin" />}
        Lige Kayıt Ol
      </button>
    </form>
  )
}

export function AgoraOnlineLeague() {
  const { user, loading: authLoading } = useAuth()
  const [roster, setRoster] = useState([])
  const [rosterLoading, setRosterLoading] = useState(true)
  const [alreadyRegistered, setAlreadyRegistered] = useState(false)
  const [checkingRegistration, setCheckingRegistration] = useState(true)

  async function loadRoster() {
    setRosterLoading(true)
    const { data } = await supabase.rpc('get_online_league_roster')
    setRoster(data ?? [])
    setRosterLoading(false)
  }

  useEffect(() => {
    loadRoster()
  }, [])

  useEffect(() => {
    if (!user) {
      setCheckingRegistration(false)
      return
    }
    setCheckingRegistration(true)
    supabase
      .from('online_league_registrations')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        setAlreadyRegistered(Boolean(data))
        setCheckingRegistration(false)
      })
  }, [user])

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-14">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-accent-blue font-bold tracking-[0.2em] uppercase text-xs">Ücretsiz · Açık Kayıt</span>
        <h1 className="text-4xl md:text-5xl font-black text-primary-blue dark:text-white mt-3 mb-4">Agora Online Ligi</h1>
        <p className="text-ink/60 dark:text-ice-white/60">
          Diğer liglerimizden bağımsız, herkese açık ve tamamen ücretsiz bir lig. Kayıt ol, OGS topluluğumuza katıl, dilediğin oyuncularla eşleş.
        </p>
      </div>

      <div className="flex flex-col gap-6 mb-10">
        <OgsCommunityCard />
      </div>

      <div className="rounded-3xl bg-white/70 dark:bg-white/5 border border-primary-blue/10 dark:border-white/10 shadow-card p-6 md:p-8 mb-10">
        <h3 className="flex items-center gap-2 font-extrabold text-lg text-ink dark:text-white mb-1">
          <Sparkles size={20} className="text-accent-blue" /> Lige Katıl
        </h3>
        <p className="text-sm text-ink/50 dark:text-ice-white/50 mb-6">Telefon numaran, OGS kullanıcı adın ve gerçek seviyen yeterli.</p>

        {authLoading || checkingRegistration ? (
          <p className="text-sm text-ink/40">Yükleniyor...</p>
        ) : !user ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <p className="text-sm text-ink/60 dark:text-ice-white/60">Kayıt olmak için önce giriş yapmalısın.</p>
            <Link to="/kayit" className="magnetic-btn press-btn px-6 py-3 rounded-2xl bg-primary-blue text-white font-extrabold text-sm">
              Ücretsiz Hesap Oluştur
            </Link>
          </div>
        ) : alreadyRegistered ? (
          <div className="flex items-center gap-3 p-5 rounded-2xl bg-success/10 border border-success/25 text-success font-bold">
            <CheckCircle2 size={22} /> Bu lige zaten kayıtlısın.
          </div>
        ) : (
          <RegistrationForm onSuccess={() => { setAlreadyRegistered(true); loadRoster() }} />
        )}
      </div>

      <div className="rounded-3xl bg-white/70 dark:bg-white/5 border border-primary-blue/10 dark:border-white/10 shadow-card p-6 md:p-8">
        <h3 className="flex items-center gap-2 font-extrabold text-lg text-ink dark:text-white mb-6">
          <Users size={20} className="text-accent-blue" /> Kayıtlı Oyuncular
          <span className="text-sm font-bold text-ink/40 dark:text-ice-white/40">({roster.length})</span>
        </h3>

        {rosterLoading ? (
          <p className="text-sm text-ink/40">Yükleniyor...</p>
        ) : roster.length === 0 ? (
          <p className="text-sm text-ink/40 dark:text-ice-white/40">Henüz kimse kayıt olmadı — ilk sen ol!</p>
        ) : (
          <div className="flex flex-col gap-2">
            {roster.map((r, i) => (
              <div key={r.id} className="flex items-center gap-4 px-4 py-3 rounded-xl bg-primary-blue/[0.04] dark:bg-white/5 text-sm">
                <span className="w-6 text-ink/30 dark:text-ice-white/30 font-data font-bold shrink-0">{i + 1}</span>
                <span className="flex-1 font-bold text-ink dark:text-white truncate">{r.full_name}</span>
                <span className="text-accent-blue font-data font-bold truncate">{r.ogs_nickname}</span>
                <span className="text-ink/50 dark:text-ice-white/50 font-data shrink-0">{r.egf_level}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
