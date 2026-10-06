// "Joseki Sonrası" — replay helpers for the joseki diagrams in
// src/data/joseki/*.json. Each diagram is { base: {B, W}, first, moves,
// labels, marks } with SGF-style two-letter coordinates ("aa" = top
// left); a null move is a pass/tenuki. The mobile app ships the exact same
// JSON and a TypeScript port of this file (Go_Akademisi_mobil/src/lib/joseki.ts).
import hoshiKogeima from '../data/joseki/hoshi-kogeima.json'
import hoshiIkkenTobi from '../data/joseki/hoshi-ikken-tobi.json'
import hoshiIkkenBasami from '../data/joseki/hoshi-ikken-basami.json'
import hoshiIkkenBasamiHigh from '../data/joseki/hoshi-ikken-basami-high.json'
import hoshiNikenBasami from '../data/joseki/hoshi-niken-basami.json'
import hoshiNikenBasamiHigh from '../data/joseki/hoshi-niken-basami-high.json'
import hoshiKosumiTsuke from '../data/joseki/hoshi-kosumi-tsuke.json'
import hoshiOgeima from '../data/joseki/hoshi-ogeima.json'
import hoshiTsukeOsae from '../data/joseki/hoshi-tsuke-osae.json'
import hoshiNiroKeima from '../data/joseki/hoshi-niro-keima.json'
import hoshiTenuki from '../data/joseki/hoshi-tenuki.json'
import hoshiSansan from '../data/joseki/hoshi-sansan.json'
import hoshiAlttanYapisma from '../data/joseki/hoshi-alttan-yapisma.json'
import komokuKeimaKakariKeima from '../data/joseki/komoku-keima-kakari-keima.json'
import komokuKeimaKakariKosumi from '../data/joseki/komoku-keima-kakari-kosumi.json'
import komokuKeimaKakariKosumiTsuke from '../data/joseki/komoku-keima-kakari-kosumi-tsuke.json'
import komokuKeimaKakariBastirma from '../data/joseki/komoku-keima-kakari-bastirma.json'
import komokuKeimaKakariPincer from '../data/joseki/komoku-keima-kakari-pincer.json'
import komokuKeimaKakariYuksekPincer from '../data/joseki/komoku-keima-kakari-yuksek-pincer.json'
import komokuKeimaKakariIkiBoslukluPincer from '../data/joseki/komoku-keima-kakari-iki-bosluklu-pincer.json'
import komokuYuksekKakariAlttanYapisma from '../data/joseki/komoku-yuksek-kakari-alttan-yapisma.json'
import komokuYuksekKakariKosumi from '../data/joseki/komoku-yuksek-kakari-kosumi.json'
import komokuYuksekKakariKeima from '../data/joseki/komoku-yuksek-kakari-keima.json'
import komokuYuksekKakariZiplama from '../data/joseki/komoku-yuksek-kakari-ziplama.json'
import komokuYuksekKakariPincer from '../data/joseki/komoku-yuksek-kakari-pincer.json'
import komokuYuksekKakariYuksekPincer from '../data/joseki/komoku-yuksek-kakari-yuksek-pincer.json'
import komokuYuksekKakariIkiBoslukluPincer from '../data/joseki/komoku-yuksek-kakari-iki-bosluklu-pincer.json'
import komokuYuksekKakariIkiBoslukluYuksekPincer from '../data/joseki/komoku-yuksek-kakari-iki-bosluklu-yuksek-pincer.json'
import komokuBuyukKeimaKakari from '../data/joseki/komoku-buyuk-keima-kakari.json'
import komokuIkiBoslukluYuksekKakari from '../data/joseki/komoku-iki-bosluklu-yuksek-kakari.json'
import komokuYandanYapisma from '../data/joseki/komoku-yandan-yapisma.json'
import komokuKeimaKapatma from '../data/joseki/komoku-keima-kapatma.json'
import komokuBirBoslukluKapatma from '../data/joseki/komoku-bir-bosluklu-kapatma.json'
import komokuBuyukKeimaKapatma from '../data/joseki/komoku-buyuk-keima-kapatma.json'
import komokuIkiBoslukluKapatma from '../data/joseki/komoku-iki-bosluklu-kapatma.json'
import ucuc from '../data/joseki/ucuc.json'
import mokuhazushiUcucKakari from '../data/joseki/mokuhazushi-ucuc-kakari.json'
import mokuhazushiKomokuKakari from '../data/joseki/mokuhazushi-komoku-kakari.json'
import mokuhazushiDiger from '../data/joseki/mokuhazushi-diger.json'
import takamoku from '../data/joseki/takamoku.json'
import { playMove } from './sgfEngine'
import { completeLesson, fetchCompletedLessonIds } from './workshopProgress'

