import { supabase } from './supabase'

// Mirrors the public.go_level_strength() SQL function — higher is stronger.
// Anything without "dan" in it is treated as kyu, since that's how players type it.
export function goLevelStrength(levelText) {
  if (!levelText || !levelText.trim()) return null
  const match = levelText.match(/\d+/)
  const n = match ? Number(match[0]) : null
  if (/dan/i.test(levelText)) return 30 + (n ?? 0)
  return 30 - (n ?? 30)
}

export async function fetchOnlineLeagueMatches() {
  const { data } = await supabase
    .from('online_league_matches')
    .select('id, round, player1_id, player2_id, winner_id, is_draw, created_at')
    .order('round', { ascending: true })
    .order('created_at', { ascending: true })
  return data ?? []
}

// 1 point per win (a bye is recorded as a win over no one), 0.5 per draw.
// Ties broken by level (stronger first), then name.
export function computeOnlineLeagueStandings(roster, matches) {
  const stats = new Map(roster.map((p) => [p.id, { player: p, points: 0, played: 0, wins: 0, draws: 0, losses: 0 }]))

  for (const m of matches) {
    const p1 = stats.get(m.player1_id)
    const p2 = m.player2_id ? stats.get(m.player2_id) : null
    if (p1) p1.played += 1
    if (p2) p2.played += 1

    if (m.is_draw) {
      if (p1) { p1.points += 0.5; p1.draws += 1 }
      if (p2) { p2.points += 0.5; p2.draws += 1 }
    } else if (m.winner_id) {
      const loserId = m.winner_id === m.player1_id ? m.player2_id : m.player1_id
      const winner = stats.get(m.winner_id)
      const loser = loserId ? stats.get(loserId) : null
      if (winner) { winner.points += 1; winner.wins += 1 }
      if (loser) { loser.losses += 1 }
    }
  }

  return Array.from(stats.values()).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    const strengthDiff = (goLevelStrength(b.player.egf_level) ?? -Infinity) - (goLevelStrength(a.player.egf_level) ?? -Infinity)
    if (strengthDiff !== 0) return strengthDiff
    return a.player.full_name.localeCompare(b.player.full_name, 'tr')
  })
}
