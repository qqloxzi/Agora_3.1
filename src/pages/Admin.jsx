import { useEffect, useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { UserPlus, Trash2, ShieldCheck, Megaphone, UserCheck, Mail, Phone, X, MessageSquare, MessageCircle, GraduationCap, CheckCheck, Globe, Hash, BookOpen, ArrowRight, Swords } from 'lucide-react'
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
  fetchOnlineLeagueRegistrations,
  deleteOnlineLeagueRegistration,
  addOnlineLeagueMatch,
  setOnlineLeagueMatchResult,
  deleteOnlineLeagueMatch,
  fetchAllComments,
  deleteComment,
} from '../lib/adminData'
import { fetchOnlineLeagueMatches, goLevelStrength } from '../lib/onlineLeagueData'
import { CourseScheduleAdmin } from '../components/admin/CourseScheduleAdmin'
import { fetchSeasonAnnouncement, updateSeasonAnnouncement } from '../lib/seasonAnnouncement'
import { fetchInstructorMessages, markInstructorMessageRead, deleteInstructorMessage, replyToInstructorMessage } from '../lib/instructorMessages'

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

  const [instructorMessages, setInstructorMessages] = useState([])
  const [replyDrafts, setReplyDrafts] = useState({})
  const [replyingId, setReplyingId] = useState(null)

  const [onlineRegistrations, setOnlineRegistrations] = useState([])

  const [onlineMatches, setOnlineMatches] = useState([])
  const [matchRound, setMatchRound] = useState(1)
  const [matchP1, setMatchP1] = useState('')
  const [matchP2, setMatchP2] = useState('')
  const [matchIsBye, setMatchIsBye] = useState(false)
  const [matchMessage, setMatchMessage] = useState('')

  const [comments, setComments] = useState([])

  async function reload() {
    const data = await fetchLeaguesForAdmin()
    setLeagues(data)
    if (!activeLeagueId && data[0]) setActiveLeagueId(data[0].id)
  }

  function reloadMessages() {
    fetchInstructorMessages().then(setInstructorMessages)
  }

  function reloadOnlineRegistrations() {
    fetchOnlineLeagueRegistrations().then(setOnlineRegistrations)
  }

  function reloadOnlineMatches() {
    fetchOnlineLeagueMatches().then(setOnlineMatches)
  }

  function reloadComments() {
    fetchAllComments().then(setComments)
  }

  useEffect(() => {
    if (profile?.is_admin) {
      reload()
      fetchSeasonAnnouncement().then(({ announcement }) => setAnnouncement(announcement))
      reloadMessages()
      reloadOnlineRegistrations()
      reloadOnlineMatches()
      reloadComments()
    }
  }, [profile])

  async function handleDeleteComment(id) {
    await deleteComment(id)
    reloadComments()
  }

  async function handleDeleteOnlineRegistration(id) {
    await deleteOnlineLeagueRegistration(id)
    reloadOnlineRegistrations()
  }

  async function handleAddOnlineMatch(e) {
    e.preventDefault()
    if (!matchP1 || (!matchIsBye && !matchP2)) {
      setMatchMessage('Oyuncu(lar)ı seç.')
      return
    }
    if (!matchIsBye && matchP1 === matchP2) {
      setMatchMessage('Aynı oyuncu iki tarafta da olamaz.')
      return
    }
    await addOnlineLeagueMatch({ round: Number(matchRound), player1Id: matchP1, player2Id: matchIsBye ? null : matchP2 })
    setMatchP1('')
    setMatchP2('')
    setMatchIsBye(false)
    setMatchMessage('Eşleştirme eklendi.')
    reloadOnlineMatches()
    setTimeout(() => setMatchMessage(''), 2500)
  }

  async function handleSetOnlineMatchResult(matchId, winnerId, isDraw) {
    await setOnlineLeagueMatchResult(matchId, { winnerId, isDraw })
    reloadOnlineMatches()
  }

  async function handleDeleteOnlineMatch(id) {
    await deleteOnlineLeagueMatch(id)
    reloadOnlineMatches()
  }

  async function handleToggleMessageRead(msg) {
    await markInstructorMessageRead(msg.id, !msg.is_read)
    reloadMessages()
  }

  async function handleDeleteMessage(id) {
    await deleteInstructorMessage(id)
    reloadMessages()
  }

  async function handleReplyMessage(id) {
    const body = (replyDrafts[id] || '').trim()
    if (!body) return
    setReplyingId(id)
    await replyToInstructorMessage(id, body)
    setReplyingId(null)
    reloadMessages()
  }

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

  const onlinePlayersByLevel = [...onlineRegistrations].sort(
    (a, b) => (goLevelStrength(b.egf_level) ?? -Infinity) - (goLevelStrength(a.egf_level) ?? -Infinity)
  )
  const onlinePlayerName = (id) => onlineRegistrations.find((p) => p.id === id)?.full_name ?? '—'
  const onlineMatchesByRound = onlineMatches.reduce((acc, m) => {
    ;(acc[m.round] ??= []).push(m)
    return acc
  }, {})

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-14">
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheck className="text-success" size={22} />
        <h1 className="text-2xl font-black text-ink dark:text-white">Yönetim — Fikstür</h1>
      </div>
      <p className="text-sm text-ink/50 dark:text-ice-white/50 mb-4">Oyuncuları yönet, haftalık maç sonuçlarını gir ve ana sayfadaki sezon duyurusunu düzenle.</p>

      <Link
        to="/admin/kutuphane"
        className="magnetic-btn flex items-center justify-between rounded-2xl bg-primary-blue/5 dark:bg-white/5 border border-primary-blue/10 dark:border-white/10 px-5 py-4 mb-8"
      >
        <span className="flex items-center gap-2 font-extrabold text-ink dark:text-white text-sm">
          <BookOpen size={17} className="text-accent-blue" /> Kütüphane — Parti Yönetimi
        </span>
        <ArrowRight size={16} className="text-accent-blue" />
      </Link>

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

      <CourseScheduleAdmin />

      <section className="rounded-3xl bg-white/70 dark:bg-white/5 border border-primary-blue/10 dark:border-white/10 shadow-card p-6 mb-8">
        <h2 className="flex items-center gap-2 font-extrabold text-ink dark:text-white mb-4">
          <MessageSquare size={18} className="text-accent-blue" /> Eğitmen Mesajları
          {instructorMessages.some((m) => !m.is_read) && (
            <span className="text-xs font-black px-2 py-0.5 rounded-full bg-heart text-white">
              {instructorMessages.filter((m) => !m.is_read).length} yeni
            </span>
          )}
        </h2>
        {instructorMessages.length === 0 ? (
          <p className="text-sm text-ink/40 dark:text-ice-white/40">Henüz mesaj yok.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {instructorMessages.map((m) => (
              <div
                key={m.id}
                className={`rounded-2xl border p-4 ${m.is_read ? 'bg-primary-blue/[0.02] border-primary-blue/10 dark:border-white/10' : 'bg-accent-blue/[0.06] border-accent-blue/25'}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-accent-blue">
                    <GraduationCap size={14} /> {m.instructor_name}
                    <span className="text-ink/30 dark:text-ice-white/30 font-normal">
                      · {new Date(m.created_at).toLocaleString('tr-TR')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleMessageRead(m)}
                      title={m.is_read ? 'Okunmadı yap' : 'Okundu işaretle'}
                      className={`p-1.5 rounded-full ${m.is_read ? 'text-ink/30 dark:text-ice-white/40 hover:bg-ink/5 dark:hover:bg-white/10' : 'text-success hover:bg-success/10'}`}
                    >
                      <CheckCheck size={16} />
                    </button>
                    <button onClick={() => handleDeleteMessage(m.id)} title="Sil" className="p-1.5 rounded-full text-heart hover:bg-heart/10">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="text-sm font-bold text-ink dark:text-white mb-1">{m.sender_name}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink/50 dark:text-ice-white/50 mb-2">
                  <a href={`mailto:${m.sender_email}`} className="flex items-center gap-1 hover:text-accent-blue"><Mail size={12} /> {m.sender_email}</a>
                  {m.sender_phone && <a href={`tel:${m.sender_phone}`} className="flex items-center gap-1 hover:text-accent-blue"><Phone size={12} /> {m.sender_phone}</a>}
                </div>
                <p className="text-sm text-ink/70 dark:text-ice-white/70 whitespace-pre-line mb-3">{m.body}</p>

                {m.reply_body && (
                  <div className="rounded-xl bg-success/[0.06] border border-success/20 p-3 mb-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-success/80 mb-1">
                      Yanıtın · {new Date(m.replied_at).toLocaleString('tr-TR')}
                    </p>
                    <p className="text-sm text-ink dark:text-white whitespace-pre-line">{m.reply_body}</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2">
                  <textarea
                    value={replyDrafts[m.id] ?? m.reply_body ?? ''}
                    onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [m.id]: e.target.value }))}
                    placeholder={m.reply_body ? 'Yanıtı düzenle...' : 'Yanıt yaz...'}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-primary-blue/15 dark:border-white/15 bg-white/70 dark:bg-white/5 text-sm resize-none h-16 focus:outline-none focus:ring-2 focus:ring-accent-blue/30"
                  />
                  <button
                    onClick={() => handleReplyMessage(m.id)}
                    disabled={replyingId === m.id}
                    className="press-btn magnetic-btn px-4 py-2.5 rounded-xl bg-primary-blue text-white font-extrabold text-sm shrink-0 disabled:opacity-60"
                  >
                    {replyingId === m.id ? 'Gönderiliyor...' : m.reply_body ? 'Güncelle' : 'Yanıtla'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-3xl bg-white/70 dark:bg-white/5 border border-primary-blue/10 dark:border-white/10 shadow-card p-6 mb-8">
        <h2 className="flex items-center gap-2 font-extrabold text-ink dark:text-white mb-4">
          <Globe size={18} className="text-accent-blue" /> Agora Çevrimiçi Turnuvası — Kayıtlar
          <span className="text-sm font-bold text-ink/40 dark:text-ice-white/40">({onlineRegistrations.length})</span>
        </h2>
        {onlineRegistrations.length === 0 ? (
          <p className="text-sm text-ink/40 dark:text-ice-white/40">Henüz kimse kayıt olmadı.</p>
        ) : (
          <div className="flex flex-col gap-2 overflow-x-auto">
            {onlineRegistrations.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-3 rounded-xl bg-primary-blue/[0.04] dark:bg-white/5 text-sm">
                <span className="font-bold text-ink dark:text-white min-w-[9rem]">{r.full_name}</span>
                <span className="flex items-center gap-1 text-ink/50 dark:text-ice-white/50 text-xs"><Mail size={12} /> {r.email}</span>
                <span className="flex items-center gap-1 text-ink/50 dark:text-ice-white/50 text-xs"><Phone size={12} /> {r.phone}</span>
                <span className="text-accent-blue font-data font-bold text-xs">OGS: {r.ogs_nickname}</span>
                {r.kgs_nickname && <span className="text-token font-data font-bold text-xs">KGS: {r.kgs_nickname}</span>}
                <span className="text-ink/50 dark:text-ice-white/50 font-data text-xs">{r.egf_level}</span>
                <span className="flex items-center gap-1 text-ink/40 dark:text-ice-white/40 font-data text-xs"><Hash size={12} /> {r.egd_pin || '—'}</span>
                <button onClick={() => handleDeleteOnlineRegistration(r.id)} className="ml-auto text-ink/30 dark:text-ice-white/40 hover:text-heart shrink-0"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-3xl bg-white/70 dark:bg-white/5 border border-primary-blue/10 dark:border-white/10 shadow-card p-6 mb-8">
        <h2 className="flex items-center gap-2 font-extrabold text-ink dark:text-white mb-4">
          <Swords size={18} className="text-accent-blue" /> Agora Çevrimiçi Turnuvası — Eşleştirme &amp; Sonuç
        </h2>

        <form onSubmit={handleAddOnlineMatch} className="grid sm:grid-cols-4 gap-3 mb-3 items-end">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-ink/50 dark:text-ice-white/50 mb-1.5 block">Tur</label>
            <input
              type="number"
              min={1}
              value={matchRound}
              onChange={(e) => setMatchRound(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-primary-blue/15 dark:border-white/15 bg-white/70 dark:bg-white/5 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-ink/50 dark:text-ice-white/50 mb-1.5 block">1. Oyuncu</label>
            <select value={matchP1} onChange={(e) => setMatchP1(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-primary-blue/15 dark:border-white/15 bg-white/70 dark:bg-white/5 text-sm">
              <option value="">Oyuncu seç</option>
              {onlinePlayersByLevel.map((p) => <option key={p.id} value={p.id}>{p.full_name} ({p.egf_level})</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-ink/50 dark:text-ice-white/50 mb-1.5 block">2. Oyuncu</label>
            <select
              value={matchP2}
              onChange={(e) => setMatchP2(e.target.value)}
              disabled={matchIsBye}
              className="w-full px-3 py-2 rounded-xl border border-primary-blue/15 dark:border-white/15 bg-white/70 dark:bg-white/5 text-sm disabled:opacity-50"
            >
              <option value="">Oyuncu seç</option>
              {onlinePlayersByLevel.map((p) => <option key={p.id} value={p.id}>{p.full_name} ({p.egf_level})</option>)}
            </select>
            <label className="flex items-center gap-1.5 mt-1.5 text-xs font-bold text-ink/50 dark:text-ice-white/50">
              <input type="checkbox" checked={matchIsBye} onChange={(e) => { setMatchIsBye(e.target.checked); setMatchP2('') }} /> Bay (rakipsiz)
            </label>
          </div>
          <button type="submit" className="press-btn magnetic-btn px-4 py-2.5 rounded-xl bg-primary-blue text-white font-bold h-fit">Eşleştirme Ekle</button>
          {matchMessage && <p className="sm:col-span-4 text-xs font-bold text-accent-blue">{matchMessage}</p>}
        </form>

        <div className="flex flex-col gap-4 mt-5">
          {Object.keys(onlineMatchesByRound).length === 0 && <p className="text-sm text-ink/40 italic">Henüz eşleştirme yok.</p>}
          {Object.keys(onlineMatchesByRound)
            .sort((a, b) => Number(a) - Number(b))
            .map((round) => (
              <div key={round}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink/40 dark:text-ice-white/40 mb-2">{round}. Tur</h3>
                <div className="flex flex-col gap-1.5">
                  {onlineMatchesByRound[round].map((m) => (
                    <div key={m.id} className="flex flex-wrap items-center gap-3 px-3 py-2 rounded-xl bg-primary-blue/[0.04] dark:bg-white/5 text-sm">
                      <span className="flex-1 min-w-[10rem]">
                        <b className={m.winner_id === m.player1_id ? 'text-success' : ''}>{onlinePlayerName(m.player1_id)}</b>
                        {' vs '}
                        <b className={m.winner_id === m.player2_id ? 'text-success' : ''}>{m.player2_id ? onlinePlayerName(m.player2_id) : 'BAY'}</b>
                      </span>
                      {m.player2_id ? (
                        <div className="flex items-center gap-1.5 text-xs">
                          <button
                            onClick={() => handleSetOnlineMatchResult(m.id, m.player1_id, false)}
                            className={`px-2.5 py-1.5 rounded-lg font-bold ${m.winner_id === m.player1_id ? 'bg-success text-white' : 'bg-primary-blue/5 dark:bg-white/10 text-ink/60 dark:text-ice-white/60'}`}
                          >
                            1. Kazandı
                          </button>
                          <button
                            onClick={() => handleSetOnlineMatchResult(m.id, m.player2_id, false)}
                            className={`px-2.5 py-1.5 rounded-lg font-bold ${m.winner_id === m.player2_id ? 'bg-success text-white' : 'bg-primary-blue/5 dark:bg-white/10 text-ink/60 dark:text-ice-white/60'}`}
                          >
                            2. Kazandı
                          </button>
                          <button
                            onClick={() => handleSetOnlineMatchResult(m.id, null, true)}
                            className={`px-2.5 py-1.5 rounded-lg font-bold ${m.is_draw ? 'bg-token text-white' : 'bg-primary-blue/5 dark:bg-white/10 text-ink/60 dark:text-ice-white/60'}`}
                          >
                            Berabere
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-ink/40 dark:text-ice-white/40">Otomatik galibiyet</span>
                      )}
                      <button onClick={() => handleDeleteOnlineMatch(m.id)} className="ml-auto text-ink/30 dark:text-ice-white/40 hover:text-heart shrink-0"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </section>

      <section className="rounded-3xl bg-white/70 dark:bg-white/5 border border-primary-blue/10 dark:border-white/10 shadow-card p-6 mb-8">
        <h2 className="flex items-center gap-2 font-extrabold text-ink dark:text-white mb-4">
          <MessageCircle size={18} className="text-accent-blue" /> Yorumlar
          <span className="text-sm font-bold text-ink/40 dark:text-ice-white/40">({comments.length})</span>
        </h2>
        {comments.length === 0 ? (
          <p className="text-sm text-ink/40 dark:text-ice-white/40">Henüz yorum yok.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {comments.map((c) => (
              <div key={c.id} className="flex items-start justify-between gap-3 px-4 py-3 rounded-xl bg-primary-blue/[0.04] dark:bg-white/5 text-sm">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-1">
                    <span className="font-bold text-ink dark:text-white">{c.authorName}</span>
                    <span className="text-ink/30 dark:text-ice-white/30 text-xs">· {new Date(c.created_at).toLocaleString('tr-TR')}</span>
                    {c.targetHref ? (
                      <Link to={c.targetHref} className="text-accent-blue text-xs font-bold hover:underline">{c.targetLabel}</Link>
                    ) : (
                      <span className="text-ink/40 dark:text-ice-white/40 text-xs">{c.targetLabel}</span>
                    )}
                  </div>
                  <p className="text-ink/80 dark:text-ice-white/80 whitespace-pre-line">{c.body}</p>
                </div>
                <button onClick={() => handleDeleteComment(c.id)} title="Sil" className="shrink-0 text-ink/30 dark:text-ice-white/40 hover:text-heart"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        )}
      </section>

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
                  <button onClick={() => handleDismissRegistration(r.id)} className="p-2 text-ink/30 dark:text-ice-white/40 hover:text-heart" aria-label="Reddet">
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
                  <button onClick={() => handleRemovePlayer(p.id)} className="text-ink/30 dark:text-ice-white/40 hover:text-heart"><Trash2 size={14} /></button>
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
                  <button onClick={() => handleDeleteMatch(m.id)} className="text-ink/30 dark:text-ice-white/40 hover:text-heart"><Trash2 size={13} /></button>
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
