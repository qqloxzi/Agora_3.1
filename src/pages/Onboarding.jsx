import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ArrowLeft, Check } from 'lucide-react'
import { ONBOARDING_QUESTIONS as Q } from '../data/onboardingQuestions'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export function Onboarding() {
  const { user, setProfile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [saving, setSaving] = useState(false)

  const question = Q[step]
  const value = answers[question.key]
  const canContinue = question.type === 'multi' ? true : Boolean(value)

  function setAnswer(v) {
    setAnswers((prev) => ({ ...prev, [question.key]: v }))
  }

  function toggleMulti(option) {
    const current = Array.isArray(value) ? value : []
    setAnswer(current.includes(option) ? current.filter((v) => v !== option) : [...current, option])
  }

  async function finish() {
    if (!user) {
      navigate('/kayit')
      return
    }
    setSaving(true)
    const { data } = await supabase
      .from('profiles')
      .update({ ...answers, onboarding_completed_at: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .single()
    setSaving(false)
    if (data) setProfile(data)
    navigate('/profil')
  }

  function next() {
    if (step < Q.length - 1) setStep((s) => s + 1)
    else finish()
  }

  return (
    <div className="max-w-xl mx-auto px-4 md:px-6 py-16">
      <div className="h-2 rounded-full bg-ink/10 dark:bg-white/10 overflow-hidden mb-10">
        <div className="h-full agora-gradient-surface transition-all duration-300" style={{ width: `${((step + 1) / Q.length) * 100}%` }} />
      </div>

      <div className="animate-pop-in" key={step}>
        <h1 className="text-2xl md:text-3xl font-black text-ink dark:text-white mb-8 leading-tight">{question.title}</h1>

        {question.type === 'text' && (
          <input
            autoFocus
            value={value || ''}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={question.placeholder}
            className="w-full px-5 py-4 rounded-2xl border border-primary-blue/15 dark:border-white/15 bg-white/70 dark:bg-white/5 text-lg focus:outline-none focus:ring-2 focus:ring-accent-blue/30"
          />
        )}

        {question.type === 'single' && (
          <div className="flex flex-col gap-2.5">
            {question.options.map((opt) => (
              <button
                key={opt}
                onClick={() => setAnswer(opt)}
                className={`text-left px-5 py-3.5 rounded-2xl border-2 font-bold transition-colors ${
                  value === opt ? 'border-accent-blue bg-accent-blue/10 text-primary-blue dark:text-white' : 'border-primary-blue/10 dark:border-white/10 text-ink/70 dark:text-ice-white/70 hover:border-accent-blue/40'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {question.type === 'multi' && (
          <div className="flex flex-wrap gap-2.5">
            {question.options.map((opt) => {
              const active = Array.isArray(value) && value.includes(opt)
              return (
                <button
                  key={opt}
                  onClick={() => toggleMulti(opt)}
                  className={`px-4 py-2.5 rounded-full border-2 font-bold text-sm transition-colors flex items-center gap-1.5 ${
                    active ? 'border-accent-blue bg-accent-blue/10 text-primary-blue dark:text-white' : 'border-primary-blue/10 dark:border-white/10 text-ink/70 dark:text-ice-white/70 hover:border-accent-blue/40'
                  }`}
                >
                  {active && <Check size={14} />} {opt}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-10">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="flex items-center gap-1.5 text-sm font-bold text-ink/50 dark:text-ice-white/50 disabled:opacity-0"
        >
          <ArrowLeft size={16} /> Geri
        </button>
        <button
          onClick={next}
          disabled={!canContinue || saving}
          className="press-btn magnetic-btn px-7 py-3.5 rounded-2xl bg-primary-blue text-white font-extrabold flex items-center gap-2 disabled:opacity-40"
        >
          {step === Q.length - 1 ? (saving ? 'Kaydediliyor...' : 'Bitir') : 'Devam Et'} <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}
