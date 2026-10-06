import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Trophy, Puzzle, Users, Megaphone, CalendarDays, GraduationCap, User, Swords, GitBranch } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { LeagueJoinForm } from '../components/LeagueJoinForm'
import { Modal } from '../components/ui/Modal'
import { FAQ } from '../components/FAQ'
import { MobileAppPromo } from '../components/MobileAppPromo'
import { GoBoardPreview } from '../components/GoBoardPreview'
import { TokenBadge } from '../components/ui/TokenBadge'
import { StreakFlame } from '../components/ui/StreakFlame'
import { fetchSeasonAnnouncement } from '../lib/seasonAnnouncement'
import { fetchOnlineLeagueMatches, computeOnlineLeagueStandings } from '../lib/onlineLeagueData'
import { parseSgf, boardSizeOf, replayPath } from '../lib/sgfEngine'
import { fetchCompletedLessonIds, fetchAllLessonIdsBySlug } from '../lib/workshopProgress'
import { nextRankProgress, rankForXp } from '../lib/gamification'
import { JOSEKI_CATALOG, JOSEKI_HOME_PREVIEW } from '../data/josekiCatalog'

// Joseki card preview board, from the small catalog (not the big joseki JSONs,
// which stay in their own lazily loaded chunk).
function josekiPreviewBoard() {
  const board = Array.from({ length: 19 }, () => Array(19).fill(null))
  for (const c of ['B', 'W']) {
    const s = JOSEKI_HOME_PREVIEW[c]
    for (let i = 0; i < s.length; i += 2) board[s.charCodeAt(i + 1) - 97][s.charCodeAt(i) - 97] = c
  }
  return board
}

// Solved joseki exercises: local progress (same key as lib/joseki.js) plus
// the signed-in user's `joseki:<slug>:<exId>` lesson rows.
function josekiProgress(completedIds) {
  let done = 0
  let total = 0
  for (const e of JOSEKI_CATALOG) {
    if (!e.slug) continue
    total += e.exercises ?? 0
    const ids = new Set()
    try {
      // Only "Josekiyi oyna" ids — the removed "İyi mi, kötü mü?" ones don't count.
      for (const id of JSON.parse(localStorage.getItem(`agora-joseki-progress:${e.slug}`) || '[]')) if (String(id).startsWith('seq-')) ids.add(id)
    } catch {
      // storage unavailable — remote rows still count
    }
    const prefix = `joseki:${e.slug}:`
    for (const id of completedIds) if (String(id).startsWith(`${prefix}seq-`)) ids.add(String(id).slice(prefix.length))
    done += Math.min(ids.size, e.exercises ?? 0)
  }
  return { done, total }
}

function sgfRowToBoard(row) {
  const root = parseSgf(row?.sgf_raw)
  if (!root) return null
  const size = boardSizeOf(root)
  const { board } = replayPath([root], size)
  return { board, size }
}

