import { supabase } from './supabase'

export async function fetchLibraryGames() {
  const { data } = await supabase.from('library_games').select('*').order('sort_order').order('created_at')
  return data ?? []
}

export async function fetchLibraryGame(id) {
  const { data } = await supabase.from('library_games').select('*').eq('id', id).maybeSingle()
  return data
}

export async function addLibraryGame(game) {
  const { error } = await supabase.from('library_games').insert(game)
  return { error }
}

export async function deleteLibraryGame(id) {
  await supabase.from('library_games').delete().eq('id', id)
}
