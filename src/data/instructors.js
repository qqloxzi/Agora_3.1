export const instructors = [
  {
    id: 'tugkaneren',
    name: 'Tuğkan Eren',
    title: '4 Dan',
    avatar: '/instructorphotos/tugkaneren.jpeg',
    location: 'İzmir, Türkiye',
    about: "Go alanında 15 yılı aşkın tecrübeye sahiptir ve Türkiye Go Milli Takımı oyuncusudur.",
    leagueSlug: 'aydinlanma',
    leagueTitle: 'Aydınlanma Ligi (Dan Seviyesi)',
  },
  {
    id: 'oguzerdogan',
    name: 'Oğuz Erdoğan',
    title: '1 Dan',
    avatar: '/instructorphotos/oguzerdogan.png',
    location: 'İzmir, Türkiye',
    about: "4 yıldır go oynuyor. Hem Goizm'de hem de İytego'da başkanlık yapmış, turnuvalar organize etmiş ve hâlâ İytego'da aktif eğitimler veriyor.",
    leagueSlug: 'gelisim',
    leagueTitle: 'Gelişim Ligi',
  },
  {
    id: 'alikarakaya',
    name: 'Ali Karakaya',
    title: '5 Kyu',
    avatar: '/instructorphotos/alikarakaya.png',
    location: 'İzmir, Türkiye',
    about: "2 yıllık Go deneyimiyle Ali, İzmir Go Oyuncuları Derneği'nde aktif rol almış, çeşitli turnuvalarda hakemlik yapmıştır. Oyuncuların Go ile tanışmasından sonra sağlam bir temel oluşturmasına odaklanmaktadır.",
    leagueSlug: 'temel-taslar',
    leagueTitle: 'Temel Taşlar Ligi',
  },
  {
    id: 'doganergezen',
    name: 'Doğan Ergezen',
    title: '3 Kyu',
    avatar: '/instructorphotos/doganergezen.jpeg',
    location: 'Ankara, Türkiye',
    about: '3 yıldan beri düzenli olarak oynuyor ve kendini geliştirmeye devam ediyor. Hacettepe Go Topluluğu’nda başkanlık yaptı ve bu süreçte birçok Go turnuvası ve etkinliğinin organizasyonunda aktif rol aldı. Go’yu yalnızca rekabetçi bir oyun olarak değil, aynı zamanda insanları bir araya getiren güçlü bir topluluk olarak görüyor. Yapay zeka mühendisliği bölümünde eğitimine devam etmekte olup, sitedeki Go atölyelerinin ve Go botlarının tasarımcısı ve yazılımcısıdır.',
    leagueSlug: 'temel-taslar',
    leagueTitle: 'Temel Taşlar Ligi',
  },
]

export function findInstructor(id) {
  return instructors.find((i) => i.id === id) ?? null
}
