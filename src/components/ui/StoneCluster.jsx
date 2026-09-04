// Small hand-drawn Go-stone cluster used as a vector icon in place of photos.
// `count` (1-3) echoes each league tier's progression — Temel Taşlar starts
// with a single stone, Aydınlanma with a small formed group.
const LAYOUTS = {
  1: [[0, 0]],
  2: [[-9, -4], [8, 6]],
  3: [[-10, -8], [9, -3], [-2, 9]],
}

export function StoneCluster({ count = 1, size = 40, className = '' }) {
  const stones = LAYOUTS[count] || LAYOUTS[1]
  return (
    <svg width={size} height={size} viewBox="-20 -20 40 40" className={className}>
      {stones.map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy + 1} r="10" fill="black" opacity="0.15" />
          <circle cx={cx} cy={cy} r="10" fill="currentColor" />
          <circle cx={cx - 3} cy={cy - 3} r="3.5" fill="white" opacity="0.35" />
        </g>
      ))}
    </svg>
  )
}
