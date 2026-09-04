import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CheckCircle2, Clock, Users, ArrowLeft, Wallet } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { StarRating } from '../components/ui/StarRating'
import { CommentThread } from '../components/ui/CommentThread'
import { StoneCluster } from '../components/ui/StoneCluster'

const STONE_COUNT_BY_SLUG = { 'temel-taslar': 1, gelisim: 2, aydinlanma: 3 }

export function LeagueDetail() {
  const { slug } = useParams()
  const { user } = useAuth()
  const [course, setCourse] = useState(null)
  const [enrolled, setEnrolled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      const { data: courseData } = await supabase.from('courses').select('*').eq('slug', slug).maybeSingle()
      if (!active) return
      setCourse(courseData)
      if (courseData && user) {
        const { data: enrollment } = await supabase
          .from('course_enrollments')
          .select('id')
          .eq('course_id', courseData.id)
          .eq('user_id', user.id)
          .maybeSingle()
        setEnrolled(Boolean(enrollment))
      }
      setLoading(false)
    }
    load()
    return () => {
      active = false
    }
  }, [slug, user])

  const isFree = !course?.price || course.price === 'Ücretsiz'

  async function handleEnroll() {
    if (!course) return
    if (course.payment_link) {
      window.open(course.payment_link, '_blank', 'noopener,noreferrer')
      return
    }
    if (!isFree || !user) return
    setEnrolling(true)
    const { error } = await supabase.from('course_enrollments').insert({ course_id: course.id, user_id: user.id })
    setEnrolling(false)
    if (!error) setEnrolled(true)
  }

  if (loading) return <p className="text-center py-24 text-ink/40">Yükleniyor...</p>
  if (!course) {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center">
        <p className="text-ink/60 mb-3">Bu lig bulunamadı.</p>
        <Link to="/ligler" className="text-accent-blue font-bold hover:underline">Liglere dön</Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-14">
      <Link to="/ligler" className="inline-flex items-center gap-1.5 text-sm font-bold text-ink/60 dark:text-ice-white/60 hover:text-accent-blue mb-6">
        <ArrowLeft size={16} /> Ligler
      </Link>

      <div className="grid lg:grid-cols-[1fr_320px] gap-10">
        <div>
          <div className="w-full h-56 agora-gradient-surface rounded-3xl mb-6 flex items-center justify-center text-white">
            <StoneCluster count={STONE_COUNT_BY_SLUG[course.slug] ?? 1} size={72} />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-accent-blue">{course.level}</span>
          <h1 className="text-3xl md:text-4xl font-black text-ink dark:text-white mt-2 mb-4">{course.title}</h1>
          <StarRating targetType="course" targetId={course.id} initialAvg={course.rating_avg} initialCount={course.rating_count} className="mb-6" />
          <p className="text-ink/70 dark:text-ice-white/70 leading-relaxed whitespace-pre-line mb-8">{course.description}</p>

          {course.outcomes && (
            <div className="mb-10">
              <h3 className="font-extrabold text-lg text-ink dark:text-white mb-3">Neler kazanacaksın?</h3>
              <ul className="flex flex-col gap-2">
                {course.outcomes.split('\n').filter(Boolean).map((line, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-ink/70 dark:text-ice-white/70">
                    <CheckCircle2 size={16} className="text-success shrink-0 mt-0.5" /> {line.replace(/^\d+[-.]?\s*/, '')}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-3xl bg-white/70 dark:bg-white/5 border border-primary-blue/10 dark:border-white/10 shadow-card p-6 md:p-8">
            <CommentThread targetType="course" targetId={course.id} />
          </div>
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start rounded-3xl bg-white/70 dark:bg-white/5 border border-primary-blue/10 dark:border-white/10 shadow-card p-6">
          <p className="text-3xl font-black text-primary-blue dark:text-white mb-1">{course.price}₺</p>
          <p className="text-xs text-ink/40 dark:text-ice-white/40 mb-6">{course.provider} tarafından yürütülür</p>

          <div className="flex flex-col gap-2.5 mb-6 text-sm text-ink/70 dark:text-ice-white/70">
            <span className="flex items-center gap-2"><Clock size={15} className="text-accent-blue" /> {course.duration}</span>
            <span className="flex items-center gap-2"><Users size={15} className="text-accent-blue" /> {course.students_count} öğrenci kayıtlı</span>
          </div>

          {enrolled ? (
            <div className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-success/10 text-success font-extrabold">
              <CheckCircle2 size={18} /> Kayıtlısın
            </div>
          ) : !isFree && !course.payment_link ? (
            <div className="flex flex-col items-center gap-2 py-4 rounded-2xl bg-token/10 text-center">
              <Wallet size={20} className="text-token" />
              <p className="text-sm font-extrabold text-ink dark:text-white">Ödeme Yakında</p>
              <p className="text-xs text-ink/50 dark:text-ice-white/50 px-4">
                Bu lig için ödeme sistemi (PayTR) çok yakında aktif olacak. Şimdilik{' '}
                <Link to="/iletisim" className="text-accent-blue font-bold hover:underline">iletişime geç</Link>.
              </p>
            </div>
          ) : (
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="w-full press-btn magnetic-btn py-3.5 rounded-2xl bg-primary-blue text-white font-extrabold disabled:opacity-60"
            >
              {course.payment_link ? 'Ödeme ile Kaydol' : 'Ücretsiz Kaydol'}
            </button>
          )}
        </aside>
      </div>
    </div>
  )
}
