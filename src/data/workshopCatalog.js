// Curriculum menu (structure only — not puzzle content). Each course's actual
// lessons are pulled live from the `go_problems` table by `course_slug`
// (see src/lib/workshopProgress.js#fetchCourseLessons). A course with no
// matching rows yet simply renders as "içerik yakında" — add go_problems
// rows with this slug and it lights up automatically, no code changes needed.
// Every section holds at least 12 course slots (Gelişim has 5 extra Nefes Yarışı
// boxes up front) so the skill tree is ready for the
// full 36-workshop curriculum; only the first few per section are named
// topics today; the rest are "yakında" placeholders waiting for content.
import { JOSEKI_CATALOG } from './josekiCatalog'

// Joseki Sonrası'nın "Josekiyi oyna" alıştırmaları, her joseki bir kutu. Dersler
// go_problems'ten değil joseki verisinden gelir (lesson id `joseki:<slug>:<exId>`),
// bu yüzden Joseki Sonrası'nda çözülen alıştırma burada da çözülmüş sayılır.
// Daha ileri pincer ve kapatmalar ile komoku'nun yüksek kakari, diğer yaklaşma ve
// köşe kapatma grupları Aydınlanma'da; gerisi Gelişim'de.
const ADVANCED_JOSEKIS = new Set(['hoshi-ikken-basami-high', 'hoshi-niken-basami', 'hoshi-niken-basami-high', 'hoshi-kosumi-tsuke', 'hoshi-ogeima'])
const ADVANCED_GROUPS = new Set(['Komoku + Yüksek Kakari', 'Komoku + Diğer Yaklaşımlar', 'Komoku Köşe Kapatmaları', '3-3', 'Mokuhazushi', 'Takamoku'])
const isAdvanced = (e) => ADVANCED_JOSEKIS.has(e.slug) || ADVANCED_GROUPS.has(e.group)
const josekiCourse = (e) => ({
  slug: `joseki-${e.slug}`,
  title: e.title,
  description: e.info,
  joseki: e.slug,
  lessonCount: e.exercises,
})
const JOSEKI_COURSES = JOSEKI_CATALOG.filter((e) => e.slug && !isAdvanced(e)).map(josekiCourse)
const ADVANCED_JOSEKI_COURSES = JOSEKI_CATALOG.filter((e) => e.slug && isAdvanced(e)).map(josekiCourse)

function placeholderSlots(bandId, from, to) {
  const slots = []
  for (let n = from; n <= to; n++) {
    slots.push({ slug: `${bandId}-atolye-${n}`, title: `Atölye ${n}`, description: 'Yakında eklenecek.' })
  }
  return slots
}

export const WORKSHOP_SECTIONS = [
  {
    id: 'temel-taslar',
    title: 'Temel Taşlar',
    levelLabel: '17 – 12 Kyu',
    intro: 'Taş yerleştirme, bağlantı ve basit şekiller üzerinden sağlam bir temel kurun.',
    courses: [
      { slug: 'temel-josekiler', title: 'Temel Josekiler', description: 'Köşe mücadelelerinde temel joseki kalıpları.' },
      { slug: 'iyi-ve-kotu-sekiller', title: 'İyi ve Kötü Şekiller', description: 'Verimli ve verimsiz taş formlarını ayırt etme.' },
      { slug: 'saldiri', title: 'Saldırı', description: 'Zayıf gruplara baskı ve saldırı teknikleri.' },
      ...placeholderSlots('temel-taslar', 4, 12),
    ],
  },
  {
    id: 'gelisim',
    title: 'Gelişim',
    levelLabel: '11 – 6 Kyu',
    intro: 'Orta oyun çatışmaları, taktik derinlik ve oyun yönü kararları.',
    courses: [
      // Nefes Yarışı 3–5 ve Tesuji 3–8 kutularının problemleri 2026-09-29'da Bulmacalar'a taşındı (Bulmaca 824–1087).
      ...Array.from({ length: 2 }, (_, i) => ({
        slug: `nefes-yarisi-${i + 1}`,
        title: `Nefes Yarışı ${i + 1}`,
        description: 'Nefes yarışı problemleri — nefesleri doğru sayıp yarışı kazanma alıştırmaları.',
      })),
      ...Array.from({ length: 2 }, (_, i) => ({
        slug: `gelisim-atolye-${5 + i}`,
        title: `Tesuji ${i + 1}`,
        description: "Lee Chang-ho'nun seçme tesuji problemleri — köşe pozisyonlarında taktik okuma alıştırmaları.",
      })),
      ...JOSEKI_COURSES,
      { slug: 'oyun-yonu-gelisim', title: 'Oyun Yönü', description: 'Orta seviye oyun yönü ve büyük resim okuma.' },
      { slug: 'overplayi-cezalandirmak', title: "Overplay'i Cezalandırmak", description: 'Aşırı oynayan rakibi cezalandırma taktikleri.' },
      { slug: 'isgal-ve-savunma', title: 'İşgal & Savunma', description: 'Bölge işgali ve grup savunması dengesi.' },
      { slug: 'oyun-sonu', title: 'Oyun Sonu', description: 'Sınırları kesinleştirme ve yose okuma.' },
    ],
  },
  {
    id: 'aydinlanma',
    title: 'Aydınlanma',
    levelLabel: '5 Kyu – 1 Dan',
    intro: 'İleri açılış, joseki varyasyonları ve yüksek seviye okuma.',
    courses: [
      ...ADVANCED_JOSEKI_COURSES,
      { slug: 'oyun-yonu-ileri', title: 'Oyun Yönü', description: 'İleri seviye oyun yönü ve planlama.' },
      { slug: 'hamlelerin-degerleri', title: 'Hamlelerin Değerleri', description: 'Hamle büyüklüğü ve değer karşılaştırması.' },
      ...placeholderSlots('aydinlanma', 3, 12),
    ],
  },
]

export function findCourse(slug) {
  for (const section of WORKSHOP_SECTIONS) {
    const course = section.courses.find((c) => c.slug === slug)
    if (course) return { ...course, section }
  }
  return null
}
