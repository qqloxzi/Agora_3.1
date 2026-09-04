import { useState } from 'react'
import { MapPin, Mail, Send } from 'lucide-react'
import { InstagramIcon, FacebookIcon, YoutubeIcon } from '../components/ui/SocialIcons'

export function Contact() {
  const [result, setResult] = useState('')
  const [status, setStatus] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    const form = e.target
    if (!form.checkValidity()) {
      form.reportValidity()
      return
    }
    setResult('Gönderiliyor...')
    setStatus('loading')
    const formData = new FormData(form)
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(formData)),
      })
      const json = await response.json()
      if (response.status === 200) {
        setResult('Mesajın gönderildi! Teşekkürler.')
        setStatus('success')
      } else {
        setResult(json.message || 'Bir hata oluştu.')
        setStatus('error')
      }
    } catch {
      setResult('Bir şeyler ters gitti!')
      setStatus('error')
    } finally {
      form.reset()
      setTimeout(() => {
        setResult('')
        setStatus('')
      }, 5000)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-14">
      <div className="text-center max-w-xl mx-auto mb-14">
        <span className="text-accent-blue font-bold tracking-[0.2em] uppercase text-xs">Bize Ulaşın</span>
        <h1 className="text-4xl md:text-5xl font-black text-primary-blue dark:text-white mt-3 mb-4">İletişim</h1>
        <p className="text-ink/60 dark:text-ice-white/60">Sorularınız ve geri bildirimleriniz bizim için değerli.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6 p-8 rounded-3xl bg-white/70 dark:bg-white/5 border border-primary-blue/10 dark:border-white/10 shadow-card">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-accent-blue/10 flex items-center justify-center text-accent-blue shrink-0"><MapPin size={20} /></div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-ink/40 dark:text-ice-white/40 mb-1">Adres</p>
              <p className="font-bold text-ink dark:text-white">Urla / İzmir</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-accent-blue/10 flex items-center justify-center text-accent-blue shrink-0"><Mail size={20} /></div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-ink/40 dark:text-ice-white/40 mb-1">E-Posta</p>
              <a href="mailto:agoragoakademisi@gmail.com" className="font-bold text-ink dark:text-white hover:text-accent-blue">agoragoakademisi@gmail.com</a>
            </div>
          </div>
          <div className="pt-4 border-t border-primary-blue/10 dark:border-white/10 flex gap-3">
            <a href="https://www.instagram.com/agoragoakademisi/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-primary-blue/20 dark:border-white/20 flex items-center justify-center hover:bg-accent-blue hover:text-white transition-colors"><InstagramIcon size={16} /></a>
            <a href="https://www.facebook.com/profile.php?id=61583449484168" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-primary-blue/20 dark:border-white/20 flex items-center justify-center hover:bg-accent-blue hover:text-white transition-colors"><FacebookIcon size={16} /></a>
            <a href="https://www.youtube.com/@Agoragoakademisi" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-primary-blue/20 dark:border-white/20 flex items-center justify-center hover:bg-accent-blue hover:text-white transition-colors"><YoutubeIcon size={16} /></a>
          </div>
          <div className="w-full h-56 rounded-2xl overflow-hidden border border-primary-blue/10 dark:border-white/10">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d100063.1595168037!2d26.685375997265625!3d38.330882!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14b9534ed2bc224f%3A0xb3ca89812bf085bb!2sUrla%2F%C4%B0zmir!5e0!3m2!1sen!2str!4v1700000000000!5m2!1sen!2str"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Urla, İzmir"
            />
          </div>
        </div>

        <div className="lg:col-span-3 p-8 rounded-3xl bg-white/70 dark:bg-white/5 border border-primary-blue/10 dark:border-white/10 shadow-card">
          <h2 className="text-xl font-extrabold text-ink dark:text-white mb-6">Bize Yazın</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <input type="hidden" name="access_key" value="f3dad19b-f9f6-44e5-9735-6e30f788478d" />
            <input type="checkbox" className="hidden" name="botcheck" tabIndex={-1} autoComplete="off" />
            <div className="grid sm:grid-cols-2 gap-5">
              <input name="name" required placeholder="Adınız Soyadınız" className="px-4 py-3.5 rounded-xl border border-primary-blue/15 dark:border-white/15 bg-white/70 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/30" />
              <input name="email" type="email" required placeholder="ornek@email.com" className="px-4 py-3.5 rounded-xl border border-primary-blue/15 dark:border-white/15 bg-white/70 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/30" />
            </div>
            <textarea name="message" required placeholder="Size nasıl yardımcı olabiliriz?" className="px-4 py-3.5 rounded-xl border border-primary-blue/15 dark:border-white/15 bg-white/70 dark:bg-white/5 text-sm h-32 resize-none focus:outline-none focus:ring-2 focus:ring-accent-blue/30" />
            <button type="submit" disabled={status === 'loading'} className="press-btn magnetic-btn self-end px-6 py-3.5 rounded-2xl bg-primary-blue text-white font-extrabold flex items-center gap-2 disabled:opacity-60">
              {status === 'loading' ? 'Gönderiliyor...' : 'Mesajı Gönder'} <Send size={16} />
            </button>
            {result && (
              <p className={`text-sm font-bold text-center p-3 rounded-xl ${status === 'success' ? 'bg-success/10 text-success' : status === 'error' ? 'bg-heart/10 text-heart' : 'bg-accent-blue/10 text-accent-blue'}`}>
                {result}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
