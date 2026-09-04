import { supabase } from './supabase'

export async function fetchSeasonAnnouncement() {
  const [{ data: announcement }, { count }] = await Promise.all([
    supabase.from('season_announcement').select('*').eq('id', 'current').maybeSingle(),
    supabase.from('league_registrations').select('*', { count: 'exact', head: true }),
  ])
  return { announcement, registrantCount: count ?? 0 }
}

export async function updateSeasonAnnouncement(fields) {
  return supabase.from('season_announcement').update(fields).eq('id', 'current')
}
