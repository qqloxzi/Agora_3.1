// Shared gamification constants and pure helper functions.
// Kept deliberately simple: counters live directly on `profiles`,
// there is no separate ledger table (see plan doc — MVP scope).

export const STARTING_TOKENS = 50

export const RANK_LADDER = [
  { rank: '20 Kyu', minXp: 0 },
  { rank: '18 Kyu', minXp: 60 },
  { rank: '16 Kyu', minXp: 140 },
  { rank: '14 Kyu', minXp: 240 },
  { rank: '12 Kyu', minXp: 360 },
  { rank: '10 Kyu', minXp: 500 },
  { rank: '8 Kyu', minXp: 660 },
  { rank: '6 Kyu', minXp: 840 },
  { rank: '4 Kyu', minXp: 1040 },
  { rank: '2 Kyu', minXp: 1260 },
  { rank: '1 Kyu', minXp: 1500 },
  { rank: '1 Dan', minXp: 1760 },
  { rank: '2 Dan', minXp: 2100 },
  { rank: '3 Dan', minXp: 2500 },
  { rank: '4 Dan+', minXp: 3000 },
]

export function rankForXp(xp = 0) {
  let current = RANK_LADDER[0]
  for (const step of RANK_LADDER) {
    if (xp >= step.minXp) current = step
    else break
  }
  return current.rank
}

export function nextRankProgress(xp = 0) {
  const idx = RANK_LADDER.findIndex((s) => s.rank === rankForXp(xp))
  const current = RANK_LADDER[idx]
  const next = RANK_LADDER[idx + 1]
  if (!next) return { current, next: null, percent: 100 }
  const span = next.minXp - current.minXp
  const into = xp - current.minXp
  return { current, next, percent: Math.min(100, Math.round((into / span) * 100)) }
}

export function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export function isYesterday(dateStr) {
  if (!dateStr) return false
  const d = new Date(dateStr)
  const y = new Date()
  y.setDate(y.getDate() - 1)
  return d.toISOString().slice(0, 10) === y.toISOString().slice(0, 10)
}

// Called once per "activity" (finishing a lesson, winning a league match, etc).
// Returns the streak fields to persist.
export function nextStreak(profile) {
  const today = todayStr()
  if (profile?.streak_last_active_date === today) {
    return { streak_count: profile.streak_count ?? 1, streak_last_active_date: today }
  }
  const continued = isYesterday(profile?.streak_last_active_date)
  return {
    streak_count: continued ? (profile?.streak_count ?? 0) + 1 : 1,
    streak_last_active_date: today,
  }
}

export const LESSON_XP_REWARD = 20
export const LESSON_TOKEN_REWARD = 5
export const LEAGUE_WIN_XP_REWARD = 30
