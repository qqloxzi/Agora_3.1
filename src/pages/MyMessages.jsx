import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { GraduationCap, MessageSquare } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { fetchMyInstructorMessages } from '../lib/instructorMessages'

export function MyMessages() {
  const { user, loading } = useAuth()
  const [messages, setMessages] = useState([])
  const [messagesLoading, setMessagesLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetchMyInstructorMessages(user.id).then((data) => {
      setMessages(data)
      setMessagesLoading(false)
    })
  }, [user])

  if (loading) return <p className="text-center py-24 text-ink/40">Yükleniyor...</p>
  if (!user) return <Navigate to="/kayit" replace />

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-14">
      <div className="text-center max-w-xl mx-auto mb-10">
        <span className="text-accent-blue font-bold tracking-[0.2em] uppercase text-xs">Eğitmen Yanıtları</span>
        <h1 className="text-3xl md:text-4xl font-black text-primary-blue dark:text-white mt-3 mb-4">Mesajlarım</h1>
        <p className="text-ink/60 dark:text-ice-white/60">Eğitmenlere gönderdiğin özel ders mesajları ve varsa aldığın yanıtlar burada.</p>
      </div>

      {messagesLoading ? (
        <p className="text-center text-sm text-ink/40">Yükleniyor...</p>
      ) : messages.length === 0 ? (
        <div className="rounded-3xl bg-white/70 dark:bg-white/5 border border-primary-blue/10 dark:border-white/10 shadow-card p-10 text-center">
          <MessageSquare size={28} className="text-ink/20 mx-auto mb-3" />
          <p className="text-sm text-ink/40 dark:text-ice-white/40">Henüz bir eğitmene mesaj göndermedin.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {messages.map((m) => (
            <div key={m.id} className="rounded-3xl bg-white/70 dark:bg-white/5 border border-primary-blue/10 dark:border-white/10 shadow-card p-6">
              <div className="flex items-center gap-2 text-xs font-bold text-accent-blue mb-2">
                <GraduationCap size={14} /> {m.instructor_name}
                <span className="text-ink/30 dark:text-ice-white/30 font-normal">
                  · {new Date(m.created_at).toLocaleString('tr-TR')}
                </span>
              </div>
              <p className="text-sm text-ink/70 dark:text-ice-white/70 whitespace-pre-line mb-3">{m.body}</p>

              {m.reply_body ? (
                <div className="rounded-2xl bg-success/[0.06] border border-success/20 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-success/80 mb-1">
                    {m.instructor_name} yanıtladı · {new Date(m.replied_at).toLocaleString('tr-TR')}
                  </p>
                  <p className="text-sm text-ink dark:text-white whitespace-pre-line">{m.reply_body}</p>
                </div>
              ) : (
                <p className="text-xs font-bold text-ink/40 dark:text-ice-white/40">Henüz yanıt yok — en kısa sürede dönüş yapılacak.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
