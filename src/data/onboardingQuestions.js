export const ONBOARDING_QUESTIONS = [
  {
    key: 'preferred_name',
    type: 'text',
    title: 'Sana nasıl hitap edelim?',
    placeholder: 'Örn. Ali',
  },
  {
    key: 'club_membership',
    type: 'single',
    title: 'Bir Go derneği veya topluluğuna üye misin?',
    options: [
      'İstanbul Go Oyuncuları Derneği', 'Ankara Go Oyuncuları Derneği', 'İzmir Go Oyuncuları Derneği',
      'Eskişehir Go Oyuncuları Derneği', 'Türkiye Go Derneği', 'ODTÜ Go Topluluğu', 'Hacettepe Go Topluluğu',
      'Bilkent Go Kulübü', 'İYTE Go Topluluğu', 'Herhangi bir üyeliğim yok',
    ],
  },
  {
    key: 'experience_duration',
    type: 'single',
    title: 'Ne kadar zamandır Go oynuyorsun?',
    options: ['1-2 aydır', '3-6 aydır', '7-8 aydır', '1-2 yıldır', '3-4 yıldır', '5 yıl ve üzeri'],
  },
  {
    key: 'current_level',
    type: 'single',
    title: 'Mevcut seviyen nedir?',
    options: ['17-12 Kyu', '11-6 Kyu', '5-1 Kyu', '1 Dan ve üzeri'],
  },
  {
    key: 'inner_goals',
    type: 'multi',
    title: 'Go oynarken içsel hedeflerin neler?',
    options: [
      'Analitik zekâmı geliştirmek', 'Odaklanma becerimi artırmak', 'Kendimi daha iyi anlamak',
      'Karakterimi tahtaya yansıtmak', 'Denge ve uyum felsefesini hayatıma taşımak',
    ],
  },
  {
    key: 'weaknesses',
    type: 'multi',
    title: 'Geliştirmek istediğin yönler neler?',
    options: ['Joseki', 'Fuseki', 'Chuban', 'Yose', 'Yaşam-Ölüm (Tsumego)', 'Oyun Yönü', 'Şekil Bilgisi', 'Zaman Yönetimi'],
  },
  {
    key: 'study_methods',
    type: 'multi',
    title: 'Bugüne kadarki çalışma yöntemlerin neler?',
    options: ['Sadece oynayarak', 'Oynayıp analiz ederek', 'Oyun + Analiz + Tsumego', 'Kulüp etkinlikleri / turnuvalar', 'Eğitim videoları'],
  },
  {
    key: 'weekly_study_hours',
    type: 'single',
    title: 'Haftalık ne kadar çalışma zamanı ayırabilirsin?',
    options: ['Ekstra zaman ayıramam', '1-2 saat', '3 saat ve üzeri'],
  },
  {
    key: 'target_league_level',
    type: 'single',
    title: 'Bu sezon sonunda hedeflediğin seviye nedir?',
    options: ['20k', '15k', '10k', '5k', '1k', '1d', '3d+'],
  },
]
