import { useMemo } from 'react'
import { GoBoard } from './GoBoard'
import { parseSgf, boardSizeOf, replayPath, collectChain, labelsOf } from '../lib/sgfEngine'

// Static, non-interactive board used to illustrate a point inside an
// article — replays the SGF's setup/move chain once and just displays it.
export function ArticleBoard({ sgf, description }) {
  const { board, size, labels } = useMemo(() => {
    const root = parseSgf(sgf)
    if (!root) return { board: null, size: 19, labels: [] }
    const chain = collectChain(root)
    const sz = boardSizeOf(root)
    return { board: replayPath(chain, sz).board, size: sz, labels: labelsOf(chain[chain.length - 1]) }
  }, [sgf])

  if (!board) return null

  return (
    <figure className="my-8">
      <div className="w-full max-w-md mx-auto aspect-square rounded-2xl overflow-hidden border border-primary-blue/10 dark:border-white/10 shadow-floating">
        <GoBoard size={size} board={board} labels={labels} interactive={false} />
      </div>
      {description && (
        <figcaption className="mt-3 max-w-md mx-auto text-center text-sm text-ink/60 dark:text-ice-white/60 leading-relaxed">
          {description}
        </figcaption>
      )}
    </figure>
  )
}
