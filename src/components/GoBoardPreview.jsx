/**
 * Salt gösterim amaçlı Go tahtası — gerçek bir bulmaca/ders pozisyonunu
 * (sgfEngine.replayPath çıktısı) GoBoard.jsx ile aynı ahşap/taş renkleriyle çizer.
 * Etkileşim yok, kontrol yok — ana sayfa kutucukları için.
 */
const PADDING_PCT = 18 / 560 // GoBoard.jsx ile aynı kenar boşluğu oranı

export function GoBoardPreview({ board, size = 19, gradientId = 'preview' }) {
  const W = 100
  const padding = W * PADDING_PCT
  const inner = W - padding * 2
  const cell = inner / (size - 1)
  const pt = (i) => padding + i * cell

  const stones = []
  if (board) {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const v = board[y]?.[x]
        if (v) stones.push({ x, y, color: v === 'W' ? 'white' : 'black' })
      }
    }
  }

  return (
    <svg viewBox={`0 0 ${W} ${W}`} className="w-full h-full block" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={`${gradientId}-wood`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#DDAC52" />
          <stop offset="50%" stopColor="#D9A548" />
          <stop offset="100%" stopColor="#D1993F" />
        </linearGradient>
        <radialGradient id={`${gradientId}-black`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#5c5c5c" />
          <stop offset="45%" stopColor="#232323" />
          <stop offset="100%" stopColor="#020202" />
        </radialGradient>
        <radialGradient id={`${gradientId}-white`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#f1efe6" />
          <stop offset="100%" stopColor="#d9d3bf" />
        </radialGradient>
      </defs>

      <rect x={0} y={0} width={W} height={W} fill={`url(#${gradientId}-wood)`} />

      {Array.from({ length: size }).map((_, i) => (
        <line key={`h-${i}`} x1={pt(0)} y1={pt(i)} x2={pt(size - 1)} y2={pt(i)} stroke="#8a6526" strokeWidth={W / 400} />
      ))}
      {Array.from({ length: size }).map((_, i) => (
        <line key={`v-${i}`} x1={pt(i)} y1={pt(0)} x2={pt(i)} y2={pt(size - 1)} stroke="#8a6526" strokeWidth={W / 400} />
      ))}

      {stones.map((s, i) => (
        <circle
          key={i}
          cx={pt(s.x)}
          cy={pt(s.y)}
          r={cell * 0.46}
          fill={s.color === 'black' ? `url(#${gradientId}-black)` : `url(#${gradientId}-white)`}
        />
      ))}
    </svg>
  )
}
