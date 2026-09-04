import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MapPin, ArrowLeft, ArrowRight, GraduationCap, CheckCircle2, Loader2 } from 'lucide-react'
import { findInstructor } from '../data/instructors'
import { useAuth } from '../contexts/AuthContext'
import { sendInstructorMessage } from '../lib/instructorMessages'
import { Modal } from '../components/ui/Modal'

function PrivateLessonForm({ person, onSuccess }) {
  const { user, profile } = useAuth()
  const [name, setName] = useState(profile?.username || '')
  const [email, setEmail] = useState(user?.email || '')
  const [phone, setPhone] = useState('')
  const [body, setBody] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | error

  async function submit(e) {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !body.trim()) return
    setStatus('loading')
    const { error } = await sendInstructorMessage({
      senderId: user?.id ?? null,
      name,
      email,
      phone,
      instructorId: person.id,
      instructorName: person.name,
      body,
    })
    if (!error) {
      setStatus('success')
      onSuccess?.()
    } else {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex items-center gap-3 p-5 rounded-2xl bg-success/10 border border-success/25 text-success font-bold">
        <CheckCircle2 size={22} /> Mesajın {person.name}'e iletildi! En kısa sürede dönüş yapılacak.
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-ink/50 dark:text-ice-white/50 mb-1.5 block">Ad Soyad</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-primary-blue/15 dark:border-white/15 bg-white/70 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/30"
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-ink/50 dark:text-ice-white/50 mb-1.5 block">E-posta</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-primary-blue/15 dark:border-white/15 bg-white/70 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/30"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-ink/50 dark:text-ice-white/50 mb-1.5 block">Telefon (opsiyonel)</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-primary-blue/15 dark:border-white/15 bg-white/70 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/30"
        />
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-ink/50 dark:text-ice-white/50 mb-1.5 block">Mesajın</label>
        <textarea
          required
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Seviyen, uygun günler, ne üzerinde çalışmak istediğin..."
          className="w-full px-4 py-3 rounded-xl border border-primary-blue/15 dark:border-white/15 bg-white/70 dark:bg-white/5 text-sm h-28 resize-none focus:outline-none focus:ring-2 focus:ring-accent-blue/30"
        />
      </div>

      {status === 'error' && <p className="text-sm font-bold text-heart">Bir şeyler ters gitti, tekrar dener misin?</p>}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="press-btn magnetic-btn mt-2 px-6 py-3.5 rounded-2xl bg-primary-blue text-white font-extrabold flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {status === 'loading' && <Loader2 size={18} className="animate-spin" />}
        Mesajı Gönder
      </button>
    </form>
  )
}

export function InstructorProfile() {
  const { id } = useParams()
  const person = findInstructor(id)
  const [lessonOpen, setLessonOpen] = useState(false)

  if (!person) {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center">
        <p className="text-ink/60 mb-3">Eğitmen bulunamadı.</p>
        <Link to="/hakkimizda" className="text-accent-blue font-bold hover:underline">Hakkımızda'ya dön</Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-14">
      <Link to="/hakkimizda" className="inline-flex items-center gap-1.5 text-sm font-bold text-ink/60 dark:text-ice-white/60 hover:text-accent-blue mb-8">
        <ArrowLeft size={16} /> Hakkımızda
      </Link>

      <div className="rounded-3xl bg-white/70 dark:bg-white/5 border border-primary-blue/10 dark:border-white/10 shadow-card p-8 md:p-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 text-center sm:text-left">
          <img src={person.avatar} alt={person.name} className="w-32 h-32 rounded-3xl object-cover shrink-0" />
          <div>
            <h1 className="text-3xl font-black text-ink dark:text-white mb-1">{person.name}</h1>
            <p className="text-lg font-bold text-accent-blue font-data mb-2">{person.title}</p>
            <p className="text-sm text-ink/50 dark:text-ice-white/50 flex items-center justify-center sm:justify-start gap-1.5">
              <MapPin size={14} /> {person.location}
            </p>
          </div>
        </div>

        <p className="text-ink/70 dark:text-ice-white/70 leading-relaxed mb-8">{person.about}</p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link to={`/lig/${person.leagueSlug}`} className="magnetic-btn press-btn inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-primary-blue text-white font-extrabold">
            {person.leagueTitle} <ArrowRight size={16} />
          </Link>
          {person.privateLessons && (
            <button
              onClick={() => setLessonOpen(true)}
              className="magnetic-btn press-btn inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border-2 border-primary-blue/20 dark:border-white/20 text-ink dark:text-white font-extrabold"
            >
              <GraduationCap size={18} className="text-accent-blue" /> Özel Ders İste
            </button>
          )}
        </div>
      </div>

      {person.privateLessons && (
        <Modal open={lessonOpen} onClose={() => setLessonOpen(false)} title={`${person.name} — Özel Ders`}>
          <PrivateLessonForm person={person} onSuccess={() => {}} />
        </Modal>
      )}
    </div>
  )
}
