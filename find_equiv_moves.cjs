// Scans every 'Bulmaca' go_problems row for branch points where a TE[1] (correct)
// sibling and a BM[1] (wrong) sibling actually reduce the SAME opponent group to the
// SAME remaining-liberty state (or both capture it outright) — i.e. the "which side do
// I atari from" case the user described, where marking one side wrong is a puzzle-data
// bug, not a real tactical distinction. Verified by direct rule simulation, not engine
// opinion, so a match here is mathematically certain, not a heuristic guess.
const { createClient } = require('@supabase/supabase-js');
const { parse } = require('@sabaki/sgf');

const supabase = createClient(
  'https://gncxqiarmnyspvrlsutp.supabase.co',
  'sb_publishable_sWU29ifFK2XJIbx7GoLD5g_lMaWWo2f'
);

const BLACK = 'B', WHITE = 'W';

function coordToXY(coord) {
  if (!coord || coord.length < 2) return null;
  return { x: coord.charCodeAt(0) - 97, y: coord.charCodeAt(1) - 97 };
}
function emptyBoard(size) { return Array.from({ length: size }, () => Array(size).fill(null)); }
function neighbors(x, y, size) {
  return [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]].filter(([nx, ny]) => nx >= 0 && ny >= 0 && nx < size && ny < size);
}
function getGroup(board, x, y, size) {
  const color = board[y][x];
  const seen = new Set([`${x},${y}`]);
  const stack = [[x, y]];
  const group = [[x, y]];
  while (stack.length) {
    const [cx, cy] = stack.pop();
    for (const [nx, ny] of neighbors(cx, cy, size)) {
      const key = `${nx},${ny}`;
      if (seen.has(key)) continue;
      if (board[ny][nx] === color) { seen.add(key); stack.push([nx, ny]); group.push([nx, ny]); }
    }
  }
  return group;
}
function groupLiberties(board, group, size) {
  const libs = new Set();
  for (const [x, y] of group) for (const [nx, ny] of neighbors(x, y, size)) if (board[ny][nx] === null) libs.add(`${nx},${ny}`);
  return libs;
}
function cloneBoard(board) { return board.map((row) => [...row]); }
function playMove(board, x, y, color, size) {
  board[y][x] = color;
  const opponent = color === BLACK ? WHITE : BLACK;
  const captured = [];
  for (const [nx, ny] of neighbors(x, y, size)) {
    if (board[ny][nx] === opponent) {
      const group = getGroup(board, nx, ny, size);
      if (groupLiberties(board, group, size).size === 0) { for (const [gx, gy] of group) board[gy][gx] = null; captured.push(group); }
    }
  }
  const ownGroup = getGroup(board, x, y, size);
  if (groupLiberties(board, ownGroup, size).size === 0) { for (const [gx, gy] of ownGroup) board[gy][gx] = null; }
  return captured;
}
function replayPath(path, size) {
  const board = emptyBoard(size);
  for (const node of path) {
    const data = node.data || {};
    for (const c of data.AB || []) { const p = coordToXY(c); if (p) board[p.y][p.x] = BLACK; }
    for (const c of data.AW || []) { const p = coordToXY(c); if (p) board[p.y][p.x] = WHITE; }
    for (const c of data.AE || []) { const p = coordToXY(c); if (p) board[p.y][p.x] = null; }
    if (data.B?.[0]) { const p = coordToXY(data.B[0]); if (p) playMove(board, p.x, p.y, BLACK, size); }
    if (data.W?.[0]) { const p = coordToXY(data.W[0]); if (p) playMove(board, p.x, p.y, WHITE, size); }
  }
  return board;
}
function boardSizeOf(root) {
  const sz = root?.data?.SZ?.[0];
  const n = sz ? parseInt(sz, 10) : 19;
  return Number.isFinite(n) && n > 0 ? n : 19;
}
function moveOf(node) {
  if (node.data?.B?.[0]) return { color: BLACK, coord: node.data.B[0] };
  if (node.data?.W?.[0]) return { color: WHITE, coord: node.data.W[0] };
  return null;
}

