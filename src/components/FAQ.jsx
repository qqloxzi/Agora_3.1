import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'Atölyeler nasıl çalışıyor?',
    answer: 'Atölyeler, seviyene uygun bir beceri ağacında ilerlediğin ücretsiz alıştırma setleridir. Her alıştırmayı tamamladığında bir sonrakinin kilidi açılır, XP ve token kazanırsın.',
  },
  {
    question: 'Ligler ile Atölyeler arasındaki fark nedir?',
    answer: 'Atölyeler herkese açık ve ücretsizdir, kendi hızında ilerlersin. Ligler ise eğitmen eşliğinde yürütülen, gerçek rakiplerle eşleştiğin 6 haftalık ücretli programlardır.',
  },
  {
    question: 'Can (kalp) sistemi nedir, canlarım biterse ne olur?',
    answer: 'Alıştırmalarda yanlış bir hamle bir can götürür. Canların zamanla kendiliğinden yenilenir; tükendiğinde bir sonraki canını bekleyip devam edebilirsin.',
  },
  {
    question: 'Ödeme nasıl yapılıyor?',
    answer: 'Lig ödemeleri için PayTR entegrasyonu yakında aktif olacak. Şu an bir lige ödeme yapmak istersen İletişim sayfasından bize ulaşabilirsin.',
  },
  {
    question: 'Mobil uygulamanız var mı?',
    answer: "Evet, Go Akademisi adıyla yayınladığımız mobil uygulama şu an yalnızca Google Play'de mevcut.",
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <section className="max-w-3xl mx-auto px-4 md:px-6 py-16">
      <div className="text-center mb-10">
        <span className="text-accent-blue font-bold tracking-[0.2em] uppercase text-xs">Soru İşaretlerin Kalmasın</span>
        <h2 className="text-3xl md:text-4xl font-black text-ink dark:text-white mt-3">Sıkça Sorulan Sorular</h2>
      </div>

      <div className="rounded-3xl bg-white/70 dark:bg-white/5 border border-primary-blue/10 dark:border-white/10 shadow-card overflow-hidden">
        {faqs.map((item, i) => {
          const isOpen = openIndex === i
          return (
            <div key={item.question} className={i > 0 ? 'border-t border-primary-blue/10 dark:border-white/10' : ''}>
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-5 md:px-7 py-5 text-left hover:bg-primary-blue/[0.03] dark:hover:bg-white/[0.03] transition-colors"
              >
                <span className="font-bold text-ink dark:text-white">{item.question}</span>
                <motion.span animate={{ rotate: isOpen ? 180 : 0 }} className="shrink-0 text-accent-blue">
                  <ChevronDown size={18} />
                </motion.span>
              </button>
              <motion.div
                initial={false}
                animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <p className="px-5 md:px-7 pb-5 text-sm text-ink/60 dark:text-ice-white/60 leading-relaxed">{item.answer}</p>
              </motion.div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
