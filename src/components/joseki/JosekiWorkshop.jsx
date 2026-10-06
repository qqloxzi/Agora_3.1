import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Lock, PlayCircle } from 'lucide-react'
import { SequenceExercise } from './JosekiExercises'
import { awardJosekiExercise, josekiBySlug, loadJosekiProgressMerged, saveJosekiProgress } from '../../lib/joseki'
import { useAuth } from '../../contexts/AuthContext'
import { StarRating } from '../ui/StarRating'
import { TagRankBadge } from '../ui/TagRankBadge'

// An Atölyeler box made of one joseki's "Josekiyi oyna" exercises. Same page
// shape as WorkshopLesson (lesson list on the left, one exercise at a time,
// each unlocked by the previous one); progress and XP are the joseki's own,
// so solving here or in Joseki Sonrası counts in both.
export default function JosekiWorkshop({ course }) {
  const joseki = josekiBySlug(course.joseki)
  const { user, profile, setProfile } = useAuth()
  const [done, setDone] = useState(new Set())
  const [activeId, setActiveId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const list = joseki?.exercises ?? []

  useEffect(() => {
    let active = true
    loadJosekiProgressMerged(course.joseki, user?.id).then((merged) => {
      if (!active) return
      setDone(merged)
      setActiveId((cur) => cur ?? (list.find((e) => !merged.has(e.id)) ?? list[0])?.id ?? null)
      setLoading(false)
    })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course.joseki, user?.id])

  if (!joseki) return null

  const activeIdx = list.findIndex((e) => e.id === activeId)
  const ex = list[activeIdx]
  const prev = list[activeIdx - 1]
  const next = list[activeIdx + 1]
  const isUnlocked = (idx) => idx === 0 || profile?.is_admin || done.has(list[idx - 1]?.id)

  async function handleSolved(id) {
    if (done.has(id)) return
    const nextDone = new Set(done).add(id)
    setDone(nextDone)
    saveJosekiProgress(course.joseki, nextDone)
    const xp = await awardJosekiExercise({ user, profile, setProfile, joseki, ex: list.find((e) => e.id === id) })
    setToast(user ? `+${xp} XP kazandın!` : 'Kaydedildi! Girişle XP kazanmaya başla.')
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className="h-full flex flex-col lg:flex-row overflow-hidden">
      <aside className="shrink-0 max-h-56 lg:max-h-none lg:w-64 lg:h-full overflow-y-auto border-b lg:border-b-0 lg:border-r border-primary-blue/10 dark:border-white/10 px-5 py-6">
        <Link to="/atolyeler" className="inline-flex items-center gap-1.5 text-sm font-bold text-ink/60 dark:text-ice-white/60 hover:text-accent-blue mb-4">
          <ArrowLeft size={16} /> Atölyeler
        </Link>
        <h1 className="text-lg font-extrabold text-ink dark:text-white mb-1">{course.title}</h1>
        <p className="text-sm text-ink/50 dark:text-ice-white/50 mb-5">{course.description}</p>

        <div className="flex flex-col gap-1.5">
          {list.map((e, idx) => {
            const unlocked = isUnlocked(idx)
            return (
              <button
                key={e.id}
                disabled={!unlocked}
                onClick={() => setActiveId(e.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-bold transition-colors ${
                  e.id === activeId
                    ? 'bg-accent-blue/15 text-primary-blue dark:text-white'
                    : unlocked
                      ? 'text-ink/70 dark:text-ice-white/70 hover:bg-primary-blue/5'
                      : 'text-ink/30 dark:text-ice-white/25 cursor-not-allowed'
                }`}
              >
                {done.has(e.id) ? (
                  <Check size={16} className="text-success shrink-0" />
                ) : unlocked ? (
                  <PlayCircle size={16} className="shrink-0" />
                ) : (
                  <Lock size={14} className="shrink-0" />
                )}
                Josekiyi oyna {idx + 1}
              </button>
            )
          })}
        </div>
      </aside>

      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col px-4 md:px-8 py-6">
        {loading ? (
          <p className="text-ink/40">Yükleniyor...</p>
        ) : ex ? (
          <div className="flex flex-col max-w-6xl w-full mx-auto animate-pop-in lg:flex-1 lg:min-h-0">
            <div className="shrink-0 mb-3 flex items-center justify-between gap-2">
              <p className="text-xs font-bold uppercase tracking-wider text-accent-blue">
                Josekiyi oyna · {activeIdx + 1}/{list.length}
              </p>
              <TagRankBadge tag="Joseki" />
            </div>

            <div className="lg:flex-1 lg:min-h-0">
              <SequenceExercise key={ex.id} joseki={joseki} ex={ex} onSolved={() => handleSolved(ex.id)} />
            </div>

            <div className="shrink-0 flex items-center justify-between gap-3 mt-3 pt-3 border-t border-primary-blue/10 dark:border-white/10">
              <button
                disabled={!prev}
                onClick={() => prev && setActiveId(prev.id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-ink/60 dark:text-ice-white/60 disabled:opacity-30 hover:bg-primary-blue/5 transition-colors"
              >
                <ArrowLeft size={16} /> Önceki
              </button>
              <button
                disabled={!next || (!done.has(ex.id) && !profile?.is_admin)}
                onClick={() => next && setActiveId(next.id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-primary-blue/10 text-primary-blue dark:text-white disabled:opacity-30 disabled:bg-transparent transition-colors"
              >
                Sonraki <ArrowRight size={16} />
              </button>
            </div>

            <div className="shrink-0 mt-2">
              <StarRating targetType="workshop" targetId={course.slug} size={16} />
            </div>
          </div>
        ) : (
          <p className="text-ink/40">Bu atölyenin içeriği yakında eklenecek.</p>
        )}

        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-2xl bg-ink text-white dark:bg-white dark:text-ink font-bold shadow-2xl animate-pop-in z-50">
            {toast}
          </div>
        )}
      </div>
    </div>
  )
}
