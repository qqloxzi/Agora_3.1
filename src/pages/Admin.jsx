import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { UserPlus, Trash2, ShieldCheck, Megaphone, UserCheck, Mail, Phone, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import {
  fetchLeaguesForAdmin,
  addPlayer,
  removePlayer,
  recordMatch,
  fetchRecentMatches,
  deleteMatch,
  approveRegistration,
  dismissRegistration,
} from '../lib/adminData'
import { fetchSeasonAnnouncement, updateSeasonAnnouncement } from '../lib/seasonAnnouncement'

export function Admin() {
  const { user, profile, loading } = useAuth()
  const [leagues, setLeagues] = useState([])
  const [activeLeagueId, setActiveLeagueId] = useState(null)
  const [newPlayerName, setNewPlayerName] = useState('')
  const [week, setWeek] = useState(1)
  const [winnerId, setWinnerId] = useState('')
  const [loserId, setLoserId] = useState('')
  const [recentMatches, setRecentMatches] = useState([])
  const [message, setMessage] = useState('')

  const [announcement, setAnnouncement] = useState(null)
  const [announcementSaving, setAnnouncementSaving] = useState(false)

  async function reload() {
    const data = await fetchLeaguesForAdmin()
    setLeagues(data)
    if (!activeLeagueId && data[0]) setActiveLeagueId(data[0].id)
  }

  useEffect(() => {
    if (profile?.is_admin) {
      reload()
      fetchSeasonAnnouncement().then(({ announcement }) => setAnnouncement(announcement))
    }
  }, [profile])

  async function handleSaveAnnouncement(e) {
    e.preventDefault()
    setAnnouncementSaving(true)
    await updateSeasonAnnouncement({
      title: announcement.title,
      description: announcement.description,
      start_date: announcement.start_date || null,
      active: announcement.active,
    })
    setAnnouncementSaving(false)
    setMessage('Sezon duyurusu güncellendi.')
    setTimeout(() => setMessage(''), 2500)
  }

  useEffect(() => {
    if (activeLeagueId) fetchRecentMatches(activeLeagueId).then(setRecentMatches)
  }, [activeLeagueId, leagues])

  if (loading) return <p className="text-center py-24 text-ink/40">Yükleniyor...</p>
  if (!user) return <Navigate to="/giris" replace />
  if (!profile?.is_admin) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <p className="text-ink/60 dark:text-ice-white/60">Bu sayfaya erişim yetkin yok.</p>
      </div>
    )
  }

  const activeLeague = leagues.find((l) => l.id === activeLeagueId)

  async function handleAddPlayer(e) {
    e.preventDefault()
    if (!newPlayerName.trim()) return
    await addPlayer(activeLeagueId, newPlayerName)
    setNewPlayerName('')
    reload()
  }

  async function handleRemovePlayer(id) {
    await removePlayer(id)
    reload()
  }

  async function handleRecordMatch(e) {
    e.preventDefault()
    if (!winnerId || !loserId || winnerId === loserId) {
      setMessage('Kazanan ve kaybeden farklı oyuncular olmalı.')
      return
    }
    await recordMatch({ leagueId: activeLeagueId, week: Number(week), winnerId, loserId })
    setMessage('Sonuç kaydedildi.')
    setWinnerId('')
    setLoserId('')
    fetchRecentMatches(activeLeagueId).then(setRecentMatches)
    setTimeout(() => setMessage(''), 2500)
  }

  async function handleDeleteMatch(id) {
    await deleteMatch(id)
    fetchRecentMatches(activeLeagueId).then(setRecentMatches)
  }

  async function handleApproveRegistration(registration) {
    await approveRegistration(registration)
    reload()
  }

  async function handleDismissRegistration(id) {
    await dismissRegistration(id)
    reload()
  }

  const playerName = (id) => activeLeague?.players.find((p) => p.id === id)?.name ?? '—'

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-14">
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheck className="text-success" size={22} />
        <h1 className="text-2xl font-black text-ink dark:text-white">Yönetim — Fikstür</h1>
      </div>
      <p className="text-sm text-ink/50 dark:text-ice-white/50 mb-8">Oyuncuları yönet, haftalık maç sonuçlarını gir ve ana sayfadaki sezon duyurusunu düzenle.</p>

      {announcement && (
        <section className="rounded-3xl bg-white/70 dark:bg-white/5 border border-primary-blue/10 dark:border-white/10 shadow-card p-6 mb-8">
          <h2 className="flex items-center gap-2 font-extrabold text-ink dark:text-white mb-4">
            <Megaphone size={18} className="text-accent-blue" /> Ana Sayfa — Sezon Duyurusu
          </h2>
          <form onSubmit={handleSaveAnnouncement} className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-ink/50 dark:text-ice-white/50 mb-1.5 block">Başlık</label>
              <input
                value={announcement.title}
                onChange={(e) => setAnnouncement((a) => ({ ...a, title: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-primary-blue/15 dark:border-white/15 bg-white/70 dark:bg-white/5 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-ink/50 dark:text-ice-white/50 mb-1.5 block">Açıklama</label>
              <textarea
                value={announcement.description}
                onChange={(e) => setAnnouncement((a) => ({ ...a, description: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-primary-blue/15 dark:border-white/15 bg-white/70 dark:bg-white/5 text-sm h-20 resize-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-ink/50 dark:text-ice-white/50 mb-1.5 block">Başlangıç Tarihi</label>
              <input
                type="date"
                value={announcement.start_date || ''}
                onChange={(e) => setAnnouncement((a) => ({ ...a, start_date: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-primary-blue/15 dark:border-white/15 bg-white/70 dark:bg-white/5 text-sm"
              />
            </div>
            <label className="flex items-center gap-2 self-end pb-2 text-sm font-bold text-ink dark:text-white">
              <input type="checkbox" checked={announcement.active} onChange={(e) => setAnnouncement((a) => ({ ...a, active: e.target.checked }))} />
              Ana sayfada göster
            </label>
            <button type="submit" disabled={announcementSaving} className="sm:col-span-2 press-btn magnetic-btn px-4 py-2.5 rounded-xl bg-primary-blue text-white font-bold disabled:opacity-60">
              {announcementSaving ? 'Kaydediliyor...' : 'Duyuruyu Kaydet'}
            </button>
            {message && <p className="sm:col-span-2 text-xs font-bold text-accent-blue">{message}</p>}
          </form>
        </section>
      )}

      <div className="flex gap-2 mb-8 flex-wrap">
        {leagues.map((l) => (
          <button
            key={l.id}
            onClick={() => setActiveLeagueId(l.id)}
            className={`relative px-4 py-2 rounded-full text-sm font-bold border-2 ${
              activeLeagueId === l.id ? 'border-accent-blue bg-accent-blue/10 text-primary-blue dark:text-white' : 'border-primary-blue/10 dark:border-white/10 text-ink/60 dark:text-ice-white/60'
            }`}
          >
            {l.name}
            {l.registrations.length > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-heart text-white text-[10px] font-black flex items-center justify-center">
                {l.registrations.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeLeague && activeLeague.registrations.length > 0 && (
        <section className="rounded-3xl bg-heart/5 border border-heart/20 shadow-card p-6 mb-8">
          <h2 className="flex items-center gap-2 font-extrabold text-ink dark:text-white mb-4">
            <UserCheck size={18} className="text-heart" /> Kayıt Başvuruları ({activeLeague.registrations.length})
          </h2>
          <div className="flex flex-col gap-2">
            {activeLeague.registrations.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white/70 dark:bg-white/5">
                <div className="min-w-0">
                  <p className="font-bold text-ink dark:text-white">{r.full_name}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-ink/50 dark:text-ice-white/50 mt-0.5">
                    <span className="flex items-center gap-1"><Mail size={12} /> {r.email}</span>
                    {r.phone && <span className="flex items-center gap-1"><Phone size={12} /> {r.phone}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleApproveRegistration(r)}
                    className="press-btn magnetic-btn px-3 py-2 rounded-xl bg-success text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <UserCheck size={14} /> Oyuncu Olarak Ekle
                  </button>
                  <button onClick={() => handleDismissRegistration(r.id)} className="p-2 text-ink/30 hover:text-heart" aria-label="Reddet">
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeLeague && (
        <div className="grid md:grid-cols-2 gap-8">
          <section className="rounded-3xl bg-white/70 dark:bg-white/5 border border-primary-blue/10 dark:border-white/10 shadow-card p-6">
            <h2 className="font-extrabold text-ink dark:text-white mb-4">Oyuncular ({activeLeague.players.length})</h2>
            <form onSubmit={handleAddPlayer} className="flex gap-2 mb-4">
              <input
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder="Oyuncu adı"
                className="flex-1 px-3 py-2 rounded-xl border border-primary-blue/15 dark:border-white/15 bg-white/70 dark:bg-white/5 text-sm"
              />
              <button type="submit" className="px-3 py-2 rounded-xl bg-primary-blue text-white"><UserPlus size={16} /></button>
            </form>
            <div className="flex flex-col gap-1.5">
              {activeLeague.players.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-primary-blue/[0.04] dark:bg-white/5 text-sm">
                  <span className="font-bold text-ink dark:text-white">{p.name}</span>
                  <button onClick={() => handleRemovePlayer(p.id)} className="text-ink/30 hover:text-heart"><Trash2 size={14} /></button>
                </div>
              ))}
              {activeLeague.players.length === 0 && <p className="text-sm text-ink/40 italic">Henüz oyuncu yok.</p>}
            </div>
          </section>

          <section className="rounded-3xl bg-white/70 dark:bg-white/5 border border-primary-blue/10 dark:border-white/10 shadow-card p-6">
            <h2 className="font-extrabold text-ink dark:text-white mb-4">Maç Sonucu Gir</h2>
            <form onSubmit={handleRecordMatch} className="flex flex-col gap-3 mb-6">
              <input type="number" min={1} value={week} onChange={(e) => setWeek(e.target.value)} placeholder="Hafta" className="px-3 py-2 rounded-xl border border-primary-blue/15 dark:border-white/15 bg-white/70 dark:bg-white/5 text-sm" />
              <select value={winnerId} onChange={(e) => setWinnerId(e.target.value)} className="px-3 py-2 rounded-xl border border-primary-blue/15 dark:border-white/15 bg-white/70 dark:bg-white/5 text-sm">
                <option value="">Kazanan seç</option>
                {activeLeague.players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select value={loserId} onChange={(e) => setLoserId(e.target.value)} className="px-3 py-2 rounded-xl border border-primary-blue/15 dark:border-white/15 bg-white/70 dark:bg-white/5 text-sm">
                <option value="">Kaybeden seç</option>
                {activeLeague.players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <button type="submit" className="press-btn magnetic-btn px-4 py-2.5 rounded-xl bg-success text-white font-bold">Sonucu Kaydet</button>
              {message && <p className="text-xs font-bold text-accent-blue">{message}</p>}
            </form>

            <h3 className="text-xs font-bold uppercase tracking-wider text-ink/40 dark:text-ice-white/40 mb-2">Son Sonuçlar</h3>
            <div className="flex flex-col gap-1.5">
              {recentMatches.map((m) => (
                <div key={m.id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-primary-blue/[0.04] dark:bg-white/5 text-xs">
                  <span>{m.week}. hafta — <b>{playerName(m.winner_player_id)}</b> vs {playerName(m.loser_player_id)}</span>
                  <button onClick={() => handleDeleteMatch(m.id)} className="text-ink/30 hover:text-heart"><Trash2 size={13} /></button>
                </div>
              ))}
              {recentMatches.length === 0 && <p className="text-sm text-ink/40 italic">Henüz sonuç yok.</p>}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
