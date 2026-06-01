import { ref } from 'vue'

const playingId = ref(null)
const loading = ref(false)

let audioCtx = null

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = uni.createInnerAudioContext()
    audioCtx.loop = true
    audioCtx.obeyMuteSwitch = false

    audioCtx.onPlay(() => {
      loading.value = false
    })

    audioCtx.onStop(() => {
      playingId.value = null
      loading.value = false
    })

    audioCtx.onPause(() => {
      playingId.value = null
    })

    audioCtx.onError(() => {
      loading.value = false
      playingId.value = null
      uni.showToast({ title: '音频加载失败', icon: 'none' })
    })
  }
  return audioCtx
}

export function usePoemAudio() {
  function isPlayingPoem(poemId) {
    return poemId != null && playingId.value === String(poemId)
  }

  function toggle(poem) {
    if (!poem?.sound) {
      uni.showToast({ title: '暂无朗诵', icon: 'none' })
      return
    }

    const id = String(poem.id)
    const ctx = getAudioContext()

    if (playingId.value === id) {
      ctx.stop()
      playingId.value = null
      return
    }

    loading.value = true
    if (playingId.value) {
      ctx.stop()
    }

    playingId.value = id
    ctx.src = poem.sound
    ctx.loop = true
    ctx.play()
  }

  function stop() {
    if (audioCtx) {
      audioCtx.stop()
    }
    playingId.value = null
    loading.value = false
  }

  return {
    playingId,
    loading,
    isPlayingPoem,
    toggle,
    stop,
  }
}
