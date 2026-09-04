import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Play } from 'lucide-react'
import { findCourse } from '../data/workshopCatalog'
import { getCourseArticle } from '../data/courseArticles'
import { fetchCourseLessons } from '../lib/workshopProgress'
import { ArticleBoard } from '../components/ArticleBoard'

function TextBlock({ content }) {
  const parts = content.split('\n\n')
  const hasSubtitle = parts.length >= 2 && parts[0].trim() && !parts[0].includes('\n')
  if (hasSubtitle) {
    const [subtitle, ...rest] = parts
    return (
      <div className="my-7">
        <h2 className="text-xl md:text-2xl font-extrabold text-ink dark:text-white mb-3">{subtitle.trim()}</h2>
        <p className="text-lg leading-relaxed text-ink/75 dark:text-ice-white/75 whitespace-pre-wrap">{rest.join('\n\n').trim()}</p>
      </div>
    )
  }
  return <p className="my-7 text-lg leading-relaxed text-ink/75 dark:text-ice-white/75 whitespace-pre-wrap">{content}</p>
}

export function WorkshopIntro() {
  const { courseSlug } = useParams()
  const navigate = useNavigate()
  const course = findCourse(courseSlug)
  const [lessonCount, setLessonCount] = useState(null)

  useEffect(() => {
    if (course) fetchCourseLessons(courseSlug).then((ls) => setLessonCount(ls.length))
  }, [courseSlug, course])

  if (!course) {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center">
        <p className="text-ink/60">Bu atölye bulunamadı.</p>
        <Link to="/atolyeler" className="text-accent-blue font-bold hover:underline">Atölyelere dön</Link>
      </div>
    )
  }

  const article = getCourseArticle(course.slug, course.title)

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-14">
      <Link to="/atolyeler" className="inline-flex items-center gap-1.5 text-sm font-bold text-ink/60 dark:text-ice-white/60 hover:text-accent-blue mb-6">
        <ArrowLeft size={16} /> Atölyeler
      </Link>

      <h1 className="text-3xl md:text-4xl font-black text-ink dark:text-white leading-tight mb-4">{article.title}</h1>

      <div className="flex flex-wrap items-center gap-3 text-sm text-ink/50 dark:text-ice-white/50 mb-8">
        <span>{course.section.levelLabel}</span>
        <span className="text-ink/25">·</span>
        <span>{lessonCount ?? '—'} ders</span>
      </div>

      <div className="h-px bg-primary-blue/10 dark:bg-white/10 mb-2" />

      <div>
        {article.blocks.map((block, i) =>
          block.type === 'board' ? (
            <ArticleBoard key={i} sgf={block.sgf} description={block.description} />
          ) : (
            <TextBlock key={i} content={block.content} />
          ),
        )}
      </div>

      <div className="mt-12 text-center">
        <button
          onClick={() => navigate(`/atolyeler/kurs/${course.slug}`)}
          className="magnetic-btn press-btn inline-flex items-center gap-3 px-8 py-4 rounded-2xl agora-gradient-surface text-white font-extrabold shadow-card"
        >
          <Play size={18} className="fill-current" /> Alıştırmalara Başla
        </button>
      </div>
    </div>
  )
}
