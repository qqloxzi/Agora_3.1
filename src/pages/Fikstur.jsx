import { useEffect, useState } from 'react'
import { Trophy, Medal } from 'lucide-react'
import { fetchLeagues, computeStandings } from '../lib/leagueData'
import { LeagueJoinForm } from '../components/LeagueJoinForm'
import { Modal } from '../components/ui/Modal'

const MEDALS = ['🥇', '🥈', '🥉']

export function Fikstur() {
  const [leagues, setLeagues] = useState([])
  const [loading, setLoading] = useState(true)
  const [weekByLeague, setWeekByLeague] = useState({})
  const [joinLeagueId, setJoinLeagueId] = useState(null)

  useEffect(() => {
    fetchLeagues().then((data) => {
      setLeagues(data)
      setLoading(false)
    })
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-14">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="text-accent-blue font-bold tracking-[0.2em] uppercase text-xs">Sezon Canlı</span>
        <h1 className="text-4xl md:text-5xl font-black text-primary-blue dark:text-white mt-3 mb-4">Lig Fikstürü</h1>
        <p className="text-ink/60 dark:text-ice-white/60">Güncel puan durumu, haftalık eşleşmeler ve sıralama — her lig en fazla 8 oyuncu.</p>
      </div>

      {loading && <p className="text-center text-ink/40">Yükleniyor...</p>}

      <div className="flex flex-col gap-10">
        {leagues.map((league) => {
          const standings = computeStandings(league)
          const week = weekByLeague[league.id] ?? 1
          const weekMatches = league.matches.filter((m) => m.week === week)
          const weeks = [...new Set(league.matches.map((m) => m.week))].sort((a, b) => a - b)
          const playerName = (id) => league.players.find((p) => p.id === id)?.name ?? '—'

          return (
            <section key={league.id} className="rounded-3xl bg-white/70 dark:bg-white/5 border border-primary-blue/10 dark:border-white/10 shadow-card p-6 md:p-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-primary-blue/10 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <Trophy className="text-token" size={28} />
                  <div>
                    <h2 className="text-2xl font-extrabold text-ink dark:text-white">{league.name}</h2>
                    <p className="text-sm text-ink/50 dark:text-ice-white/50">{league.sub}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-success/10 text-success border border-success/25">{league.status}</span>
                  <button
                    onClick={() => setJoinLeagueId(league.id)}
                    disabled={league.players.length >= 8}
                    className="press-btn magnetic-btn px-4 py-2 rounded-xl bg-primary-blue text-white text-sm font-bold disabled:opacity-40"
                  >
                    {league.players.length >= 8 ? 'Kontenjan Doldu' : 'Kayıt Ol'}
                  </button>
                </div>
              </div>

              <div className="grid xl:grid-cols-12 gap-8">
                <div className="xl:col-span-5">
                  <h3 className="font-bold text-ink dark:text-white mb-4">Puan Durumu</h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs uppercase tracking-wider text-ink/40 dark:text-ice-white/40 border-b border-primary-blue/10 dark:border-white/10">
                        <th className="py-2 text-left w-8">#</th>
                        <th className="py-2 text-left">Oyuncu</th>
                        <th className="py-2 text-center w-10">G</th>
                        <th className="py-2 text-center w-10">M</th>
                        <th className="py-2 text-center w-12">SOS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standings.map((row, i) => (
                        <tr key={row.player.id} className="border-b border-primary-blue/5 dark:border-white/5 last:border-0">
                          <td className="py-2.5">{MEDALS[i] || `${i + 1}.`}</td>
                          <td className="py-2.5 font-bold text-ink dark:text-white flex items-center gap-1.5">
                            {i < 3 && <Medal size={13} className="text-token" />} {row.player.name}
                          </td>
                          <td className="py-2.5 text-center text-success font-bold">{row.wins}</td>
                          <td className="py-2.5 text-center text-heart font-bold">{row.losses}</td>
                          <td className="py-2.5 text-center text-ink/50 dark:text-ice-white/50 font-data">{row.sos}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="xl:col-span-7">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-ink dark:text-white">Maç Fikstürü</h3>
                    {weeks.length > 0 && (
                      <select
                        value={week}
                        onChange={(e) => setWeekByLeague((prev) => ({ ...prev, [league.id]: Number(e.target.value) }))}
                        className="rounded-full border border-primary-blue/15 dark:border-white/15 bg-white/70 dark:bg-white/5 px-3 py-1.5 text-xs font-bold"
                      >
                        {weeks.map((w) => (
                          <option key={w} value={w}>{w}. Hafta</option>
                        ))}
                      </select>
                    )}
                  </div>
                  {weekMatches.length === 0 ? (
                    <div className="py-10 border-2 border-dashed border-primary-blue/15 dark:border-white/15 rounded-2xl text-center text-sm text-ink/40 italic">
                      Henüz fikstür belirlenmedi.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {weekMatches.map((m) => (
                        <div key={m.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-primary-blue/[0.04] dark:bg-white/5 text-sm">
                          <span className="font-bold text-ink dark:text-white w-2/5 truncate">{playerName(m.winnerId)}</span>
                          <span className="text-xs font-bold text-success">Kazandı</span>
                          <span className="w-2/5 truncate text-right text-ink/60 dark:text-ice-white/60">{playerName(m.p2Id)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )
        })}
      </div>

      <Modal open={joinLeagueId != null} onClose={() => setJoinLeagueId(null)} title="Lige Kayıt Ol">
        {joinLeagueId != null && (
          <LeagueJoinForm
            leagues={leagues.map((l) => ({ id: l.id, name: l.name, sub: l.sub }))}
            defaultLeagueId={joinLeagueId}
            onSuccess={() => {}}
          />
        )}
      </Modal>
    </div>
  )
}
