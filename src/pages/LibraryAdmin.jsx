import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, Trash2, Eye } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { fetchLibraryGames, addLibraryGame, deleteLibraryGame } from '../lib/libraryGames'

const EMPTY_FORM = { title: '', blackName: '', blackRank: '', whiteName: '', whiteRank: '', sgfRaw: '' }

export function LibraryAdmin() {
  const { user, profile, loading } = useAuth()
  const [games, setGames] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  function reload() {
    fetchLibraryGames().then(setGames)
  }

  useEffect(() => {
    if (profile?.is_admin) reload()
  }, [profile])

  if (loading) return <p className="text-center py-24 text-ink/40">Yükleniyor...</p>
  if (!user) return <Navigate to="/giris" replace />
  if (!profile?.is_admin) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <p className="text-ink/60 dark:text-ice-white/60">Bu sayfaya erişim yetkin yok.</p>
      </div>
    )
  }

  async function handleAdd(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.sgfRaw.trim()) {
      setMessage('Başlık ve SGF metni zorunlu.')
      return
    }
    setSaving(true)
    const { error } = await addLibraryGame({
      title: form.title.trim(),
      black_name: form.blackName.trim(),
      black_rank: form.blackRank.trim(),
      white_name: form.whiteName.trim(),
      white_rank: form.whiteRank.trim(),
      sgf_raw: form.sgfRaw.trim(),
      sort_order: games.length,
    })
    setSaving(false)
    if (error) {
      setMessage('Kaydedilemedi: ' + error.message)
      return
    }
    setForm(EMPTY_FORM)
    setMessage('Parti eklendi.')
    setTimeout(() => setMessage(''), 2500)
    reload()
  }

  async function handleDelete(id) {
    await deleteLibraryGame(id)
    reload()
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-14">
      <Link to="/admin" className="inline-flex items-center gap-1.5 text-sm font-bold text-ink/60 dark:text-ice-white/60 hover:text-accent-blue mb-4">
        <ArrowLeft size={16} /> Yönetim
      </Link>

      <div className="flex items-center gap-2 mb-2">
        <BookOpen className="text-accent-blue" size={22} />
        <h1 className="text-2xl font-black text-ink dark:text-white">Kütüphane — Parti Yönetimi</h1>
      </div>
      <p className="text-sm text-ink/50 dark:text-ice-white/50 mb-8">
        SGF metnini yapıştır, oyuncu isim/derecelerini gir — Kütüphane sayfasında öğrencilere gösterilir.
      </p>

      <form onSubmit={handleAdd} className="rounded-3xl bg-white/70 dark:bg-white/5 border border-primary-blue/10 dark:border-white/10 shadow-card p-6 mb-8 grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="text-xs font-bold uppercase tracking-wider text-ink/50 dark:text-ice-white/50 mb-1.5 block">Parti Başlığı</label>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Ör. AlphaGo — Lee Sedol, 4. Maç"
            className="w-full px-4 py-3 rounded-xl border border-primary-blue/15 dark:border-white/15 bg-white/70 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/30"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-ink/50 dark:text-ice-white/50 mb-1.5 block">Siyah — İsim</label>
          <input
            value={form.blackName}
            onChange={(e) => setForm((f) => ({ ...f, blackName: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-primary-blue/15 dark:border-white/15 bg-white/70 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/30"
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-ink/50 dark:text-ice-white/50 mb-1.5 block">Siyah — Derece</label>
          <input
            value={form.blackRank}
            onChange={(e) => setForm((f) => ({ ...f, blackRank: e.target.value }))}
            placeholder="9p"
            className="w-full px-4 py-3 rounded-xl border border-primary-blue/15 dark:border-white/15 bg-white/70 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/30"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-ink/50 dark:text-ice-white/50 mb-1.5 block">Beyaz — İsim</label>
          <input
            value={form.whiteName}
            onChange={(e) => setForm((f) => ({ ...f, whiteName: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-primary-blue/15 dark:border-white/15 bg-white/70 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/30"
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-ink/50 dark:text-ice-white/50 mb-1.5 block">Beyaz — Derece</label>
          <input
            value={form.whiteRank}
            onChange={(e) => setForm((f) => ({ ...f, whiteRank: e.target.value }))}
            placeholder="9p"
            className="w-full px-4 py-3 rounded-xl border border-primary-blue/15 dark:border-white/15 bg-white/70 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/30"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-xs font-bold uppercase tracking-wider text-ink/50 dark:text-ice-white/50 mb-1.5 block">SGF Metni</label>
          <textarea
            value={form.sgfRaw}
            onChange={(e) => setForm((f) => ({ ...f, sgfRaw: e.target.value }))}
            rows={6}
            placeholder="(;FF[4]GM[1]SZ[19]PB[...]PW[...];B[pd];W[dp]...)"
            className="w-full px-4 py-3 rounded-xl border border-primary-blue/15 dark:border-white/15 bg-white/70 dark:bg-white/5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-accent-blue/30"
          />
        </div>

        <div className="sm:col-span-2 flex items-center gap-3">
          <button disabled={saving} type="submit" className="press-btn magnetic-btn px-5 py-2.5 rounded-xl bg-primary-blue text-white font-extrabold text-sm disabled:opacity-50">
            {saving ? 'Kaydediliyor...' : 'Partiyi Ekle'}
          </button>
          {message && <span className="text-xs font-bold text-ink/60 dark:text-ice-white/60">{message}</span>}
        </div>
      </form>

      <div className="rounded-3xl bg-white/70 dark:bg-white/5 border border-primary-blue/10 dark:border-white/10 shadow-card p-6">
        <h2 className="font-extrabold text-ink dark:text-white mb-4">Kayıtlı Partiler ({games.length})</h2>
        {games.length === 0 ? (
          <p className="text-sm text-ink/40 dark:text-ice-white/40">Henüz parti eklenmedi.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {games.map((g) => (
              <div key={g.id} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary-blue/[0.04] dark:bg-white/5 text-sm">
                <span className="flex-1 min-w-0 font-bold text-ink dark:text-white truncate">{g.title}</span>
                <span className="text-xs text-ink/40 dark:text-ice-white/40 shrink-0 hidden sm:inline">
                  {g.black_name || 'Siyah'} vs {g.white_name || 'Beyaz'}
                </span>
                <Link to={`/kutuphane/parti/${g.id}`} className="text-ink/40 hover:text-accent-blue shrink-0" title="Önizle">
                  <Eye size={15} />
                </Link>
                <button onClick={() => handleDelete(g.id)} className="text-ink/30 dark:text-ice-white/40 hover:text-heart shrink-0" title="Sil">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
