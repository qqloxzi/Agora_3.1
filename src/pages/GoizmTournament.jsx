import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import './goizm.css'

// GOİZM için bağımsız turnuva kayıt sayfası (navbar/footer yok, App Layout dışında render edilir).
// Kayıtlar Supabase `goizm_registrations` tablosuna yazılır — şema: scripts/goizm_registrations.sql.
const TOURNAMENT = 'izmir-19'
const TITLE = '19. İzmir Go Turnuvası'
const PREREG_DEADLINE = new Date('2026-11-19T23:59:59+03:00')
const EGD_API = 'https://www.europeangodatabase.eu/EGD'
const WHATSAPP_GROUP_URL = 'https://chat.whatsapp.com/JynBTMQmPJm7XrVg8MzeHS'

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.57.93.95-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.23-9.43 9.44-9.43 2.52 0 4.89.98 6.67 2.77a9.37 9.37 0 0 1 2.76 6.67c0 5.2-4.24 9.43-9.44 9.43m8.03-17.46A11.27 11.27 0 0 0 12.05.7C5.79.7.7 5.79.7 12.04c0 2 .52 3.95 1.52 5.67L.6 23.3l5.72-1.5a11.3 11.3 0 0 0 5.42 1.38h.01c6.25 0 11.34-5.09 11.35-11.34 0-3.03-1.18-5.88-3.32-8.02" />
    </svg>
  )
}

function WhatsAppLink({ floating = false, label = 'WhatsApp Grubuna Katıl' }) {
  return (
    <a className={floating ? 'gz-wa gz-wa-float' : 'gz-wa'} href={WHATSAPP_GROUP_URL} target="_blank" rel="noreferrer" aria-label={label}>
      <WhatsAppIcon />
      {!floating && <span>{label}</span>}
    </a>
  )
}

const RANKS = [
  ...Array.from({ length: 9 }, (_, i) => `${9 - i}d`),
  ...Array.from({ length: 30 }, (_, i) => `${i + 1}k`),
]
const MEMBERSHIPS = [
  { value: 'yok', label: 'Üye değilim / Not a member' },
  { value: 'goizm', label: 'GOİZM – İzmir Go Oyuncuları Derneği' },
  { value: 'tgod', label: 'TGOD – Türkiye Go Derneği' },
  { value: 'diger', label: 'Başka bir Go derneği / Other Go association' },
]
const SPONSORS = [
  { name: 'GOİZM – İzmir Go Oyuncuları Derneği', img: '/images/goizm/goizm.png' },
  { name: 'Türkiye Go Derneği', img: '/images/goizm/tgod.png', href: 'https://www.tgod.org.tr/' },
  { name: 'JİKAD – Japonya İzmir Kültürler Arası Dostluk Derneği', img: '/images/goizm/jikad.png' },
  { name: 'İzmir Müze Gemiler Müdürlüğü', img: '/images/goizm/muze.png' },
]
const COLUMNS = [
  { key: 'no', label: '#' },
  { key: 'first_name', label: 'Ad / Name' },
  { key: 'last_name', label: 'Soyad / Surname' },
  { key: 'rank', label: 'Seviye / Rank' },
  { key: 'gor', label: 'GoR' },
  { key: 'city', label: 'Şehir / City' },
  { key: 'country', label: 'Ülke Kodu / Country Code' },
  { key: 'egd_pin', label: 'AGVKN / EGDPIN' },
]

const EMPTY_FORM = {
  first_name: '', last_name: '', rank: '', gor: '', egd_pin: '', city: '', country: 'TR',
  club: '', phone: '', email: '', membership: 'yok', notes: '', consent: false,
}

// 30k → 0 … 1k → 29, 1d → 30 … 9d → 38
function rankValue(rank) {
  const m = /^(\d+)([kd])$/.exec(rank || '')
  if (!m) return -1
  return m[2] === 'k' ? 30 - Number(m[1]) : 29 + Number(m[1])
}

