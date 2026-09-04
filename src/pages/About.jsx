import { Link } from 'react-router-dom'
import { MapPin, ArrowRight } from 'lucide-react'
import { instructors } from '../data/instructors'

export function About() {
  return (
    <div>
      <section className="max-w-4xl mx-auto px-4 md:px-6 pt-16 pb-14 text-center">
        <span className="text-accent-blue font-bold tracking-[0.2em] uppercase text-xs">Hakkımızda</span>
        <h1 className="text-4xl md:text-5xl font-black text-primary-blue dark:text-white mt-3 mb-6">Agora Go Akademisi</h1>
        <p className="text-lg text-ink/70 dark:text-ice-white/70 leading-relaxed">
          Go'yu (Baduk) sadece bir oyun değil, sabır, denge ve stratejik düşüncenin buluştuğu bir felsefe olarak öğretiyoruz.
          İzmir merkezli topluluğumuzla ligler, atölyeler ve gerçek rakiplerle birlikte gelişiyoruz.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-24">
        <h2 className="text-2xl md:text-3xl font-black text-ink dark:text-white text-center mb-10">Eğitim Kadromuz</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {instructors.map((person) => (
            <Link
              key={person.id}
              to={`/egitmen/${person.id}`}
              className="magnetic-btn rounded-3xl bg-white/70 dark:bg-white/5 border border-primary-blue/10 dark:border-white/10 shadow-card p-6 flex gap-5"
            >
              <img src={person.avatar} alt={person.name} className="w-20 h-20 rounded-2xl object-cover shrink-0" />
              <div className="min-w-0">
                <h3 className="font-extrabold text-lg text-ink dark:text-white">{person.name}</h3>
                <p className="text-sm font-bold text-accent-blue font-data mb-1.5">{person.title}</p>
                <p className="text-xs text-ink/40 dark:text-ice-white/40 flex items-center gap-1 mb-2">
                  <MapPin size={12} /> {person.location}
                </p>
                <p className="text-sm text-ink/60 dark:text-ice-white/60 line-clamp-2">{person.about}</p>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-primary-blue dark:text-white mt-3">
                  Profili gör <ArrowRight size={12} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
