import { Link } from 'react-router-dom'
import { Mail, MapPin } from 'lucide-react'
import { InstagramIcon, FacebookIcon, YoutubeIcon } from './ui/SocialIcons'

export function Footer() {
  return (
    <footer className="mt-24 border-t border-primary-blue/10 dark:border-white/10 bg-white/40 dark:bg-white/[0.02]">
      <div className="max-w-7xl mx-auto px-6 py-14 grid gap-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <img src="/transparentAgora.svg" alt="Agora" className="h-7 w-7" />
            <span className="font-display font-bold text-lg italic text-primary-blue dark:text-white">Agora</span>
          </div>
          <p className="text-sm text-ink/60 dark:text-ice-white/60 leading-relaxed">Go'yu (Baduk) interaktif atölyeler, ligler ve gerçek bir topluluk ile öğren.</p>
        </div>

        <div>
          <h4 className="font-bold text-sm text-ink dark:text-white mb-3 uppercase tracking-wider">Platform</h4>
          <ul className="flex flex-col gap-2 text-sm text-ink/60 dark:text-ice-white/60">
            <li><Link to="/atolyeler" className="hover:text-accent-blue transition-colors">Atölyeler</Link></li>
            <li><Link to="/ligler" className="hover:text-accent-blue transition-colors">Ligler</Link></li>
            <li><Link to="/fikstur" className="hover:text-accent-blue transition-colors">Fikstür</Link></li>
            <li><Link to="/bulmacalar" className="hover:text-accent-blue transition-colors">Bulmacalar</Link></li>
            <li><Link to="/liderlik-tablosu" className="hover:text-accent-blue transition-colors">Liderlik Tablosu</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-sm text-ink dark:text-white mb-3 uppercase tracking-wider">Akademi</h4>
          <ul className="flex flex-col gap-2 text-sm text-ink/60 dark:text-ice-white/60">
            <li><Link to="/hakkimizda" className="hover:text-accent-blue transition-colors">Hakkımızda</Link></li>
            <li><Link to="/blog" className="hover:text-accent-blue transition-colors">Kütüphane</Link></li>
            <li><Link to="/iletisim" className="hover:text-accent-blue transition-colors">İletişim</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-sm text-ink dark:text-white mb-3 uppercase tracking-wider">İletişim</h4>
          <ul className="flex flex-col gap-2.5 text-sm text-ink/60 dark:text-ice-white/60">
            <li className="flex items-center gap-2"><MapPin size={15} className="text-accent-blue shrink-0" /> Urla / İzmir</li>
            <li className="flex items-center gap-2"><Mail size={15} className="text-accent-blue shrink-0" /> agoragoakademisi@gmail.com</li>
          </ul>
          <div className="flex gap-3 mt-4">
            <a href="https://www.instagram.com/agoragoakademisi/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-primary-blue/20 dark:border-white/20 flex items-center justify-center text-ink/70 dark:text-white/70 hover:bg-accent-blue hover:text-white hover:border-transparent transition-all">
              <InstagramIcon size={16} />
            </a>
            <a href="https://www.facebook.com/profile.php?id=61583449484168" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-primary-blue/20 dark:border-white/20 flex items-center justify-center text-ink/70 dark:text-white/70 hover:bg-accent-blue hover:text-white hover:border-transparent transition-all">
              <FacebookIcon size={16} />
            </a>
            <a href="https://www.youtube.com/@Agoragoakademisi" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-primary-blue/20 dark:border-white/20 flex items-center justify-center text-ink/70 dark:text-white/70 hover:bg-accent-blue hover:text-white hover:border-transparent transition-all">
              <YoutubeIcon size={16} />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-primary-blue/10 dark:border-white/10 py-5 text-center text-xs text-ink/40 dark:text-ice-white/40">
        © {new Date().getFullYear()} Agora Go Akademisi. Tüm hakları saklıdır.
      </div>
    </footer>
  )
}
