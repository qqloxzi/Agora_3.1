import { supabase } from './supabase'
import { completeLesson } from './workshopProgress'

// Solve this many puzzles (in total, any kyu — nothing is gated) to be
// shown as having advanced one kyu tier on the Bulmacalar level badge.
export const LEVEL_STEP_SOLVES = 15

// Flat XP/token reward per newly-solved puzzle — every puzzle is worth the
// same regardless of kyu, since every kyu's puzzles are open from the start.
const PUZZLE_XP_REWARD = 10
const PUZZLE_TOKEN_REWARD = 5

function kyuNumber(rank) {
  const m = /(\d+)/.exec(rank || '')
  return m ? parseInt(m[1], 10) : null
}

// Weakest→strongest ladder built from whatever ranks actually exist among
// the puzzles right now (largest kyu number first) — this naturally skips
// gaps (e.g. no 9-11 Kyu content) instead of assuming a fixed ladder.
function tierLadder(puzzles) {
  const uniq = [...new Set(puzzles.map((p) => p.rank).filter(Boolean))]
  return uniq.sort((a, b) => kyuNumber(b) - kyuNumber(a))
}

// Standalone tsumego puzzles (Bulmacalar) — unlike go_problems rows tied to a
// workshop course_slug, these are flagged by category='Bulmaca' and browsed
// freely (no sequential lock, no course grouping, no kyu gating — every
// puzzle is open to everyone regardless of their current level).
export async function fetchPuzzles() {
  const { data } = await supabase
    .from('go_problems')
    .select('id, lesson_title, initial_description, sort_order, sgf_raw, validation_mode, tag, rank')
    .eq('category', 'Bulmaca')
    .order('sort_order', { ascending: true })

  return (data ?? []).map((row, i) => ({
    id: row.id,
    title: row.lesson_title || `Bulmaca ${i + 1}`,
    description: row.initial_description || 'Doğru hamleyi bul.',
    sgfRaw: row.sgf_raw,
    validationMode: row.validation_mode,
    tag: row.tag,
    rank: row.rank,
  }))
}

// A purely-display "level": every LEVEL_STEP_SOLVES uniquely-solved puzzles
// (of any kyu) advances one step down the tier ladder. Doesn't gate which
// puzzles are shown, and never drops back down on a wrong answer — it's
// just a progress readout, derived fresh from the completed-id set.
export function puzzleLevelInfo(puzzles, completedIds) {
  const ladder = tierLadder(puzzles)
  if (ladder.length === 0) return { level: null, solvedInTier: 0, ladder, tierIndex: -1 }

  const solvedCount = puzzles.filter((p) => completedIds.has(p.id)).length
  const tierIndex = Math.min(Math.floor(solvedCount / LEVEL_STEP_SOLVES), ladder.length - 1)
  const solvedInTier = solvedCount - tierIndex * LEVEL_STEP_SOLVES
  return { level: ladder[tierIndex], solvedInTier, ladder, tierIndex }
}

// Marks a puzzle solved: flat XP/token reward, same for every kyu since
// every puzzle is open from the start (no per-tier scaling to reward
// "harder" puzzles — see puzzleLevelInfo for the level readout instead).
export async function completePuzzleSolve({ user, profile, setProfile, puzzle }) {
  return completeLesson({
    user,
    profile,
    setProfile,
    lesson: puzzle,
    course: PUZZLE_PSEUDO_COURSE,
    xpOverride: PUZZLE_XP_REWARD,
    tokensOverride: PUZZLE_TOKEN_REWARD,
  })
}

// A pseudo-course so completeLesson/fetchCompletedLessonIds (built for
// atolye_lesson_progress) can be reused as-is for puzzle completion + XP.
export const PUZZLE_PSEUDO_COURSE = { slug: 'bulmacalar', title: 'Bulmacalar', section: null }
