import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { WORKSHOP_SECTIONS } from '../data/workshopCatalog'
import { fetchAllLessonIdsBySlug, fetchCompletedLessonIds } from '../lib/workshopProgress'
import { useAuth } from '../contexts/AuthContext'
import { SkillTreePath } from '../components/ui/SkillTreePath'
import { ProfileSummaryCard } from '../components/ProfileSummaryCard'

// Lesson ids of a course. Joseki boxes have no go_problems rows: their lessons
// are the joseki's "Josekiyi oyna" exercises, so only the solved ids (shared
// with Joseki Sonrası) and the count from the catalog are needed here.
function courseProgress(course, lessonMap, completed) {
  if (course.joseki) {
    const prefix = `joseki:${course.joseki}:seq-`
    const done = [...completed].filter((id) => String(id).startsWith(prefix)).length
    return { total: course.lessonCount ?? 0, done: Math.min(done, course.lessonCount ?? 0) }
  }
  const ids = lessonMap[course.slug] ?? []
  return { total: ids.length, done: ids.filter((id) => completed.has(id)).length }
}

export function Workshops() {
  const { user, profile } = useAuth()
  const [lessonMap, setLessonMap] = useState({})
  const [completed, setCompleted] = useState(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      const [lessons, done] = await Promise.all([fetchAllLessonIdsBySlug(), fetchCompletedLessonIds(user?.id)])
      if (!active) return
      setLessonMap(lessons)
      setCompleted(done)
      setLoading(false)
    }
    load()
    return () => {
      active = false
    }
  }, [user])

  return (
    <div className="max-w-7xl mx-auto px-3 md:px-6 pb-24">
      <div className={`grid ${user ? 'xl:grid-cols-[1fr_280px]' : ''} gap-8 items-start`}>
        <div className="w-full min-w-0">
          <div className="text-center pt-14 pb-10">
            <span className="text-accent-blue font-bold tracking-[0.2em] uppercase text-xs">Beceri Ağacı</span>
            <h1 className="text-4xl md:text-5xl font-black text-primary-blue dark:text-white mt-3">Atölyeler</h1>
          </div>

          {loading ? (
            <p className="text-center text-ink/40">Yükleniyor...</p>
          ) : (
            // One column per level, each with its own tree.
            <div className="grid grid-cols-3 gap-2 md:gap-6">
              {WORKSHOP_SECTIONS.map((section, sIdx) => {
                const progress = section.courses.map((course) => courseProgress(course, lessonMap, completed))
                const annotated = section.courses.map((course, cIdx) => {
                  const { total, done } = progress[cIdx]
                  const prev = progress[cIdx - 1]
                  const prevComplete = !prev || (prev.total > 0 && prev.done === prev.total)
                  let status = 'locked'
                  if (total > 0 && done === total) status = 'complete'
                  else if (cIdx === 0 || prevComplete || profile?.is_admin) status = 'current'
                  return { ...course, total, done, status, stars: done === total && total > 0 ? 3 : 0 }
                })

                return (
                  <motion.section
                    key={section.id}
                    className="min-w-0"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: sIdx * 0.05 }}
                  >
                    <div className="text-center mb-2 md:min-h-[7.5rem]">
                      <h2 className="text-base md:text-2xl font-extrabold text-ink dark:text-white leading-tight">{section.title}</h2>
                      <p className="text-[11px] md:text-sm text-primary-blue dark:text-accent-blue font-bold font-data mt-1">{section.levelLabel}</p>
                      <p className="hidden md:block text-sm text-ink/50 dark:text-ice-white/50 mt-2 max-w-xs mx-auto">{section.intro}</p>
                    </div>
                    <SkillTreePath courses={annotated} />
                  </motion.section>
                )
              })}
            </div>
          )}
        </div>

        {user && <ProfileSummaryCard className="xl:sticky xl:top-24" />}
      </div>
    </div>
  )
}
