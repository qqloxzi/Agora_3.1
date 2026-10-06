import { useEffect, useMemo, useState } from 'react'
import { fetchPuzzles, puzzleLevelInfo, completePuzzleSolve, LEVEL_STEP_SOLVES } from '../lib/puzzleProgress'
import { fetchCompletedLessonIds } from '../lib/workshopProgress'
import { useAuth } from '../contexts/AuthContext'
import { GoPuzzle } from '../components/GoPuzzle'
import { TokenBadge } from '../components/ui/TokenBadge'
import { TagRankBadge } from '../components/ui/TagRankBadge'

function shuffle(list) {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function Puzzles() {
  const { user, profile, setProfile } = useAuth()
  const [puzzles, setPuzzles] = useState([])
  const [completed, setCompleted] = useState(new Set())
  const [activeIndex, setActiveIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      const [rawList, done] = await Promise.all([fetchPuzzles(), fetchCompletedLessonIds(user?.id)])
      if (!active) return
      const list = shuffle(rawList)
      setPuzzles(list)
      setCompleted(done)
      const firstUnsolved = list.findIndex((p) => !done.has(p.id))
      setActiveIndex(firstUnsolved === -1 ? Math.max(0, list.length - 1) : firstUnsolved)
      setLoading(false)
    }
    load()
    return () => {
      active = false
    }
  }, [user])

  const activePuzzle = puzzles[activeIndex]
  const total = puzzles.length
  const progressPct = total ? Math.round(((activeIndex + 1) / total) * 100) : 0
  const levelInfo = useMemo(() => puzzleLevelInfo(puzzles, completed), [puzzles, completed])

  async function handleSolved() {
    if (!activePuzzle) return
    await completePuzzleSolve({ user, profile, setProfile, puzzle: activePuzzle })
    setCompleted((prev) => new Set(prev).add(activePuzzle.id))
  }

  return (
    <div className="h-full overflow-hidden flex flex-col px-4 md:px-6 py-3">
      <div className="max-w-3xl w-full mx-auto flex flex-col flex-1 min-h-0">
        <h1 className="shrink-0 text-center text-lg md:text-xl font-black text-primary-blue dark:text-white pb-2">Bulmacalar</h1>

        {loading ? (
          <p className="text-center text-ink/40">Yükleniyor...</p>
        ) : total === 0 ? (
          <p className="text-center text-ink/40">Henüz bulmaca eklenmedi, çok yakında.</p>
        ) : (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="shrink-0 flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                {profile && <TokenBadge tokens={profile.tokens ?? 0} size="sm" />}
              </div>
              {levelInfo.level && (
                <span className="text-xs font-bold uppercase tracking-wider text-primary-blue dark:text-accent-blue font-data">
                  {levelInfo.level} · {levelInfo.solvedInTier}/{LEVEL_STEP_SOLVES} doğru
                </span>
              )}
            </div>

            <div className="shrink-0 mb-2">
              <div className="flex items-center justify-between text-xs font-bold text-ink/40 dark:text-ice-white/40 mb-1.5">
                <span>Soru {activeIndex + 1} / {total}</span>
                <span>%{progressPct}</span>
              </div>
              <div className="h-2 rounded-full bg-ink/10 dark:bg-white/10 overflow-hidden">
                <div className="h-full rounded-full agora-gradient-surface transition-all" style={{ width: `${progressPct}%` }} />
              </div>
            </div>

            {activePuzzle && (
              <div className="flex flex-col flex-1 min-h-0">
                <div className="shrink-0 flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-accent-blue">
                    {activePuzzle.title}
                  </span>
                  <TagRankBadge tag={activePuzzle.tag} rank={activePuzzle.rank} />
                </div>

                <div className="flex-1 min-h-0">
                  <GoPuzzle
                    fitParent
                    key={activePuzzle.id}
                    sgfRaw={activePuzzle.sgfRaw}
                    validationMode={activePuzzle.validationMode}
                    onSolved={handleSolved}
                    onPrev={() => setActiveIndex((i) => Math.max(0, i - 1))}
                    onNext={() => setActiveIndex((i) => Math.min(total - 1, i + 1))}
                    hasPrev={activeIndex > 0}
                    hasNext={activeIndex < total - 1}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