export function Home() {
  const { user, profile } = useAuth()
  const [leagues, setLeagues] = useState([])
  const [stats, setStats] = useState({ students: 0, exercises: 0 })
  const [joinOpen, setJoinOpen] = useState(false)
  const [announcement, setAnnouncement] = useState(null)
  const [registrantCount, setRegistrantCount] = useState(0)
  const [tournamentRoster, setTournamentRoster] = useState([])
  const [tournamentRosterLoading, setTournamentRosterLoading] = useState(true)
  const [tournamentMatches, setTournamentMatches] = useState([])
  const [puzzlePreview, setPuzzlePreview] = useState(null)
  const [coursePreview, setCoursePreview] = useState(null)
  const [puzzleProgress, setPuzzleProgress] = useState({ done: 0, total: 0 })
  const [courseProgress, setCourseProgress] = useState({ done: 0, total: 0 })
  const [josekiProgressState, setJosekiProgress] = useState(() => josekiProgress(new Set()))

  useEffect(() => {
    async function load() {
      const [{ data: leagueData }, students, exercises, season, { data: roster }, matches] = await Promise.all([
        supabase.from('league_groups').select('id, name, sub, status').order('sort_order'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('go_problems').select('*', { count: 'exact', head: true }),
        fetchSeasonAnnouncement(),
        supabase.rpc('get_online_league_roster'),
        fetchOnlineLeagueMatches(),
      ])
      setLeagues(leagueData ?? [])
      setStats({ students: students.count ?? 0, exercises: exercises.count ?? 0 })
      setAnnouncement(season.announcement)
      setRegistrantCount(season.registrantCount)
      setTournamentRoster(roster ?? [])
      setTournamentRosterLoading(false)
      setTournamentMatches(matches)
    }
    load()
  }, [])

  useEffect(() => {
    async function loadPreviews() {
      const [{ data: puzzleRow }, { data: courseRow }] = await Promise.all([
        supabase.from('go_problems').select('sgf_raw').eq('category', 'Bulmaca').limit(1).maybeSingle(),
        supabase.from('go_problems').select('sgf_raw').not('course_slug', 'is', null).limit(1).maybeSingle(),
      ])
      setPuzzlePreview(sgfRowToBoard(puzzleRow))
      setCoursePreview(sgfRowToBoard(courseRow))
    }
    loadPreviews()
  }, [])

  useEffect(() => {
    async function loadProgress() {
      const [{ data: puzzleIdRows }, lessonsBySlug, completedIds] = await Promise.all([
        supabase.from('go_problems').select('id').eq('category', 'Bulmaca'),
        fetchAllLessonIdsBySlug(),
        fetchCompletedLessonIds(user?.id),
      ])
      const puzzleIds = (puzzleIdRows ?? []).map((r) => r.id)
      const courseIds = Object.values(lessonsBySlug).flat()
      setPuzzleProgress({ done: puzzleIds.filter((id) => completedIds.has(id)).length, total: puzzleIds.length })
      setCourseProgress({ done: courseIds.filter((id) => completedIds.has(id)).length, total: courseIds.length })
      setJosekiProgress(josekiProgress(completedIds))
    }
    loadProgress()
  }, [user])

  const tournamentStandings = computeOnlineLeagueStandings(tournamentRoster, tournamentMatches)
  const latestTournamentRound = tournamentMatches.reduce((max, m) => Math.max(max, m.round), 0)

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        {user && profile && (
          <Link
            to="/profil"
            className="magnetic-btn absolute top-4 right-4 md:top-6 md:right-6 z-10 flex items-center gap-2.5 pl-2.5 pr-3.5 py-2 rounded-2xl bg-white/70 dark:bg-white/5 border border-primary-blue/10 dark:border-white/10 shadow-card backdrop-blur-sm"
          >
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-accent-blue/30 flex items-center justify-center text-primary-blue shrink-0">
                <User size={16} />
              </div>
            )}
            <span className="flex flex-col gap-0.5 leading-tight min-w-0">
              <span className="flex items-baseline gap-1.5 min-w-0">
                <span className="text-sm font-bold text-ink dark:text-white truncate max-w-[7rem]">{profile.username || 'Profilim'}</span>
                <span className="shrink-0 text-[11px] font-bold text-primary-blue dark:text-accent-blue font-data">{rankForXp(profile.xp ?? 0)}</span>
              </span>
              <span className="block w-28 h-1.5 rounded-full bg-ink/10 dark:bg-white/10 overflow-hidden" title={`${profile.xp ?? 0} XP`}>
                <span className="block h-full rounded-full agora-gradient-surface" style={{ width: `${Math.max(nextRankProgress(profile.xp ?? 0).percent, 3)}%` }} />
              </span>
            </span>
            <div className="hidden sm:block w-px h-6 bg-primary-blue/15 dark:bg-white/15" />
            <div className="hidden sm:flex items-center gap-2">
              <TokenBadge tokens={profile.tokens ?? 0} size="sm" />
              <StreakFlame count={profile.streak_count ?? 0} size="sm" />
            </div>
          </Link>
        )}
        <div className="max-w-6xl mx-auto px-4 md:px-6 pt-20 pb-16 relative">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center max-w-3xl mx-auto">
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
          </motion.div>
        </div>
      </section>

      {/* Agora Online Turnuvası — prominent, free, standalone from the 3 mentored leagues */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 mb-10">
        <div className="grid md:grid-cols-2 gap-6">
          <Link
            to="/agora-online-ligi"
            className="magnetic-btn rounded-3xl bg-white/70 dark:bg-white/5 border border-primary-blue/10 dark:border-white/10 shadow-card p-6 md:p-8"
          >
            <h3 className="flex items-center gap-2 font-extrabold text-lg text-ink dark:text-white mb-4">
              <Trophy size={18} className="text-accent-blue" /> Sıralama
            </h3>
            {tournamentRosterLoading ? (
              <p className="text-sm text-ink/40">Yükleniyor...</p>
            ) : tournamentStandings.length === 0 ? (
              <p className="text-sm text-ink/40 dark:text-ice-white/40">Henüz sonuç girilmedi.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {tournamentStandings.slice(0, 5).map((s, i) => (
                  <div key={s.player.id} className="flex items-center gap-4 px-4 py-2.5 rounded-xl bg-primary-blue/[0.04] dark:bg-white/5 text-sm">
                    <span className="w-6 text-ink/30 dark:text-ice-white/30 font-data font-bold shrink-0">{i + 1}</span>
                    <span className="flex-1 font-bold text-ink dark:text-white truncate">{s.player.full_name}</span>
                    <span className="text-accent-blue font-data font-black shrink-0">{s.points} p</span>
                  </div>
                ))}
              </div>
            )}
          </Link>

          <Link
            to="/agora-online-ligi"
            className="magnetic-btn flex flex-col rounded-3xl agora-gradient-surface text-white p-6 md:p-8 shadow-card"
          >
            <h3 className="flex items-center gap-2 font-extrabold text-lg mb-1">
              <Swords size={18} /> Eşleştirmeler
            </h3>
            <p className="text-sm opacity-80 flex-1">
              {latestTournamentRound > 0
                ? `${latestTournamentRound}. tur eşleştirmeleri açıklandı — kimin kime karşı oynadığını ve sonuçları gör.`
                : 'Eşleştirmeler henüz açıklanmadı.'}
            </p>
            <span className="mt-4 self-start shrink-0 flex items-center gap-1.5 font-extrabold text-sm bg-white text-primary-blue px-5 py-3 rounded-xl">
              Eşleştirmeleri Gör <ArrowRight size={16} />
            </span>
          </Link>
        </div>
      </section>

      {/* Katıl CTA'ları + istatistikler — Turnuva'nın altında */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 mb-10">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {user ? (
            <Link to="/atolyeler" className="magnetic-btn press-btn px-7 py-4 rounded-2xl bg-primary-blue text-white font-extrabold flex items-center gap-2">
              Öğrenmeye devam et <ArrowRight size={18} />
            </Link>
          ) : (
            <Link to="/kayit" className="magnetic-btn press-btn px-7 py-4 rounded-2xl bg-primary-blue text-white font-extrabold flex items-center gap-2">
              Agora'ya Katıl <ArrowRight size={18} />
            </Link>
          )}
          <button onClick={() => setJoinOpen(true)} className="magnetic-btn px-7 py-4 rounded-2xl border-2 border-primary-blue/20 dark:border-white/20 text-ink dark:text-white font-extrabold flex items-center gap-2">
            <Trophy size={18} className="text-token" /> Bir Lige Katıl
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-lg mx-auto mt-10">
          {[
            { label: 'Öğrenci', value: stats.students },
            { label: 'Alıştırma', value: stats.exercises },
            { label: 'Sezon', value: 3 },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-black text-primary-blue dark:text-white font-data">{s.value}+</p>
              <p className="text-xs uppercase tracking-wider text-ink/50 dark:text-ice-white/50 font-bold mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pratik yap — bulmaca çöz ya da atölyelere devam et */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 mb-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6 max-w-xl sm:max-w-3xl mx-auto">
          <Link to="/bulmacalar" className="magnetic-btn group block rounded-3xl overflow-hidden shadow-card">
            <div className="relative aspect-square">
              <GoBoardPreview board={puzzlePreview?.board} size={puzzlePreview?.size ?? 19} gradientId="home-puzzle" />
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <span className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/95 dark:bg-ink/85 backdrop-blur-sm text-ink dark:text-white font-extrabold text-sm shadow-xl group-hover:scale-105 transition-transform">
                  <Puzzle size={16} className="text-accent-blue" /> Bulmacaları Çözün
                </span>
              </div>
            </div>
            <div className="bg-white/70 dark:bg-white/5 border-t border-primary-blue/10 dark:border-white/10 px-4 py-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-extrabold text-ink dark:text-white">Bulmacalar</span>
                <span className="text-[11px] font-bold text-ink/40 dark:text-ice-white/40 font-data">
                  {puzzleProgress.done}/{puzzleProgress.total}
                </span>
              </div>
              <div className="h-2 rounded-full bg-primary-blue/10 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent-blue to-primary-blue transition-all duration-500"
                  style={{ width: `${puzzleProgress.total ? Math.max((puzzleProgress.done / puzzleProgress.total) * 100, puzzleProgress.done > 0 ? 4 : 0) : 0}%` }}
                />
              </div>
            </div>
          </Link>

          <Link to="/atolyeler" className="magnetic-btn group block rounded-3xl overflow-hidden shadow-card">
            <div className="relative aspect-square">
              <GoBoardPreview board={coursePreview?.board} size={coursePreview?.size ?? 19} gradientId="home-course" />
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <span className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/95 dark:bg-ink/85 backdrop-blur-sm text-ink dark:text-white font-extrabold text-sm shadow-xl group-hover:scale-105 transition-transform">
                  <GraduationCap size={16} className="text-accent-blue" /> Atölyelere Git
                </span>
              </div>
            </div>
            <div className="bg-white/70 dark:bg-white/5 border-t border-primary-blue/10 dark:border-white/10 px-4 py-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-extrabold text-ink dark:text-white">Atölyeler</span>
                <span className="text-[11px] font-bold text-ink/40 dark:text-ice-white/40 font-data">
                  {courseProgress.done}/{courseProgress.total}
                </span>
              </div>
              <div className="h-2 rounded-full bg-primary-blue/10 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent-blue to-primary-blue transition-all duration-500"
                  style={{ width: `${courseProgress.total ? Math.max((courseProgress.done / courseProgress.total) * 100, courseProgress.done > 0 ? 4 : 0) : 0}%` }}
                />
              </div>
            </div>
          </Link>

          <Link to="/joseki-sonrasi" className="col-span-2 sm:col-span-1 justify-self-center w-[calc(50%-0.5rem)] sm:w-auto magnetic-btn group block rounded-3xl overflow-hidden shadow-card">
            <div className="relative aspect-square">
              <GoBoardPreview board={josekiPreviewBoard()} size={19} gradientId="home-joseki" />
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <span className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/95 dark:bg-ink/85 backdrop-blur-sm text-ink dark:text-white font-extrabold text-sm shadow-xl group-hover:scale-105 transition-transform">
                  <GitBranch size={16} className="text-accent-blue" /> Josekileri Öğren
                </span>
              </div>
            </div>
            <div className="bg-white/70 dark:bg-white/5 border-t border-primary-blue/10 dark:border-white/10 px-4 py-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-extrabold text-ink dark:text-white">Joseki Sonrası</span>
                <span className="text-[11px] font-bold text-ink/40 dark:text-ice-white/40 font-data">
                  {josekiProgressState.done}/{josekiProgressState.total}
                </span>
              </div>
              <div className="h-2 rounded-full bg-primary-blue/10 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent-blue to-primary-blue transition-all duration-500"
                  style={{ width: `${josekiProgressState.total ? Math.max((josekiProgressState.done / josekiProgressState.total) * 100, josekiProgressState.done > 0 ? 4 : 0) : 0}%` }}
                />
              </div>
            </div>
          </Link>
        </div>
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
