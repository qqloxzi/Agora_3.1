import { useMemo, useState } from 'react'
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, Menu, X } from 'lucide-react'
import { parseSgf, boardSizeOf, coordToXY, playMove } from '../lib/sgfEngine'

function emptyBoard(size) {
  return Array.from({ length: size }, () => Array(size).fill(null))
}

/** Kök düğümden itibaren her zaman ilk çocuğu izleyerek tam ana hattı döner — varyasyon dalları göz ardı edilir. */
function mainLineChain(root) {
  const chain = []
  let node = root
  while (node?.children?.length > 0) {
    node = node.children[0]
    chain.push(node)
  }
  return chain
}

function cloneBoard(board) {
  return board.map((row) => [...row])
}

function countColor(board, color) {
  let n = 0
  for (const row of board) for (const cell of row) if (cell === color) n++
  return n
}

/** SGF ana hattını (ilk dal) baştan sona oynatıp her hamle için tahta + top sayısı anlık görüntüsü üretir. */
function buildSnapshots(root, size) {
  const board = emptyBoard(size)
  const chain = mainLineChain(root)
  const caps = { B: 0, W: 0 }
  const snapshots = [{ board: cloneBoard(board), caps: { ...caps }, lastMove: null }]

  // Kök düğümdeki AB/AW (handikap/kurulum taşları) ilk anlık görüntüye işlenir.
  const rootData = root?.data || {}
  for (const coord of rootData.AB || []) {
    const p = coordToXY(coord)
    if (p) board[p.y][p.x] = 'B'
  }
  for (const coord of rootData.AW || []) {
    const p = coordToXY(coord)
    if (p) board[p.y][p.x] = 'W'
  }
  snapshots[0] = { board: cloneBoard(board), caps: { ...caps }, lastMove: null }

  for (const node of chain) {
    const data = node.data || {}
    let lastMove = null

    if (data.B?.[0] !== undefined) {
      const coord = data.B[0]
      const p = coordToXY(coord)
      if (p) {
        const before = countColor(board, 'W')
        playMove(board, p.x, p.y, 'B', size)
        caps.B += Math.max(0, before - countColor(board, 'W'))
        lastMove = { ...p, color: 'B' }
      }
    } else if (data.W?.[0] !== undefined) {
      const coord = data.W[0]
      const p = coordToXY(coord)
      if (p) {
        const before = countColor(board, 'B')
        playMove(board, p.x, p.y, 'W', size)
        caps.W += Math.max(0, before - countColor(board, 'B'))
        lastMove = { ...p, color: 'W' }
      }
    } else {
      continue // AB/AW-only ara düğüm ya da pas — yeni anlık görüntü gerekmiyor
    }

    snapshots.push({ board: cloneBoard(board), caps: { ...caps }, lastMove })
  }

  return snapshots
}

