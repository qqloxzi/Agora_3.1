import { ShoppingBag } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { TokenBadge } from '../components/ui/TokenBadge'

export function Store() {
  const { user, profile } = useAuth()

  return (
    <div className="max-w-xl mx-auto px-4 md:px-6 py-24 text-center">
      <div className="w-20 h-20 rounded-3xl agora-gradient-surface flex items-center justify-center mx-auto mb-8 shadow-card">
        <ShoppingBag size={34} className="text-white" />
      </div>
      <span className="inline-block px-4 py-1.5 rounded-full bg-token/15 text-token text-xs font-bold uppercase tracking-wider mb-4">Yakında</span>
      <h1 className="text-3xl md:text-4xl font-black text-ink dark:text-white mb-4">Mağaza</h1>
      <p className="text-ink/60 dark:text-ice-white/60 leading-relaxed mb-8">
        Atölyelerden ve liglerden kazandığın tokenleri avatar çerçeveleri, temalar ve özel içerikler için harcayabileceğin mağaza çok yakında açılıyor.
      </p>
      {user && (
        <div className="inline-flex flex-col items-center gap-2 px-6 py-4 rounded-2xl bg-white/70 dark:bg-white/5 border border-primary-blue/10 dark:border-white/10">
          <span className="text-xs font-bold uppercase tracking-wider text-ink/40 dark:text-ice-white/40">Mevcut bakiyen</span>
          <TokenBadge tokens={profile?.tokens ?? 0} size="lg" />
        </div>
      )}
    </div>
  )
}