export const JOSEKI_LIST = [
  hoshiKogeima,
  hoshiIkkenTobi,
  hoshiIkkenBasami,
  hoshiIkkenBasamiHigh,
  hoshiNikenBasami,
  hoshiNikenBasamiHigh,
  hoshiKosumiTsuke,
  hoshiOgeima,
  hoshiTsukeOsae,
  hoshiNiroKeima,
  hoshiTenuki,
  hoshiSansan,
  hoshiAlttanYapisma,
  komokuKeimaKakariKeima,
  komokuKeimaKakariKosumi,
  komokuKeimaKakariKosumiTsuke,
  komokuKeimaKakariBastirma,
  komokuKeimaKakariPincer,
  komokuKeimaKakariYuksekPincer,
  komokuKeimaKakariIkiBoslukluPincer,
  komokuYuksekKakariAlttanYapisma,
  komokuYuksekKakariKosumi,
  komokuYuksekKakariKeima,
  komokuYuksekKakariZiplama,
  komokuYuksekKakariPincer,
  komokuYuksekKakariYuksekPincer,
  komokuYuksekKakariIkiBoslukluPincer,
  komokuYuksekKakariIkiBoslukluYuksekPincer,
  komokuBuyukKeimaKakari,
  komokuIkiBoslukluYuksekKakari,
  komokuYandanYapisma,
  komokuKeimaKapatma,
  komokuBirBoslukluKapatma,
  komokuBuyukKeimaKapatma,
  komokuIkiBoslukluKapatma,
  ucuc,
  mokuhazushiUcucKakari,
  mokuhazushiKomokuKakari,
  mokuhazushiDiger,
  takamoku,
]

export function josekiBySlug(slug) {
  return JOSEKI_LIST.find((j) => j.slug === slug) ?? null
}

// ---- "Tüm josekiler": every joseki on one board, Josekipedia style ----
// The board starts empty. Each joseki's starting position (e.g. black hoshi +
// white keima kakari, or black komoku alone for the enclosures) is reached by
// playing its stones from the empty board, black first and alternating, with a
// tenuki (pass) wherever one side has no stone left to play. Then its move tree
// is merged in. The same move by the same colour from the same position becomes
// one node, so josekis that share a start (all hoshi + keima kakari answers, or
// the E17 kosumi-tsuke line inside the ōgeima tree) grow from the same point.
// The result has the same shape as a single joseki, so JosekiExplorer shows it.
export const ALL_JOSEKI_ROOT = 'TUM'
let allJosekiCache = null

