import { supabase } from './supabase'

export async function fetchLeaguesForAdmin() {
  const [{ data: leagues }, { data: players }, { data: registrations }] = await Promise.all([
    supabase.from('league_groups').select('id, name, sub, status').order('sort_order'),
    supabase.from('league_players').select('id, league_id, name, active').order('sort_order'),
    supabase.from('league_registrations').select('id, league_id, full_name, email, phone, note, created_at').order('created_at'),
  ])
  return (leagues ?? []).map((l) => ({
    ...l,
    players: (players ?? []).filter((p) => p.league_id === l.id),
    registrations: (registrations ?? []).filter((r) => r.league_id === l.id),
  }))
}

// Turns a "Lige Katıl" form submission into an active roster entry, then
// clears the submission from the pending queue.
export async function approveRegistration(registration) {
  const { error } = await supabase.from('league_players').insert({ league_id: registration.league_id, name: registration.full_name })
  if (error) return { error }
  return supabase.from('league_registrations').delete().eq('id', registration.id)
}

export async function dismissRegistration(registrationId) {
  return supabase.from('league_registrations').delete().eq('id', registrationId)
}

export async function addPlayer(leagueId, name) {
  return supabase.from('league_players').insert({ league_id: leagueId, name: name.trim() })
}

export async function removePlayer(playerId) {
  return supabase.from('league_players').delete().eq('id', playerId)
}

export async function recordMatch({ leagueId, week, winnerId, loserId }) {
  return supabase.from('league_match_results').insert({ league_id: leagueId, week, winner_player_id: winnerId, loser_player_id: loserId })
}

export async function fetchRecentMatches(leagueId) {
  const { data } = await supabase
    .from('league_match_results')
    .select('id, week, winner_player_id, loser_player_id, created_at')
    .eq('league_id', leagueId)
    .order('created_at', { ascending: false })
    .limit(10)
  return data ?? []
}

export async function deleteMatch(matchId) {
  return supabase.from('league_match_results').delete().eq('id', matchId)
}
