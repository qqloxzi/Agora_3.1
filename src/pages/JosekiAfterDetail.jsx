import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, BookOpen, Dumbbell } from 'lucide-react'
import { JosekiExplorer } from '../components/joseki/JosekiExplorer'
import { JosekiExercises } from '../components/joseki/JosekiExercises'
import { awardJosekiExercise, josekiBySlug, loadJosekiProgress, loadJosekiProgressMerged, saveJosekiProgress } from '../lib/joseki'
import { useAuth } from '../contexts/AuthContext'
import { NotFound } from './NotFound'

export function JosekiAfterDetail() {
  const { slug } = useParams()
  const joseki = josekiBySlug(slug)
  const [tab, setTab] = useState('learn')
  const { user, profile, setProfile } = useAuth()
  const [done, setDone] = useState(() => loadJosekiProgress(slug))
  const [reward, setReward] = useState(null)

  useEffect(() => {
    let active = true
    loadJosekiProgressMerged(slug, user?.id).then((merged) => active && setDone(merged))
    return () => {
      active = false
    }
  }, [slug, user?.id])

  if (!joseki) return <NotFound />

  async function markSolved(id) {
    if (done.has(id)) return
    const next = new Set(done).add(id)
    setDone(next)
    saveJosekiProgress(slug, next)
    const ex = joseki.exercises.find((e) => e.id === id)
    const xp = await awardJosekiExercise({ user, profile, setProfile, joseki, ex })
    setReward({ id, xp, signedIn: !!user })
  }

  const tabClass = (active) =>
    `press-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
      active ? 'bg-primary-blue text-white' : 'text-ink/60 dark:text-ice-white/60 hover:bg-primary-blue/5 dark:hover:bg-white/5'
    }`

  return (
    <div className="h-full flex flex-col max-w-7xl w-full mx-auto px-4 md:px-6 py-3">
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/joseki-sonrasi" title="Joseki Sonrası" className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-primary-blue/5 dark:bg-white/10 text-ink/60 dark:text-ice-white/60 hover:text-accent-blue">
            <ArrowLeft size={16} />
          </Link>
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-black text-primary-blue dark:text-white leading-tight truncate">{joseki.title}</h1>
            <p className="text-[11px] font-bold text-accent-blue truncate">{joseki.subtitle}</p>
          </div>
        </div>
        <div className="flex gap-1 p-1 rounded-xl bg-white/70 dark:bg-white/5 border border-primary-blue/10 dark:border-white/10">
          <button onClick={() => setTab('learn')} className={tabClass(tab === 'learn')}>
            <BookOpen size={15} /> Öğren
          </button>
          <button onClick={() => setTab('practice')} className={tabClass(tab === 'practice')}>
            <Dumbbell size={15} /> Alıştırmalar
            <span className={`text-[10px] font-data ${tab === 'practice' ? 'text-white/70' : 'text-ink/40 dark:text-ice-white/40'}`}>
              {done.size}/{joseki.exercises.length}
            </span>
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto lg:overflow-visible">
        {tab === 'learn' ? <JosekiExplorer key={slug} joseki={joseki} /> : <JosekiExercises key={slug} joseki={joseki} done={done} onSolved={markSolved} reward={reward} />}
      </div>
    </div>
  )
}
