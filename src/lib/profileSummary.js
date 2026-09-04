import { supabase } from './supabase'
import { WORKSHOP_SECTIONS } from '../data/workshopCatalog'
import { fetchAllLessonIdsBySlug, fetchCompletedLessonIds } from './workshopProgress'

export async function fetchMyLeagueRegistrations(userId) {
  if (!userId) return []
  const { data } = await supabase
    .from('league_registrations')
    .select('league_id, league_groups(name, sub, status)')
    .eq('user_id', userId)
  return (data ?? []).map((r) => ({ id: r.league_id, ...r.league_groups }))
}

export async function fetchWorkshopOverview(userId) {
  const [lessonMap, completed] = await Promise.all([fetchAllLessonIdsBySlug(), fetchCompletedLessonIds(userId)])
  let total = 0
  let done = 0
  const bySection = WORKSHOP_SECTIONS.map((section) => {
    let sectionTotal = 0
    let sectionDone = 0
    for (const course of section.courses) {
      const ids = lessonMap[course.slug] ?? []
      sectionTotal += ids.length
      sectionDone += ids.filter((id) => completed.has(id)).length
    }
    total += sectionTotal
    done += sectionDone
    return { id: section.id, title: section.title, done: sectionDone, total: sectionTotal }
  })
  return { done, total, bySection }
}
