import { Puzzle } from 'lucide-react'
import { ComingSoon } from '../components/ui/ComingSoon'

export function Puzzles() {
  return (
    <ComingSoon
      icon={Puzzle}
      title="Bulmacalar (Tsumego)"
      description="Günlük tsumego bulmacaları, zorluk seviyeleri ve doğru çözümlerle can/XP kazanma çok yakında burada. Şimdilik atölyelerdeki alıştırmalarla pratik yapmaya devam edebilirsin."
      cta={{ to: '/atolyeler', label: 'Atölyelere göz at' }}
    />
  )
}
