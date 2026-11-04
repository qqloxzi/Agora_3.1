import { useEffect, useState } from 'react'
import { ChevronDown, ExternalLink, Users, ScrollText, Trophy, Swords, Medal, PartyPopper } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { fetchOnlineLeagueMatches } from '../lib/onlineLeagueData'
import { ONLINE_TOURNAMENT_FINAL } from '../data/onlineTournamentFinal'

const OGS_GROUP_URL = 'https://online-go.com/group/15895'

function CollapsibleSection({ icon, title, badge, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-3xl bg-white/70 dark:bg-white/5 border border-primary-blue/10 dark:border-white/10 shadow-card p-6 md:p-8 mb-10">
      <button type="button" onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between gap-3 text-left">
        <h3 className="flex items-center gap-2 font-extrabold text-lg text-ink dark:text-white">
          {icon} {title} {badge}
        </h3>
        <ChevronDown size={18} className={`text-ink/40 dark:text-ice-white/40 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="mt-6">{children}</div>}
    </div>
  )
}

function OgsCommunityCard() {
  return (
    <div className="rounded-3xl bg-white/70 dark:bg-white/5 border border-primary-blue/10 dark:border-white/10 shadow-card p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6">
      <div className="w-16 h-16 rounded-2xl bg-ink flex items-center justify-center shrink-0 p-3">
        <img src="/goyabaslarken/ogs.svg" alt="OGS" className="w-full h-full object-contain" />
      </div>
      <div className="flex-1 text-center sm:text-left">
        <h3 className="font-extrabold text-lg text-ink dark:text-white mb-1">OGS Topluluk Grubumuz</h3>
        <p className="text-sm text-ink/60 dark:text-ice-white/60 leading-relaxed">
          Maçlarını Online-Go Server üzerinden oynuyoruz. Gruba katıl, rakip bul, sonuçlarını paylaş.
        </p>
      </div>
      <a
        href={OGS_GROUP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="magnetic-btn press-btn shrink-0 px-5 py-3 rounded-2xl bg-primary-blue text-white font-extrabold text-sm flex items-center gap-2"
      >
        Gruba Katıl <ExternalLink size={15} />
      </a>
    </div>
  )
}

const TOURNAMENT_INFO = [
  { label: 'Katılım Ücreti', value: 'Ücretsiz' },
  { label: 'Son Kayıt', value: '19 Eylül 2026' },
  { label: 'İlk Tur', value: '21 Eylül 2026' },
  { label: 'Tur Sayısı / Süre', value: '6 tur — 24 gün (her maç 4 günde bir)' },
  { label: 'Platform', value: 'KGS veya OGS' },
  { label: 'Zaman Sistemi', value: '30 dk ana süre + hamle başına 10 sn Fischer' },
  { label: 'Eşleştirme Sistemi', value: 'McMahon veya seviyelere göre lig — OpenGotha ile' },
  { label: 'EGD', value: 'Sonuçlar D sınıfı turnuva olarak işlenecek' },
]

function TournamentInfo() {
  return (
    <div className="rounded-3xl bg-white/70 dark:bg-white/5 border border-primary-blue/10 dark:border-white/10 shadow-card p-6 md:p-8 mb-10">
      <h3 className="font-extrabold text-lg text-ink dark:text-white mb-6">Turnuva Hakkında</h3>
      <div className="grid sm:grid-cols-2 gap-5">
        {TOURNAMENT_INFO.map(({ label, value }) => (
          <div key={label}>
            <p className="text-xs font-bold uppercase tracking-wider text-ink/50 dark:text-ice-white/50 mb-1">{label}</p>
            <p className="text-sm font-bold text-ink dark:text-white">{value || 'Yakında açıklanacak'}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

const RULE_SECTIONS = [
  {
    title: 'Katılım',
    body: [
      'Turnuvaya katılım ücretsizdir.',
      'Son kayıt tarihi: 19 Eylül 2026',
    ],
  },
  {
    title: 'Turnuva Sistemi',
    body: [
      'Katılımcı sayısına ve oyuncuların seviyelerine göre aşağıdaki sistemlerden biri uygulanacaktır:',
    ],
    list: ['McMahon sistemi', 'Oyuncuların seviyelerine göre gruplara ayrıldığı lig sistemi'],
    footer: 'Eşleştirmeler OpenGotha turnuva yazılımı ile yapılacaktır. Kesin eşleştirme sistemi, kayıtların tamamlanmasının ardından organizasyon ekibi tarafından açıklanacaktır.',
  },
  {
    title: 'Turnuva İşleyişi',
    body: [
      'Turnuva 6 tur üzerinden oynanacaktır.',
      'İlk tur 21 Eylül 2026 tarihinde başlayacaktır.',
      'Her maç 4 günde bir oynanacak ve turnuva toplamda 24 gün sürecektir.',
      'Her turun eşleştirmeleri organizasyon ekibi tarafından duyurulacak; oyuncuların ilgili 4 günlük süre içerisinde rakipleriyle iletişime geçerek karşılaşmalarını tamamlamaları beklenecektir.',
    ],
  },
  {
    title: 'Oyun Platformu',
    body: [
      'Karşılaşmalar KGS veya OGS (Online Go Server) üzerinden oynanacaktır.',
      'Kullanılacak platform, kayıtların tamamlanmasının ardından kesinleştirilerek katılımcılara bildirilecektir.',
    ],
  },
  {
    title: 'Zaman Sistemi',
    body: ['Karşılaşmalarda 30 dakika ana süre + hamle başına 10 saniye Fischer artırımı uygulanacaktır.'],
  },
  {
    title: 'EGD',
    body: [
      'Turnuva sonuçları European Go Database (EGD) sistemine D sınıfı turnuva olarak işlenecektir.',
      'Çevrimiçi turnuvalar EGD sistemine D sınıfı olarak işlenmektedir.',
      'Katılımcıların kayıt sırasında aşağıdaki bilgileri doğru şekilde paylaşmaları gerekmektedir:',
    ],
    list: ['Ad Soyad', 'Kulüp', 'EGD PIN'],
  },
  {
    title: 'Yapay Zekâ Kullanımı',
    body: [
      'Turnuva sırasında herhangi bir yapay zekâ / Go AI programının kullanılması kesinlikle yasaktır.',
      'KataGo, Leela Zero, FineArt ve benzeri Go motorları ile oyun sırasında hamle önerisi, pozisyon analizi, kazanma yüzdesi, skor tahmini veya herhangi bir başka şekilde bilgisayar desteği almak yasaktır.',
      'Bu yasak yalnızca doğrudan hamle seçmek amacıyla AI kullanmayı değil, devam eden bir karşılaşmanın herhangi bir aşamasında yapay zekâ ile analiz yapılmasını da kapsar.',
      'AI kullanımına ilişkin şüpheli durumlarda organizasyon ekibi oyun kayıtlarını inceleme hakkına sahiptir. Yapay zekâ kullandığı tespit edilen oyuncu turnuvadan çıkarılabilir ve ilgili karşılaşmaları veya turnuva sonuçları geçersiz sayılabilir.',
      'Oyun tamamlandıktan ve sonuç organizasyona bildirildikten sonra oyuncuların kendi oyunlarını eğitim amacıyla AI ile incelemelerinde herhangi bir sakınca yoktur.',
    ],
  },
  {
    title: 'Organizatör',
    body: ['Agora Go Akademisi'],
  },
]

function TournamentRulesContent() {
  return (
    <div className="flex flex-col gap-6">
      {RULE_SECTIONS.map((section) => (
          <div key={section.title}>
            <h4 className="font-extrabold text-sm text-ink dark:text-white mb-2">{section.title}</h4>
            <div className="flex flex-col gap-1.5">
              {section.body.map((p) => (
                <p key={p} className="text-sm text-ink/60 dark:text-ice-white/60 leading-relaxed">{p}</p>
              ))}
              {section.list && (
                <ul className="list-disc pl-5 flex flex-col gap-1 mt-1">
                  {section.list.map((item) => (
                    <li key={item} className="text-sm text-ink/60 dark:text-ice-white/60 leading-relaxed">{item}</li>
                  ))}
                </ul>
              )}
              {section.footer && (
                <p className="text-sm text-ink/60 dark:text-ice-white/60 leading-relaxed mt-1">{section.footer}</p>
              )}
            </div>
          </div>
        ))}
      </div>
  )
}

const MEDAL_COLORS = { 1: '#D4A017', 2: '#9CA3AF', 3: '#B87333' }
const PODIUM_TITLES = { 1: 'Şampiyon', 2: 'İkinci', 3: 'Üçüncü' }

function TournamentResults() {
  const { title, round, standings } = ONLINE_TOURNAMENT_FINAL
  const podium = standings.filter((p) => p.place <= 3)
  const third = podium.filter((p) => p.place === 3)
  return (
    <div className="rounded-3xl bg-white/70 dark:bg-white/5 border border-primary-blue/10 dark:border-white/10 shadow-card p-6 md:p-8 mb-10">
      <h3 className="flex items-center gap-2 font-extrabold text-lg text-ink dark:text-white mb-3">
        <PartyPopper size={20} className="text-accent-blue" /> Turnuva Sonuçları
      </h3>
      <p className="text-sm text-ink/70 dark:text-ice-white/70 leading-relaxed mb-6">
        {title} {round} turun ardından tamamlandı. Şampiyonumuz <strong className="text-ink dark:text-white">{podium[0].name}</strong>,
        {' '}ikincimiz <strong className="text-ink dark:text-white">{podium[1].name}</strong>
        {third.length > 1
          ? <>; üçüncülüğü <strong className="text-ink dark:text-white">{third.map((p) => p.name).join(' ve ')}</strong> eşit puanla paylaştı.</>
          : <>, üçüncümüz <strong className="text-ink dark:text-white">{third[0].name}</strong> oldu.</>}
        {' '}Dereceye giren oyuncularımızı tebrik ediyor, turnuvaya katılan herkese teşekkür ediyoruz!
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {podium.map((p) => (
          <div key={p.num} className="flex items-center gap-3 rounded-2xl px-4 py-4 bg-primary-blue/[0.04] dark:bg-white/5 border border-primary-blue/10 dark:border-white/10">
            <Medal size={30} style={{ color: MEDAL_COLORS[p.place] }} className="shrink-0" />
            <div className="min-w-0">
              <span className="block text-[11px] font-bold uppercase tracking-wider" style={{ color: MEDAL_COLORS[p.place] }}>
                {PODIUM_TITLES[p.place]}{third.length > 1 && p.place === 3 ? ' (ortak)' : ''}
              </span>
              <span className="block font-extrabold text-ink dark:text-white truncate">{p.name}</span>
              <span className="block text-xs font-data text-ink/50 dark:text-ice-white/50">{p.rank} · {p.wins}/{round} galibiyet · MMS {p.mms}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function FinalStandingsTable() {
  const { round, date, standings } = ONLINE_TOURNAMENT_FINAL
  const rounds = Array.from({ length: round }, (_, i) => i + 1)
  return (
    <div className="rounded-3xl bg-white/70 dark:bg-white/5 border border-primary-blue/10 dark:border-white/10 shadow-card p-6 md:p-8 mb-10">
      <h3 className="flex items-center gap-2 font-extrabold text-lg text-ink dark:text-white mb-1">
        <Trophy size={20} className="text-accent-blue" /> Final Sıralaması
      </h3>
      <p className="text-xs text-ink/40 dark:text-ice-white/40 mb-5">
        {round}. tur sonrası resmi sıralama (OpenGotha, {new Date(date).toLocaleDateString('tr-TR')}). Tur sütunlarında rakibin sıra numarası ve sonuç gösterilir: + galibiyet, − mağlubiyet.
      </p>
      <div className="overflow-x-auto -mx-2">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-ink/40 dark:text-ice-white/40">
              <th className="px-2 py-2">Sıra</th>
              <th className="px-2 py-2">Oyuncu</th>
              <th className="px-2 py-2">Seviye</th>
              <th className="px-2 py-2">Kulüp</th>
              <th className="px-2 py-2 text-center">G</th>
              {rounds.map((r) => <th key={r} className="px-1.5 py-2 text-center">T{r}</th>)}
              <th className="px-2 py-2 text-right">MMS</th>
              <th className="px-2 py-2 text-right">SOS</th>
              <th className="px-2 py-2 text-right">SOSOS</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((p) => (
              <tr key={p.num} className="border-t border-primary-blue/10 dark:border-white/10">
                <td className="px-2 py-2.5 font-data font-bold" style={MEDAL_COLORS[p.place] ? { color: MEDAL_COLORS[p.place] } : undefined}>
                  <span className={MEDAL_COLORS[p.place] ? '' : 'text-ink/40 dark:text-ice-white/40'}>{p.place}</span>
                </td>
                <td className="px-2 py-2.5 font-bold text-ink dark:text-white whitespace-nowrap">{p.name}</td>
                <td className="px-2 py-2.5 font-data text-ink/60 dark:text-ice-white/60">{p.rank}</td>
                <td className="px-2 py-2.5 font-data text-ink/50 dark:text-ice-white/50 whitespace-nowrap">{p.country} {p.club}</td>
                <td className="px-2 py-2.5 font-data font-bold text-center text-ink dark:text-white">{p.wins}</td>
                {p.rounds.map((r, i) => (
                  <td
                    key={i}
                    className={`px-1.5 py-2.5 font-data text-xs text-center ${
                      r.endsWith('+') ? 'text-success font-bold' : 'text-ink/40 dark:text-ice-white/40'
                    }`}
                  >
                    {r === '0+' ? 'bay' : r === '0-' ? '—' : r.replace('-', '−')}
                  </td>
                ))}
                <td className="px-2 py-2.5 font-data font-black text-right text-accent-blue">{p.mms}</td>
                <td className="px-2 py-2.5 font-data text-right text-ink/60 dark:text-ice-white/60">{p.sos}</td>
                <td className="px-2 py-2.5 font-data text-right text-ink/40 dark:text-ice-white/40">{p.sosos}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PairingBox({ label, name, isWinner, isEmpty, dark }) {
  return (
    <div
      className={`flex-1 min-w-0 rounded-xl border px-3 py-2 ${
        isWinner
          ? 'bg-success/10 border-success/30'
          : dark
            ? 'bg-ink/10 dark:bg-black/30 border-ink/15 dark:border-white/10'
            : 'bg-white/70 dark:bg-white/5 border-primary-blue/10 dark:border-white/10'
      }`}
    >
      <span className="block text-[10px] font-bold uppercase tracking-wider text-ink/40 dark:text-ice-white/40">{label}</span>
      <span className={`block font-bold truncate ${isWinner ? 'text-success' : 'text-ink dark:text-white'} ${isEmpty ? 'italic text-ink/40 dark:text-ice-white/40 font-normal' : ''}`}>
        {name}
      </span>
    </div>
  )
}

function PairingsList({ matchesByRound, nameById }) {
  const rounds = Object.keys(matchesByRound).sort((a, b) => Number(a) - Number(b))
  const [selectedRound, setSelectedRound] = useState(null)
  const activeRound = selectedRound && rounds.includes(selectedRound) ? selectedRound : rounds[rounds.length - 1]

  return (
    <div className="rounded-3xl bg-white/70 dark:bg-white/5 border border-primary-blue/10 dark:border-white/10 shadow-card p-6 md:p-8 mb-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h3 className="flex items-center gap-2 font-extrabold text-lg text-ink dark:text-white">
          <Swords size={20} className="text-accent-blue" /> Eşleştirmeler
        </h3>
        {rounds.length > 0 && (
          <select
            value={activeRound}
            onChange={(e) => setSelectedRound(e.target.value)}
            className="px-3 py-2 rounded-xl border border-primary-blue/15 dark:border-white/15 bg-white/70 dark:bg-white/5 text-sm font-bold text-ink dark:text-white"
          >
            {rounds.map((round) => (
              <option key={round} value={round}>{round}. Tur</option>
            ))}
          </select>
        )}
      </div>

      {rounds.length === 0 ? (
        <p className="text-sm text-ink/40 dark:text-ice-white/40">Eşleştirmeler henüz açıklanmadı.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {matchesByRound[activeRound].map((m) => {
            const p1 = nameById[m.player1_id] || '—'
            const p2 = m.player2_id ? nameById[m.player2_id] || '—' : null
            const resultLabel = m.is_draw ? 'Berabere' : m.winner_id ? `${nameById[m.winner_id] || '—'} kazandı` : p2 ? 'Devam ediyor' : 'Bay geçti'
            return (
              <div key={m.id} className="flex flex-col gap-1.5 px-3 py-2.5 rounded-xl bg-primary-blue/[0.04] dark:bg-white/5">
                <div className="flex items-stretch gap-2">
                  <PairingBox label="Beyaz" name={p1} isWinner={m.winner_id === m.player1_id} />
                  <span className="self-center text-[11px] font-black text-ink/30 dark:text-ice-white/30 shrink-0">VS</span>
                  <PairingBox label="Siyah" name={p2 ?? 'BAY'} isWinner={p2 ? m.winner_id === m.player2_id : false} isEmpty={!p2} dark />
                </div>
                <span className={`text-xs font-bold ${m.winner_id || m.is_draw ? 'text-success' : 'text-ink/40 dark:text-ice-white/40'}`}>{resultLabel}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function AgoraOnlineLeague() {
  const [roster, setRoster] = useState([])
  const [rosterLoading, setRosterLoading] = useState(true)
  const [matches, setMatches] = useState([])

  useEffect(() => {
    setRosterLoading(true)
    supabase.rpc('get_online_league_roster').then(({ data }) => {
      setRoster(data ?? [])
      setRosterLoading(false)
    })
    fetchOnlineLeagueMatches().then(setMatches)
  }, [])

  const nameById = Object.fromEntries(roster.map((r) => [r.id, r.full_name]))
  const matchesByRound = matches.reduce((acc, m) => {
    ;(acc[m.round] ??= []).push(m)
    return acc
  }, {})

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-14">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-accent-blue font-bold tracking-[0.2em] uppercase text-xs">Ücretsiz · Açık Kayıt</span>
        <h1 className="text-4xl md:text-5xl font-black text-primary-blue dark:text-white mt-3 mb-4">Agora Çevrimiçi Turnuvası</h1>
      </div>

      <TournamentResults />

      <TournamentInfo />

      <CollapsibleSection icon={<ScrollText size={20} className="text-accent-blue" />} title="Turnuva Kuralları">
        <TournamentRulesContent />
      </CollapsibleSection>

      <div className="flex flex-col gap-6 mb-10">
        <OgsCommunityCard />
      </div>

      <FinalStandingsTable />

      <PairingsList matchesByRound={matchesByRound} nameById={nameById} />

      <CollapsibleSection
        icon={<Users size={20} className="text-accent-blue" />}
        title="Kayıtlı Oyuncular"
        badge={<span className="text-sm font-bold text-ink/40 dark:text-ice-white/40">({roster.length})</span>}
      >
        {rosterLoading ? (
          <p className="text-sm text-ink/40">Yükleniyor...</p>
        ) : roster.length === 0 ? (
          <p className="text-sm text-ink/40 dark:text-ice-white/40">Henüz kimse kayıt olmadı — ilk sen ol!</p>
        ) : (
          <div className="flex flex-col gap-2">
            {roster.map((r, i) => (
              <div key={r.id} className="flex items-center gap-4 px-4 py-3 rounded-xl bg-primary-blue/[0.04] dark:bg-white/5 text-sm">
                <span className="w-6 text-ink/30 dark:text-ice-white/30 font-data font-bold shrink-0">{i + 1}</span>
                <span className="flex-1 font-bold text-ink dark:text-white truncate">{r.full_name}</span>
                <span className="text-accent-blue font-data font-bold truncate">{r.ogs_nickname}</span>
                {r.kgs_nickname && (
                  <span className="text-token font-data font-bold truncate">{r.kgs_nickname}</span>
                )}
                <span className="text-ink/50 dark:text-ice-white/50 font-data shrink-0">{r.egf_level}</span>
              </div>
            ))}
          </div>
        )}
      </CollapsibleSection>
    </div>
  )
}
