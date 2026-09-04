import { supabase } from './supabase'
import { LESSON_XP_REWARD, LESSON_TOKEN_REWARD, MAX_HEARTS, nextStreak } from './gamification'

// Spends one heart on a wrong puzzle attempt. Starts the regen timer only
// when hearts were previously full — losing a second heart shouldn't reset
// an already-ticking regen clock.
export async function spendHeart({ user, profile, setProfile }) {
  if (!user || !profile || profile.hearts <= 0) return
  const wasFull = profile.hearts >= MAX_HEARTS
  const updates = {
    hearts: profile.hearts - 1,
    ...(wasFull ? { hearts_refill_at: new Date().toISOString() } : {}),
  }
  const { data } = await supabase.from('profiles').update(updates).eq('id', user.id).select().single()
  if (data) setProfile(data)
}

const LOCAL_KEY = 'agora_completed_lessons'

function getLocalCompleted() {
  try {
    return new Set(JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]'))
  } catch {
    return new Set()
  }
}

function setLocalCompleted(set) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify([...set]))
}

// All lessons for one workshop course, live from `go_problems`.
export async function fetchCourseLessons(courseSlug) {
  const { data } = await supabase
    .from('go_problems')
    .select('id, lesson_title, initial_description, sort_order, module_title, sgf_raw, validation_mode')
    .eq('course_slug', courseSlug)
    .order('sort_order', { ascending: true })

  return (data ?? []).map((row, i) => ({
    id: row.id,
    title: row.lesson_title || `Alıştırma ${i + 1}`,
    description: row.initial_description || 'Bu alıştırmanın açıklaması hazırlanıyor.',
    moduleTitle: row.module_title,
    sgfRaw: row.sgf_raw,
    validationMode: row.validation_mode,
  }))
}

// Lesson ids grouped by course, in one query — used by the skill-tree
// overview to compute per-course totals and (combined with completed-id set)
// done counts, without an extra round trip per course.
export async function fetchAllLessonIdsBySlug() {
  const { data } = await supabase.from('go_problems').select('id, course_slug').order('sort_order', { ascending: true })
  const map = {}
  for (const row of data ?? []) {
    if (!row.course_slug) continue
    if (!map[row.course_slug]) map[row.course_slug] = []
    map[row.course_slug].push(row.id)
  }
  return map
}

export async function fetchCompletedLessonIds(userId) {
  const local = getLocalCompleted()
  if (!userId) return local
  const { data } = await supabase.from('atolye_lesson_progress').select('lesson_id').eq('user_id', userId)
  return new Set([...(data ?? []).map((r) => r.lesson_id), ...local])
}

// Marks a lesson complete: always cached locally, and synced + rewarded
// server-side when logged in. Idempotent — repeat calls award nothing extra.
export async function completeLesson({ user, profile, setProfile, lesson, course }) {
  const local = getLocalCompleted()
  const alreadyLocal = local.has(lesson.id)
  local.add(lesson.id)
  setLocalCompleted(local)

  if (!user) return { xpGained: 0, tokensGained: 0, alreadyDone: alreadyLocal }

  const { data: existing } = await supabase
    .from('atolye_lesson_progress')
    .select('id')
    .eq('user_id', user.id)
    .eq('lesson_id', lesson.id)
    .maybeSingle()

  if (existing) return { xpGained: 0, tokensGained: 0, alreadyDone: true }

  await supabase.from('atolye_lesson_progress').insert({
    user_id: user.id,
    course_id: course.slug,
    course_slug: course.slug,
    course_title: course.title,
    level_band: course.section?.id ?? null,
    lesson_id: lesson.id,
    lesson_title: lesson.title,
    xp_earned: LESSON_XP_REWARD,
    stars: 3,
  })

  const streak = nextStreak(profile)
  const updates = {
    xp: (profile?.xp ?? 0) + LESSON_XP_REWARD,
    tokens: (profile?.tokens ?? 0) + LESSON_TOKEN_REWARD,
    ...streak,
  }
  const { data: updated } = await supabase.from('profiles').update(updates).eq('id', user.id).select().single()
  if (updated) setProfile(updated)

  return { xpGained: LESSON_XP_REWARD, tokensGained: LESSON_TOKEN_REWARD, alreadyDone: false }
}
