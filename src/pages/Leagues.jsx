import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Users, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { StarRating } from '../components/ui/StarRating'
import { StoneCluster } from '../components/ui/StoneCluster'

const STONE_COUNT_BY_SLUG = { 'temel-taslar': 1, gelisim: 2, aydinlanma: 3 }

export function Leagues() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('courses')
      .select('*')
      .order('course_start', { ascending: true })
      .then(({ data }) => {
        setCourses(data ?? [])
        setLoading(false)
      })
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-14">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="text-accent-blue font-bold tracking-[0.2em] uppercase text-xs">Rehberli Programlar</span>
        <h1 className="text-4xl md:text-5xl font-black text-primary-blue dark:text-white mt-3 mb-4">Ligler</h1>
        <p className="text-ink/60 dark:text-ice-white/60">Seviyene uygun ligde eğitmen eşliğinde 6 haftalık yoğun bir programla gelişimini hızlandır.</p>
      </div>

      {loading && <p className="text-center text-ink/40">Yükleniyor...</p>}

      <div className="grid md:grid-cols-3 gap-8">
        {courses.map((course) => (
          <div key={course.id} className="rounded-3xl bg-white/70 dark:bg-white/5 border border-primary-blue/10 dark:border-white/10 shadow-card overflow-hidden flex flex-col">
            <div className="h-40 agora-gradient-surface flex items-center justify-center text-white">
              <StoneCluster count={STONE_COUNT_BY_SLUG[course.slug] ?? 1} size={56} />
            </div>
            <div className="p-6 flex flex-col flex-1">
              <span className="text-xs font-bold uppercase tracking-wider text-accent-blue mb-2">{course.level}</span>
              <h3 className="text-xl font-extrabold text-ink dark:text-white mb-2">{course.title}</h3>
              <p className="text-sm text-ink/60 dark:text-ice-white/60 leading-relaxed mb-4 flex-1">{course.description}</p>
              <StarRating targetType="course" targetId={course.id} initialAvg={course.rating_avg} initialCount={course.rating_count} size={16} className="mb-4" />
              <div className="flex items-center gap-4 text-xs text-ink/50 dark:text-ice-white/50 font-bold mb-5">
                <span className="flex items-center gap-1"><Clock size={13} /> {course.duration}</span>
                <span className="flex items-center gap-1"><Users size={13} /> {course.students_count} öğrenci</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-primary-blue dark:text-white">{course.price}₺</span>
                <Link to={`/lig/${course.slug}`} className="magnetic-btn press-btn px-5 py-2.5 rounded-xl bg-primary-blue text-white font-bold text-sm flex items-center gap-1.5">
                  İncele <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