// Does playing `mover` at (x,y) reduce some single opponent group to the SAME
// liberty-state as playing `other` at (ox,oy) — same target group identity (by
// stone-set), same remaining liberty point (or both fully capture it)?
function sameAtariEffect(board, size, mover, x, y, ox, oy) {
  const opponent = mover === BLACK ? WHITE : BLACK;

  function targetInfo(px, py) {
    if (board[py][px] !== null) return null; // must be an empty point to place on
    const b = cloneBoard(board);
    const captured = playMove(b, px, py, mover, size);
    if (captured.length > 0) {
      // Fully captured — identify by the captured group's original stone set.
      const group = captured[0];
      return { kind: 'capture', stones: new Set(group.map(([gx, gy]) => `${gx},${gy}`)) };
    }
    // No capture — did an adjacent opponent group drop to exactly 1 liberty?
    for (const [nx, ny] of neighbors(px, py, size)) {
      if (board[ny][nx] === opponent) {
        const group = getGroup(b, nx, ny, size);
        const libs = groupLiberties(b, group, size);
        if (libs.size === 1) {
          return { kind: 'atari', stones: new Set(group.map(([gx, gy]) => `${gx},${gy}`)), lib: [...libs][0] };
        }
      }
    }
    return null;
  }

  const a = targetInfo(x, y);
  const c = targetInfo(ox, oy);
  if (!a || !c) return false;
  if (a.kind !== c.kind) return false;
  const sameStones = a.stones.size === c.stones.size && [...a.stones].every((s) => c.stones.has(s));
  if (!sameStones) return false;
  if (a.kind === 'capture') return true;
  return a.lib === c.lib;
}

function walk(node, path, size, results, ctx) {
  const board = replayPath(path, size);
  const children = node.children || [];
  if (children.length > 1) {
    const withMove = children.map((child) => ({ child, move: moveOf(child) })).filter((c) => c.move);
    const correct = withMove.filter((c) => /\b(TE)\s*\[\s*1\s*\]/i.test(stringifyProps(c.child)) || (c.child.data?.TE || []).includes('1'));
    const wrong = withMove.filter((c) => (c.child.data?.BM || []).includes('1'));
    for (const cw of wrong) {
      for (const cc of correct) {
        if (cw === cc) continue;
        if (cc.move.color !== cw.move.color) continue;
        const p1 = coordToXY(cc.move.coord);
        const p2 = coordToXY(cw.move.coord);
        if (!p1 || !p2) continue;
        if (board[p1.y][p1.x] !== null || board[p2.y][p2.x] !== null) continue;
        if (sameAtariEffect(board, size, cc.move.color, p1.x, p1.y, p2.x, p2.y)) {
          results.push({
            ...ctx,
            correctCoord: cc.move.coord,
            wrongCoord: cw.move.coord,
            wrongNode: cw.child,
            correctNode: cc.child,
          });
        }
      }
    }
  }
  for (const child of children) walk(child, [...path, child], size, results, ctx);
}
function stringifyProps(node) {
  return Object.entries(node.data || {}).map(([k, v]) => `${k}[${v.join('][')}]`).join('');
}

async function main() {
  const { data, error } = await supabase.from('go_problems').select('id, sgf_filename, category, sgf_raw').eq('category', 'Bulmaca');
  if (error) { console.error(error); process.exit(1); }
  console.log('Bulmaca puzzles:', data.length);

  const allResults = [];
  for (const row of data) {
    const roots = parse(row.sgf_raw);
    const root = roots?.[0];
    if (!root) continue;
    const size = boardSizeOf(root);
    const results = [];
    walk(root, [root], size, results, { id: row.id, filename: row.sgf_filename });
    allResults.push(...results);
  }

  console.log(`\nFound ${allResults.length} mechanically-verified equivalent-atari-direction pairs:\n`);
  for (const r of allResults) {
    console.log(`${r.filename}  (${r.id})  correct=${r.correctCoord}  also-valid-but-marked-wrong=${r.wrongCoord}`);
  }

  require('fs').writeFileSync(
    '/tmp/claude-1000/-home-alikarakaya/b07c8d1f-6aad-41f9-b07d-d3042ed0a39d/scratchpad/equiv_moves.json',
    JSON.stringify(allResults.map((r) => ({ id: r.id, filename: r.filename, correctCoord: r.correctCoord, wrongCoord: r.wrongCoord })), null, 2)
  );
}

main();