function PlayerBadge({ name, rank, color, caps, align }) {
  const label = [name || (color === 'B' ? 'Siyah' : 'Beyaz'), rank].filter(Boolean).join(' ')
  const stone = (
    <span
      className="inline-block w-4 h-4 rounded-full shrink-0"
      style={{
        background: color === 'B' ? 'radial-gradient(circle at 35% 30%, #5c5c5c, #232323 45%, #020202)' : 'radial-gradient(circle at 35% 30%, #ffffff, #f1efe6 60%, #d9d3bf)',
        border: color === 'W' ? '1px solid rgba(0,0,0,0.15)' : 'none',
      }}
    />
  )
  return (
    <div className={`flex flex-col gap-1 ${align === 'right' ? 'items-end text-right' : 'items-start text-left'}`}>
      <div className={`flex items-center gap-2 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
        {stone}
        <span className="font-extrabold text-ink dark:text-white text-sm md:text-base">{label}</span>
      </div>
      <span className="text-xs text-ink/40 dark:text-ice-white/40 font-data">Top: {caps}</span>
    </div>
  )
}

const NAV_BTN = 'flex items-center justify-center w-10 h-10 rounded-xl bg-primary-blue/5 dark:bg-white/10 text-ink/70 dark:text-ice-white/70 hover:bg-primary-blue/10 dark:hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'

/**
 * Salt izleme amaçlı SGF partisi görüntüleyici — kütüphaneden bir tam maçı
 * hamle hamle oynatmak için. GoPuzzle'ın aksine çözüm ağacı/doğrulama yok,
 * yalnızca SGF ana hattında ileri/geri gezinme.
 */
export function GameViewer({ sgfRaw, title, blackName, blackRank, whiteName, whiteRank }) {
  const parsed = useMemo(() => {
    const root = parseSgf(sgfRaw)
    if (!root) return null
    const size = boardSizeOf(root)
    const snapshots = buildSnapshots(root, size)
    const data = root.data || {}
    return {
      size,
      snapshots,
      pb: blackName || data.PB?.[0] || 'Siyah',
      pw: whiteName || data.PW?.[0] || 'Beyaz',
      br: blackRank || data.BR?.[0] || '',
      wr: whiteRank || data.WR?.[0] || '',
    }
  }, [sgfRaw, blackName, blackRank, whiteName, whiteRank])

  const [moveIndex, setMoveIndex] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)

  if (!parsed) {
    return <p className="text-center text-ink/40 py-12">Bu parti için geçerli bir SGF bulunamadı.</p>
  }

  const { size, snapshots, pb, pw, br, wr } = parsed
  const total = snapshots.length - 1
  const current = snapshots[Math.min(moveIndex, total)]
  const padding = 18 / 560
  const W = 100
  const p = W * padding
  const inner = W - p * 2
  const cell = inner / (size - 1)
  const pt = (i) => p + i * cell

  return (
    <div className="w-full max-w-xl mx-auto">
      {title && <h3 className="text-center text-sm font-extrabold uppercase tracking-wider text-accent-blue mb-3">{title}</h3>}

      <div className="flex items-start justify-between mb-4 px-1">
        <PlayerBadge name={pw} rank={wr} color="W" caps={current.caps.W} align="left" />
        <PlayerBadge name={pb} rank={br} color="B" caps={current.caps.B} align="right" />
      </div>

      <div className="relative rounded-2xl overflow-hidden shadow-card aspect-square">
        <svg viewBox={`0 0 ${W} ${W}`} className="w-full h-full block">
          <defs>
            <linearGradient id="gv-wood" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#DDAC52" />
              <stop offset="50%" stopColor="#D9A548" />
              <stop offset="100%" stopColor="#D1993F" />
            </linearGradient>
            <radialGradient id="gv-black" cx="35%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#5c5c5c" />
              <stop offset="45%" stopColor="#232323" />
              <stop offset="100%" stopColor="#020202" />
            </radialGradient>
            <radialGradient id="gv-white" cx="35%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#f1efe6" />
              <stop offset="100%" stopColor="#d9d3bf" />
            </radialGradient>
          </defs>

          <rect x={0} y={0} width={W} height={W} fill="url(#gv-wood)" />

          {Array.from({ length: size }).map((_, i) => (
            <line key={`h-${i}`} x1={pt(0)} y1={pt(i)} x2={pt(size - 1)} y2={pt(i)} stroke="#8a6526" strokeWidth={W / 400} />
          ))}
          {Array.from({ length: size }).map((_, i) => (
            <line key={`v-${i}`} x1={pt(i)} y1={pt(0)} x2={pt(i)} y2={pt(size - 1)} stroke="#8a6526" strokeWidth={W / 400} />
          ))}

          {current.board.map((row, y) =>
            row.map((v, x) =>
              v ? (
                <circle key={`${x}-${y}`} cx={pt(x)} cy={pt(y)} r={cell * 0.46} fill={v === 'B' ? 'url(#gv-black)' : 'url(#gv-white)'} />
              ) : null
            )
          )}

          {current.lastMove && (
            <rect
              x={pt(current.lastMove.x) - cell * 0.12}
              y={pt(current.lastMove.y) - cell * 0.12}
              width={cell * 0.24}
              height={cell * 0.24}
              fill={current.lastMove.color === 'B' ? '#ffffff' : '#1a1a1a'}
            />
          )}
        </svg>
      </div>

      <div className="flex items-center justify-center gap-2 mt-4">
        <button className={NAV_BTN} disabled={moveIndex === 0} onClick={() => setMoveIndex(0)} aria-label="Başa dön">
          <ChevronsLeft size={18} />
        </button>
        <button className={NAV_BTN} disabled={moveIndex === 0} onClick={() => setMoveIndex((i) => Math.max(0, i - 1))} aria-label="Önceki hamle">
          <ChevronLeft size={18} />
        </button>
        <button className={NAV_BTN} disabled={moveIndex >= total} onClick={() => setMoveIndex((i) => Math.min(total, i + 1))} aria-label="Sonraki hamle">
          <ChevronRight size={18} />
        </button>
        <button className={NAV_BTN} disabled={moveIndex >= total} onClick={() => setMoveIndex(total)} aria-label="Sona git">
          <ChevronsRight size={18} />
        </button>
        <div className="flex-1" />
        <button className={NAV_BTN} onClick={() => setMenuOpen((v) => !v)} aria-label="Hamle listesi">
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <p className="text-center text-xs text-ink/40 dark:text-ice-white/40 font-data mt-2">
        Hamle {moveIndex} / {total}
      </p>

      {menuOpen && (
        <div className="mt-3 max-h-56 overflow-y-auto rounded-2xl border border-primary-blue/10 dark:border-white/10 bg-white/70 dark:bg-white/5 p-2 grid grid-cols-6 sm:grid-cols-8 gap-1.5">
          {snapshots.map((s, i) => (
            <button
              key={i}
              onClick={() => {
                setMoveIndex(i)
                setMenuOpen(false)
              }}
              className={`text-xs font-bold rounded-lg py-1.5 ${
                i === moveIndex ? 'bg-primary-blue text-white' : 'bg-primary-blue/5 dark:bg-white/10 text-ink/60 dark:text-ice-white/60 hover:bg-primary-blue/10'
              }`}
            >
              {i}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
