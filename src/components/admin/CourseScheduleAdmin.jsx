import { useEffect, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { fetchCoursesForAdmin, updateCourseSchedule } from '../../lib/adminData'

const STATUS_SUGGESTIONS = ['Kayıtlar açık', 'Kayıtlar kapandı', 'Devam ediyor', 'Tamamlandı', 'Yakında']

const inputClass = 'w-full px-3 py-2 rounded-xl border border-primary-blue/15 dark:border-white/15 bg-white/70 dark:bg-white/5 text-sm'
const labelClass = 'text-xs font-bold uppercase tracking-wider text-ink/50 dark:text-ice-white/50 mb-1.5 block'

function CourseRow({ course, onSaved }) {
  const [draft, setDraft] = useState({
    status: course.status ?? '',
    course_start: course.course_start ?? '',
    course_end: course.course_end ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [note, setNote] = useState('')

  async function handleSave(e) {
    e.preventDefault()
    if (draft.course_start && draft.course_end && draft.course_end < draft.course_start) {
      setNote('Bitiş tarihi başlangıçtan önce olamaz.')
      return
    }
    setSaving(true)
    const { data, error } = await updateCourseSchedule(course.id, draft)
    setSaving(false)
    // RLS bir güncellemeyi reddettiğinde hata dönmez, sadece 0 satır döner.
    if (error || !data?.length) {
      setNote('Kaydedilemedi — yetki veya bağlantı sorunu.')
      return
    }
    setNote('Kaydedildi.')
    onSaved()
    setTimeout(() => setNote(''), 2500)
  }

  return (
    <form onSubmit={handleSave} className="rounded-2xl border border-primary-blue/10 dark:border-white/10 p-4">
      <p className="font-extrabold text-ink dark:text-white mb-3">{course.title}</p>
      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>Durum</label>
          <input
            list="course-status-suggestions"
            value={draft.status}
            onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}
            placeholder="Kayıtlar açık"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Başlangıç</label>
          <input type="date" value={draft.course_start} onChange={(e) => setDraft((d) => ({ ...d, course_start: e.target.value }))} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Bitiş</label>
          <input type="date" value={draft.course_end} onChange={(e) => setDraft((d) => ({ ...d, course_end: e.target.value }))} className={inputClass} />
        </div>
      </div>
      <div className="flex items-center gap-3 mt-3">
        <button type="submit" disabled={saving} className="press-btn magnetic-btn px-4 py-2 rounded-xl bg-primary-blue text-white text-sm font-bold disabled:opacity-60">
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
        {note && <p className="text-xs font-bold text-accent-blue">{note}</p>}
      </div>
    </form>
  )
}

// Lig Detayı sayfasındaki "Durum" ve "Tarih Aralığı" bilgilerini yönetir.
export function CourseScheduleAdmin() {
  const [courses, setCourses] = useState([])

  function reload() {
    fetchCoursesForAdmin().then(setCourses)
  }

  useEffect(reload, [])

  return (
    <section className="rounded-3xl bg-white/70 dark:bg-white/5 border border-primary-blue/10 dark:border-white/10 shadow-card p-6 mb-8">
      <h2 className="flex items-center gap-2 font-extrabold text-ink dark:text-white mb-1">
        <CalendarDays size={18} className="text-accent-blue" /> Ligler — Durum ve Tarih Aralığı
      </h2>
      <p className="text-sm text-ink/50 dark:text-ice-white/50 mb-4">Lig detay sayfasında gösterilir. Tarih boşsa “Yakında Açıklanacak” yazar.</p>
      <datalist id="course-status-suggestions">
        {STATUS_SUGGESTIONS.map((s) => <option key={s} value={s} />)}
      </datalist>
      {courses.length === 0 ? (
        <p className="text-sm text-ink/40 dark:text-ice-white/40">Lig bulunamadı.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {courses.map((c) => <CourseRow key={c.id} course={c} onSaved={reload} />)}
        </div>
      )}
    </section>
  )
}
