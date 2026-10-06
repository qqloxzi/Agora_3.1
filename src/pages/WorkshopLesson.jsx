import { lazy, Suspense, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Lock, PlayCircle } from 'lucide-react'
import { findCourse } from '../data/workshopCatalog'
import { fetchCourseLessons, fetchCompletedLessonIds, completeLesson } from '../lib/workshopProgress'
import { useAuth } from '../contexts/AuthContext'
import { StarRating } from '../components/ui/StarRating'
import { GoPuzzle } from '../components/GoPuzzle'
import { TagRankBadge } from '../components/ui/TagRankBadge'

// Joseki boxes carry ~1 MB of joseki data, so they load as a separate chunk.
const JosekiWorkshop = lazy(() => import('../components/joseki/JosekiWorkshop'))

export function WorkshopLesson() {
  const { courseSlug } = useParams()
  const course = findCourse(courseSlug)
  if (course?.joseki) {
    return (
      <Suspense fallback={<p className="px-6 py-8 text-ink/40">Yükleniyor...</p>}>
        <JosekiWorkshop key={course.slug} course={course} />
      </Suspense>
    )
  }
  return <ProblemWorkshopLesson />
}

function ProblemWorkshopLesson() {
  const { courseSlug } = useParams()
  const { user, profile, setProfile } = useAuth()
  const course = findCourse(courseSlug)
  const [lessons, setLessons] = useState([])
  const [completed, setCompleted] = useState(new Set())
  const [activeId, setActiveId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      const [ls, done] = await Promise.all([fetchCourseLessons(courseSlug), fetchCompletedLessonIds(user?.id)])
      if (!active) return
      setLessons(ls)
      setCompleted(done)
      const firstIncomplete = ls.find((l) => !done.has(l.id))
      setActiveId((firstIncomplete ?? ls[0])?.id ?? null)
      setLoading(false)
    }
    load()
    return () => {
      active = false
    }
  }, [courseSlug, user])

  if (!course) {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center">
        <p className="text-ink/60">Bu atölye bulunamadı.</p>
        <Link to="/atolyeler" className="text-accent-blue font-bold hover:underline">Atölyelere dön</Link>
      </div>
    )
  }

  const activeLesson = lessons.find((l) => l.id === activeId)
  const activeIdx = lessons.findIndex((l) => l.id === activeId)
  const isDone = activeLesson && completed.has(activeLesson.id)
  const prevLesson = lessons[activeIdx - 1]
  const nextLesson = lessons[activeIdx + 1]

  function isUnlocked(idx) {
    if (idx === 0 || profile?.is_admin) return true
    return completed.has(lessons[idx - 1]?.id)
  }

  async function handleComplete() {
    if (!activeLesson || completed.has(activeLesson.id)) return
    const result = await completeLesson({ user, profile, setProfile, lesson: activeLesson, course })
    setCompleted((prev) => new Set(prev).add(activeLesson.id))
    if (!result.alreadyDone) {
      setToast(user ? `+${result.xpGained} XP · +${result.tokensGained} token kazandın!` : 'Kaydedildi! Girişle XP/token kazanmaya başla.')
    }
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className="h-full flex flex-col lg:flex-row overflow-hidden">
      <aside className="shrink-0 lg:w-64 lg:h-full lg:overflow-y-auto border-b lg:border-b-0 lg:border-r border-primary-blue/10 dark:border-white/10 px-5 py-6">
        <Link to="/atolyeler" className="inline-flex items-center gap-1.5 text-sm font-bold text-ink/60 dark:text-ice-white/60 hover:text-accent-blue mb-4">
          <ArrowLeft size={16} /> Atölyeler
        </Link>
        <h1 className="text-lg font-extrabold text-ink dark:text-white mb-1">{course.title}</h1>
        <p className="text-sm text-ink/50 dark:text-ice-white/50 mb-5">{course.description}</p>

        <div className="flex flex-col gap-1.5">
          {lessons.map((lesson, idx) => {
            const unlocked = isUnlocked(idx)
            const done = completed.has(lesson.id)
            return (
              <button
                key={lesson.id}
                disabled={!unlocked}
                onClick={() => setActiveId(lesson.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-bold transition-colors ${
                  lesson.id === activeId
                    ? 'bg-accent-blue/15 text-primary-blue dark:text-white'
                    : unlocked
                      ? 'text-ink/70 dark:text-ice-white/70 hover:bg-primary-blue/5'
                      : 'text-ink/30 dark:text-ice-white/25 cursor-not-allowed'
                }`}
              >
                {done ? (
                  <Check size={16} className="text-success shrink-0" />
                ) : unlocked ? (
                  <PlayCircle size={16} className="shrink-0" />
                ) : (
                  <Lock size={14} className="shrink-0" />
                )}
                {lesson.title}
              </button>
            )
          })}
          {!loading && lessons.length === 0 && (
            <p className="text-sm text-ink/40 dark:text-ice-white/40 italic px-3">Bu atölyenin içeriği yakında eklenecek.</p>
          )}
        </div>
      </aside>

      <div className="flex-1 min-h-0 flex flex-col px-4 md:px-8 py-6">
        {loading ? (
          <p className="text-ink/40">Yükleniyor...</p>
        ) : activeLesson ? (
          <div className="flex-1 min-h-0 flex flex-col max-w-3xl w-full mx-auto animate-pop-in">
            <div className="shrink-0 mb-3 flex items-center justify-between gap-2">
              <p className="text-xs font-bold uppercase tracking-wider text-accent-blue">
                {activeLesson.moduleTitle || 'Alıştırma'} · {activeLesson.title}
              </p>
              <TagRankBadge tag={activeLesson.tag} rank={activeLesson.rank} />
            </div>

            <div className="flex-1 min-h-0">
              <GoPuzzle fitParent sgfRaw={activeLesson.sgfRaw} validationMode={activeLesson.validationMode} onSolved={handleComplete} />
            </div>

            <div className="shrink-0 flex items-center justify-between gap-3 mt-3 pt-3 border-t border-primary-blue/10 dark:border-white/10">
              <button
                disabled={!prevLesson}
                onClick={() => prevLesson && setActiveId(prevLesson.id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-ink/60 dark:text-ice-white/60 disabled:opacity-30 hover:bg-primary-blue/5 transition-colors"
              >
                <ArrowLeft size={16} /> Önceki
              </button>

              {!isDone && (
                <button onClick={handleComplete} className="press-btn magnetic-btn px-5 py-2 rounded-xl bg-success text-white font-extrabold text-sm">
                  Tamamlandı olarak işaretle
                </button>
              )}

              <button
                disabled={!isDone || !nextLesson}
                onClick={() => nextLesson && setActiveId(nextLesson.id)}
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
