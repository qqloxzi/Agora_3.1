import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Trophy, Puzzle, Users, Flame, Megaphone, CalendarDays, Globe } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { LeagueJoinForm } from '../components/LeagueJoinForm'
import { Modal } from '../components/ui/Modal'
import { FAQ } from '../components/FAQ'
import { MobileAppPromo } from '../components/MobileAppPromo'
import { fetchSeasonAnnouncement } from '../lib/seasonAnnouncement'

export function Home() {
  const { user } = useAuth()
  const [leagues, setLeagues] = useState([])
  const [stats, setStats] = useState({ students: 0, exercises: 0, matches: 0 })
  const [joinOpen, setJoinOpen] = useState(false)
  const [announcement, setAnnouncement] = useState(null)
  const [registrantCount, setRegistrantCount] = useState(0)

  useEffect(() => {
    async function load() {
      const [{ data: leagueData }, students, exercises, matches, season] = await Promise.all([
        supabase.from('league_groups').select('id, name, sub, status').order('sort_order'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('go_problems').select('*', { count: 'exact', head: true }),
        supabase.from('league_match_results').select('*', { count: 'exact', head: true }),
        fetchSeasonAnnouncement(),
      ])
      setLeagues(leagueData ?? [])
      setStats({ students: students.count ?? 0, exercises: exercises.count ?? 0, matches: matches.count ?? 0 })
      setAnnouncement(season.announcement)
      setRegistrantCount(season.registrantCount)
    }
    load()
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 md:px-6 pt-20 pb-16 relative">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-accent-blue/15 text-primary-blue dark:text-accent-blue text-xs font-bold uppercase tracking-wider mb-6">
              <Flame size={13} className="text-streak" /> Go öğrenmenin en eğlenceli yolu
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-primary-blue dark:text-white leading-[1.05] tracking-tight mb-6">
              Çevrimiçi Go Eğitim Platformu
            </h1>
            <p className="text-lg text-ink/70 dark:text-ice-white/70 leading-relaxed mb-8 max-w-xl mx-auto">
              Sadece kuralları değil, hamlelerin ardındaki derinliği keşfedin.
            </p>

            {announcement?.active && (
              <div className="inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-5 px-5 py-3.5 rounded-2xl bg-white/70 dark:bg-white/5 border border-primary-blue/15 dark:border-white/15 shadow-card mb-8 text-left">
                <div className="flex items-center gap-2 text-primary-blue dark:text-accent-blue font-extrabold shrink-0">
                  <Megaphone size={18} /> {announcement.title}
                </div>
                <div className="hidden sm:block w-px h-6 bg-primary-blue/15 dark:bg-white/15" />
                <p className="text-sm text-ink/70 dark:text-ice-white/70">{announcement.description}</p>
                <div className="flex items-center gap-3 text-xs font-bold text-ink/50 dark:text-ice-white/50 shrink-0">
                  {announcement.start_date && (
                    <span className="flex items-center gap-1">
                      <CalendarDays size={13} />
                      {new Date(announcement.start_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                    </span>
                  )}
                  <span className="flex items-center gap-1"><Users size={13} /> {registrantCount} kayıt</span>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {user ? (
                <Link to="/atolyeler" className="magnetic-btn press-btn px-7 py-4 rounded-2xl bg-primary-blue text-white font-extrabold flex items-center gap-2">
                  Öğrenmeye devam et <ArrowRight size={18} />
                </Link>
              ) : (
                <Link to="/kayit" className="magnetic-btn press-btn px-7 py-4 rounded-2xl bg-primary-blue text-white font-extrabold flex items-center gap-2">
                  Ücretsiz Başla <ArrowRight size={18} />
                </Link>
              )}
              <button onClick={() => setJoinOpen(true)} className="magnetic-btn px-7 py-4 rounded-2xl border-2 border-primary-blue/20 dark:border-white/20 text-ink dark:text-white font-extrabold flex items-center gap-2">
                <Trophy size={18} className="text-token" /> Bir Lige Katıl
              </button>
            </div>
          </motion.div>

          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-lg mx-auto mt-16">
            {[
              { label: 'Öğrenci', value: stats.students },
              { label: 'Alıştırma', value: stats.exercises },
              { label: 'Lig Maçı', value: stats.matches },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-black text-primary-blue dark:text-white font-data">{s.value}+</p>
                <p className="text-xs uppercase tracking-wider text-ink/50 dark:text-ice-white/50 font-bold mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agora Online Ligi — prominent, free, standalone from the 3 mentored leagues */}
      <section className="max-w-6xl mx-auto px-4 md:px-6">
        <Link
          to="/agora-online-ligi"
          className="magnetic-btn flex flex-col sm:flex-row items-center gap-5 rounded-3xl agora-gradient-surface text-white p-6 md:p-8 shadow-card"
        >
          <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
            <Globe size={26} />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="font-black text-xl mb-1">Agora Online Ligi</p>
            <p className="text-sm opacity-80">Tamamen ücretsiz, herkese açık — OGS üzerinden oyna, kayıtlı oyuncular listesine katıl.</p>
          </div>
          <span className="shrink-0 flex items-center gap-1.5 font-extrabold text-sm bg-white text-primary-blue px-5 py-3 rounded-xl">
            Hemen Kayıt Ol <ArrowRight size={16} />
          </span>
        </Link>
      </section>

      {/* Leagues — text left, cards right */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-16">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] gap-10 items-center">
          <div className="text-center lg:text-left">
            <span className="text-accent-blue font-bold tracking-[0.2em] uppercase text-xs">Sezon Devam Ediyor</span>
            <h2 className="text-3xl md:text-4xl font-black text-ink dark:text-white mt-3 mb-4">Aktif Ligler</h2>
            <p className="text-ink/60 dark:text-ice-white/60 mb-6 max-w-sm mx-auto lg:mx-0">
              Eğitmen eşliğinde 6 haftalık programlarla seviyene uygun ligde gerçek rakiplerle eşleş.
            </p>
            <Link to="/ligler" className="magnetic-btn inline-flex items-center gap-1.5 px-5 py-3 rounded-xl bg-primary-blue/10 text-primary-blue dark:text-white font-bold text-sm">
              Tüm ligleri gör <ArrowRight size={14} />
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            {leagues.map((league) => (
              <div key={league.id} className="flex items-center gap-4 rounded-2xl bg-white/70 dark:bg-white/5 border border-primary-blue/10 dark:border-white/10 shadow-card p-5">
                <Trophy className="text-token shrink-0" size={24} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-extrabold text-ink dark:text-white">{league.name}</h3>
                  <p className="text-xs text-ink/50 dark:text-ice-white/50">{league.sub}</p>
                </div>
                <button
                  onClick={() => setJoinOpen(true)}
                  className="magnetic-btn press-btn shrink-0 px-4 py-2 rounded-xl bg-primary-blue/10 text-primary-blue dark:text-white font-bold text-xs"
                >
                  Katıl
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workshops preview — cards left, text right */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-16">
        <div className="grid lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-10 items-center">
          <div className="flex flex-col lg:order-1 order-2">
            <Link
              to="/atolyeler"
              className="magnetic-btn rounded-2xl agora-gradient-surface text-white p-8 flex items-center gap-5 shadow-card"
            >
              <Puzzle size={32} className="opacity-90 shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-xl mb-1">Atölyeler</h3>
                <p className="text-sm opacity-80">Temel Taşlar'dan Aydınlanma'ya, tüm beceri ağacı burada.</p>
              </div>
              <ArrowRight size={20} className="shrink-0" />
            </Link>
          </div>
          <div className="text-center lg:text-left lg:order-2 order-1">
            <span className="text-accent-blue font-bold tracking-[0.2em] uppercase text-xs">Oyunlaştırılmış Öğrenim</span>
            <h2 className="text-3xl md:text-4xl font-black text-ink dark:text-white mt-3 mb-4">Atölyeler</h2>
            <p className="text-ink/60 dark:text-ice-white/60 mb-6 max-w-sm mx-auto lg:mx-0">
              Seviyene uygun beceri ağacında kendi hızında ilerle, her ders için XP ve token kazan, canlarını koru.
            </p>
            <Link to="/atolyeler" className="magnetic-btn inline-flex items-center gap-1.5 px-5 py-3 rounded-xl bg-primary-blue/10 text-primary-blue dark:text-white font-bold text-sm">
              Atölyelere başla <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <MobileAppPromo />

      <FAQ />

      <Modal open={joinOpen} onClose={() => setJoinOpen(false)} title="Bir Lige Katıl">
        {leagues.length > 0 && <LeagueJoinForm leagues={leagues} onSuccess={() => {}} />}
      </Modal>
    </div>
  )
}
