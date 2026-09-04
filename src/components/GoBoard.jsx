import { useState } from 'react'

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

function Stone({ x, y, color, ghost = false }) {
  const fillId = color === 'B' ? 'agora-stone-black' : 'agora-stone-white'
  return (
    <g opacity={ghost ? 0.35 : 1}>
      {!ghost && <ellipse cx={x + 0.5} cy={y + 0.62} rx={0.44} ry={0.4} fill="black" opacity={0.28} />}
      <circle
        cx={x + 0.5}
        cy={y + 0.5}
        r={0.46}
        fill={`url(#${fillId})`}
        stroke={color === 'W' ? '#a89f8c' : '#000'}
        strokeWidth={color === 'W' ? 0.015 : 0.01}
        strokeOpacity={0.5}
      />
    </g>
  )
}

export function GoBoard({ size = 19, board, labels = [], lastMove, interactive = true, onPointClick, flash, hintPoints = [], toPlay }) {
  const [hover, setHover] = useState(null)
  const points = []
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) points.push({ x, y })

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full select-none">
      <defs>
        <linearGradient id="agora-board-wood" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E7B65B" />
          <stop offset="55%" stopColor="#D9A548" />
          <stop offset="100%" stopColor="#C08F3E" />
        </linearGradient>
        <radialGradient id="agora-stone-black" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#5c5c5c" />
          <stop offset="45%" stopColor="#232323" />
          <stop offset="100%" stopColor="#020202" />
        </radialGradient>
        <radialGradient id="agora-stone-white" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#f1efe6" />
          <stop offset="100%" stopColor="#d9d3bf" />
        </radialGradient>
      </defs>

      <rect x={0} y={0} width={size} height={size} fill="url(#agora-board-wood)" />

      {Array.from({ length: size }).map((_, i) => (
        <line key={`h${i}`} x1={0.5} y1={i + 0.5} x2={size - 0.5} y2={i + 0.5} stroke="#5c3f1e" strokeOpacity={0.55} strokeWidth={0.018} />
      ))}
      {Array.from({ length: size }).map((_, i) => (
        <line key={`v${i}`} x1={i + 0.5} y1={0.5} x2={i + 0.5} y2={size - 0.5} stroke="#5c3f1e" strokeOpacity={0.55} strokeWidth={0.018} />
      ))}

      {hoshiPoints(size).map(([x, y]) => (
        <circle key={`hoshi-${x}-${y}`} cx={x + 0.5} cy={y + 0.5} r={0.08} fill="#5c3f1e" fillOpacity={0.65} />
      ))}

      {board &&
        points.map(({ x, y }) => {
          const stone = board[y][x]
          if (!stone) return null
          return (
            <g key={`stone-${x}-${y}`}>
              <Stone x={x} y={y} color={stone} />
              {lastMove && lastMove.x === x && lastMove.y === y && (
                <circle cx={x + 0.5} cy={y + 0.5} r={0.15} fill="none" stroke={stone === 'B' ? '#f5f5f0' : '#1c1c1c'} strokeWidth={0.035} />
              )}
            </g>
          )
        })}

      {interactive && toPlay && hover && board && !board[hover.y]?.[hover.x] && <Stone x={hover.x} y={hover.y} color={toPlay} ghost />}

      {hintPoints.map((p) => (
        <circle
          key={`hint-${p.x}-${p.y}`}
          cx={p.x + 0.5}
          cy={p.y + 0.5}
          r={0.42}
          fill="none"
          stroke="#8FADC7"
          strokeWidth={0.05}
          className="animate-pulse"
        />
      ))}

      {labels.map((l) => (
        <text
          key={`label-${l.x}-${l.y}`}
          x={l.x + 0.5}
          y={l.y + 0.5}
          fontSize={0.52}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#000"
          fontWeight="bold"
        >
          {l.text}
        </text>
      ))}

      {flash && (
        <circle
          cx={flash.x + 0.5}
          cy={flash.y + 0.5}
          r={0.46}
          fill="none"
          stroke={flash.type === 'correct' ? '#4C9A6A' : '#D6564F'}
          strokeWidth={0.09}
        />
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
