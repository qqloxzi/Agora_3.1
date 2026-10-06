import { useId, useState } from 'react'

const HOSHI = {
  19: [3, 9, 15],
  13: [3, 6, 9],
  9: [2, 4, 6],
}

function hoshiPoints(size) {
  if (size === 9) return [[2, 2], [2, 6], [6, 2], [6, 6], [4, 4]]
  const coords = HOSHI[size]
  if (!coords) return []
  return coords.flatMap((a) => coords.map((b) => [a, b]))
}

function Stone({ x, y, color, ghost = false, blackFillId, whiteFillId }) {
  const fillId = color === 'B' ? blackFillId : whiteFillId
  return (
    <g opacity={ghost ? 0.35 : 1}>
      {!ghost && <ellipse cx={x + 0.5} cy={y + 0.63} rx={0.44} ry={0.4} fill="black" opacity={0.32} />}
      <circle
        cx={x + 0.5}
        cy={y + 0.5}
        r={0.465}
        fill={`url(#${fillId})`}
        stroke={color === 'W' ? '#9c9280' : '#000'}
        strokeWidth={color === 'W' ? 0.022 : 0.014}
        strokeOpacity={0.6}
      />
    </g>
  )
}

// Letters on empty points interrupt the grid lines (like a printed diagram)
// instead of sitting on a painted disc that never matches the wood texture.
const LETTER_GAP = 0.3

function letterGaps(labels, board) {
  const rows = new Map()
  const cols = new Map()
  const keys = new Set()
  for (const l of labels) {
    if (!l.letter || board?.[l.y]?.[l.x]) continue
    keys.add(`${l.x},${l.y}`)
    rows.set(l.y, [...(rows.get(l.y) ?? []), l.x + 0.5])
    cols.set(l.x, [...(cols.get(l.x) ?? []), l.y + 0.5])
  }
  return { rows, cols, keys }
}

function lineSegments(gapCenters = [], size) {
  const segs = []
  let start = 0.5
  for (const c of [...gapCenters].sort((a, b) => a - b)) {
    if (c - LETTER_GAP > start) segs.push([start, c - LETTER_GAP])
    start = Math.max(start, c + LETTER_GAP)
  }
  if (size - 0.5 > start) segs.push([start, size - 0.5])
  return segs
}

export function GoBoard({ size = 19, board, labels = [], rings = [], lastMove, interactive = true, onPointClick, flash, toPlay, crop }) {
  const [hover, setHover] = useState(null)
  const uid = useId()
  const woodId = `agora-board-wood-${uid}`
  const grainId = `agora-wood-grain-${uid}`
  const blackId = `agora-stone-black-${uid}`
  const whiteId = `agora-stone-white-${uid}`
  const points = []
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) points.push({ x, y })

  const gridStroke = size >= 19 ? 0.028 : size >= 13 ? 0.032 : 0.038
  // Puzzles/diagrams whose stones cluster in one corner or side pass a
  // `crop` (see boardCropOf) so we zoom the camera into that region instead
  // of showing the full empty board — the underlying coordinate system and
  // hit-test grid below stay untouched, exactly like the mobile app's crop.
  const view = crop ?? { minX: 0, minY: 0, span: size }
  const gaps = letterGaps(labels, board)

  return (
    <svg viewBox={`${view.minX} ${view.minY} ${view.span} ${view.span}`} className="w-full h-full select-none">
      <defs>
        <linearGradient id={woodId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#DDAC52" />
          <stop offset="50%" stopColor="#D9A548" />
          <stop offset="100%" stopColor="#D1993F" />
        </linearGradient>
        <filter id={grainId} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.01 0.9" numOctaves="2" seed="11" result="grain" />
          <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0.22  0 0 0 0 0.13  0 0 0 0 0.04  0 0 0 0.22 0" />
        </filter>
        <radialGradient id={blackId} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#5c5c5c" />
          <stop offset="45%" stopColor="#232323" />
          <stop offset="100%" stopColor="#020202" />
        </radialGradient>
        <radialGradient id={whiteId} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#f1efe6" />
          <stop offset="100%" stopColor="#d9d3bf" />
        </radialGradient>
      </defs>

      <rect x={0} y={0} width={size} height={size} fill={`url(#${woodId})`} />
      <rect x={0} y={0} width={size} height={size} filter={`url(#${grainId})`} style={{ mixBlendMode: 'multiply' }} />

      {Array.from({ length: size }).flatMap((_, i) =>
        lineSegments(gaps.rows.get(i), size).map(([a, b]) => (
          <line key={`h${i}-${a}`} x1={a} y1={i + 0.5} x2={b} y2={i + 0.5} stroke="#1c1006" strokeOpacity={0.88} strokeWidth={gridStroke} />
        )),
      )}
      {Array.from({ length: size }).flatMap((_, i) =>
        lineSegments(gaps.cols.get(i), size).map(([a, b]) => (
          <line key={`v${i}-${a}`} x1={i + 0.5} y1={a} x2={i + 0.5} y2={b} stroke="#1c1006" strokeOpacity={0.88} strokeWidth={gridStroke} />
        )),
      )}

      {hoshiPoints(size).filter(([x, y]) => !gaps.keys.has(`${x},${y}`)).map(([x, y]) => (
        <circle key={`hoshi-${x}-${y}`} cx={x + 0.5} cy={y + 0.5} r={0.1} fill="#1c1006" fillOpacity={0.9} />
      ))}

      {board &&
        points.map(({ x, y }) => {
          const stone = board[y][x]
          if (!stone) return null
          return (
            <g key={`stone-${x}-${y}`}>
              <Stone x={x} y={y} color={stone} blackFillId={blackId} whiteFillId={whiteId} />
              {lastMove && lastMove.x === x && lastMove.y === y && (
                <circle cx={x + 0.5} cy={y + 0.5} r={0.15} fill="none" stroke={stone === 'B' ? '#f5f5f0' : '#1c1c1c'} strokeWidth={0.035} />
              )}
            </g>
          )
        })}

      {interactive && toPlay && hover && board && !board[hover.y]?.[hover.x] && (
        <Stone x={hover.x} y={hover.y} color={toPlay} ghost blackFillId={blackId} whiteFillId={whiteId} />
      )}

      {labels.map((l) => (
        <g key={`label-${l.x}-${l.y}`}>
          <text
            x={l.x + 0.5}
            y={l.y + 0.5}
            fontSize={l.small ? 0.42 : 0.52}
            textAnchor="middle"
            dominantBaseline="central"
            fill={l.fill ?? '#000'}
            fontWeight="bold"
          >
            {l.text}
          </text>
        </g>
      ))}

      {rings.map((r) => (
        <circle key={`ring-${r.x}-${r.y}`} cx={r.x + 0.5} cy={r.y + 0.5} r={0.42} fill="none" stroke={r.color ?? '#2E9FE0'} strokeWidth={0.09} />
      ))}

      {flash && flash.color && (!board || !board[flash.y]?.[flash.x]) && (
        <Stone x={flash.x} y={flash.y} color={flash.color} blackFillId={blackId} whiteFillId={whiteId} />
      )}

      {interactive &&
        points.map(({ x, y }) => (
          <rect
            key={`hit-${x}-${y}`}
            x={x}
            y={y}
            width={1}
            height={1}
            fill="transparent"
            className="cursor-pointer"
            onMouseEnter={() => setHover({ x, y })}
            onMouseLeave={() => setHover(null)}
            onClick={() => onPointClick?.(x, y)}
          />
        ))}
    </svg>
  )
}
