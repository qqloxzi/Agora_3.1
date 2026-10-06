import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check } from 'lucide-react'
import { JOSEKI_CATALOG } from '../data/josekiCatalog'
import { allJoseki, josekiBySlug, josekiGlyph, loadJosekiProgressMerged } from '../lib/joseki'
import { JosekiExplorer } from '../components/joseki/JosekiExplorer'
import { useAuth } from '../contexts/AuthContext'

// The joseki's own shape as a simple white drawing: black stones filled,
// white stones as rings, the defining move in gold.
function JosekiGlyph({ joseki }) {
  const { span, stones } = useMemo(() => josekiGlyph(joseki), [joseki])
  return (
    <svg viewBox={`0 0 ${span} ${span}`} className="w-16 h-16">
      {Array.from({ length: span }).map((_, i) => (
        <g key={i} stroke="rgba(255,255,255,0.3)" strokeWidth={0.05}>
          <line x1={0.5} y1={i + 0.5} x2={span - 0.5} y2={i + 0.5} />
          <line x1={i + 0.5} y1={0.5} x2={i + 0.5} y2={span - 0.5} />
        </g>
      ))}
      {stones.map((s) => (
        <circle
          key={`${s.x},${s.y}`}
          cx={s.x + 0.5}
          cy={s.y + 0.5}
          r={0.4}
          fill={s.c === 'B' ? (s.key ? '#F2C14E' : '#fff') : 'none'}
          stroke={s.c === 'W' ? (s.key ? '#F2C14E' : '#fff') : 'none'}
          strokeWidth={0.13}
        />
      ))}
    </svg>
  )
}

// One joseki as a lesson card: its shape, title, short info and progress.
function JosekiCard({ joseki, info, done }) {
  const variationCount = Object.values(joseki.nodes).filter((n) => n.kind === 'variation').length
  const total = joseki.exercises.length
  const complete = total > 0 && done >= total

  return (
    <Link
      to={`/joseki-sonrasi/${joseki.slug}`}
      className="magnetic-btn group flex flex-col rounded-3xl bg-white/70 dark:bg-white/5 border border-primary-blue/10 dark:border-white/10 shadow-card overflow-hidden"
    >
      <div className={`relative h-28 flex items-center justify-center ${complete ? 'bg-success' : 'agora-gradient-surface'}`}>
        <JosekiGlyph joseki={joseki} />
        {complete && (
          <span className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center">
            <Check size={16} className="text-success" strokeWidth={3} />
          </span>
        )}
      </div>
      <div className="flex-1 flex flex-col gap-2 p-5">
        <h2 className="text-base font-extrabold text-ink dark:text-white leading-tight">{joseki.title}</h2>
        {info && <p className="text-sm text-ink/60 dark:text-ice-white/60 leading-snug">{info}</p>}
        <div className="mt-auto pt-2 flex flex-col gap-2">
          <p className="text-xs font-bold text-ink/40 dark:text-ice-white/40 font-data">
            {variationCount} varyasyon · {done}/{total} alıştırma
          </p>
          <div className="h-1.5 rounded-full bg-ink/10 dark:bg-white/10 overflow-hidden">
            <div className="h-full rounded-full agora-gradient-surface" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-bold text-accent-blue group-hover:gap-2 transition-all">
            {done > 0 ? 'Devam et' : 'Başla'} <ArrowRight size={15} />
          </span>
        </div>
      </div>
    </Link>
  )
}

export function JosekiAfter() {
  const { user } = useAuth()
  const [progress, setProgress] = useState({})
  const entries = useMemo(() => JOSEKI_CATALOG.filter((e) => e.slug && josekiBySlug(e.slug)), [])
  const all = useMemo(() => allJoseki(), [])
  const groups = useMemo(() => {
    const map = new Map()
    for (const e of entries) map.set(e.group, [...(map.get(e.group) ?? []), e])
    return [...map]
  }, [entries])

  useEffect(() => {
    let active = true
    Promise.all(entries.map(async (e) => [e.slug, (await loadJosekiProgressMerged(e.slug, user?.id)).size])).then(
      (rows) => active && setProgress(Object.fromEntries(rows)),
    )
    return () => {
      active = false
    }
  }, [entries, user?.id])

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-24">
        <div className="text-center pt-10 pb-6">
          <h1 className="text-4xl md:text-5xl font-black text-primary-blue dark:text-white">Joseki Sonrası</h1>
        </div>

        {/* Every joseki on one board — the letters at the start are black's answers. */}
        <section className="mb-14">
          <JosekiExplorer
            joseki={all}
            aside={<img src="/agora-kitap.webp" alt="Kitap okuyan Agora kuşu" className="block w-full max-w-[13rem] lg:max-w-[18rem] mx-auto select-none pointer-events-none" draggable={false} />}
          />
        </section>

        {/* Lesson cards, grouped like the book's chapters (catalog `group`). */}
        <div className="flex flex-col gap-12">
          {groups.map(([group, list]) => (
            <section key={group}>
              <h2 className="text-xl md:text-2xl font-extrabold text-ink dark:text-white mb-4">{group}</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {list.map((e) => (
                  <JosekiCard key={e.slug} joseki={josekiBySlug(e.slug)} info={e.info} done={progress[e.slug] ?? 0} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
