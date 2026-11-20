import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Clock, Users, ArrowLeft, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { courseSlugForLeague, REVIEW3_PAYMENT_LINKS } from '../lib/leagueData'
import { StarRating } from '../components/ui/StarRating'
import { CommentThread } from '../components/ui/CommentThread'
import { LeagueOptions } from '../components/LeagueOptions'

export function LeagueDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [leagueId, setLeagueId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      const [{ data: courseData }, { data: groups }] = await Promise.all([
        supabase.from('courses').select('*').eq('slug', slug).maybeSingle(),
        supabase.from('league_groups').select('id, name'),
      ])
      if (!active) return
      setCourse(courseData)
      setLeagueId(groups?.find((group) => courseSlugForLeague(group.name) === slug)?.id ?? null)
      setLoading(false)
    }
    load()
    return () => {
      active = false
    }
  }, [slug])

  function handleFreeJoin() {
    const query = leagueId ? `?kayit=true&leagueId=${leagueId}` : '?kayit=true'
    navigate(`/ligler${query}`)
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
          <div className="w-full h-40 mb-2 flex items-center justify-center">
            <img src="/banners/leagues-banner.svg" alt="GO Akademisi" className="h-32 w-auto" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-accent-blue">{course.level}</span>
          <h1 className="text-3xl md:text-4xl font-black text-ink dark:text-white mt-2 mb-4">{course.title}</h1>
          <StarRating targetType="course" targetId={course.id} initialAvg={course.rating_avg} initialCount={course.rating_count} className="mb-6" />
          <p className="text-ink/70 dark:text-ice-white/70 leading-relaxed whitespace-pre-line mb-8">{course.description}</p>
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start rounded-3xl bg-white/70 dark:bg-white/5 border border-primary-blue/10 dark:border-white/10 shadow-card p-6">
          <p className="text-3xl font-black text-primary-blue dark:text-white mb-1">{course.price}₺</p>
          <p className="text-xs text-ink/40 dark:text-ice-white/40 mb-6">{course.provider} tarafından yürütülür</p>

          <div className="flex flex-col gap-2.5 mb-6 text-sm text-ink/70 dark:text-ice-white/70">
            <span className="flex items-center gap-2"><Clock size={15} className="text-accent-blue" /> {course.duration}</span>
            <span className="flex items-center gap-2"><Users size={15} className="text-accent-blue" /> Bu zamana kadar toplam {course.students_count} öğrenci</span>
          </div>

          <p className="text-xs font-bold uppercase tracking-wider text-ink/40 dark:text-ice-white/40 mb-3">Katılım Seçenekleri</p>
          <LeagueOptions
            paymentLinks={{
              review3: REVIEW3_PAYMENT_LINKS[course.slug],
              review6: course.payment_link,
            }}
            onFreeJoin={handleFreeJoin}
          />

          <Link to="/ligler" className="mt-5 flex items-center justify-center gap-1.5 text-sm font-bold text-accent-blue hover:underline">
            Lig kaydına dön <ArrowRight size={14} />
          </Link>
        </aside>
      </div>

      <div className="mt-8 rounded-3xl bg-white/70 dark:bg-white/5 border border-primary-blue/10 dark:border-white/10 shadow-card p-6 md:p-8">
        <CommentThread targetType="course" targetId={course.id} />
      </div>
    </div>
  )
}
