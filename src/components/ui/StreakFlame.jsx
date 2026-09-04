import { Flame } from 'lucide-react'

export function StreakFlame({ count = 0, size = 'md', className = '' }) {
  const active = count > 0
  const sizes = {
    sm: 'text-xs px-2 py-1 gap-1',
    md: 'text-sm px-3 py-1.5 gap-1.5',
    lg: 'text-base px-4 py-2 gap-2',
  }
  return (
    <div
      className={`inline-flex items-center rounded-full font-bold border ${sizes[size]} ${
        active ? 'bg-streak/15 text-streak border-streak/30' : 'bg-ink/5 text-ink/40 border-ink/10 dark:bg-white/5 dark:text-ice-white/40 dark:border-white/10'
      } ${className}`}
    >
      <Flame size={size === 'lg' ? 18 : size === 'sm' ? 13 : 15} className={active ? 'fill-streak/40 animate-flame-flicker' : ''} />
      {count} gün
    </div>
  )
}
