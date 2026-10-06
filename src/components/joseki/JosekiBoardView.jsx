import { GoBoard } from '../GoBoard'

// Square board shared by the joseki explorer and exercises. Its size depends
// only on the viewport (never on the controls around it), so it stays the same
// in both tabs and doesn't jump when buttons appear under it. On narrow
// screens it is simply full width.
export function JosekiBoardView({ size, board, labels, rings, onPointClick, toPlay, interactive = true, overlay }) {
  return (
    <div className="w-full shrink-0 flex justify-center">
      <div className="relative w-full max-w-[36rem] lg:max-w-none lg:w-[min(100%,calc(100dvh_-_13.5rem))] aspect-square overflow-hidden shadow-floating">
        <GoBoard
          size={size}
          board={board}
          labels={labels}
          rings={rings}
          interactive={interactive}
          onPointClick={onPointClick}
          toPlay={toPlay}
        />
        {overlay}
      </div>
    </div>
  )
}

export function RatingBadge({ meta, className = '' }) {
  if (!meta) return null
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap ${meta.className} ${className}`}>{meta.label}</span>
}
