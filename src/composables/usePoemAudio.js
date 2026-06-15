import { ref } from 'vue'
import { resolveCachedMedia, preloadMedia } from '@/utils/mediaCache'

const playingKey = ref(null)
const loading = ref(false)

let audioCtx = null
let pendingPlay = false

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = uni.createInnerAudioContext()
    audioCtx.obeyMuteSwitch = false

    audioCtx.onPlay(() => {
      loading.value = false
      pendingPlay = false
    })

    audioCtx.onCanplay(() => {
      if (pendingPlay) {
        audioCtx.play()
      }
    })

    audioCtx.onEnded(() => {
      playingKey.value = null
      loading.value = false
      pendingPlay = false
    })

    audioCtx.onStop(() => {
      playingKey.value = null
      loading.value = false
      pendingPlay = false
    })

    audioCtx.onPause(() => {
      playingKey.value = null
      pendingPlay = false
    })

    audioCtx.onError(() => {
      loading.value = false
      playingKey.value = null
      pendingPlay = false
      uni.showToast({ title: '音频加载失败', icon: 'none' })
    })
  }
  return audioCtx
}

function buildKey(poemId, mode) {
  return `${String(poemId)}:${mode}`
}

function getAudioSrc(poem, mode) {
  if (mode === 'full') return poem?.audio || ''
  return poem?.sound || poem?.quote_audio || ''
}

export function usePoemAudio() {
  function isPlayingPoem(poemId, mode = 'quote') {
    return poemId != null && playingKey.value === buildKey(poemId, mode)
  }

  function preload(poem, mode = 'quote') {
    preloadMedia(getAudioSrc(poem, mode))
  }

  async function toggle(poem, mode = 'quote') {
    const src = getAudioSrc(poem, mode)
    if (!src) {
      uni.showToast({ title: mode === 'full' ? '暂无全文朗诵' : '暂无朗诵', icon: 'none' })
      return
    }

    const key = buildKey(poem.id, mode)
    const ctx = getAudioContext()

    if (playingKey.value === key) {
      ctx.stop()
      playingKey.value = null
      return
    }

    loading.value = true
    pendingPlay = false
    if (playingKey.value) {
      ctx.stop()
    }

    playingKey.value = key
    ctx.loop = mode === 'full'

    const localSrc = await resolveCachedMedia(src)
    if (playingKey.value !== key) return

    ctx.src = localSrc
    pendingPlay = true
    ctx.play()
  }

  function stop() {
    if (audioCtx) {
      audioCtx.stop()
    }
    playingKey.value = null
    loading.value = false
    pendingPlay = false
  }

  return {
    playingKey,
    loading,
    isPlayingPoem,
    preload,
    toggle,
    stop,
  }
}
