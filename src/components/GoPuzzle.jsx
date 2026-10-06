import { RotateCcw, MessageCircle, Check, X, Unlock, ChevronLeft, ChevronRight } from 'lucide-react'
import { GoBoard } from './GoBoard'
import { useSgfPuzzle } from '../hooks/useSgfPuzzle'

const GENERIC_SOLVED_COMMENT = 'Doğru çözüm!'

// One shared minimal style for every control in the row — free mode,
// restart, and (when the caller wires them up) prev/next question.
function ControlButton({ onClick, disabled, icon: Icon, label, iconPosition = 'left', title }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="press-btn flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-primary-blue/5 dark:bg-white/10 text-ink/70 dark:text-ice-white/70 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary-blue/10 dark:hover:bg-white/15 transition-colors"
    >
      {iconPosition === 'left' && <Icon size={14} />}
      <span className="whitespace-nowrap">{label}</span>
      {iconPosition === 'right' && <Icon size={14} />}
    </button>
  )
}

export function GoPuzzle({ sgfRaw, validationMode, onSolved, onWrongMove, fitParent = false, onPrev, onNext, hasPrev = false, hasNext = false }) {
  const puzzle = useSgfPuzzle(sgfRaw, validationMode, { onSolved, onWrongMove })

  const boardMaxClass = fitParent ? 'w-[min(100%,100cqh)]' : 'w-full max-w-[min(48rem,74vh)]'

  if (!puzzle.ready) {
    return (
      <div className={`${boardMaxClass} aspect-square mx-auto rounded-2xl border-2 border-dashed border-primary-blue/20 dark:border-white/15 flex items-center justify-center text-sm text-ink/40 dark:text-ice-white/40`}>
        Bu alıştırma için tahta verisi bulunamadı.
      </div>
    )
  }

  const turnLabel = puzzle.toPlay === 'B' ? 'Siyah' : puzzle.toPlay === 'W' ? 'Beyaz' : null

  return (
    <div className={fitParent ? 'flex flex-col h-full min-h-0' : 'flex flex-col'}>
      <div className={fitParent ? 'flex-1 min-h-0 flex items-center justify-center [container-type:size]' : undefined}>
        <div className={`relative ${boardMaxClass} aspect-square mx-auto overflow-hidden shadow-floating`}>
          <GoBoard
            size={puzzle.size}
            crop={puzzle.crop}
            board={puzzle.board}
            labels={puzzle.labels}
            lastMove={puzzle.lastMove}
            interactive={puzzle.canInteract}
            onPointClick={puzzle.handlePointClick}
            flash={puzzle.flash}
            toPlay={puzzle.toPlay}
          />

          {puzzle.lastResult === 'correct' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-pop-in">
              <div className="w-20 h-20 rounded-full bg-success/90 flex items-center justify-center shadow-2xl">
                <Check size={44} className="text-white" strokeWidth={3} />
              </div>
            </div>
          )}
          {puzzle.lastResult === 'wrong' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-pop-in">
              <div className="w-20 h-20 rounded-full bg-heart/90 flex items-center justify-center shadow-2xl">
                <X size={44} className="text-white" strokeWidth={3} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={`mt-4 flex flex-col gap-3 ${fitParent ? 'shrink-0' : ''}`}>
        <div className="text-center text-sm font-bold text-ink/70 dark:text-ice-white/70">
          {turnLabel ? (
            <span className="inline-flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${puzzle.toPlay === 'B' ? 'bg-ink dark:bg-white' : 'bg-white border border-ink/30'}`} />
              Sıra: {turnLabel}
              {puzzle.done && <span className="text-success font-bold">· serbest oyun</span>}
            </span>
          ) : (
            <span className="text-ink/40 font-semibold">Bu pozisyonda hazırlanmış devam yok.</span>
          )}
        </div>

        {puzzle.feedback && puzzle.feedback !== GENERIC_SOLVED_COMMENT && (
          <p className="flex items-start gap-2 px-5 py-4 rounded-xl bg-primary-blue/[0.05] dark:bg-white/5 text-base text-ink/80 dark:text-ice-white/80 leading-relaxed">
            <MessageCircle size={18} className="text-accent-blue shrink-0 mt-0.5" /> {puzzle.feedback}
          </p>
        )}

        <div className="flex items-center justify-center gap-2 flex-wrap">
          {onPrev && <ControlButton onClick={onPrev} disabled={!hasPrev} icon={ChevronLeft} label="Önceki soru" />}
          {puzzle.hasBranches && !puzzle.done && (
            <ControlButton
              onClick={puzzle.enterFreeMode}
              disabled={!puzzle.hasSolvedOnce}
              title={puzzle.hasSolvedOnce ? undefined : 'Bulmacayı bir kez doğru çözünce açılır'}
              icon={Unlock}
              label="Serbest mod"
            />
          )}
          <ControlButton onClick={puzzle.reset} icon={RotateCcw} label="Baştan başla" />
          {onNext && <ControlButton onClick={onNext} disabled={!hasNext} icon={ChevronRight} label="Sonraki soru" iconPosition="right" />}
        </div>
      </div>
    </div>
  )
}
