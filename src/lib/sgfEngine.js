import { parse } from '@sabaki/sgf'

const BLACK = 'B'
const WHITE = 'W'

export function coordToXY(coord) {
  if (!coord || coord.length < 2) return null
  const x = coord.charCodeAt(0) - 97
  const y = coord.charCodeAt(1) - 97
  return { x, y }
}

export function xyToCoord(x, y) {
  return String.fromCharCode(97 + x) + String.fromCharCode(97 + y)
}

function emptyBoard(size) {
  return Array.from({ length: size }, () => Array(size).fill(null))
}

function neighbors(x, y, size) {
  return [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]].filter(([nx, ny]) => nx >= 0 && ny >= 0 && nx < size && ny < size)
}

function getGroup(board, x, y, size) {
  const color = board[y][x]
  const seen = new Set([`${x},${y}`])
  const stack = [[x, y]]
  const group = [[x, y]]
  while (stack.length) {
    const [cx, cy] = stack.pop()
    for (const [nx, ny] of neighbors(cx, cy, size)) {
      const key = `${nx},${ny}`
      if (seen.has(key)) continue
      if (board[ny][nx] === color) {
        seen.add(key)
        stack.push([nx, ny])
        group.push([nx, ny])
      }
    }
  }
  return group
}

function groupLiberties(board, group, size) {
  const libs = new Set()
  for (const [x, y] of group) {
    for (const [nx, ny] of neighbors(x, y, size)) {
      if (board[ny][nx] === null) libs.add(`${nx},${ny}`)
    }
  }
  return libs.size
}

export function playMove(board, x, y, color, size) {
  board[y][x] = color
  const opponent = color === BLACK ? WHITE : BLACK
  for (const [nx, ny] of neighbors(x, y, size)) {
    if (board[ny][nx] === opponent) {
      const group = getGroup(board, nx, ny, size)
      if (groupLiberties(board, group, size) === 0) {
        for (const [gx, gy] of group) board[gy][gx] = null
      }
    }
  }
  const ownGroup = getGroup(board, x, y, size)
  if (groupLiberties(board, ownGroup, size) === 0) {
    for (const [gx, gy] of ownGroup) board[gy][gx] = null
  }
}

// Legality-checked move for free play: unlike playMove (used for trusted SGF
// replay, which always succeeds), this rejects occupied points, suicide
// (0 liberties and no capture), and ko (repeats a prior board state) instead
// of silently placing then erasing the stone.
export function attemptMove(board, x, y, color, size, history = []) {
  if (board[y][x] !== null) return { ok: false, reason: 'occupied' }

  const next = board.map((row) => [...row])
  next[y][x] = color
  const opponent = color === BLACK ? WHITE : BLACK
  let captured = false
  for (const [nx, ny] of neighbors(x, y, size)) {
    if (next[ny][nx] === opponent) {
      const group = getGroup(next, nx, ny, size)
      if (groupLiberties(next, group, size) === 0) {
        for (const [gx, gy] of group) next[gy][gx] = null
        captured = true
      }
    }
  }

  const ownGroup = getGroup(next, x, y, size)
  if (groupLiberties(next, ownGroup, size) === 0) {
    return { ok: false, reason: 'suicide' }
  }

  const snapshot = JSON.stringify(next)
  if (history.includes(snapshot)) {
    return { ok: false, reason: 'ko' }
  }

  return { ok: true, board: next, captured }
}

// Parses an SGF string and returns the first game tree's root node, or null.
export function parseSgf(sgfRaw) {
  if (!sgfRaw) return null
  try {
    const roots = parse(sgfRaw)
    return roots?.[0] ?? null
  } catch {
    return null
  }
}

export function boardSizeOf(root) {
  const sz = root?.data?.SZ?.[0]
  const n = sz ? parseInt(sz, 10) : 19
  return Number.isFinite(n) && n > 0 ? n : 19
}

