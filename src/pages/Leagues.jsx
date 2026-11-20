import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { LeagueRegistration } from '../components/LeagueRegistration'
import { TournamentResults, FinalStandingsTable } from '../components/OnlineTournamentResults'

export function Leagues() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-11">
      <div className="text-center max-w-2xl mx-auto mb-11">
        <h1 className="text-3xl md:text-4xl font-black text-primary-blue dark:text-white">Agora Turnuvası</h1>
      </div>

      <section className="mb-11 max-w-4xl">
        <span className="text-accent-blue font-bold tracking-[0.2em] uppercase text-[10px]">5. Sezon</span>
        <h2 className="text-2xl font-black text-primary-blue dark:text-white mt-1 mb-2">Turnuva Bilgileri</h2>
        <p className="text-sm text-ink dark:text-white leading-relaxed">
          Tek turnuva, üç eğitmen. Seviyene göre eğitmenin belirlenir ve maçların McMahon sistemiyle eşleştirilir.
        </p>

        <dl className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div>
            <dt className="font-bold text-ink/60 dark:text-ice-white/60">Eşleştirme operatörü</dt>
            <dd className="font-extrabold text-ink dark:text-white mt-0.5">Oğuz Erdoğan</dd>
          </div>
          <div>
            <dt className="font-bold text-ink/60 dark:text-ice-white/60">Sistem</dt>
            <dd className="font-extrabold text-ink dark:text-white mt-0.5">McMahon</dd>
          </div>
          <div>
            <dt className="font-bold text-ink/60 dark:text-ice-white/60">Süre</dt>
            <dd className="font-extrabold text-ink dark:text-white mt-0.5">5 hafta · 5 maç</dd>
          </div>
          <div>
            <dt className="font-bold text-ink/60 dark:text-ice-white/60">Sonuçlar</dt>
            <dd className="font-extrabold text-ink dark:text-white mt-0.5">EGD'ye işlenir</dd>
          </div>
        </dl>

        <div className="mt-6 pt-4 border-t border-primary-blue/10 dark:border-white/10">
          <h3 className="text-sm font-extrabold text-ink dark:text-white mb-2">Yapay Zekâ Kullanımı</h3>
          <ul className="list-disc pl-4 flex flex-col gap-1.5 text-xs text-ink dark:text-white leading-relaxed">
            <li>Turnuva sırasında herhangi bir yapay zekâ / Go AI programının kullanılması kesinlikle yasaktır.</li>
            <li>KataGo, Leela Zero, FineArt ve benzeri Go motorları ile oyun sırasında hamle önerisi, pozisyon analizi, kazanma yüzdesi, skor tahmini veya herhangi bir başka şekilde bilgisayar desteği almak yasaktır.</li>
            <li>Bu yasak yalnızca doğrudan hamle seçmek amacıyla AI kullanmayı değil, devam eden bir karşılaşmanın herhangi bir aşamasında yapay zekâ ile analiz yapılmasını da kapsar.</li>
            <li>AI kullanımına ilişkin şüpheli durumlarda organizasyon ekibi oyun kayıtlarını inceleme hakkına sahiptir. Yapay zekâ kullandığı tespit edilen oyuncu turnuvadan çıkarılabilir ve ilgili karşılaşmaları veya turnuva sonuçları geçersiz sayılabilir.</li>
            <li>Oyun tamamlandıktan ve sonuç organizasyona bildirildikten sonra oyuncuların kendi oyunlarını eğitim amacıyla AI ile incelemelerinde herhangi bir sakınca yoktur.</li>
          </ul>
        </div>
      </section>

      <LeagueRegistration />

      <section className="mt-16">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h2 className="text-2xl font-black text-primary-blue dark:text-white">Agora Çevrimiçi Turnuvası — Geçmiş Sonuçlar</h2>
          <Link to="/agora-online-ligi" className="inline-flex items-center gap-1.5 text-sm font-bold text-accent-blue hover:underline">
            Turnuva sayfası <ArrowRight size={15} />
          </Link>
        </div>
        <TournamentResults />
        <FinalStandingsTable />
      </section>
    </div>
  )
}