function compare(a, b, key) {
  if (key === 'rank') return rankValue(a.rank) - rankValue(b.rank)
  if (key === 'no' || key === 'gor') return (a[key] ?? -9999) - (b[key] ?? -9999)
  return String(a[key] ?? '').localeCompare(String(b[key] ?? ''), 'tr')
}

// EGD isimleri ASCII tutuyor, boşluk yerine "_" kullanıyor (ör. "Cam Alpay_Cemre"); Türkçe karakterler aramayı bozuyor.
const TR_ASCII = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u' }
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

// API yalnızca soyada göre arıyor; ada göre bulabilmek için tüm TR oyuncularını (~3600) bir kez çekip yerelde arıyoruz.
let trPlayersPromise = null
function loadTrPlayers() {
  if (!trPlayersPromise) {
    trPlayersPromise = egdFetch('GetPlayerDataByData.php', { lastname: '', country: 'TR' })
      .then((d) => d.players || [])
      .catch((err) => { trPlayersPromise = null; throw err })
  }
  return trPlayersPromise
}

// Her kelime, oyuncunun ad/soyad kelimelerinden birinin başıyla eşleşmeli; tam eşleşmeler öne çıkar.
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

const EGD_MAX_RESULTS = 40

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
        // Yabancı oyuncular için API'de ilk ve son kelimeyi soyad olarak dene; TR listesini yerelde tara.
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
    <div className="gz-field">
      <span>Avrupa Go Veritabanı'nda ara / Search EGD</span>
      <div className="gz-egd">
        <input
          type="text"
          value={query}
          placeholder="Ad, soyad veya EGD PIN…"
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { loadTrPlayers().catch(() => {}) }}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); search() } }}
        />
        <button type="button" className="gz-btn-ghost" onClick={search} disabled={busy}>
          {busy ? 'Aranıyor…' : 'Ara'}
        </button>
      </div>
      <small>Kaydınızı seçerseniz ad, soyad, seviye, GoR ve EGD PIN alanları otomatik doldurulur.</small>
      {results && (
        <div className="gz-egd-results">
          {results.length === 0 && (
            <p className="gz-note" style={{ margin: '.5rem .7rem' }}>
              {error
                ? 'Avrupa Go Veritabanı\'na şu an ulaşılamıyor. Bilgilerinizi elle girebilirsiniz.'
                : 'Sonuç bulunamadı. EGD\'de kaydınız yoksa bilgilerinizi elle girebilirsiniz.'}
            </p>
          )}
          {total > results.length && (
            <p className="gz-note" style={{ margin: '.5rem .7rem' }}>
              {total} sonuç bulundu, ilk {results.length} gösteriliyor. Daraltmak için ad ve soyadı birlikte yazın.
            </p>
          )}
          {results.map((p) => (
            <button
              key={p.Pin_Player}
              type="button"
              onClick={() => { onPick(p); setResults(null); setQuery('') }}
            >
              <strong>{(p.Real_Last_Name || p.Last_Name || '').replace(/_/g, ' ')} {(p.Real_Name || p.Name || '').replace(/_/g, ' ')}</strong>
              {' '}— {p.Grade}, GoR {p.Gor}, {p.Country_Code} {p.Club} · PIN {p.Pin_Player}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function RegistrationForm({ onRegistered }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [status, setStatus] = useState(null)
  const [sending, setSending] = useState(false)
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  function pickEgd(p) {
    const grade = (p.Grade || '').toLowerCase()
    // EGD isimlerdeki boşlukları "_" ile saklıyor (ör. "Sevval_Beyza").
    const clean = (v) => (v || '').replace(/_/g, ' ').trim()
    setForm((f) => ({
      ...f,
      first_name: clean(p.Real_Name || p.Name) || f.first_name,
      last_name: clean(p.Real_Last_Name || p.Last_Name) || f.last_name,
      rank: RANKS.includes(grade) ? grade : f.rank,
      gor: p.Gor ? String(p.Gor) : f.gor,
      egd_pin: p.Pin_Player || f.egd_pin,
      country: p.Country_Code || f.country,
      club: p.Club || f.club,
    }))
  }

  async function submit(e) {
    e.preventDefault()
    setStatus(null)
    const phone = form.phone.trim()
    if (!/^\+?[0-9 ()-]{10,20}$/.test(phone)) {
      setStatus({ type: 'err', text: 'Lütfen geçerli bir telefon numarası girin (ör. 0532 123 45 67).' })
      return
    }
    if (form.egd_pin && !/^[0-9]{6,9}$/.test(form.egd_pin.trim())) {
      setStatus({ type: 'err', text: 'EGD PIN yalnızca rakamlardan oluşmalıdır (ör. 20162956).' })
      return
    }
    setSending(true)
    const gor = form.gor.trim() === '' ? null : Number(form.gor)
    const { error } = await supabase.from('goizm_registrations').insert({
      tournament: TOURNAMENT,
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      rank: form.rank,
      gor: Number.isFinite(gor) ? Math.round(gor) : null,
      egd_pin: form.egd_pin.trim() || null,
      city: form.city.trim() || null,
      country: form.country.trim().toUpperCase() || 'TR',
      club: form.club.trim() || null,
      phone,
      email: form.email.trim() || null,
      membership: form.membership,
      notes: form.notes.trim() || null,
    })
    setSending(false)
    if (error) {
      setStatus({
        type: 'err',
        text: error.code === '23505'
          ? 'Bu telefon numarası veya EGD PIN ile zaten bir ön kayıt bulunuyor.'
          : 'Kayıt gönderilemedi, lütfen bilgileri kontrol edip tekrar deneyin.',
      })
      return
    }
    setForm(EMPTY_FORM)
    setStatus({ type: 'ok', text: 'Ön kaydınız alındı, teşekkür ederiz! Adınız aşağıdaki ön kayıt listesinde görünecektir. Duyurular için WhatsApp grubumuza katılmayı unutmayın.' })
    onRegistered()
  }

  return (
    <form className="gz-form" onSubmit={submit}>
      <EgdLookup onPick={pickEgd} />
      <div className="gz-row">
        <label className="gz-field"><span>Ad / Name *</span>
          <input required maxLength={60} value={form.first_name} onChange={set('first_name')} autoComplete="given-name" />
        </label>
        <label className="gz-field"><span>Soyad / Surname *</span>
          <input required maxLength={60} value={form.last_name} onChange={set('last_name')} autoComplete="family-name" />
        </label>
      </div>
      <div className="gz-row">
        <label className="gz-field"><span>Seviye / Rank *</span>
          <select required value={form.rank} onChange={set('rank')}>
            <option value="">Seçiniz…</option>
            {RANKS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </label>
        <label className="gz-field"><span>GoR</span>
          <input type="number" min={-1000} max={3200} value={form.gor} onChange={set('gor')} />
        </label>
      </div>
      <div className="gz-row">
        <label className="gz-field"><span>EGD PIN / AGVKN</span>
          <input inputMode="numeric" maxLength={9} value={form.egd_pin} onChange={set('egd_pin')} />
          <small>İlk turnuvanızsa boş bırakabilirsiniz.</small>
        </label>
        <label className="gz-field"><span>Telefon / Phone *</span>
          <input required type="tel" maxLength={20} value={form.phone} onChange={set('phone')} autoComplete="tel" placeholder="05xx xxx xx xx" />
        </label>
      </div>
      <div className="gz-row">
        <label className="gz-field"><span>Şehir / City</span>
          <input maxLength={60} value={form.city} onChange={set('city')} />
        </label>
        <label className="gz-field"><span>Ülke Kodu / Country Code</span>
          <input maxLength={2} value={form.country} onChange={set('country')} style={{ textTransform: 'uppercase' }} />
        </label>
      </div>
      <div className="gz-row">
        <label className="gz-field"><span>Kulüp / Club</span>
          <input maxLength={60} value={form.club} onChange={set('club')} />
        </label>
        <label className="gz-field"><span>E-posta / E-mail</span>
          <input type="email" maxLength={120} value={form.email} onChange={set('email')} autoComplete="email" />
        </label>
      </div>
      <label className="gz-field"><span>Go derneği üyeliği / Go association membership *</span>
        <select value={form.membership} onChange={set('membership')}>
          {MEMBERSHIPS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
      </label>
      <label className="gz-field"><span>Notlar / Notes</span>
        <textarea rows={3} maxLength={500} value={form.notes} onChange={set('notes')} />
      </label>
      <label className="gz-check">
        <input type="checkbox" required checked={form.consent} onChange={set('consent')} />
        <span>
          Bilgilerimin turnuva organizasyonu ve iletişim amacıyla işlenmesini kabul ediyorum. Telefon ve
          e-posta bilgilerim herkese açık listede gösterilmez.
        </span>
      </label>
      {status && <div className={`gz-alert ${status.type}`} role="status">{status.text}</div>}
      <button className="gz-btn" disabled={sending}>{sending ? 'Gönderiliyor…' : 'Ön Kayıt Yap'}</button>
    </form>
  )
}

function PreRegistrationList({ rows, error }) {
  const [perPage, setPerPage] = useState(100)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState({ key: 'rank', dir: 'desc' })
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr')
    const list = q
      ? rows.filter((r) => COLUMNS.some((c) => String(r[c.key] ?? '').toLocaleLowerCase('tr').includes(q)))
      : rows.slice()
    list.sort((a, b) => compare(a, b, sort.key) * (sort.dir === 'asc' ? 1 : -1))
    return list
  }, [rows, query, sort])

  const pages = Math.max(1, Math.ceil(filtered.length / perPage))
  const current = Math.min(page, pages - 1)
  const visible = filtered.slice(current * perPage, (current + 1) * perPage)

  function toggle(key) {
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }))
  }

  return (
    <>
      <div className="gz-list-tools">
        <label>Sayfada
          <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(0) }}>
            {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          Kayıt Göster
        </label>
        <label>Bul:
          <input type="search" value={query} onChange={(e) => { setQuery(e.target.value); setPage(0) }} />
        </label>
      </div>
      <div className="gz-table-scroll">
        <table className="gz-list">
          <thead>
            <tr>
              {COLUMNS.map((c) => (
                <th
                  key={c.key}
                  className={sort.key === c.key ? `active ${sort.dir}` : undefined}
                  onClick={() => toggle(c.key)}
                  aria-sort={sort.key === c.key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r.no}>
                {COLUMNS.map((c) => <td key={c.key}>{r[c.key] ?? ''}</td>)}
              </tr>
            ))}
            {visible.length === 0 && (
              <tr><td colSpan={COLUMNS.length} className="gz-empty">
                {error ? 'Liste şu anda yüklenemedi.' : rows.length ? 'Eşleşen kayıt bulunamadı.' : 'Henüz ön kayıt yok.'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="gz-pager">
        <span>
          {filtered.length ? `${filtered.length} kayıttan ${current * perPage + 1} - ${current * perPage + visible.length} arası gösteriliyor` : '0 kayıt'}
          {query && ` (toplam ${rows.length} kayıt içinden)`}
        </span>
        {pages > 1 && (
          <div>
            <button type="button" className="gz-btn-ghost" disabled={current === 0} onClick={() => setPage(current - 1)}>Önceki</button>
            <button type="button" className="gz-btn-ghost" disabled={current >= pages - 1} onClick={() => setPage(current + 1)}>Sonraki</button>
          </div>
        )}
      </div>
    </>
  )
}

export function GoizmTournament() {
  const [rows, setRows] = useState([])
  const [listError, setListError] = useState(false)
  const [preregOpen] = useState(() => Date.now() <= PREREG_DEADLINE.getTime())

  async function loadList() {
    const { data, error } = await supabase.rpc('goizm_registration_list', { p_tournament: TOURNAMENT })
    setListError(Boolean(error))
    if (!error) setRows(data || [])
  }

  useEffect(() => {
    const prevTitle = document.title
    document.title = TITLE
    loadList()
    return () => { document.title = prevTitle }
  }, [])

  return (
    <div className="gz">
      <header className="gz-hero">
        <span className="gz-stone s1" aria-hidden="true" />
        <span className="gz-stone s2" aria-hidden="true" />
        <span className="gz-stone s3" aria-hidden="true" />
        <img className="gz-samurai" src="/images/goizm/samurai.png" alt="" aria-hidden="true" />
        <div className="gz-hero-text">
          <h1>
            <span className="gz-h-small">19. İzmir</span>
            <span className="gz-h-go">Go</span>
            <span className="gz-h-mid">Turnuvası</span>
          </h1>
          <p className="gz-hero-date">21-22 Kasım 2026</p>
          <div className="gz-hero-actions">
            {preregOpen && <a className="gz-btn" href="#on-kayit">Ön Kayıt Yap</a>}
            <a className="gz-btn-ghost" href="#on-kayit-listesi">Ön Kayıt Listesi</a>
            <WhatsAppLink />
          </div>
        </div>
      </header>

      <main className="gz-wrap">
        <figure className="gz-poster-wrap">
          <img className="gz-poster" src="/images/goizm/afis.jpg" alt="19. İzmir Go Turnuvası afişi – 21-22 Kasım" width={1587} height={2245} />
          <figcaption><a href="/images/goizm/afis.jpg" target="_blank" rel="noreferrer">Afişi tam boyut aç</a></figcaption>
        </figure>

        <p><strong>21 – 22 Kasım 2026</strong> tarihlerinde gerçekleşecek <strong>19. İzmir Go Turnuvası'nın</strong> resmi sayfasına hoşgeldiniz.</p>
        <p>Turnuva hazırlıkları boyunca bu sayfa güncellenecektir. Son ve güncel bilgilere ulaşmak için lütfen sayfamızı ve sosyal medya hesaplarımızı takip edin.</p>
        <p>
          <strong>
            {preregOpen
              ? 'Ön kayıtlar 19 Kasım 2026 Perşembe günü saat 23:59\'a kadar açıktır.'
              : 'Ön kayıtlar kapanmıştır, ilginiz için teşekkür ederiz.'}
          </strong>
          <br />
          Ön kayıt yapmamış oyuncular, turnuva günü saat 09:30'a kadar kayıt olabilirler. Hazırlıkların ön kayıtlar baz
          alınarak planlanması sebebiyle, ön kayıt yaptırmadan gelen oyuncuların ancak eldeki malzeme durumuna göre
          katılabileceklerini hatırlatırız.
        </p>

        <h2>Destekleyenler</h2>
        <p>19. İzmir Go Turnuvası; İzmir Go Oyuncuları Derneği (GOİZM), Türkiye Go Derneği (TGOD), Japonya İzmir Kültürler Arası Dostluk Derneği (JİKAD) ve İzmir Müze Gemiler Müdürlüğü destekleriyle size ulaşmaktadır.</p>
        <div className="gz-sponsors">
          {SPONSORS.map((s) => {
            const img = <img src={s.img} alt={s.name} loading="lazy" />
            return s.href
              ? <a key={s.name} href={s.href} target="_blank" rel="noreferrer">{img}</a>
              : <div key={s.name}>{img}</div>
          })}
        </div>

        <h2>Turnuva Kuralları</h2>
        <h3>Ana Turnuva Kuralları</h3>
        <ul>
          <li><strong>Turnuva Koordinatörü:</strong> İzmir Go Oyuncuları Derneği (GOİZM)</li>
          <li><strong>Başhakem:</strong> Hasan Para</li>
          <li><strong>Hakemler:</strong> Ali Moeni, Yiğit Dumanlar</li>
          <li><strong>Eşleştirme Operatörü:</strong> Alpay Cemre Çam</li>
          <li><strong>Turnuva sistemi:</strong> Kategorili İsviçre (Swiss), 5 tur</li>
          <li><strong>Kategoriler:</strong> Katılan oyuncuların seviyelerine göre 3 ya da 4 kategori belirlenecek; kategoriler turnuva günü paylaşılacaktır.</li>
          <li><strong>Oyun kuralları:</strong> Avanssız Japon oyun ve sayma kuralları</li>
          <li><strong>Süre:</strong> 60 dak. + 3 x 30 saniye Byoyomi</li>
          <li><strong>Komi:</strong> 6,5</li>
        </ul>
        <p>19. İzmir Go Turnuvası aşağıdaki <abbr title="Avrupa Go Federasyonu">AGF</abbr> kural ve düzenlemelerine de tabidir:</p>
        <ol>
          <li><a href="http://www.eurogofed.org/egf/tourrules.htm" target="_blank" rel="noreferrer"><abbr title="Avrupa Go Federasyonu">AGF</abbr> Genel Turnuva Kuralları – İngilizce</a></li>
          <li><a href="http://www.eurogofed.org/egf/toursysrules.htm" target="_blank" rel="noreferrer"><abbr title="Avrupa Go Federasyonu">AGF</abbr> Turnuva Sistem Kuralları – İngilizce</a></li>
        </ol>
        <p>Türkçe çevirileri için:</p>
        <ol>
          <li><a href="http://yunus.hacettepe.edu.tr/~ctavsan/AGF-GTK.html" target="_blank" rel="noreferrer"><abbr title="Avrupa Go Federasyonu">AGF</abbr> Genel Turnuva Kuralları</a></li>
          <li><a href="http://yunus.hacettepe.edu.tr/~ctavsan/AGF-TSK.html" target="_blank" rel="noreferrer"><abbr title="Avrupa Go Federasyonu">AGF</abbr> Turnuva Sistem Kuralları</a></li>
        </ol>
        <p>Katılımcıların söz konusu kurallardan haberdar olmaları ve gereğince hareket etmeleri beklenmektedir.</p>

        <h3>AGV Lisans Ücreti</h3>
        <p>
          Türkiye Go Derneği Yönetim Kurulu'nun kararı gereği; 2026 yılı itibarıyla EGD'ye yüklenen tüm turnuvalarda
          {' '}<strong>800 GoR ve üzeri (yaklaşık 12 kyu ve daha güçlü)</strong> oyuncular için yıllık EGD Lisansı
          gerekmektedir. EGD Lisansı bulunmayan oyuncular turnuvaya katılamayacaktır. Detaylı bilgi ve yönerge için{' '}
          <a href="https://www.tgod.org.tr/egd-lisans-sureci/" target="_blank" rel="noreferrer">TGOD EGD Lisans Süreci sayfasını</a> inceleyebilirsiniz.
        </p>

        <h2>Turnuva Programı</h2>
        <p>Turnuva ile ilgili planlama halen devam ettiğinden aşağıdaki programın değişme ihtimali olduğunu lütfen unutmayın.</p>
        <p>
          <em><strong>21 Kasım (Cumartesi)</strong></em><br />
          08:30 – 09:30 : <em>Toplanma ve kayıt kesinleştirme</em><br />
          09:30 – 10:00 : <em>Açılış ve eşleştirmelerin ilanı</em><br />
          10:00 – 12:30 : <em>1. Tur</em><br />
          12:30 – 13:30 : <em>Öğle yemeği arası</em><br />
          13:30 – 16:00 : <em>2. Tur</em><br />
          16:00 – 16:15 : <em>Ara</em><br />
          16:15 – 18:45 : <em>3. Tur</em>
        </p>
        <p>
          <em><strong>22 Kasım (Pazar)</strong></em><br />
          09:45 – 10:00 : <em>Toplanma ve hazırlık</em><br />
          10:00 – 12:30 : <em>4. Tur</em><br />
          12:30 – 13:30 : <em>Öğle yemeği arası</em><br />
          13:30 – 16:00 : <em>5. Tur</em><br />
          16:30 – 17:00 : <em>Ödül ve kapanış töreni</em>
        </p>

        <h2>Ödül</h2>
        <p>Ödüllerle ilgili çalışmamız halen devam etmektedir, detaylar duyurulacaktır.</p>

        <h2>Kayıt</h2>
        <p>
          Kayıtların en geç turnuva günü saat 09:30'a kadar kesinleştirilmesi gerekmektedir. Ön kayıt yapmamış oyuncular,
          kesin kayıtlarını belirtilen zamanı geçmeyecek şekilde turnuva mekanında yapabilirler. Malzeme ve mekan
          hazırlığı ön kayıt listesi temel alınarak yapıldığından, ön kayıt yaptırmayan oyuncuların katılım talebinin
          tahmin edilenden fazla olması durumunda katılamama riski bulunduğunu hatırlatırız.
        </p>
        <p><strong>Uyarı:</strong> Ön kayıt, kesin kayda eşdeğer değildir. Ön kayıt yaptıranların belirtilen saati aşmayacak şekilde turnuva ücretini yatırarak kesin kayıt yaptırması gerekmektedir.</p>
        <p>Turnuvanın ilk günü haber vermeksizin vaktinde turnuva mekanında bulunmayan katılımcıların kayıtları silinecektir.</p>

        <h2>Katılım Ücreti</h2>
        <p>Kayıt ücretleri ekonomik koşullara bağlı olduğundan düzenleme kurulunun değişiklik yapma hakkı saklıdır.</p>
        <table className="gz-fees">
          <thead><tr><th>Katılımcı</th><th>Ücret</th></tr></thead>
          <tbody>
            <tr><td>Ön kaydı olan Go dernek üyeleri</td><td>200 TRY</td></tr>
            <tr><td>Ön kaydı olmayan Go dernek üyeleri</td><td>300 TRY</td></tr>
            <tr><td>Ön kaydı ve Go dernek üyeliği olmayan oyuncular</td><td>400 TRY</td></tr>
          </tbody>
        </table>

        <h2>Mekan</h2>
        <p>Gemi Müzesi</p>

        <h2 id="on-kayit">Ön Kayıt</h2>
        <p><strong>Uyarı:</strong> Kayıt formlarının içeriklerinin doğru ve eksiksiz olmasından katılımcılar sorumludur. Düzenleme kurulu, formun tam ve doğru olarak doldurulmamasından dolayı oluşabilecek iletişim sorunlarından sorumlu tutulamaz.</p>
        <div className="gz-wa-box">
          <p>Turnuva öncesi ve sırasında duyuruları ve iletişimi kolaylaştırmak için turnuva WhatsApp grubumuza katılmanızı önemle rica ederiz.</p>
          <WhatsAppLink />
        </div>
        {preregOpen
          ? <RegistrationForm onRegistered={loadList} />
          : <p><strong>Ön kayıt süreci bitmiştir. Ön kayıt yaparak planlamaya yardımcı olan katılımcılarımıza teşekkür ederiz.</strong></p>}

        <h2 id="on-kayit-listesi">Ön Kayıt Listesi</h2>
        <p>Ön kayıt listesi kayıt yapıldığı anda güncellenir. Kaydınızı yaptığınız halde listede gözükmüyorsanız lütfen turnuva organizasyonu ile iletişime geçin.</p>
        <PreRegistrationList rows={rows} error={listError} />
      </main>
      <WhatsAppLink floating label="Turnuva WhatsApp grubu" />
    </div>
  )
}
