import { useEffect, useMemo, useRef, useState } from 'react'
import {
  parseSgf,
  boardSizeOf,
  replayPath,
  collectChain,
  labelsOf,
  nextColorOf,
  moveCoordOf,
  commentOf,
  xyToCoord,
  coordToXY,
  playMove,
  BLACK,
  WHITE,
} from '../lib/sgfEngine'
import { playStoneSound } from '../lib/stoneSound'

function countStones(board) {
  let n = 0
  for (const row of board) for (const cell of row) if (cell) n += 1
  return n
}

const STEP_DELAY_MS = 550

// Drives one interactive SGF position: setup replay, branch-matching on
// click, auto-playing forced single-line continuations, and (in
// 'sgf_marks' mode) TE/BM-based correct/wrong judging. In any other
// validation mode it behaves as free exploration of the prepared branches,
// surfacing each node's comment as feedback instead of judging right/wrong.
export function useSgfPuzzle(sgfRaw, validationMode, { onWrongMove, onSolved } = {}) {
  const root = useMemo(() => parseSgf(sgfRaw), [sgfRaw])
  const size = useMemo(() => boardSizeOf(root), [root])
  const strict = validationMode === 'sgf_marks'

  const [path, setPath] = useState(() => (root ? collectChain(root) : []))
  const [busy, setBusy] = useState(false)
  const [flash, setFlash] = useState(null)
  const [lastResult, setLastResult] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [done, setDone] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [freeBoard, setFreeBoard] = useState(null)
  const [freeLastMove, setFreeLastMove] = useState(null)
  const [freeTurn, setFreeTurn] = useState(null)
  const timeouts = useRef([])
  // playChain runs a synchronous recursive sequence across setTimeouts; a
  // ref (rather than the `path` state closure, which goes stale between
  // steps) is what we advance for each step's before/after stone counts.
  const pathRef = useRef(path)

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
    setShowHint(false)
    setFreeBoard(null)
    setFreeLastMove(null)
    setFreeTurn(null)
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
  const branchPoints = useMemo(
    () => (current?.children ?? []).map((c) => coordToXY(moveCoordOf(c))).filter(Boolean),
    [current],
  )

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
        const finalBoard = replayPath(pathRef.current, size).board
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

  // Bulmaca çözüldükten sonra serbest oynama — tahtayı istediği gibi doldurmaya devam edebilir.
  function handleFreeClick(x, y) {
    if (!freeBoard || freeBoard[y][x] !== null) return
    const next = freeBoard.map((row) => [...row])
    const before = countStones(next)
    playMove(next, x, y, freeTurn, size)
    const after = countStones(next)
    playStoneSound({ capture: after < before + 1 })
    setFreeBoard(next)
    setFreeLastMove({ x, y })
    setFreeTurn(freeTurn === BLACK ? WHITE : BLACK)
  }

  function handlePointClick(x, y) {
    if (!canInteract) return
    if (done) {
      handleFreeClick(x, y)
      return
    }
    const coord = xyToCoord(x, y)
    const match = current.children.find((child) => moveCoordOf(child) === coord)

    if (!match) {
      if (strict) {
        setFlash({ x, y, type: 'wrong' })
        setLastResult('wrong')
        onWrongMove?.()
        schedule(() => setFlash(null), 700)
      } else {
        setFeedback('Bu nokta için hazırlanmış bir devam yok — işaretli noktalardan birini dene.')
      }
      return
    }

    if (strict && match.data.BM) {
      setFlash({ x, y, type: 'wrong' })
      setLastResult('wrong')
      onWrongMove?.()
      schedule(() => setFlash(null), 700)
      return
    }

    if (strict && match.data.TE) {
      setLastResult('correct')
      schedule(() => setLastResult(null), 1200)
    } else {
      setLastResult(null)
    }

    setBusy(true)
    const chain = collectChain(match)
    playChain(chain, 0)
  }

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
    setShowHint(false)
    setFreeBoard(null)
    setFreeLastMove(null)
    setFreeTurn(null)
  }

  function hint() {
    setShowHint(true)
    schedule(() => setShowHint(false), 2200)
  }

  return {
    ready: Boolean(root),
    size,
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
    hintPoints: showHint ? branchPoints : [],
    handlePointClick,
    reset,
    hint,
  }
}
