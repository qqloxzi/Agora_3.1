import { nextRankProgress } from '../../lib/gamification'

export function XPProgressBar({ xp = 0, showLabel = true, className = '' }) {
  const { current, next, percent } = nextRankProgress(xp)

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex items-center justify-between mb-1.5 text-xs font-bold">
          <span className="text-primary-blue dark:text-accent-blue">{current.rank}</span>
          <span className="text-ink/40 dark:text-ice-white/40 font-data">{xp} XP{next ? ` · sıradaki: ${next.rank}` : ' · maksimum'}</span>
        </div>
      )}
      <div className="h-3 rounded-full bg-ink/10 dark:bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full agora-gradient-surface transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
