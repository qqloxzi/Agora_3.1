import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { User, Trophy, GraduationCap } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { fetchMyLeagueRegistrations, fetchWorkshopOverview } from '../lib/profileSummary'
import { HeartsBar } from './ui/HeartsBar'
import { TokenBadge } from './ui/TokenBadge'
import { StreakFlame } from './ui/StreakFlame'
import { XPProgressBar } from './ui/XPProgressBar'

// Reusable "who am I, how am I doing" card — used on both the Profile page
// and the Atölyeler overview so a logged-in user always has their status
// (rank/XP, hearts & tokens, joined league, workshop progress) at hand.
export function ProfileSummaryCard({ className = '' }) {
  const { user, profile } = useAuth()
  const [leagues, setLeagues] = useState([])
  const [workshop, setWorkshop] = useState(null)

  useEffect(() => {
    if (!user) return
    fetchMyLeagueRegistrations(user.id).then(setLeagues)
    fetchWorkshopOverview(user.id).then(setWorkshop)
  }, [user])

  if (!user || !profile) {
    return (
      <div className={`rounded-3xl bg-white/70 dark:bg-white/5 border border-primary-blue/10 dark:border-white/10 shadow-card p-6 text-center ${className}`}>
        <p className="text-sm text-ink/60 dark:text-ice-white/60 mb-4">İlerlemeni ve lig durumunu görmek için giriş yap.</p>
        <Link to="/giris" className="magnetic-btn press-btn inline-block px-5 py-2.5 rounded-xl bg-primary-blue text-white font-bold text-sm">
          Giriş Yap
        </Link>
      </div>
    )
  }

  return (
    <div className={`rounded-3xl bg-white/70 dark:bg-white/5 border border-primary-blue/10 dark:border-white/10 shadow-card p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-accent-blue/20 flex items-center justify-center text-primary-blue shrink-0">
            <User size={20} />
          </div>
        )}
        <div className="min-w-0">
          <p className="font-extrabold text-ink dark:text-white truncate">{profile.username || 'Oyuncu'}</p>
          <p className="text-xs text-ink/40 dark:text-ice-white/40 font-data">{profile.rank}</p>
        </div>
      </div>

      <XPProgressBar xp={profile.xp ?? 0} className="mb-4" />

      <div className="flex flex-wrap items-center gap-2 mb-5">
        <HeartsBar hearts={profile.hearts} profile={profile} size={15} />
        <TokenBadge tokens={profile.tokens ?? 0} size="sm" />
        <StreakFlame count={profile.streak_count ?? 0} size="sm" />
      </div>

      <div className="pt-4 border-t border-primary-blue/10 dark:border-white/10">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink/40 dark:text-ice-white/40 mb-2">
          <Trophy size={13} /> Katıldığın Ligler
        </p>
        {leagues.length === 0 ? (
          <Link to="/fikstur" className="text-sm text-accent-blue font-bold hover:underline">Henüz katılmadın — bir lige göz at</Link>
        ) : (
          <div className="flex flex-col gap-1.5">
            {leagues.map((l) => (
              <div key={l.id} className="flex items-center justify-between text-sm">
                <span className="font-bold text-ink dark:text-white">{l.name}</span>
                <span className="text-xs text-ink/40 dark:text-ice-white/40">{l.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-4 mt-4 border-t border-primary-blue/10 dark:border-white/10">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink/40 dark:text-ice-white/40 mb-2">
          <GraduationCap size={13} /> Atölye İlerlemen
        </p>
        {workshop ? (
          <div className="flex flex-col gap-2">
            {workshop.bySection.map((s) => (
              <div key={s.id}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-ink/70 dark:text-ice-white/70">{s.title}</span>
                  <span className="text-ink/40 dark:text-ice-white/40 font-data">{s.done}/{s.total}</span>
                </div>
                <div className="h-1.5 rounded-full bg-ink/10 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary-blue"
                    style={{ width: `${s.total ? Math.round((s.done / s.total) * 100) : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink/40">Yükleniyor...</p>
        )}
      </div>
    </div>
  )
}
