import { useState } from 'react'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Search,
  Star,
  Trophy,
  Users,
  Video,
  Wallet,
} from 'lucide-react'
import { instructors } from '../data/instructors'
import { REVIEW1_PAYMENT_LINKS, REVIEW3_PAYMENT_LINKS, REVIEW5_PAYMENT_LINKS, REVIEW_PRICES } from '../lib/leagueData'

const EGD_API = 'https://www.europeangodatabase.eu/EGD'
const EGD_MAX_RESULTS = 40
const TR_ASCII = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u' }

const RANKS = [
  ...Array.from({ length: 30 }, (_, i) => `${30 - i}k`),
  ...Array.from({ length: 9 }, (_, i) => `${i + 1}d`),
]

const OPTIONS = [
  {
    id: 'free',
    title: 'Sadece Lig',
    description: 'Ücretsiz lig katılımı, haftalık maçlar ve puan durumu.',
    bullets: [
      'EGD veritabanına işlenecek online turnuvaya katılım',
    ],
    icon: Trophy,
  },
  {
    id: 'leagueReviews',
    title: 'Lig + Analiz + Grup Dersi',
    description: 'Lig katılımına ek olarak maç analizleri ve grup dersleri.',
    bullets: [
      'İki taraf için de oyun analizi',
      'Joseki ve Fuseki teorileri',
      'Belirli bir temadaki çevrimiçi grup derslerine katılım',
      'İleriye yönelik çalışma planları',
    ],
    icon: Users,
  },
  {
    id: 'privateOnly',
    title: 'Sadece Özel Ders',
    description: 'Tek özel ders (2 saat).',
    bullets: [
      'Oyun sonrası detaylı analiz ve soru-cevap',
      'Yapay zekâ destekli çalışma yöntemleri',
      'Joseki ve Fuseki önerileri',
      'Zayıf yönlerin belirlenmesi ve geliştirilmesi',
      'Kişiselleştirilmiş antrenman planları ve çalışma rutinleri',
    ],
    icon: Video,
  },
]

const REVIEW_COUNTS = [1, 3, 5]

const STEP_INFO = { key: 'info', label: 'Bilgiler' }
const STEP_OPTION = { key: 'option', label: 'Kayıt' }
const STEP_REVIEWS = { key: 'reviews', label: 'Analiz' }
const STEP_CONFIRM = { key: 'confirm', label: 'Onay' }

function stepsForOption(optionId) {
  if (optionId === 'free') return [STEP_INFO, STEP_OPTION, STEP_CONFIRM]
  if (optionId === 'privateOnly') return [STEP_INFO, STEP_OPTION, STEP_CONFIRM]
  return [STEP_INFO, STEP_OPTION, STEP_REVIEWS, STEP_CONFIRM]
}

function egdNorm(v) {
  return (v || '').toLocaleLowerCase('tr')
    .replace(/[çğıöşü]/g, (c) => TR_ASCII[c])
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[_\-.]/g, ' ').replace(/\s+/g, ' ').trim()
}

async function egdFetch(file, params) {
  const res = await fetch(`${EGD_API}/${file}?${new URLSearchParams(params)}`)
  return res.json()
}

let trPlayersPromise = null
function loadTrPlayers() {
  if (!trPlayersPromise) {
    trPlayersPromise = egdFetch('GetPlayerDataByData.php', { lastname: '', country: 'TR' })
      .then((d) => d.players || [])
      .catch((err) => { trPlayersPromise = null; throw err })
  }
  return trPlayersPromise
}

function matchScore(p, tokens) {
  const words = egdNorm(`${p.Name} ${p.Last_Name}`).split(' ')
  let score = 0
  for (const t of tokens) {
    if (words.includes(t)) score += 2
    else if (words.some((w) => w.startsWith(t))) score += 1
    else return 0
  }
  return score
}

