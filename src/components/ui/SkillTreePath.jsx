import { Link } from 'react-router-dom'
import { Check, Lock, Star } from 'lucide-react'

// Zigzag offsets at full width; scaled down by --zz so the tree fits a third
// of the Atölyeler page (one column per level) on every screen size.
const OFFSETS = [0, 56, 84, 56, 0, -56, -84, -56]

export function SkillTreePath({ courses }) {
  return (
    <div className="relative flex flex-col items-center py-6 [--zz:0.15] md:[--zz:0.4] xl:[--zz:0.55]">
      {courses.map((course, i) => {
        const offset = OFFSETS[i % OFFSETS.length]
        const isLocked = course.status === 'locked'
        const isComplete = course.status === 'complete'
        const isEmpty = course.total === 0

        const node = (
          <div
            className={`relative w-14 h-14 md:w-20 md:h-20 rounded-full flex items-center justify-center font-black text-base md:text-lg shrink-0 press-btn ${
              isLocked || isEmpty
                ? 'bg-ink/10 dark:bg-white/10 text-ink/30 dark:text-ice-white/30'
                : isComplete
                  ? 'bg-success text-white'
                  : 'agora-gradient-surface text-white'
            }`}
          >
            {isLocked || isEmpty ? <Lock size={20} /> : isComplete ? <Check size={24} /> : i + 1}
            {course.stars > 0 && (
              <div className="absolute -bottom-2 flex gap-0.5 bg-white dark:bg-ink rounded-full px-1.5 py-0.5 shadow-card">
                {Array.from({ length: 3 }).map((_, s) => (
                  <Star key={s} size={10} className={s < course.stars ? 'fill-token text-token' : 'fill-transparent text-ink/20'} />
                ))}
              </div>
            )}
          </div>
        )

        return (
          <div key={course.slug} className="w-full flex flex-col items-center" style={{ transform: `translateX(calc(${offset}px * var(--zz)))` }}>
            {isLocked || isEmpty ? (
              <div className="cursor-not-allowed opacity-90" title={isEmpty ? 'İçerik yakında' : 'Önce önceki atölyeyi tamamla'}>
                {node}
              </div>
            ) : (
              <Link to={`/atolyeler/${course.slug}`} className="hover:scale-105 transition-transform">
                {node}
              </Link>
            )}
            <div className="mt-2 mb-5 md:mb-6 text-center w-full max-w-[140px] px-0.5">
              <p className="text-[11px] md:text-sm font-extrabold text-ink dark:text-white leading-tight">{course.title}</p>
              <p className="text-[10px] md:text-xs text-ink/40 dark:text-ice-white/40 font-data mt-0.5">
                {isEmpty ? 'Yakında' : `${course.done}/${course.total} ders`}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
