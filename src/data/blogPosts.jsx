const LinkCard = ({ img, title, text, href }) => (
  <div className="flex flex-col md:flex-row gap-4 items-start mb-6">
    <img src={img} alt={title} className="w-20 md:w-24 object-contain rounded-md bg-white p-2 border border-primary-blue/10 dark:border-white/10" />
    <div className="p-5 rounded-2xl flex-1 border bg-ice-white/50 border-primary-blue/5 dark:bg-white/5 dark:border-white/10">
      <h4 className="mt-0 mb-2 font-bold text-xl text-ink dark:text-white">{title}</h4>
      <p className={href ? 'mb-4' : 'mb-0'} style={{ lineHeight: 1.6 }}>
        <span className="text-base text-ink/70 dark:text-ice-white/80">{text}</span>
      </p>
      {href && (
        <a href={href} target="_blank" rel="noopener noreferrer" className="font-bold text-accent-blue hover:underline inline-flex items-center gap-1">
          Siteye Git →
        </a>
      )}
    </div>
  </div>
)

export const blogPosts = [
  {
    slug: 'goya-baslarken',
    title: "Go'ya Başlarken",
    category: 'Rehber',
    author: 'Ali Karakaya',
    publishDate: new Date('2024-12-02'),
    image: '/goyabaslarken/Goyabaslarken.jpg',
    snippet: 'Go oyununa yeni başlayanlar için sunucular, uygulamalar ve kitap önerileri.',
    content: (
      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-bold text-primary-blue dark:text-white mb-6 border-b border-primary-blue/10 dark:border-white/10 pb-2">Go Sunucuları</h2>
          <LinkCard img="/goyabaslarken/ogs.svg" title="OGS" href="https://online-go.com/play" text="Web üzerinden oynanabilen, basit ve kullanıcı dostu arayüzüyle Go oynamaya başlamak için uygun bir platformdur. Oyuncu kitlesi ağırlıklı olarak Avrupa'dandır." />
          <LinkCard img="/goyabaslarken/kgs.png" title="KGS" href="https://www.gokgs.com/" text="Uzun süredir kullanılan köklü bir Go sunucusudur. Java tabanlıdır. Oyuncu veritabanı çoğunlukla Avrupa ve Amerika menşeilidir." />
          <LinkCard img="/goyabaslarken/fox.jpg" title="FOX" href="https://www.foxwq.com/soft/foreign.html" text="Çin merkezli olup çok geniş ve aktif bir oyuncu havuzuna sahiptir. Arayüzü ilk başta karmaşık gelebilir ancak alışınca oldukça işlevseldir." />
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary-blue dark:text-white mb-6 border-b border-primary-blue/10 dark:border-white/10 pb-2">Tsumego ve Problem Platformları</h2>
          <LinkCard img="/goyabaslarken/tsumegoHero.png" title="Tsumego Hero" href="https://tsumego-hero.com/" text="Oldukça popüler ve farklı problem setleri ile web tabanlı bir uygulama." />
          <LinkCard img="/goyabaslarken/goproblems.svg" title="Go Problems" href="https://www.goproblems.com/" text="Kullanıcı dostu arayüzü ve sunduğu çok yönlü problemlerle, özellikle ileri seviye oyuncular için keyifli bir platform." />
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary-blue dark:text-white mb-6 border-b border-primary-blue/10 dark:border-white/10 pb-2">Android ve iOS Uygulamaları</h2>
          <LinkCard img="/goyabaslarken/badukpop.png" title="BadukPop" text="iOS ve Android için mevcut. Botlara karşı oynayabilir, tsumego çözebilir ve temel Go çalışmaları yapabilirsiniz." />
          <LinkCard img="/goyabaslarken/weiqihub.png" title="WeiqiHub" text="Her seviye ve konu başlığı için birçok farklı problem seti sunan oldukça kullanışlı bir uygulama." />
          <LinkCard img="/goyabaslarken/surround.png" title="Surround" text="Sadece iOS'ta mevcut. OGS hesabınıza bağlanarak online maçlarınızı telefondan oynayabilmenizi sağlar." />
          <LinkCard img="/goyabaslarken/tsumegopro.png" title="Tsumego Pro" text="Üç farklı problem seti ve günlük soru havuzuyla düzenli çalışma imkânı sunar." />
        </section>
      </div>
    ),
  },
]

export function findBlogPost(slug) {
  return blogPosts.find((p) => p.slug === slug) ?? null
}
