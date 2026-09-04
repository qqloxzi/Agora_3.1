import { supabase } from './supabase'

export async function fetchLeagues() {
  const [{ data: groups }, { data: players }, { data: results }] = await Promise.all([
    supabase.from('league_groups').select('id, name, sub, status, sort_order').order('sort_order'),
    supabase.from('league_players').select('id, league_id, name, sort_order').eq('active', true).order('sort_order'),
    supabase.from('league_match_results').select('id, league_id, week, winner_player_id, loser_player_id'),
  ])

  return (groups ?? []).map((league) => ({
    ...league,
    players: (players ?? []).filter((p) => p.league_id === league.id),
    matches: (results ?? [])
      .filter((m) => m.league_id === league.id)
      .map((m) => ({ id: m.id, week: m.week, p1Id: m.winner_player_id, p2Id: m.loser_player_id, winnerId: m.winner_player_id })),
  }))
}

// Wins, then strength-of-schedule (sum of defeated opponents' win counts).
export function computeStandings(league) {
  const stats = new Map()
  const defeatedBy = new Map()

  for (const p of league.players) {
    stats.set(p.id, { player: p, wins: 0, losses: 0, sos: 0 })
    defeatedBy.set(p.id, new Set())
  }

  for (const m of league.matches) {
    if (!m.winnerId) continue
    const loserId = m.winnerId === m.p1Id ? m.p2Id : m.p1Id
    if (stats.has(m.winnerId)) stats.get(m.winnerId).wins += 1
    if (stats.has(loserId)) stats.get(loserId).losses += 1
    defeatedBy.get(m.winnerId)?.add(loserId)
  }

  for (const [playerId, entry] of stats) {
    entry.sos = Array.from(defeatedBy.get(playerId) || []).reduce((sum, oppId) => sum + (stats.get(oppId)?.wins || 0), 0)
  }

  return Array.from(stats.values()).sort((a, b) => (b.wins !== a.wins ? b.wins - a.wins : b.sos - a.sos))
}
