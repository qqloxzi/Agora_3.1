import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { User, LogOut, ArrowRight, History } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { ProfileSummaryCard } from '../components/ProfileSummaryCard'

export function Profile() {
  const { user, profile, loading, signOut } = useAuth()
  const [recent, setRecent] = useState([])

  useEffect(() => {
    if (!user) return
    supabase
      .from('atolye_lesson_progress')
      .select('lesson_title, course_title, completed_at, xp_earned')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(6)
      .then(({ data }) => setRecent(data ?? []))
  }, [user])

  if (loading) return <p className="text-center py-24 text-ink/40">Yükleniyor...</p>
  if (!user) return <Navigate to="/kayit" replace />

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-14">
      <div className="rounded-3xl agora-gradient-surface text-white p-8 md:p-10 mb-8 flex items-center gap-5">
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="" className="w-20 h-20 rounded-full object-cover border-4 border-white/30" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/30">
            <User size={32} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-black truncate">{profile?.username || 'Oyuncu'}</h1>
          <p className="opacity-80 font-data text-sm">{profile?.rank}</p>
        </div>
        <button onClick={signOut} className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors shrink-0" aria-label="Çıkış yap">
          <LogOut size={18} />
        </button>
      </div>

      <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-6 mb-8">
        <ProfileSummaryCard />
        <div className="flex flex-col gap-6">
          <Link to="/atolyeler" className="magnetic-btn rounded-3xl bg-white/70 dark:bg-white/5 border border-primary-blue/10 dark:border-white/10 shadow-card p-6 flex items-center justify-between">
            <div>
              <p className="font-extrabold text-ink dark:text-white mb-1">Atölyelere Devam Et</p>
              <p className="text-sm text-ink/50 dark:text-ice-white/50">Beceri ağacındaki bir sonraki dersine geç.</p>
            </div>
            <ArrowRight className="text-accent-blue shrink-0" />
          </Link>
          <Link to="/fikstur" className="magnetic-btn rounded-3xl bg-white/70 dark:bg-white/5 border border-primary-blue/10 dark:border-white/10 shadow-card p-6 flex items-center justify-between">
            <div>
              <p className="font-extrabold text-ink dark:text-white mb-1">Lig Durumunu Gör</p>
              <p className="text-sm text-ink/50 dark:text-ice-white/50">Puan durumu ve haftalık eşleşmeler.</p>
            </div>
            <ArrowRight className="text-accent-blue shrink-0" />
          </Link>
        </div>
      </div>

      <div className="rounded-3xl bg-white/70 dark:bg-white/5 border border-primary-blue/10 dark:border-white/10 shadow-card p-6 md:p-8">
        <h3 className="flex items-center gap-2 font-extrabold text-lg text-ink dark:text-white mb-4">
          <History size={20} className="text-accent-blue" /> Son Tamamlananlar
        </h3>
        {recent.length === 0 ? (
          <p className="text-sm text-ink/40 dark:text-ice-white/40">Henüz tamamlanan ders yok — atölyelerden başla!</p>
        ) : (
          <div className="flex flex-col gap-2">
            {recent.map((r, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-primary-blue/[0.04] dark:bg-white/5 text-sm">
                <span className="font-bold text-ink dark:text-white">{r.lesson_title}</span>
                <span className="text-ink/40 dark:text-ice-white/40">{r.course_title}</span>
                <span className="text-token font-bold font-data">+{r.xp_earned} XP</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
