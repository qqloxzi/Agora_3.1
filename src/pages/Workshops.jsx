import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { WORKSHOP_SECTIONS } from '../data/workshopCatalog'
import { fetchAllLessonIdsBySlug, fetchCompletedLessonIds } from '../lib/workshopProgress'
import { useAuth } from '../contexts/AuthContext'
import { SkillTreePath } from '../components/ui/SkillTreePath'
import { ProfileSummaryCard } from '../components/ProfileSummaryCard'

export function Workshops() {
  const { user } = useAuth()
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
    <div className="max-w-6xl mx-auto px-4 md:px-6 pb-24">
      <div className={`grid ${user ? 'lg:grid-cols-[1fr_300px]' : ''} gap-10 items-start`}>
        <div className="max-w-3xl w-full mx-auto">
          <div className="text-center pt-14 pb-10">
            <span className="text-accent-blue font-bold tracking-[0.2em] uppercase text-xs">Beceri Ağacı</span>
            <h1 className="text-4xl md:text-5xl font-black text-primary-blue dark:text-white mt-3 mb-4">Atölyeler</h1>
            <p className="text-ink/60 dark:text-ice-white/60 max-w-xl mx-auto">
              Duolingo tarzı bir yolda ilerle: her atölyeyi tamamladıkça sıradaki kilidi açılır, XP ve token kazanırsın.
            </p>
          </div>

          {loading ? (
            <p className="text-center text-ink/40">Yükleniyor...</p>
          ) : (
            <div className="flex flex-col gap-16">
              {WORKSHOP_SECTIONS.map((section, sIdx) => {
                const annotated = section.courses.map((course, cIdx) => {
                  const ids = lessonMap[course.slug] ?? []
                  const total = ids.length
                  const done = ids.filter((id) => completed.has(id)).length
                  const prevCourse = section.courses[cIdx - 1]
                  const prevIds = prevCourse ? lessonMap[prevCourse.slug] ?? [] : null
                  const prevComplete = !prevCourse || (prevIds.length > 0 && prevIds.every((id) => completed.has(id)))
                  let status = 'locked'
                  if (total > 0 && done === total) status = 'complete'
                  else if (cIdx === 0 || prevComplete) status = 'current'
                  return { ...course, total, done, status, stars: done === total && total > 0 ? 3 : 0 }
                })

                return (
                  <motion.section
                    key={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.4, delay: sIdx * 0.05 }}
                  >
                    <div className="text-center mb-2">
                      <h2 className="text-2xl font-extrabold text-ink dark:text-white">{section.title}</h2>
                      <p className="text-sm text-primary-blue dark:text-accent-blue font-bold font-data mt-1">{section.levelLabel}</p>
                      <p className="text-sm text-ink/50 dark:text-ice-white/50 mt-2 max-w-md mx-auto">{section.intro}</p>
                    </div>
                    <SkillTreePath courses={annotated} />
                  </motion.section>
                )
              })}
            </div>
          )}
        </div>

        {user && <ProfileSummaryCard className="lg:sticky lg:top-24" />}
      </div>
    </div>
  )
}
