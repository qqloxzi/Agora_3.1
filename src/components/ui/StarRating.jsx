import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

// Unified 5-star rating widget, backed by the `ratings` table
// (target_type: 'course' | 'workshop', target_id: text).
export function StarRating({ targetType, targetId, initialAvg = 0, initialCount = 0, size = 20, className = '' }) {
  const { user } = useAuth()
  const [avg, setAvg] = useState(initialAvg)
  const [count, setCount] = useState(initialCount)
  const [myRating, setMyRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let active = true
    async function load() {
      if (targetType === 'workshop') {
        const { data } = await supabase.from('ratings').select('rating').eq('target_type', targetType).eq('target_id', targetId)
        if (active && data) {
          setCount(data.length)
          setAvg(data.length ? data.reduce((s, r) => s + r.rating, 0) / data.length : 0)
        }
      }
      if (user) {
        const { data } = await supabase
          .from('ratings')
          .select('rating')
          .eq('target_type', targetType)
          .eq('target_id', targetId)
          .eq('user_id', user.id)
          .maybeSingle()
        if (active) setMyRating(data?.rating ?? 0)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [targetType, targetId, user])

  async function rate(value) {
    if (!user || busy) return
    setBusy(true)
    const { error } = await supabase
      .from('ratings')
      .upsert({ target_type: targetType, target_id: targetId, user_id: user.id, rating: value }, { onConflict: 'target_type,target_id,user_id' })
    setBusy(false)
    if (!error) {
      const wasNew = myRating === 0
      setMyRating(value)
      if (targetType === 'workshop') {
        setAvg((prev) => (wasNew ? (prev * count + value) / (count + 1) : (prev * count - (myRating || value) + value) / count))
        if (wasNew) setCount((c) => c + 1)
      }
    }
  }

  const display = hover || myRating || Math.round(avg)

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center gap-0.5" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            disabled={!user}
            onMouseEnter={() => setHover(n)}
            onClick={() => rate(n)}
            className={user ? 'cursor-pointer' : 'cursor-default'}
            aria-label={`${n} yıldız`}
          >
            <Star size={size} className={n <= display ? 'fill-token text-token' : 'fill-transparent text-ink/20 dark:text-ice-white/25'} />
          </button>
        ))}
      </div>
      <span className="text-sm font-bold text-ink/60 dark:text-ice-white/60 font-data">
        {avg > 0 ? avg.toFixed(1) : '—'} <span className="font-normal text-ink/40 dark:text-ice-white/40">({count})</span>
      </span>
    </div>
  )
}
