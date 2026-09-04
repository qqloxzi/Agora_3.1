import { useEffect, useState } from 'react'
import { Trophy, User } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { StreakFlame } from '../components/ui/StreakFlame'

const MEDAL_COLORS = ['bg-token text-white', 'bg-ink/20 text-ink dark:text-white', 'bg-heart/60 text-white']

export function Leaderboard() {
  const { user } = useAuth()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('profiles')
      .select('id, username, avatar_url, rank, xp, streak_count')
      .order('xp', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setRows(data ?? [])
        setLoading(false)
      })
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-14">
      <div className="text-center mb-10">
        <span className="text-accent-blue font-bold tracking-[0.2em] uppercase text-xs">Genel Sıralama</span>
        <h1 className="text-4xl md:text-5xl font-black text-primary-blue dark:text-white mt-3 mb-4 flex items-center justify-center gap-3">
          <Trophy className="text-token" size={38} /> Liderlik Tablosu
        </h1>
        <p className="text-ink/60 dark:text-ice-white/60">Toplam XP'ye göre en iyi öğrenciler.</p>
      </div>

      {loading && <p className="text-center text-ink/40">Yükleniyor...</p>}

      <div className="flex flex-col gap-2">
        {rows.map((row, i) => (
          <div
            key={row.id}
            className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl border ${
              row.id === user?.id ? 'bg-accent-blue/10 border-accent-blue/30' : 'bg-white/60 dark:bg-white/5 border-primary-blue/10 dark:border-white/10'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${MEDAL_COLORS[i] || 'text-ink/40 dark:text-ice-white/40'}`}>
              {i + 1}
            </div>
            {row.avatar_url ? (
              <img src={row.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-accent-blue/20 flex items-center justify-center text-primary-blue"><User size={18} /></div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-ink dark:text-white truncate">{row.username || 'İsimsiz Oyuncu'}</p>
              <p className="text-xs text-ink/40 dark:text-ice-white/40 font-data">{row.rank}</p>
            </div>
            <StreakFlame count={row.streak_count} size="sm" className="hidden sm:inline-flex" />
            <span className="font-black text-primary-blue dark:text-white font-data w-16 text-right">{row.xp} XP</span>
          </div>
        ))}
      </div>
    </div>
  )
}