function EgdLookup({ onPick }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [total, setTotal] = useState(0)
  const [error, setError] = useState(false)
  const [busy, setBusy] = useState(false)

  async function search() {
    const q = query.trim()
    const tokens = egdNorm(q).split(' ').filter(Boolean)
    if (!tokens.length || tokens.join('').length < 2) return
    setBusy(true)
    setError(false)
    try {
      let found
      if (/^\d{6,9}$/.test(q)) {
        const d = await egdFetch('GetPlayerDataByPIN.php', { pin: q })
        found = d.retcode === 'Ok' ? [d] : []
      } else {
        const lastnames = [...new Set([tokens[0], tokens[tokens.length - 1]])].filter((t) => t.length >= 3)
        const [trList, ...remote] = await Promise.all([
          loadTrPlayers().catch(() => null),
          ...lastnames.map((t) => egdFetch('GetPlayerDataByData.php', { lastname: t }).catch(() => null)),
        ])
        if (!trList && remote.every((r) => !r)) throw new Error('EGD unreachable')
        const byPin = new Map()
        for (const p of [...(trList || []), ...remote.flatMap((r) => r?.players || [])]) {
          if (byPin.has(p.Pin_Player)) continue
          const score = matchScore(p, tokens)
          if (score) byPin.set(p.Pin_Player, { p, score })
        }
        found = [...byPin.values()]
          .sort((a, b) => b.score - a.score
            || (a.p.Country_Code === 'TR' ? 0 : 1) - (b.p.Country_Code === 'TR' ? 0 : 1)
            || Number(b.p.Gor || 0) - Number(a.p.Gor || 0))
          .map((x) => x.p)
      }
      setTotal(found.length)
      setResults(found.slice(0, EGD_MAX_RESULTS))
    } catch {
      setError(true)
      setTotal(0)
      setResults([])
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rounded-2xl border border-primary-blue/25 dark:border-white/20 bg-accent-blue/[0.06] dark:bg-accent-blue/[0.08] p-4">
      <label className="text-sm uppercase tracking-wider text-ink dark:text-white mb-2 block">
        Avrupa Go Veritabanı'nda ara
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          placeholder="Ad, soyad veya EGD PIN…"
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { loadTrPlayers().catch(() => {}) }}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); search() } }}
          className="flex-1 px-3 py-2.5 rounded-xl border border-primary-blue/30 dark:border-white/25 bg-white/70 dark:bg-white/5 text-base focus:outline-none focus:ring-2 focus:ring-accent-blue/30"
        />
        <button
          type="button"
          onClick={search}
          disabled={busy}
          className="press-btn shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary-blue text-white text-base disabled:opacity-50"
        >
          <Search size={15} /> {busy ? 'Aranıyor…' : 'Ara'}
        </button>
      </div>
      <p className="text-sm text-ink dark:text-white mt-2">
        Kaydını seçersen ad, soyad, seviye, GoR ve EGD PIN alanların aşağıda görünür.
      </p>
      {results && (
        <div className="mt-3 flex flex-col gap-1.5 max-h-64 overflow-y-auto">
          {results.length === 0 && (
            <p className="text-sm text-ink dark:text-white">
              {error ? 'EGD şu an ulaşılamıyor. Bilgilerini elle girebilirsin.' : 'Sonuç bulunamadı. EGD kaydın yoksa bilgilerini elle girebilirsin.'}
            </p>
          )}
          {total > results.length && (
            <p className="text-sm text-ink">{total} sonuç bulundu, ilk {results.length} gösteriliyor.</p>
          )}
          {results.map((p) => (
            <button
              key={p.Pin_Player}
              type="button"
              onClick={() => { onPick(p); setResults(null); setQuery('') }}
              className="text-left px-3 py-2 rounded-xl bg-primary-blue/[0.04] dark:bg-white/5 hover:bg-primary-blue/10 text-sm text-ink dark:text-white transition-colors"
            >
              <strong>{(p.Real_Last_Name || p.Last_Name || '').replace(/_/g, ' ')} {(p.Real_Name || p.Name || '').replace(/_/g, ' ')}</strong>
              {' '}— {p.Grade}, GoR {p.Gor}, {p.Country_Code} · PIN {p.Pin_Player}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <p className="text-base text-ink dark:text-white">
      <span className="text-ink dark:text-white">{label}:</span> {value || '—'}
    </p>
  )
}

function rankValue(rank) {
  const m = /^(\d+)([kd])$/.exec((rank || '').trim().toLowerCase())
  if (!m) return -1
  return m[2] === 'k' ? 30 - Number(m[1]) : 29 + Number(m[1])
}

function instructorForRank(rank) {
  const value = rankValue(rank)
  if (value < 0) return null
  const byId = (id) => instructors.find((i) => i.id === id)
  if (value <= 18) return byId('alikarakaya')
  if (value <= 24) return byId('oguzerdogan')
  return byId('tugkaneren')
}

const inputClass = 'w-full px-3.5 py-2.5 rounded-xl border border-primary-blue/30 dark:border-white/25 bg-white/70 dark:bg-white/5 text-base focus:outline-none focus:ring-2 focus:ring-accent-blue/30'

export function LeagueRegistration() {
  const [step, setStep] = useState(1)
  const [infoMode, setInfoMode] = useState(null)
  const [infoError, setInfoError] = useState(false)
  const [form, setForm] = useState({
    option: null,
    first_name: '',
    last_name: '',
    rank: '',
    gor: '',
    egd_pin: '',
    phone: '',
    reviewCount: 1,
  })
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const option = OPTIONS.find((o) => o.id === form.option)
  const instructor = instructorForRank(form.rank)
  const steps = stepsForOption(form.option)
  const current = steps[step - 1]?.key ?? 'info'
  const instructorSlug = instructor?.leagueSlug
  const paymentLink = form.option === 'leagueReviews' && instructorSlug
    ? (form.reviewCount === 1
      ? REVIEW1_PAYMENT_LINKS[instructorSlug]
      : form.reviewCount === 3
        ? REVIEW3_PAYMENT_LINKS[instructorSlug]
        : REVIEW5_PAYMENT_LINKS[instructorSlug])
    : null

  function handleNext() {
    if (current === 'info' && !infoMode) {
      setInfoError(true)
      return
    }
    setInfoError(false)
    setStep((s) => Math.min(steps.length, s + 1))
  }

  function handleSelectOption(optionId) {
    setForm((f) => ({ ...f, option: optionId }))
    setStep(3)
  }

  function pickEgd(p) {
    const grade = (p.Grade || '').toLowerCase()
    const clean = (v) => (v || '').replace(/_/g, ' ').trim()
    setForm((f) => ({
      ...f,
      first_name: clean(p.Real_Name || p.Name) || f.first_name,
      last_name: clean(p.Real_Last_Name || p.Last_Name) || f.last_name,
      rank: RANKS.includes(grade) ? grade : f.rank,
      gor: p.Gor ? String(p.Gor) : f.gor,
      egd_pin: p.Pin_Player || f.egd_pin,
    }))
  }

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      {step > 1 && (
        <button
          type="button"
          aria-label="Geri"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          className="shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-primary-blue/30 dark:border-white/25 bg-white/70 dark:bg-white/10 text-ink dark:text-white flex items-center justify-center transition-all duration-200 hover:scale-110 hover:bg-accent-blue hover:text-white hover:border-accent-blue"
        >
          <ChevronLeft size={22} />
        </button>
      )}
      <div className="flex-1 rounded-3xl bg-accent-blue/[0.04] dark:bg-white/5 border border-primary-blue/25 dark:border-white/20 shadow-card p-5 md:p-8">
      <div className="flex flex-wrap gap-2 mb-8">
        {steps.map((s, i) => (
          <div
            key={s.key}
            className={`flex-1 min-w-[6rem] px-3 py-2 rounded-xl text-center text-sm transition-colors ${
              step === i + 1
                ? 'bg-primary-blue text-white'
                : step > i + 1
                  ? 'bg-success/10 text-success'
                  : 'bg-primary-blue/[0.05] dark:bg-white/5 text-ink dark:text-white'
            }`}
          >
            {i + 1}. {s.label}
          </div>
        ))}
      </div>

      <div className="min-h-[560px]">
        {current === 'info' && (
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl text-ink dark:text-white">Bilgilerin</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { id: 'egd', title: 'EGD ile Kayıt', description: 'EGD kaydından ad, seviye ve PIN bilgilerini otomatik al.', icon: Search },
                { id: 'manual', title: 'Elle Giriş', description: 'Bilgilerini kendin gir.', icon: Pencil },
              ].map((mode) => {
                const Icon = mode.icon
                const active = infoMode === mode.id
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => { setInfoMode(mode.id); setInfoError(false) }}
                    className={`text-left rounded-2xl border p-4 transition-colors ${
                      active
                        ? 'border-accent-blue bg-accent-blue/10 shadow-card'
                        : 'border-primary-blue/25 dark:border-white/20 hover:border-accent-blue/40'
                    }`}
                  >
                    <Icon size={20} className="text-accent-blue mb-2" />
                    <p className="text-base text-ink dark:text-white">{mode.title}</p>
                    <p className="text-sm text-ink dark:text-white mt-1 leading-relaxed">{mode.description}</p>
                  </button>
                )
              })}
            </div>
            {infoError && <p className="text-sm text-heart">Lütfen bilgi giriş yöntemini seç.</p>}

            {infoMode === 'egd' && (
              <div className="flex flex-col gap-3">
                <EgdLookup onPick={pickEgd} />
                {(form.first_name || form.last_name || form.rank) && (
                  <div className="rounded-xl border border-primary-blue/25 dark:border-white/20 bg-accent-blue/[0.06] dark:bg-accent-blue/[0.08] p-3">
                    <p className="text-xs uppercase tracking-wider text-ink dark:text-white mb-2">EGD BİLGİLERİN</p>
                    <div className="grid sm:grid-cols-2 gap-x-5 gap-y-0.5">
                      <InfoRow label="Ad" value={form.first_name} />
                      <InfoRow label="Soyad" value={form.last_name} />
                      <InfoRow label="Seviye" value={form.rank} />
                      <InfoRow label="GoR" value={form.gor} />
                      <InfoRow label="EGD PIN" value={form.egd_pin} />
                    </div>
                  </div>
                )}
              </div>
            )}
            {infoMode === 'manual' && (
              <div className="rounded-xl border border-primary-blue/25 dark:border-white/20 bg-accent-blue/[0.06] dark:bg-accent-blue/[0.08] p-3">
                <p className="text-xs uppercase tracking-wider text-ink dark:text-white mb-3">Bilgilerini elle gir</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  <input className={`${inputClass} py-2 text-sm`} placeholder="Ad" value={form.first_name} onChange={set('first_name')} />
                  <input className={`${inputClass} py-2 text-sm`} placeholder="Soyad" value={form.last_name} onChange={set('last_name')} />
                  <select className={`${inputClass} py-2 text-sm`} value={form.rank} onChange={set('rank')}>
                    <option value="">Seviye seç</option>
                    {RANKS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <input className={`${inputClass} py-2 text-sm`} placeholder="EGD PIN (opsiyonel)" value={form.egd_pin} onChange={set('egd_pin')} />
                </div>
              </div>
            )}

            <div>
              <label className="flex items-center gap-1 text-sm text-ink dark:text-white mb-1.5">
                Telefon (opsiyonel)
              </label>
              <input
                type="tel"
                placeholder="05XX XXX XX XX"
                value={form.phone}
                onChange={set('phone')}
                className={inputClass}
              />
            </div>
          </div>
        )}

        {current === 'option' && (
          <div>
            <h2 className="text-2xl text-ink dark:text-white mb-1">Kayıt seçeneğini belirle</h2>
            <p className="text-sm text-ink dark:text-white mb-4">Sana uygun programı seç.</p>
            <div className="grid sm:grid-cols-3 gap-3">
              {OPTIONS.map((o) => {
                const Icon = o.icon
                const active = form.option === o.id
                return (
                  <div
                    key={o.id}
                    className={`h-full min-h-[360px] flex flex-col text-left rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-accent-blue/50 active:scale-[0.99] ${
                      active
                        ? 'border-accent-blue bg-accent-blue/20 ring-2 ring-accent-blue/30 shadow-card'
                        : 'border-primary-blue/25 dark:border-white/20 bg-accent-blue/[0.06] dark:bg-accent-blue/[0.08]'
                    }`}
                  >
                    <Icon size={22} className="text-accent-blue mb-3" />
                    <p className="text-lg text-ink dark:text-white">{o.title}</p>
                    <p className="text-sm text-ink dark:text-white mt-1.5 leading-relaxed">{o.description}</p>
                    {o.bullets && (
                      <ul className="mt-4 pt-3 flex flex-col gap-2 border-t border-primary-blue/25 dark:border-white/20">
                        {o.bullets.map((bullet) => (
                          <li key={bullet} className="flex items-start gap-2 text-sm leading-snug text-ink dark:text-white">
                            <Check size={13} className="text-accent-blue shrink-0 mt-0.5" /> {bullet}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-auto pt-4">
                      {o.id === 'free' && (
                        <p className="text-xl text-primary-blue dark:text-white">Ücretsiz</p>
                      )}
                      <button
                        type="button"
                        onClick={() => handleSelectOption(o.id)}
                        className="mt-2 w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary-blue text-white text-base hover:bg-primary-blue/90"
                      >
                        Devam <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      {current === 'reviews' && (
        <div>
          <h2 className="text-2xl text-ink dark:text-white mb-1">Kaç maç analizi istiyorsun?</h2>
          <p className="text-sm text-ink dark:text-white mb-5">Analiz sayısını seç.</p>
          <div className="grid sm:grid-cols-3 gap-3">
            {REVIEW_COUNTS.map((count) => {
              const price = instructorSlug ? REVIEW_PRICES[instructorSlug]?.[count] : null
              return (
                <button
                  key={count}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, reviewCount: count }))}
                  className={`press-btn rounded-2xl border p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-accent-blue/60 ${
                    form.reviewCount === count
                      ? 'border-accent-blue bg-accent-blue/10 shadow-card'
                      : 'border-primary-blue/25 dark:border-white/20 hover:border-accent-blue/40'
                  }`}
                >
                  <p className={`text-primary-blue dark:text-white ${count === 1 ? 'text-xl' : 'text-4xl'}`}>
                    {count === 1 ? 'Deneme Dersi' : count}
                  </p>
                  <p className="text-sm text-ink dark:text-white mt-1 leading-snug">
                    {count === 1
                      ? 'Agora Turnuvası ve topluluğuya tanışmak için ideal. 1 kez grup dersine katılım ile devam etmek isteyip istemediğinize karar verebilirsiniz.'
                      : count === 5 ? 'Maç Analizi ve Eğitmenle Simültane Maç' : 'maç analizi'}
                  </p>
                  <p className="text-xs text-accent-blue mt-3 border-t border-primary-blue/25 dark:border-white/20 pt-2">
                    {price ? `${price} TL` : 'Fiyat yakında'}
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {current === 'confirm' && (
        <div className="flex flex-col gap-5">
          <div>
            <h2 className="text-2xl text-ink dark:text-white mb-1">Onay</h2>
            <p className="text-sm text-ink dark:text-white">Eğitmenini ve bilgilerini kontrol et.</p>
          </div>

          {instructor ? (
            <div className="flex flex-col sm:flex-row items-center gap-5 rounded-2xl border border-primary-blue/25 dark:border-white/20 bg-accent-blue/[0.06] dark:bg-accent-blue/[0.08] p-5">
              <img src={instructor.avatar} alt={instructor.name} className="w-20 h-20 rounded-2xl object-cover shrink-0" />
              <div>
                <p className="text-sm text-accent-blue uppercase tracking-wider">{instructor.title}</p>
                <h3 className="text-xl text-ink dark:text-white mt-1">{instructor.name}</h3>
                <p className="text-sm text-ink dark:text-white mt-2 leading-relaxed">{instructor.about}</p>
                <p className="text-sm text-ink dark:text-white mt-2">{instructor.leagueTitle} · {form.rank}</p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-primary-blue/25 p-5 text-base text-ink dark:text-white">
              Eğitmenini görmek için seviyeni girmelisin.
            </div>
          )}

          <div className="rounded-2xl border border-primary-blue/25 dark:border-white/20 bg-accent-blue/[0.06] dark:bg-accent-blue/[0.08] p-5">
            <p className="text-base text-ink dark:text-white mb-2">{option?.title}</p>
            <p className="text-sm text-ink dark:text-white">{option?.description}</p>
            <p className="text-sm text-accent-blue mt-3">
              {form.option === 'privateOnly'
                ? '1 özel ders · 2 saat'
                : form.reviewCount === 1 ? 'Deneme Dersi' : `${form.reviewCount} maç analizi`}
            </p>
          </div>

          <div className="rounded-2xl border border-primary-blue/25 dark:border-white/20 bg-accent-blue/[0.06] dark:bg-accent-blue/[0.08] p-5">
            <p className="text-base text-ink dark:text-white mb-2">Değerlendirmeler</p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => <Star key={n} size={16} className="fill-token text-token" />)}
              <span className="text-sm text-ink dark:text-white ml-2">Eğitmen değerlendirmeleri yakında.</span>
            </div>
          </div>

          <div className="rounded-2xl border border-primary-blue/25 dark:border-white/20 bg-accent-blue/[0.06] dark:bg-accent-blue/[0.08] p-5 flex flex-col gap-2 text-base">
            <p className="text-ink dark:text-white"><span className="">Ad:</span> {form.first_name} {form.last_name}</p>
            <p className="text-ink dark:text-white"><span className="">Seviye:</span> {form.rank || '—'}</p>
            <p className="text-ink dark:text-white"><span className="">Telefon:</span> {form.phone || '—'}</p>
            <p className="text-ink dark:text-white"><span className="">Program:</span> {option?.title}</p>
            {form.option === 'leagueReviews' && (
              <p className="text-ink dark:text-white"><span className="">Seçim:</span> {form.reviewCount === 1 ? 'Deneme Dersi' : `${form.reviewCount} maç analizi`}</p>
            )}
            {form.option === 'privateOnly' && (
              <p className="text-ink dark:text-white"><span className="">Özel ders:</span> 1 ders · 2 saat</p>
            )}
            <p className="text-ink dark:text-white"><span className="">Eğitmen:</span> {instructor?.name ?? '—'}</p>
          </div>

          {paymentLink ? (
            <button
              type="button"
              onClick={() => window.open(paymentLink, '_blank', 'noopener,noreferrer')}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary-blue text-white hover:bg-primary-blue/90"
            >
              <Wallet size={17} /> Kaydol
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="w-full py-3.5 rounded-2xl bg-primary-blue text-white flex items-center justify-center gap-2 opacity-50"
            >
              <Wallet size={17} /> {form.option === 'free' ? 'Ücretsiz Kayıt Yakında' : 'Ödeme linki yakında'}
            </button>
          )}
        </div>
      )}

      </div>
      </div>

      {current !== 'option' && step < steps.length && (
        <button
          type="button"
          aria-label="Devam"
          onClick={handleNext}
          className="shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-primary-blue text-white flex items-center justify-center shadow-card transition-all duration-200 hover:scale-110 hover:bg-accent-blue"
        >
          <ChevronRight size={22} />
        </button>
      )}
    </div>
  )
}