export function allJoseki() {
  if (allJosekiCache) return allJosekiCache
  const T = [{ p: null, m: null, c: null, t: 'B', d: ALL_JOSEKI_ROOT, ch: [] }]
  const nodes = {
    [ALL_JOSEKI_ROOT]: {
      id: ALL_JOSEKI_ROOT,
      kind: 'position',
      title: 'Tüm Josekiler',
      rating: null,
      text: 'Boş köşeden başla. Tahtadaki harfler oynanabilecek hamlelerdir: önce köşe noktası (hoshi, komoku, 3-3, mokuhazushi ya da takamoku), sonra rakibin yaklaşması ve cevaplar. Bir harfe tıkla; her josekinin bütün varyasyonlarını aynı tahtada incele.',
      diagram: { base: { B: '', W: '' }, first: 'B', moves: [], labels: {}, marks: [] },
    },
  }
  const paths = { [ALL_JOSEKI_ROOT]: [0] }
  const isMove = (n) => n.m && n.m !== 'pass' && n.m !== 'setup'
  const mergeable = (n) => isMove(n) || n.m === 'pass'
  const lettered = new Set([0]) // prefix and start nodes: all their moves get letters

  function child(parent, m, c) {
    const same = T[parent].ch.find((k) => T[k].m === m && T[k].c === c)
    if (same !== undefined) return same
    const id = T.length
    T.push({ p: parent, m, c, t: c === 'B' ? 'W' : 'B', d: ALL_JOSEKI_ROOT, ch: [] })
    T[parent].ch.push(id)
    return id
  }

  for (const j of JOSEKI_LIST) {
    const src = j.tree.nodes
    const base = j.nodes[j.root].diagram.base
    const stones = { B: [], W: [] }
    for (const c of ['B', 'W']) for (let i = 0; i + 1 < base[c].length; i += 2) stones[c].push(base[c].slice(i, i + 2))
    let at = 0
    let color = 'B'
    while (stones.B.length || stones.W.length || color !== src[0].t) {
      at = child(at, stones[color].shift() ?? 'pass', color)
      lettered.add(at)
      color = color === 'B' ? 'W' : 'B'
    }
    const map = new Map([[0, at]])
    // Parents first: walk the tree breadth-first from its root.
    const queue = [...src[0].ch]
    while (queue.length) {
      const i = queue.shift()
      const n = src[i]
      const parent = map.get(n.p)
      const same = mergeable(n) ? T[parent].ch.find((c) => T[c].m === n.m && T[c].c === n.c) : undefined
      if (same !== undefined) {
        map.set(i, same)
      } else {
        const id = T.length
        T.push({ ...n, p: parent, ch: [] })
        T[parent].ch.push(id)
        map.set(i, id)
      }
      queue.push(...n.ch)
    }
    Object.assign(nodes, j.nodes)
    for (const [code, path] of Object.entries(j.tree.paths)) paths[code] = path.map((i) => map.get(i))
  }

  // Letters: every move from the empty board up to each joseki's start gets
  // A, B, C… in catalog order; other branch points that gained moves in a
  // merge get the next free letters.
  const LETTERS = 'ABCDEFGHJKLMNOPQRSTUVWXYZ'
  for (const i of lettered) T[i].ch.filter((c) => isMove(T[c])).forEach((c, k) => (T[c] = { ...T[c], l: LETTERS[k] }))
  for (let i = 1; i < T.length; i++) {
    if (lettered.has(i)) continue
    const kids = T[i].ch.filter((c) => isMove(T[c]))
    if (kids.length < 2 || kids.every((c) => T[c].l)) continue
    const used = new Set(kids.map((c) => T[c].l).filter(Boolean))
    const free = [...LETTERS].filter((l) => !used.has(l))
    for (const c of kids) if (!T[c].l) T[c] = { ...T[c], l: free.shift() }
  }

  allJosekiCache = { slug: 'tum-josekiler', title: 'Tüm Josekiler', root: ALL_JOSEKI_ROOT, start: 0, size: JOSEKI_LIST[0].size, nodes, exercises: [], tree: { nodes: T, paths } }
  return allJosekiCache
}

export const RATING_META = {
  best: { label: 'En iyi', className: 'bg-success/15 text-success' },
  ok: { label: 'Oynanabilir', className: 'bg-accent-blue/15 text-accent-blue' },
  situational: { label: 'Duruma bağlı', className: 'bg-token/15 text-token' },
  bad: { label: 'Hatalı', className: 'bg-heart/15 text-heart' },
}

export function decode(coord) {
  return { x: coord.charCodeAt(0) - 97, y: coord.charCodeAt(1) - 97 }
}

function decodeList(s) {
  const out = []
  for (let i = 0; i + 1 < s.length; i += 2) out.push(decode(s.slice(i, i + 2)))
  return out
}

export function otherColor(c) {
  return c === 'B' ? 'W' : 'B'
}

export function moveColor(diagram, index) {
  return index % 2 === 0 ? diagram.first : otherColor(diagram.first)
}

// Who is to play once the whole diagram has been played out. A diagram with
// no numbered moves is always a "white tenuki'd, black to play" position.
export function colorAfter(diagram) {
  const n = diagram.moves.length
  return n ? otherColor(moveColor(diagram, n - 1)) : 'B'
}

