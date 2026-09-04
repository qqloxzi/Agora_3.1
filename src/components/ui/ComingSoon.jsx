import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export function ComingSoon({ icon: Icon, title, description, cta }) {
  return (
    <div className="max-w-xl mx-auto px-4 md:px-6 py-24 text-center">
      <div className="w-20 h-20 rounded-3xl agora-gradient-surface flex items-center justify-center mx-auto mb-8 shadow-card">
        <Icon size={34} className="text-white" />
      </div>
      <span className="inline-block px-4 py-1.5 rounded-full bg-token/15 text-token text-xs font-bold uppercase tracking-wider mb-4">Yakında</span>
      <h1 className="text-3xl md:text-4xl font-black text-ink dark:text-white mb-4">{title}</h1>
      <p className="text-ink/60 dark:text-ice-white/60 leading-relaxed mb-8">{description}</p>
      {cta && (
        <Link to={cta.to} className="magnetic-btn press-btn inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-primary-blue text-white font-extrabold">
          {cta.label} <ArrowRight size={16} />
        </Link>
      )}
    </div>
  )
}
