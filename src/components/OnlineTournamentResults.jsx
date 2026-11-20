import { Medal, PartyPopper, Trophy } from 'lucide-react'
import { ONLINE_TOURNAMENT_FINAL } from '../data/onlineTournamentFinal'

const MEDAL_COLORS = { 1: '#D4A017', 2: '#9CA3AF', 3: '#B87333' }
const PODIUM_TITLES = { 1: 'Şampiyon', 2: 'İkinci', 3: 'Üçüncü' }

export function TournamentResults() {
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

export function FinalStandingsTable() {
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
