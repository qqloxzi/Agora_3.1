import { RotateCcw, MessageCircle, Lightbulb } from 'lucide-react'
import { GoBoard } from './GoBoard'
import { useSgfPuzzle } from '../hooks/useSgfPuzzle'
import { useAuth } from '../contexts/AuthContext'
import { spendHeart } from '../lib/workshopProgress'

export function GoPuzzle({ sgfRaw, validationMode, onSolved }) {
  const { user, profile, setProfile } = useAuth()
  const puzzle = useSgfPuzzle(sgfRaw, validationMode, {
    onWrongMove: () => spendHeart({ user, profile, setProfile }),
    onSolved,
  })

  if (!puzzle.ready) {
    return (
      <div className="w-full max-w-3xl aspect-square max-h-[74vh] mx-auto rounded-2xl border-2 border-dashed border-primary-blue/20 dark:border-white/15 flex items-center justify-center text-sm text-ink/40 dark:text-ice-white/40">
        Bu alıştırma için tahta verisi bulunamadı.
      </div>
    )
  }

  const turnLabel = puzzle.toPlay === 'B' ? 'Siyah' : puzzle.toPlay === 'W' ? 'Beyaz' : null

  return (
    <div className="flex flex-col">
      <div className="w-full max-w-3xl aspect-square max-h-[74vh] mx-auto rounded-2xl overflow-hidden border border-primary-blue/10 dark:border-white/10 shadow-floating">
        <GoBoard
          size={puzzle.size}
          board={puzzle.board}
          labels={puzzle.labels}
          lastMove={puzzle.lastMove}
          interactive={puzzle.canInteract}
          onPointClick={puzzle.handlePointClick}
          flash={puzzle.flash}
          hintPoints={puzzle.hintPoints}
          toPlay={puzzle.toPlay}
        />
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-ink/70 dark:text-ice-white/70">
            {turnLabel ? (
              <>
                <span className={`w-3 h-3 rounded-full ${puzzle.toPlay === 'B' ? 'bg-ink dark:bg-white' : 'bg-white border border-ink/30'}`} />
                Sıra: {turnLabel}
                {puzzle.done && <span className="text-success font-bold">· serbest oyun</span>}
              </>
            ) : (
              <span className="text-ink/40">Bu pozisyonda hazırlanmış devam yok.</span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {puzzle.hasBranches && !puzzle.done && (
              <button
                onClick={puzzle.hint}
                className="flex items-center gap-1.5 text-xs font-bold text-token hover:opacity-70 transition-opacity"
              >
                <Lightbulb size={14} /> İpucu
              </button>
            )}
            <button
              onClick={puzzle.reset}
              className="flex items-center gap-1.5 text-xs font-bold text-ink/50 dark:text-ice-white/50 hover:text-accent-blue transition-colors"
            >
              <RotateCcw size={13} /> Baştan başla
            </button>
          </div>
        </div>

        {puzzle.lastResult === 'correct' && (
          <p className="px-4 py-2.5 rounded-xl bg-success/10 text-success text-sm font-bold">Doğru hamle!</p>
        )}
        {puzzle.lastResult === 'wrong' && (
          <p className="px-4 py-2.5 rounded-xl bg-heart/10 text-heart text-sm font-bold">Bu doğru hamle değil, tekrar dene.</p>
        )}
        {puzzle.feedback && (
          <p className="flex items-start gap-2 px-5 py-4 rounded-xl bg-primary-blue/[0.05] dark:bg-white/5 text-base text-ink/80 dark:text-ice-white/80 leading-relaxed">
            <MessageCircle size={18} className="text-accent-blue shrink-0 mt-0.5" /> {puzzle.feedback}
          </p>
        )}
      </div>
    </div>
  )
}
