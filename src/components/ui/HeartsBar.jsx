import { Heart } from 'lucide-react'
import { MAX_HEARTS, minutesUntilNextHeart } from '../../lib/gamification'

export function HeartsBar({ hearts = MAX_HEARTS, profile, size = 18, className = '' }) {
  const minutesLeft = profile ? minutesUntilNextHeart(profile) : 0

  return (
    <div className={`flex items-center gap-1.5 ${className}`} title={minutesLeft ? `Sonraki can: ${minutesLeft} dk` : 'Canların dolu'}>
      {Array.from({ length: MAX_HEARTS }).map((_, i) => (
        <Heart
          key={i}
          size={size}
          className={i < hearts ? 'fill-heart text-heart' : 'fill-transparent text-heart/25'}
          strokeWidth={2}
        />
      ))}
      {minutesLeft > 0 && <span className="ml-1 text-xs font-data text-ink/50 dark:text-ice-white/50">{minutesLeft} dk</span>}
    </div>
  )
}
