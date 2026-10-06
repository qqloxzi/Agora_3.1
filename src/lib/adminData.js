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

// All user comments across the site (currently only left on course pages,
// target_type='course'), newest first, with the author's username and the
// commented-on course resolved for display — for admin moderation.
export async function fetchAllComments() {
  const { data: comments } = await supabase
    .from('comments')
    .select('id, target_type, target_id, user_id, body, created_at')
    .order('created_at', { ascending: false })
  if (!comments || comments.length === 0) return []

  const userIds = [...new Set(comments.map((c) => c.user_id))]
  const courseIds = [...new Set(comments.filter((c) => c.target_type === 'course').map((c) => c.target_id))]

  const [{ data: profiles }, { data: courses }] = await Promise.all([
    supabase.from('profiles').select('id, username').in('id', userIds),
    courseIds.length > 0
      ? supabase.from('courses').select('id, title, slug').in('id', courseIds)
      : Promise.resolve({ data: [] }),
  ])

  const usernameById = Object.fromEntries((profiles ?? []).map((p) => [p.id, p.username]))
  const courseById = Object.fromEntries((courses ?? []).map((c) => [c.id, c]))

  return comments.map((c) => {
    const course = c.target_type === 'course' ? courseById[c.target_id] : null
    return {
      ...c,
      authorName: usernameById[c.user_id] || 'Bilinmeyen kullanıcı',
      targetLabel: course ? course.title : c.target_type === 'course' ? 'Silinmiş kurs' : `${c.target_type} — ${c.target_id}`,
      targetHref: course ? `/lig/${course.slug}` : null,
    }
  })
}

export async function deleteComment(id) {
  return supabase.from('comments').delete().eq('id', id)
}

export async function fetchOnlineLeagueRegistrations() {
  const { data } = await supabase
    .from('online_league_registrations')
    .select('id, user_id, full_name, email, phone, ogs_nickname, kgs_nickname, egf_level, egd_pin, created_at')
    .order('created_at', { ascending: true })
  return data ?? []
}

export async function deleteOnlineLeagueRegistration(id) {
  return supabase.from('online_league_registrations').delete().eq('id', id)
}

export async function addOnlineLeagueMatch({ round, player1Id, player2Id }) {
  return supabase.from('online_league_matches').insert({
    round,
    player1_id: player1Id,
    player2_id: player2Id || null,
  })
}

export async function setOnlineLeagueMatchResult(matchId, { winnerId, isDraw }) {
  return supabase
    .from('online_league_matches')
    .update({ winner_id: isDraw ? null : winnerId, is_draw: isDraw, updated_at: new Date().toISOString() })
    .eq('id', matchId)
}

export async function deleteOnlineLeagueMatch(id) {
  return supabase.from('online_league_matches').delete().eq('id', id)
}

// Lig (kurs) takvimi — mobil "Lig Detayı" sayfasındaki Durum ve Tarih
// Aralığı satırları bu alanlardan okunur.
export async function fetchCoursesForAdmin() {
  const { data } = await supabase
    .from('courses')
    .select('id, title, status, course_start, course_end')
    .order('course_start', { ascending: true })
  return data ?? []
}

export async function updateCourseSchedule(id, { status, course_start, course_end }) {
  return supabase
    .from('courses')
    .update({ status: status?.trim() || null, course_start: course_start || null, course_end: course_end || null })
    .eq('id', id)
    .select('id')
}
