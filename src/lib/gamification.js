// Shared gamification constants and pure helper functions.
// Kept deliberately simple: counters live directly on `profiles`,
// there is no separate ledger table (see plan doc — MVP scope).

export const MAX_HEARTS = 5
export const HEART_REGEN_MINUTES = 30
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

// Hearts regenerate passively over time, Duolingo-style. We don't need a
// server cron for this MVP: we lazily "settle" the regen on read, based on
// how much time passed since `hearts_refill_at`.
export function settleHearts(profile) {
  if (!profile) return { hearts: MAX_HEARTS, hearts_refill_at: new Date().toISOString() }
  const hearts = profile.hearts ?? MAX_HEARTS
  if (hearts >= MAX_HEARTS) return { hearts, hearts_refill_at: profile.hearts_refill_at }

  const refillAt = profile.hearts_refill_at ? new Date(profile.hearts_refill_at) : new Date()
  const minutesPassed = (Date.now() - refillAt.getTime()) / 60000
  const regained = Math.floor(minutesPassed / HEART_REGEN_MINUTES)
  if (regained <= 0) return { hearts, hearts_refill_at: profile.hearts_refill_at }

  const newHearts = Math.min(MAX_HEARTS, hearts + regained)
  const leftoverMinutes = minutesPassed - regained * HEART_REGEN_MINUTES
  const newRefillAt = new Date(Date.now() - leftoverMinutes * 60000).toISOString()
  return { hearts: newHearts, hearts_refill_at: newHearts >= MAX_HEARTS ? null : newRefillAt }
}

export function minutesUntilNextHeart(profile) {
  if (!profile?.hearts_refill_at || profile.hearts >= MAX_HEARTS) return 0
  const refillAt = new Date(profile.hearts_refill_at)
  const elapsed = (Date.now() - refillAt.getTime()) / 60000
  return Math.max(0, Math.ceil(HEART_REGEN_MINUTES - elapsed))
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
