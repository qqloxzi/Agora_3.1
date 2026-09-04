import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

export function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-32 text-center">
      <p className="text-7xl font-black text-accent-blue/30 mb-4">404</p>
      <h1 className="text-2xl font-extrabold text-ink dark:text-white mb-3">Bu taş tahtada yok</h1>
      <p className="text-ink/60 dark:text-ice-white/60 mb-8">Aradığın sayfa bulunamadı.</p>
      <Link to="/" className="magnetic-btn press-btn inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-primary-blue text-white font-extrabold">
        <Home size={16} /> Ana Sayfaya Dön
      </Link>
    </div>
  )
}
