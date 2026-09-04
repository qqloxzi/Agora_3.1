const SOUND_SRC = {
  stone: '/sounds/stone.mp3',
  capture: '/sounds/capturing.mp3',
}

function play(src) {
  if (typeof Audio === 'undefined') return
  const audio = new Audio(src)
  audio.volume = 0.85
  audio.preload = 'auto'
  audio.play().catch(() => {})
}

export function playStoneSound({ capture = false } = {}) {
  play(capture ? SOUND_SRC.capture : SOUND_SRC.stone)
}
