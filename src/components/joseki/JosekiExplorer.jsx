import { Fragment, useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Undo2, RotateCcw, BookOpen, MapPin } from 'lucide-react'
import { JosekiBoardView, RatingBadge } from './JosekiBoardView'
import { decode, otherColor, RATING_META, treeBoardAt } from '../../lib/joseki'
import { attemptMove } from '../../lib/sgfEngine'
import { playStoneSound } from '../../lib/stoneSound'

function StepButton({ onClick, disabled, icon: Icon, title }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="press-btn w-10 h-10 rounded-xl flex items-center justify-center bg-primary-blue/5 dark:bg-white/10 text-ink/70 dark:text-ice-white/70 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary-blue/10 dark:hover:bg-white/15 transition-colors"
    >
      <Icon size={18} />
    </button>
  )
}

// Turns "A-1-1-1-1-26" references in the commentary into links.
function RichText({ text, joseki, onOpen }) {
  const parts = text.split(/(A(?:-\d+){2,})/g)
  return parts.map((part, i) =>
    joseki.tree.paths[part] ? (
      <button key={i} onClick={() => onOpen(part)} className="font-bold text-accent-blue hover:underline">
        {part}
      </button>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  )
}

// The learn view walks one merged move tree. `line` is the diagram being
// read: its commentary is shown on the right and its moves are numbered from
// 1 like in the book. Every branch point shows its continuations as letters
// on the board; clicking one follows that branch.
// `aside` (optional) is shown under the commentary card, to the right of the board.
export function JosekiExplorer({ joseki, aside }) {
  const T = joseki.tree.nodes
  const paths = joseki.tree.paths
  const rootLine = joseki.root
  // Where the board opens and "Başa dön" returns: the end of the root line, or
  // an explicit start node (the all-josekis board starts on the empty board).
  const startNode = joseki.start ?? paths[rootLine].at(-1)
  const [cur, setCur] = useState(startNode)
  const [line, setLine] = useState(rootLine)
  const [tries, setTries] = useState([])

  const linePath = paths[line]
  const lineIndex = linePath.indexOf(cur)
  const lineNode = joseki.nodes[line]
  const node = T[cur]

  function go(id, preferLine = line) {
    setCur(id)
    setLine(paths[preferLine].includes(id) ? preferLine : T[id].d)
    setTries([])
  }

  function openDiagram(code) {
    setLine(code)
    setCur(paths[code][0])
    setTries([])
  }

  const next = lineIndex >= 0 && lineIndex < linePath.length - 1 ? linePath[lineIndex + 1] : node.ch.length === 1 ? node.ch[0] : null
  const lineEnd = linePath.at(-1)

  useEffect(() => {
    function onKey(e) {
      if (e.target.closest?.('input, textarea')) return
      if (e.key === 'ArrowRight' && next !== null) go(next)
      if (e.key === 'ArrowLeft' && node.p !== null) go(node.p)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const base = useMemo(() => treeBoardAt(joseki, cur, line), [joseki, cur, line])

  const tryBoard = useMemo(() => {
    let board = base.board
    const history = [JSON.stringify(board)]
    for (const t of tries) {
      const r = attemptMove(board, t.x, t.y, t.color, joseki.size, history)
      if (r.ok) {
        board = r.board
        history.push(JSON.stringify(board))
      }
    }
    return board
  }, [base, tries, joseki.size])

  const toPlay = tries.length ? otherColor(tries.at(-1).color) : node.t
  const board = tries.length ? tryBoard : base.board

  // Continuations of this position: letters on the board, tenuki / special
  // setups as buttons under it.
  const moveKids = node.ch.filter((c) => T[c].m !== 'pass' && T[c].m !== 'setup')
  const extraKids = node.ch.filter((c) => T[c].m === 'pass' || T[c].m === 'setup')
  const lettered = moveKids.filter((c) => T[c].l)

  let labels
  if (tries.length) {
    labels = tries.map((t, i) => ({ x: t.x, y: t.y, text: String(i + 1), fill: t.color === 'B' ? '#fff' : '#000' })).filter((l) => board[l.y][l.x])
  } else {
    labels = []
    for (const [key, n] of base.numbers) {
      const [x, y] = key.split(',').map(Number)
      labels.push({ x, y, text: String(n), fill: board[y][x] === 'B' ? '#fff' : '#000', small: n >= 10 })
    }
    if (lineIndex >= 0) {
      for (const m of lineNode.diagram.marks) {
        const { x, y } = decode(m)
        labels.push({ x, y, text: '×', fill: board[y][x] === 'B' ? '#fff' : '#000' })
      }
    }
    const taken = new Set()
    for (const c of lettered) {
      const { x, y } = decode(T[c].m)
      taken.add(`${x},${y}`)
      labels.push({ x, y, text: T[c].l, fill: '#000', letter: true })
    }
    // Points the commentary refers to (not playable branches here) — muted.
    if (cur === lineEnd) {
      for (const [letter, c] of Object.entries(lineNode.diagram.labels)) {
        const { x, y } = decode(c)
        if (taken.has(`${x},${y}`) || base.numbers.has(`${x},${y}`) || lettered.some((k) => T[k].l === letter)) continue
        labels.push({ x, y, text: letter, fill: board[y][x] === 'B' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.45)', letter: true })
      }
    }
  }
  const rings = !tries.length && base.lastMove ? [{ ...base.lastMove, color: '#2E9FE0' }] : []

  function handlePointClick(x, y) {
    if (!tries.length) {
      const kid = moveKids.find((c) => {
        const p = decode(T[c].m)
        return p.x === x && p.y === y
      })
      if (kid !== undefined) return go(kid)
    }
    const r = attemptMove(tryBoard, x, y, toPlay, joseki.size)
    if (!r.ok) return
    playStoneSound({ capture: r.captured })
    setTries((t) => [...t, { x, y, color: toPlay }])
  }

  const colorName = (c) => (c === 'B' ? 'Siyah' : 'Beyaz')

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] gap-5 lg:h-full lg:min-h-0">
      <div className="flex flex-col gap-2 lg:h-full lg:min-h-0">
        <JosekiBoardView size={joseki.size} board={board} labels={labels} rings={rings} onPointClick={handlePointClick} toPlay={toPlay} />

        <div className="shrink-0 flex items-center justify-center gap-2">
          <StepButton onClick={() => go(startNode, rootLine)} disabled={cur === startNode && !tries.length} icon={ChevronsLeft} title="Başa dön" />
          <StepButton onClick={() => go(node.p)} disabled={node.p === null} icon={ChevronLeft} title="Geri (←)" />
          <span className="min-w-[7rem] text-center text-xs font-bold text-ink/60 dark:text-ice-white/60 font-data">
            {lineIndex >= 0 && linePath.length > 1 ? `Hamle ${lineIndex} / ${linePath.length - 1}` : 'Pozisyon'}
          </span>
          <StepButton onClick={() => go(next)} disabled={next === null} icon={ChevronRight} title="İleri (→)" />
          <StepButton onClick={() => go(lineEnd)} disabled={cur === lineEnd} icon={ChevronsRight} title="Bu varyasyonun sonuna git" />
        </div>

        <div className="shrink-0 flex flex-col items-center gap-2 min-h-[2.5rem]">
          {tries.length ? (
            <p className="inline-flex items-center gap-2 text-xs font-semibold text-ink/50 dark:text-ice-white/50">
              <span className="text-accent-blue font-bold">Deneme modu</span> · {tries.length} hamle
              <button onClick={() => setTries((t) => t.slice(0, -1))} className="inline-flex items-center gap-1 font-bold text-ink/70 dark:text-ice-white/70 hover:text-accent-blue">
                <Undo2 size={12} /> Geri al
              </button>
              <button onClick={() => setTries([])} className="inline-flex items-center gap-1 font-bold text-ink/70 dark:text-ice-white/70 hover:text-accent-blue">
                <RotateCcw size={12} /> Diyagrama dön
              </button>
            </p>
          ) : (
            <>
              {extraKids.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2">
                  {extraKids.map((c) => (
                    <button
                      key={c}
                      onClick={() => go(c)}
                      className="press-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary-blue/5 dark:bg-white/10 text-ink/75 dark:text-ice-white/75 hover:bg-primary-blue/10"
                    >
                      {T[c].m === 'pass' ? (
                        <>{colorName(node.t)} tenuki yapar</>
                      ) : (
                        <>
                          <MapPin size={12} /> Özel durum: {joseki.nodes[T[c].d].title}
                        </>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 self-start lg:max-h-full lg:min-h-0">
      <div className="rounded-2xl bg-white/70 dark:bg-white/5 border border-primary-blue/10 dark:border-white/10 shadow-card p-5 flex flex-col gap-3 lg:min-h-0 lg:overflow-y-auto">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-extrabold text-ink dark:text-white leading-snug">{lineNode.title}</h2>
          <RatingBadge meta={RATING_META[lineNode.rating]} className="mt-1" />
        </div>
        <p className="text-sm text-ink/75 dark:text-ice-white/75 leading-relaxed">
          <RichText text={lineNode.text} joseki={joseki} onOpen={openDiagram} />
        </p>
        <div className="flex items-center justify-between text-[11px] font-bold text-ink/35 dark:text-ice-white/35 font-data">
          <span>{line}</span>
          {lineNode.bookPage && (
            <span className="inline-flex items-center gap-1">
              <BookOpen size={11} /> s. {lineNode.bookPage}
            </span>
          )}
        </div>
      </div>
      {aside}
      </div>
    </div>
  )
}
