import { useEffect, useMemo, useRef, useState } from 'react'
import {
  parseSgf,
  boardSizeOf,
  boardCropOf,
  replayPath,
  collectChain,
  labelsOf,
  nextColorOf,
  moveCoordOf,
  commentOf,
  xyToCoord,
  attemptMove,
  BLACK,
  WHITE,
} from '../lib/sgfEngine'
import { playStoneSound } from '../lib/stoneSound'

function countStones(board) {
  let n = 0
  for (const row of board) for (const cell of row) if (cell) n += 1
  return n
}

const STEP_DELAY_MS = 200

// Drives one interactive SGF position: setup replay, branch-matching on
// click, auto-playing forced single-line continuations, and (in
// 'sgf_marks' mode) TE/BM-based correct/wrong judging. In any other
// validation mode it behaves as free exploration of the prepared branches,
// surfacing each node's comment as feedback instead of judging right/wrong.
export function useSgfPuzzle(sgfRaw, validationMode, { onWrongMove, onSolved } = {}) {
  const root = useMemo(() => parseSgf(sgfRaw), [sgfRaw])
  const size = useMemo(() => boardSizeOf(root), [root])
  const crop = useMemo(() => boardCropOf(root, size), [root, size])
  const strict = validationMode === 'sgf_marks'

  const [path, setPath] = useState(() => (root ? collectChain(root) : []))
  const [busy, setBusy] = useState(false)
  const [flash, setFlash] = useState(null)
  const [lastResult, setLastResult] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [done, setDone] = useState(false)
  const [freeBoard, setFreeBoard] = useState(null)
  const [freeLastMove, setFreeLastMove] = useState(null)
  const [freeTurn, setFreeTurn] = useState(null)
  // Serbest mod, bulmaca ilk açıldığında kilitli — kullanıcı bir kez doğru
  // çözene kadar. Sonrasında "Baştan başla" ile sıfırlansa bile açık kalır.
  const [hasSolvedOnce, setHasSolvedOnce] = useState(false)
  const timeouts = useRef([])
  // playChain runs a synchronous recursive sequence across setTimeouts; a
  // ref (rather than the `path` state closure, which goes stale between
  // steps) is what we advance for each step's before/after stone counts.
  const pathRef = useRef(path)
  // Board-state history for the current free-play session, used to enforce
  // the ko rule (a move may not recreate a position that already occurred).
  const freeHistoryRef = useRef([])

  useEffect(() => {
    timeouts.current.forEach(clearTimeout)
    timeouts.current = []
    pathRef.current = root ? collectChain(root) : []
    setPath(pathRef.current)
    setBusy(false)
    setFlash(null)
    setLastResult(null)
    setFeedback(null)
    setDone(false)
    setFreeBoard(null)
    setFreeLastMove(null)
    setFreeTurn(null)
    setHasSolvedOnce(false)
    freeHistoryRef.current = []
    return () => timeouts.current.forEach(clearTimeout)
  }, [root])

  const current = path[path.length - 1]
  const { board: pathBoard, lastMove: pathLastMove } = useMemo(() => replayPath(path, size), [path, size])
  const board = freeBoard ?? pathBoard
  const lastMove = freeLastMove ?? pathLastMove
  const labels = useMemo(() => labelsOf(current), [current])
  const pathToPlay = useMemo(() => nextColorOf(current), [current])
  const toPlay = freeBoard ? freeTurn : pathToPlay
  const canInteract = !busy && (done || (current?.children?.length ?? 0) > 0)

  function schedule(fn, delay) {
    const id = setTimeout(fn, delay)
    timeouts.current.push(id)
  }

  function playChain(chain, index) {
    if (index >= chain.length) {
      setBusy(false)
      const finalNode = chain[chain.length - 1]
      setFeedback(commentOf(finalNode))
      if (!finalNode.children || finalNode.children.length === 0) {
        setDone(true)
        setHasSolvedOnce(true)
        if (strict) {
          setLastResult('correct')
          schedule(() => setLastResult(null), 1200)
        }
        const finalBoard = replayPath(pathRef.current, size).board
        freeHistoryRef.current = []
        setFreeBoard(finalBoard.map((row) => [...row]))
        const lastColor = finalNode.data?.B ? BLACK : finalNode.data?.W ? WHITE : null
        setFreeTurn(lastColor === BLACK ? WHITE : BLACK)
        onSolved?.()
      }
      return
    }
    const node = chain[index]
    const hasMove = Boolean(node.data?.B || node.data?.W)
    if (hasMove) {
      const before = countStones(replayPath(pathRef.current, size).board)
      const after = countStones(replayPath([...pathRef.current, node], size).board)
      playStoneSound({ capture: after < before + 1 })
    }
    pathRef.current = [...pathRef.current, node]
    setPath(pathRef.current)
    const c = commentOf(node)
    if (c) setFeedback(c)
    schedule(() => playChain(chain, index + 1), STEP_DELAY_MS)
  }

  // Bulmaca çözüldükten sonra veya serbest moda geçince tahtayı istediği gibi
  // oynayabilir. Dolu bir noktaya, intihar hamlesine (esir almıyorsa) veya ko
  // kuralını ihlal eden bir hamleye tıklamak oyun kuralları gereği zaten
  // mümkün değil — üçü de sessizce yok sayılır, "yanlış hamle" sayılmaz.
  function handleFreeClick(x, y) {
    if (!freeBoard) return
    const result = attemptMove(freeBoard, x, y, freeTurn, size, freeHistoryRef.current)
    if (!result.ok) return
    freeHistoryRef.current = [...freeHistoryRef.current, JSON.stringify(freeBoard)]
    playStoneSound({ capture: result.captured })
    setFreeBoard(result.board)
    setFreeLastMove({ x, y })
    setFreeTurn(freeTurn === BLACK ? WHITE : BLACK)
  }

  function handlePointClick(x, y) {
    if (!canInteract) return
    if (done) {
      handleFreeClick(x, y)
      return
    }
    if (board[y]?.[x]) return
    const coord = xyToCoord(x, y)
    const match = current.children.find((child) => moveCoordOf(child) === coord)

    if (!match) {
      if (strict) {
        setFlash({ x, y, type: 'wrong', color: toPlay })
        setLastResult('wrong')
        onWrongMove?.()
        schedule(() => setFlash(null), 900)
        schedule(() => setLastResult(null), 1200)
      } else {
        setFeedback('Bu nokta için hazırlanmış bir devam yok — işaretli noktalardan birini dene.')
      }
      return
    }

    if (strict && match.data.BM) {
      setFlash({ x, y, type: 'wrong', color: toPlay })
      setLastResult('wrong')
      onWrongMove?.()
      schedule(() => setFlash(null), 900)
      schedule(() => setLastResult(null), 1200)
      return
    }

    setLastResult(null)
    setBusy(true)
    const chain = collectChain(match)
    playChain(chain, 0)
  }

  // "Baştan başla" always restarts the puzzle from scratch, even if it was
  // already solved — serbest mod is a separate, deliberate choice (see
  // enterFreeMode below), not something restarting drops you into.
  function reset() {
    timeouts.current.forEach(clearTimeout)
    timeouts.current = []
    pathRef.current = root ? collectChain(root) : []
    setPath(pathRef.current)
    setBusy(false)
    setFlash(null)
    setLastResult(null)
    setFeedback(null)
    setDone(false)
    setFreeBoard(null)
    setFreeLastMove(null)
    setFreeTurn(null)
    freeHistoryRef.current = []
  }

  // Kullanıcı istediği an tetikleyebilir — bulmacayı çözmeye zorlamadan
  // tahtayı serbestçe oynamaya geçmek için.
  function enterFreeMode() {
    if (done) return
    timeouts.current.forEach(clearTimeout)
    timeouts.current = []
    setBusy(false)
    setFlash(null)
    setLastResult(null)
    const currentBoard = replayPath(pathRef.current, size).board
    freeHistoryRef.current = []
    setFreeBoard(currentBoard.map((row) => [...row]))
    setFreeLastMove(pathLastMove)
    setFreeTurn(pathToPlay)
    setDone(true)
  }

  return {
    ready: Boolean(root),
    size,
    crop,
    board,
    lastMove,
    labels,
    toPlay,
    canInteract,
    busy,
    flash,
    lastResult,
    feedback,
    done,
    hasBranches: (current?.children?.length ?? 0) > 0,
    hasSolvedOnce,
    handlePointClick,
    reset,
    enterFreeMode,
  }
}
