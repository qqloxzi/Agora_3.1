import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Send, Trash2, MessageCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

export function CommentThread({ targetType, targetId, className = '' }) {
  const { user, profile } = useAuth()
  const [comments, setComments] = useState([])
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      const { data } = await supabase
        .from('comments')
        .select('id, body, created_at, user_id')
        .eq('target_type', targetType)
        .eq('target_id', targetId)
        .order('created_at', { ascending: false })
      if (active) {
        setComments(data ?? [])
        setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [targetType, targetId])

  async function submit(e) {
    e.preventDefault()
    if (!user || !body.trim() || sending) return
    setSending(true)
    const { data, error } = await supabase
      .from('comments')
      .insert({ target_type: targetType, target_id: targetId, user_id: user.id, body: body.trim() })
      .select('id, body, created_at, user_id')
      .single()
    setSending(false)
    if (!error && data) {
      setComments((prev) => [data, ...prev])
      setBody('')
    }
  }

  async function remove(id) {
    setComments((prev) => prev.filter((c) => c.id !== id))
    await supabase.from('comments').delete().eq('id', id)
  }

  return (
    <div className={className}>
      <h3 className="flex items-center gap-2 font-extrabold text-lg text-ink dark:text-white mb-4">
        <MessageCircle size={20} className="text-accent-blue" /> Yorumlar
        <span className="text-ink/40 dark:text-ice-white/40 font-normal text-sm">({comments.length})</span>
      </h3>

      {user ? (
        <form onSubmit={submit} className="flex gap-2 mb-6">
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={`${profile?.username || 'Sen'} olarak yorum yaz...`}
            maxLength={500}
            className="flex-1 px-4 py-2.5 rounded-xl border border-primary-blue/15 dark:border-white/15 bg-white/70 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/30"
          />
          <button
            type="submit"
            disabled={sending || !body.trim()}
            className="magnetic-btn shrink-0 px-4 py-2.5 rounded-xl bg-primary-blue text-white disabled:opacity-40"
          >
            <Send size={16} />
          </button>
        </form>
      ) : (
        <p className="text-sm text-ink/50 dark:text-ice-white/50 mb-6">
          Yorum yazmak için <Link to="/giris" className="text-accent-blue font-bold hover:underline">giriş yap</Link>.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {loading && <p className="text-sm text-ink/40">Yükleniyor...</p>}
        {!loading && comments.length === 0 && <p className="text-sm text-ink/40 dark:text-ice-white/40">Henüz yorum yok — ilk yorumu sen yaz.</p>}
        {comments.map((c) => (
          <div key={c.id} className="flex items-start justify-between gap-3 p-4 rounded-xl bg-white/60 dark:bg-white/5 border border-primary-blue/10 dark:border-white/10">
            <div>
              <p className="text-sm text-ink dark:text-white/90">{c.body}</p>
              <p className="text-xs text-ink/40 dark:text-ice-white/40 mt-1">{new Date(c.created_at).toLocaleDateString('tr-TR')}</p>
            </div>
            {(user?.id === c.user_id || profile?.is_admin) && (
              <button onClick={() => remove(c.id)} className="shrink-0 text-ink/30 hover:text-heart transition-colors" title={profile?.is_admin && user?.id !== c.user_id ? 'Admin olarak sil' : 'Sil'}>
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
