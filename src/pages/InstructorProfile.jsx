import { Link, useParams } from 'react-router-dom'
import { MapPin, ArrowLeft, ArrowRight } from 'lucide-react'
import { findInstructor } from '../data/instructors'

export function InstructorProfile() {
  const { id } = useParams()
  const person = findInstructor(id)

  if (!person) {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center">
        <p className="text-ink/60 mb-3">Eğitmen bulunamadı.</p>
        <Link to="/hakkimizda" className="text-accent-blue font-bold hover:underline">Hakkımızda'ya dön</Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-14">
      <Link to="/hakkimizda" className="inline-flex items-center gap-1.5 text-sm font-bold text-ink/60 dark:text-ice-white/60 hover:text-accent-blue mb-8">
        <ArrowLeft size={16} /> Hakkımızda
      </Link>

      <div className="rounded-3xl bg-white/70 dark:bg-white/5 border border-primary-blue/10 dark:border-white/10 shadow-card p-8 md:p-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 text-center sm:text-left">
          <img src={person.avatar} alt={person.name} className="w-32 h-32 rounded-3xl object-cover shrink-0" />
          <div>
            <h1 className="text-3xl font-black text-ink dark:text-white mb-1">{person.name}</h1>
            <p className="text-lg font-bold text-accent-blue font-data mb-2">{person.title}</p>
            <p className="text-sm text-ink/50 dark:text-ice-white/50 flex items-center justify-center sm:justify-start gap-1.5">
              <MapPin size={14} /> {person.location}
            </p>
          </div>
        </div>

        <p className="text-ink/70 dark:text-ice-white/70 leading-relaxed mb-8">{person.about}</p>

        <Link to={`/lig/${person.leagueSlug}`} className="magnetic-btn press-btn inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-primary-blue text-white font-extrabold">
          {person.leagueTitle} <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}