// Board after the first `step` numbered moves, plus the move number shown on
// every stone that is still standing (like the printed diagram).
export function boardAt(diagram, step, size = 19) {
  const board = Array.from({ length: size }, () => Array(size).fill(null))
  for (const { x, y } of decodeList(diagram.base.B)) board[y][x] = 'B'
  for (const { x, y } of decodeList(diagram.base.W)) board[y][x] = 'W'
  const numbers = new Map()
  let lastMove = null
  for (let i = 0; i < step && i < diagram.moves.length; i++) {
    const m = diagram.moves[i]
    if (!m) {
      lastMove = null
      continue
    }
    const { x, y } = decode(m)
    playMove(board, x, y, moveColor(diagram, i), size)
    numbers.set(`${x},${y}`, i + 1)
    lastMove = { x, y }
  }
  for (const key of [...numbers.keys()]) {
    const [x, y] = key.split(',').map(Number)
    if (!board[y][x]) numbers.delete(key)
  }
  return { board, numbers, lastMove }
}

// Tiny vector glyph of a joseki for the index tree: just the stones of its
// starting position in a small window around them. Black stones and the key
// move (the root diagram's last move) are marked so each node shows its shape.
export function josekiGlyph(joseki) {
  const d = joseki.nodes[joseki.root].diagram
  const { board, lastMove } = boardAt(d, d.moves.length, joseki.size)
  const pts = []
  for (let y = 0; y < joseki.size; y++) for (let x = 0; x < joseki.size; x++) if (board[y][x]) pts.push({ x, y, c: board[y][x] })
  const xs = pts.map((p) => p.x)
  const ys = pts.map((p) => p.y)
  const span = Math.max(5, Math.max(...xs) - Math.min(...xs) + 3, Math.max(...ys) - Math.min(...ys) + 3)
  const minX = Math.round((Math.min(...xs) + Math.max(...xs)) / 2 - (span - 1) / 2)
  const minY = Math.round((Math.min(...ys) + Math.max(...ys)) / 2 - (span - 1) / 2)
  return {
    span,
    stones: pts.map((p) => ({ x: p.x - minX, y: p.y - minY, c: p.c, key: !!lastMove && lastMove.x === p.x && lastMove.y === p.y })),
  }
}

// GoBoard labels for a given board state: move numbers on stones, the ×
// markers, and (when `showLetters`) the A/B/C option letters.
export function labelsFor(diagram, board, numbers, { showLetters = true, showNumbers = true } = {}) {
  const labels = []
  const ink = (x, y) => (board[y][x] === 'B' ? '#fff' : '#000')
  if (showNumbers) {
    for (const [key, n] of numbers) {
      const [x, y] = key.split(',').map(Number)
      labels.push({ x, y, text: String(n), fill: ink(x, y), small: n >= 10 })
    }
  }
  for (const m of diagram.marks) {
    const { x, y } = decode(m)
    labels.push({ x, y, text: '×', fill: ink(x, y) })
  }
  if (showLetters) {
    for (const [letter, c] of Object.entries(diagram.labels)) {
      const { x, y } = decode(c)
      if (showNumbers && numbers.has(`${x},${y}`)) continue
      labels.push({ x, y, text: letter, fill: ink(x, y), letter: true })
    }
  }
  return labels
}

export function moveCaption(diagram, index) {
  const color = moveColor(diagram, index) === 'B' ? 'Siyah' : 'Beyaz'
  return diagram.moves[index] ? `${color} ${index + 1}` : `${color} ${index + 1}: tenuki (başka yere oynar)`
}

// ---- merged move tree (joseki.tree) used by the learn view ----
// tree.nodes[i] = { p: parent, m: 'dq' | 'pass' | 'setup' | null, c: colour of
// the move, t: side to play after it, d: diagram code that introduced it,
// ch: children, l: branch letter, s: extra context stones for 'setup' }.
// tree.paths[code] = node ids of that diagram's line (anchor first).

export function treeChain(joseki, id) {
  const T = joseki.tree.nodes
  const chain = []
  for (let cur = id; cur !== null && cur !== undefined; cur = T[cur].p) chain.unshift(cur)
  return chain
}

