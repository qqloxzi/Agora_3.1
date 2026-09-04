// Curriculum menu (structure only — not puzzle content). Each course's actual
// lessons are pulled live from the `go_problems` table by `course_slug`
// (see src/lib/workshopProgress.js#fetchCourseLessons). A course with no
// matching rows yet simply renders as "içerik yakında" — add go_problems
// rows with this slug and it lights up automatically, no code changes needed.
// Every section holds 12 course slots so the skill tree is ready for the
// full 36-workshop curriculum; only the first few per section are named
// topics today; the rest are "yakında" placeholders waiting for content.
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
      { slug: 'oyun-yonu', title: 'Oyun Yönü', description: 'Tahta üzerinde doğru yön seçimi ve genel oyun akışı.' },
      { slug: 'temel-josekiler', title: 'Temel Josekiler', description: 'Köşe mücadelelerinde temel joseki kalıpları.' },
      { slug: 'iyi-ve-kotu-sekiller', title: 'İyi ve Kötü Şekiller', description: 'Verimli ve verimsiz taş formlarını ayırt etme.' },
      { slug: 'saldiri', title: 'Saldırı', description: 'Zayıf gruplara baskı ve saldırı teknikleri.' },
      ...placeholderSlots('temel-taslar', 5, 12),
    ],
  },
  {
    id: 'gelisim',
    title: 'Gelişim',
    levelLabel: '11 – 6 Kyu',
    intro: 'Orta oyun çatışmaları, taktik derinlik ve oyun yönü kararları.',
    courses: [
      { slug: 'oyun-yonu-gelisim', title: 'Oyun Yönü', description: 'Orta seviye oyun yönü ve büyük resim okuma.' },
      { slug: 'overplayi-cezalandirmak', title: "Overplay'i Cezalandırmak", description: 'Aşırı oynayan rakibi cezalandırma taktikleri.' },
      { slug: 'isgal-ve-savunma', title: 'İşgal & Savunma', description: 'Bölge işgali ve grup savunması dengesi.' },
      { slug: 'oyun-sonu', title: 'Oyun Sonu', description: 'Sınırları kesinleştirme ve yose okuma.' },
      ...placeholderSlots('gelisim', 5, 12),
    ],
  },
  {
    id: 'aydinlanma',
    title: 'Aydınlanma',
    levelLabel: '5 Kyu – 1 Dan',
    intro: 'İleri açılış, joseki varyasyonları ve yüksek seviye okuma.',
    courses: [
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
