import { Smartphone, Flame, Trophy } from 'lucide-react'

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.agoragoakademisi.app'

export function MobileAppPromo() {
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-16">
      <div className="grid lg:grid-cols-2 gap-10 items-center">
        <div className="order-2 lg:order-1 flex justify-center">
          <div className="relative w-56 aspect-[9/19] rounded-[2.5rem] agora-gradient-surface p-2 shadow-2xl">
            <div className="w-full h-full rounded-[2rem] bg-ice-white dark:bg-ink flex flex-col items-center justify-center gap-4 p-6">
              <div className="w-16 h-16 rounded-2xl agora-gradient-surface flex items-center justify-center shadow-card">
                <Smartphone className="text-white" size={28} />
              </div>
              <p className="font-display italic font-bold text-lg text-primary-blue dark:text-white text-center">Go Akademisi</p>
              <div className="flex items-center gap-2 text-xs font-bold text-ink/50 dark:text-ice-white/50">
                <Flame size={13} className="text-streak" /> Seri <Trophy size={13} className="text-token ml-1" /> Ligler
              </div>
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2 text-center lg:text-left">
          <span className="text-accent-blue font-bold tracking-[0.2em] uppercase text-xs">Cebinde Agora</span>
          <h2 className="text-3xl md:text-4xl font-black text-ink dark:text-white mt-3 mb-4">Go Akademisi Mobil Uygulaması</h2>
          <p className="text-ink/60 dark:text-ice-white/60 leading-relaxed mb-6 max-w-md mx-auto lg:mx-0">
            Agora'nın mobil uygulaması Go Akademisi ile atölyelerine, serine ve lig durumuna her yerden göz at. Şimdilik yalnızca Google Play'de.
          </p>
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="magnetic-btn inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-ink dark:bg-white text-white dark:text-ink shadow-card"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3.6 2.4c-.4.3-.6.7-.6 1.3v16.6c0 .6.2 1 .6 1.3l.1.1L13 12.4v-.2L3.7 2.3l-.1.1z" fill="#00D2FF" />
              <path d="M16.1 15.5l-3.1-3.1v-.2l3.1-3.1 6.5 3.7c.7.4.7 1.4 0 1.8l-6.5 3.9z" fill="#FFD200" />
              <path d="M16.1 8.5L12.9 12l-9.3-9.6c.3-.3.8-.4 1.4 0z" fill="#00E676" />
              <path d="M16.1 15.5l-11.1 6.1c-.5.3-1 .3-1.4 0l9.3-9.6 3.2 3.5z" fill="#FF3B30" />
            </svg>
            <span className="text-left">
              <span className="block text-[10px] uppercase tracking-wider opacity-70">Get it on</span>
              <span className="block text-base font-bold -mt-0.5">Google Play</span>
            </span>
          </a>
        </div>
      </div>
    </section>
  )
}