// Replays a path of nodes (root-first) into a board grid, applying
// AB/AW/AE setup and B/W moves (with captures) in order.
export function replayPath(path, size) {
  const board = emptyBoard(size)
  let lastMove = null
  for (const node of path) {
    const data = node.data || {}
    for (const coord of data.AB || []) {
      const p = coordToXY(coord)
      if (p) board[p.y][p.x] = BLACK
    }
    for (const coord of data.AW || []) {
      const p = coordToXY(coord)
      if (p) board[p.y][p.x] = WHITE
    }
    for (const coord of data.AE || []) {
      const p = coordToXY(coord)
      if (p) board[p.y][p.x] = null
    }
    if (data.B?.[0]) {
      const p = coordToXY(data.B[0])
      if (p) {
        playMove(board, p.x, p.y, BLACK, size)
        lastMove = p
      }
    }
    if (data.W?.[0]) {
      const p = coordToXY(data.W[0])
      if (p) {
        playMove(board, p.x, p.y, WHITE, size)
        lastMove = p
      }
    }
  }
  return { board, lastMove }
}

// Walks forward from `node` through single-child chains, collecting each
// node passed through, and stops at a node with 0 or >1 children.
//
// A lone Black continuation is never auto-played, even when it's the only
// child: every puzzle in this app has Black as the solver, so a solitary
// Black child is the solver's own next move, not a forced reply — without
// this check, a puzzle authored as one straight SGF line (no alternative/
// wrong branches, e.g. a move sequence lifted straight from a game record)
// would fast-forward through its entire solution on load instead of
// stopping for input at each of the solver's moves.
export function collectChain(node) {
  const chain = [node]
  let current = node
  while (current.children?.length === 1) {
    const next = current.children[0]
    if (next.data?.B) break
    current = next
    chain.push(current)
  }
  return chain
}

// Mirrors the mobile app's board-cropping algorithm (Go_Akademisi_mobil's
// GoBoard.tsx `crop`): most tsumego diagrams cluster in one corner or side
// of the board, so showing the full 19x19 grid wastes space and makes the
// stones hard to read. Considers every point placed anywhere in the whole
// tree — setup stones plus every branch's moves, not just the currently
// played path — so the view never shifts or resizes as the puzzle is
// played through.
export function boardCropOf(root, size) {
  const MARGIN_CELLS = 2
  const MIN_SPAN = 9
  const full = { minX: 0, minY: 0, span: size }
  if (!root) return full

  const pts = []
  function collect(node) {
    if (!node) return
    const data = node.data || {}
    for (const coord of data.AB || []) {
      const p = coordToXY(coord)
      if (p) pts.push(p)
    }
    for (const coord of data.AW || []) {
      const p = coordToXY(coord)
      if (p) pts.push(p)
    }
    for (const coord of data.B || []) {
      const p = coordToXY(coord)
      if (p) pts.push(p)
    }
    for (const coord of data.W || []) {
      const p = coordToXY(coord)
      if (p) pts.push(p)
    }
    for (const child of node.children || []) collect(child)
  }
  collect(root)
  if (pts.length === 0) return full

  let minX = size
  let maxX = -1
  let minY = size
  let maxY = -1
  for (const p of pts) {
    minX = Math.min(minX, p.x)
    maxX = Math.max(maxX, p.x)
    minY = Math.min(minY, p.y)
    maxY = Math.max(maxY, p.y)
  }
  const tightSpan = Math.max(maxX - minX + 1, maxY - minY + 1)
  if (tightSpan > size - 6) return full // stones already spread wide — cropping wouldn't help

  minX -= MARGIN_CELLS
  maxX += MARGIN_CELLS
  minY -= MARGIN_CELLS
  maxY += MARGIN_CELLS
  const span = Math.min(size, Math.max(maxX - minX + 1, maxY - minY + 1, MIN_SPAN))

  minX -= Math.floor((span - (maxX - minX + 1)) / 2)
  minY -= Math.floor((span - (maxY - minY + 1)) / 2)

  if (minX < 0) minX = 0
  if (minY < 0) minY = 0
  if (minX + span > size) minX = size - span
  if (minY + span > size) minY = size - span

  return { minX, minY, span }
}

export function labelsOf(node) {
  const lb = node?.data?.LB || []
  return lb
    .map((entry) => {
      const [coord, text] = entry.split(':')
      const p = coordToXY(coord)
      return p ? { ...p, text: text || '' } : null
    })
    .filter(Boolean)
}

// Which color's move the children of this node represent, if any.
export function nextColorOf(node) {
  const child = node?.children?.[0]
  if (!child) return null
  if (child.data?.B) return BLACK
  if (child.data?.W) return WHITE
  return null
}

export function moveCoordOf(node) {
  return node?.data?.B?.[0] ?? node?.data?.W?.[0] ?? null
}

export function commentOf(node) {
  return node?.data?.C?.[0] ?? null
}

export { BLACK, WHITE }