// Board at tree node `id`; numbers are counted from the start of `line`
// (the diagram being read), exactly like the printed diagram.
export function treeBoardAt(joseki, id, line) {
  const T = joseki.tree.nodes
  const size = joseki.size
  const rootD = joseki.nodes[joseki.root].diagram
  const board = Array.from({ length: size }, () => Array(size).fill(null))
  for (const { x, y } of decodeList(rootD.base.B)) board[y][x] = 'B'
  for (const { x, y } of decodeList(rootD.base.W)) board[y][x] = 'W'
  const path = joseki.tree.paths[line] ?? []
  const numberOf = new Map(path.map((n, i) => [n, i]))
  const numbers = new Map()
  let lastMove = null
  for (const n of treeChain(joseki, id).slice(1)) {
    const node = T[n]
    if (node.m === 'setup') {
      for (const { x, y } of decodeList(node.s.B)) board[y][x] = 'B'
      for (const { x, y } of decodeList(node.s.W)) board[y][x] = 'W'
      lastMove = null
    } else if (node.m === 'pass') {
      lastMove = null
    } else {
      const { x, y } = decode(node.m)
      playMove(board, x, y, node.c, size)
      if (numberOf.get(n) > 0) numbers.set(`${x},${y}`, numberOf.get(n))
      lastMove = { x, y }
    }
  }
  for (const key of [...numbers.keys()]) {
    const [x, y] = key.split(',').map(Number)
    if (!board[y][x]) numbers.delete(key)
  }
  return { board, numbers, lastMove }
}

// Ancestor chain root → node, for breadcrumbs.
export function pathTo(joseki, id) {
  const path = []
  let cur = joseki.nodes[id]
  while (cur) {
    path.unshift(cur)
    cur = cur.parent ? joseki.nodes[cur.parent] : null
  }
  return path
}

// Local exercise progress — same key shape as the mobile app's AsyncStorage.
const PROGRESS_KEY = (slug) => `agora-joseki-progress:${slug}`

export function loadJosekiProgress(slug) {
  try {
    // Only ids that still exist — exercises can be removed between releases.
    const valid = new Set(josekiBySlug(slug)?.exercises.map((e) => e.id))
    return new Set(JSON.parse(localStorage.getItem(PROGRESS_KEY(slug)) || '[]').filter((id) => valid.has(id)))
  } catch {
    return new Set()
  }
}

export function saveJosekiProgress(slug, done) {
  try {
    localStorage.setItem(PROGRESS_KEY(slug), JSON.stringify([...done]))
  } catch {
    // storage unavailable (private mode) — progress just isn't remembered
  }
}

// ---- XP: every exercise solved for the first time is recorded like a
// puzzle (atolye_lesson_progress row + profiles.xp), so it shows up on the
// profile's XP bar/rank and the leaderboard, and syncs across devices.
export const JOSEKI_XP = { sequence: 10 }
const JOSEKI_COURSE = { slug: 'joseki-sonrasi', title: 'Joseki Sonrası', section: null }
export const lessonIdOf = (slug, exId) => `joseki:${slug}:${exId}`

// Lesson ids of a joseki's exercises — the Atölyeler joseki boxes use the same
// ids, so an exercise solved in either place counts in both.
export function josekiLessonIds(slug) {
  return (josekiBySlug(slug)?.exercises ?? []).map((e) => lessonIdOf(slug, e.id))
}

// Local progress merged with what this account has already solved on any device.
export async function loadJosekiProgressMerged(slug, userId) {
  const local = loadJosekiProgress(slug)
  if (!userId) return local
  const prefix = lessonIdOf(slug, '')
  const valid = new Set(josekiBySlug(slug)?.exercises.map((e) => e.id))
  const remote = [...(await fetchCompletedLessonIds(userId))]
    .filter((id) => String(id).startsWith(prefix))
    .map((id) => String(id).slice(prefix.length))
    .filter((id) => valid.has(id))
  return new Set([...local, ...remote])
}

export async function awardJosekiExercise({ user, profile, setProfile, joseki, ex }) {
  const node = joseki.nodes[ex.node]
  const result = await completeLesson({
    user,
    profile,
    setProfile,
    lesson: { id: lessonIdOf(joseki.slug, ex.id), title: `${joseki.title} · ${node.title}` },
    course: JOSEKI_COURSE,
    xpOverride: JOSEKI_XP[ex.type] ?? JOSEKI_XP.sequence,
    tokensOverride: 0,
  })
  return result.xpGained
}
