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

function playMove(board, x, y, color, size) {
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
export function collectChain(node) {
  const chain = [node]
  let current = node
  while (current.children?.length === 1) {
    current = current.children[0]
    chain.push(current)
  }
  return chain
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
