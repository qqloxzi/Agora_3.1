import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, X, ChevronLeft, ChevronRight, RotateCcw, Lightbulb, Footprints } from 'lucide-react'
import { JosekiBoardView, RatingBadge } from './JosekiBoardView'
import { boardAt, colorAfter, decode, JOSEKI_XP, labelsFor, moveColor, RATING_META } from '../../lib/joseki'
import { playStoneSound } from '../../lib/stoneSound'

function ResultBadge({ ok }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-pop-in">
      <div className={`w-20 h-20 rounded-full ${ok ? 'bg-success/90' : 'bg-heart/90'} flex items-center justify-center shadow-2xl`}>
        {ok ? <Check size={44} className="text-white" strokeWidth={3} /> : <X size={44} className="text-white" strokeWidth={3} />}
      </div>
    </div>
  )
}

function Explanation({ node, extra }) {
  return (
    <div className="rounded-2xl bg-white/70 dark:bg-white/5 border border-primary-blue/10 dark:border-white/10 p-4 flex flex-col gap-2 animate-pop-in">
      {extra && <p className="text-sm font-bold text-ink dark:text-white">{extra}</p>}
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-extrabold text-ink dark:text-white">{node.title}</span>
        <RatingBadge meta={RATING_META[node.rating]} />
      </div>
      <p className="text-sm text-ink/70 dark:text-ice-white/70 leading-relaxed">{node.text}</p>
    </div>
  )
}

export function SequenceExercise({ joseki, ex, onSolved }) {
  const node = joseki.nodes[ex.node]
  const d = node.diagram
  const total = d.moves.length
  const [step, setStep] = useState(0)
  const [wrong, setWrong] = useState(null)
  const [misses, setMisses] = useState(0)
  const done = step === total
  const state = useMemo(() => boardAt(d, step, joseki.size), [d, step, joseki.size])
  const target = !done ? decode(d.moves[step]) : null
  const showHint = !done && misses >= 2

  function clickPoint(x, y) {
    if (done || state.board[y][x]) return
    if (x === target.x && y === target.y) {
      const before = state.board.flat().filter(Boolean).length
      const after = boardAt(d, step + 1, joseki.size).board.flat().filter(Boolean).length
      playStoneSound({ capture: after <= before })
      setWrong(null)
      setMisses(0)
      if (step + 1 === total) onSolved()
      setStep(step + 1)
    } else {
      setWrong({ x, y })
      setMisses((m) => m + 1)
    }
  }

  function restart() {
    setStep(0)
    setWrong(null)
    setMisses(0)
  }

  const rings = [...(wrong ? [{ ...wrong, color: '#D6564F' }] : []), ...(showHint ? [{ ...target, color: '#4C9A6A' }] : [])]
  const toPlay = done ? colorAfter(d) : moveColor(d, step)

  return (
    <Layout
      board={
        <JosekiBoardView
          size={joseki.size}
          board={state.board}
          labels={labelsFor(d, state.board, state.numbers, { showLetters: done })}
          rings={rings}
          onPointClick={clickPoint}
          toPlay={done ? null : toPlay}
          overlay={done && <ResultBadge ok />}
        />
      }
    >
      <p className="text-base font-bold text-ink dark:text-white leading-snug">{ex.question}</p>
      <p className="text-xs font-semibold text-ink/50 dark:text-ice-white/50">
        Varyasyon: <span className="font-bold text-ink/70 dark:text-ice-white/70">{node.title}</span>
      </p>
      {!done && (
        <div className="flex items-center gap-2 text-sm font-bold text-ink/70 dark:text-ice-white/70">
          <span className={`w-3 h-3 rounded-full ${toPlay === 'B' ? 'bg-ink dark:bg-white' : 'bg-white border border-ink/30'}`} />
          Sıra: {toPlay === 'B' ? 'Siyah' : 'Beyaz'} {step + 1} · {step}/{total}
        </div>
      )}
      <div className="h-2 rounded-full bg-ink/10 dark:bg-white/10 overflow-hidden">
        <div className="h-full rounded-full agora-gradient-surface transition-all" style={{ width: `${(step / total) * 100}%` }} />
      </div>
      {wrong && !done && <p className="text-sm font-bold text-heart">{showHint ? 'Doğru nokta yeşil halkayla gösterildi.' : 'Bu hamle diyagramda yok — tekrar dene.'}</p>}
      <div className="flex gap-2">
        <button onClick={restart} className="press-btn flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-primary-blue/5 dark:bg-white/10 text-ink/70 dark:text-ice-white/70 hover:bg-primary-blue/10">
          <RotateCcw size={14} /> Baştan başla
        </button>
        {!done && (
          <button onClick={() => setMisses(2)} className="press-btn flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-primary-blue/5 dark:bg-white/10 text-ink/70 dark:text-ice-white/70 hover:bg-primary-blue/10">
            <Lightbulb size={14} /> İpucu
          </button>
        )}
      </div>
      {done && <Explanation node={node} extra="Tebrikler, josekiyi eksiksiz oynadın!" />}
    </Layout>
  )
}

export function Layout({ board, children }) {
  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] gap-5 lg:h-full lg:min-h-0">
      <div className="flex flex-col lg:h-full lg:min-h-0">{board}</div>
      <div className="flex flex-col gap-3 lg:min-h-0 lg:overflow-y-auto">{children}</div>
    </div>
  )
}

// Only one exercise type is left: "Josekiyi oyna" (replay the diagram).
export function JosekiExercises({ joseki, done, onSolved, reward }) {
  const list = joseki.exercises
  const [index, setIndex] = useState(() => Math.max(0, list.findIndex((e) => !done.has(e.id))))
  const ex = list[index]
  const solved = list.filter((e) => done.has(e.id)).length
  const navBtn =
    'press-btn flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-primary-blue/5 dark:bg-white/10 text-ink/70 dark:text-ice-white/70 disabled:opacity-30'

  return (
    <div className="flex flex-col gap-3 lg:h-full lg:min-h-0">
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary-blue text-white">
          <Footprints size={13} />
          Josekiyi oyna
          <span className="font-data text-[10px] text-white/70">
            {solved}/{list.length}
          </span>
        </span>
        <div className="flex items-center gap-2">
          {ex && reward?.id === ex.id ? (
            reward.signedIn ? (
              <span className="px-2.5 py-1 rounded-full bg-success/15 text-success text-xs font-black animate-pop-in">+{reward.xp} XP</span>
            ) : (
              <Link to="/giris" className="text-[11px] font-bold text-accent-blue hover:underline">XP kazanmak için giriş yap</Link>
            )
          ) : (
            ex && done.has(ex.id) && <span className="text-[10px] font-black uppercase tracking-wider text-success">Çözüldü</span>
          )}
          <span className="text-[11px] font-bold text-ink/40 dark:text-ice-white/40 font-data">
            {index + 1}/{list.length} · +{JOSEKI_XP.sequence} XP
          </span>
          <button onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0} className={navBtn}>
            <ChevronLeft size={14} /> Önceki
          </button>
          <button onClick={() => setIndex((i) => Math.min(list.length - 1, i + 1))} disabled={index >= list.length - 1} className={navBtn}>
            Sonraki <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="lg:flex-1 lg:min-h-0">{ex && <SequenceExercise key={ex.id} joseki={joseki} ex={ex} onSolved={() => onSolved(ex.id)} />}</div>
    </div>
  )
}
