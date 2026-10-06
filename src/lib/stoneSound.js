const SOUND_SRC = {
  stone: '/sounds/stone.mp3',
  capture: '/sounds/capturing.mp3',
}

// Taş sesi seviyesi (2026-09-29'da kullanıcı isteğiyle %50 kısıldı: 0.85 → 0.425).
// Mobil: Go_Akademisi_mobil STONE_VOLUME (expo-audio varsayılanı 1 → 0.5).
const STONE_VOLUME = 0.425

function play(src) {
  if (typeof Audio === 'undefined') return
  const audio = new Audio(src)
  audio.volume = STONE_VOLUME
  audio.preload = 'auto'
  audio.play().catch(() => {})
}

export function playStoneSound({ capture = false } = {}) {
  play(capture ? SOUND_SRC.capture : SOUND_SRC.stone)
}
