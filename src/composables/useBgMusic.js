/**
 * 背景音乐管理 —— 使用 BackgroundAudioManager 以便切换 tab 后持续播放
 * 模块级单例，所有页面共享同一个状态
 */
import { ref } from 'vue'

const isPlaying = ref(false)
let _audio = null
// BackgroundAudioManager.src 是只写属性，读取返回空值，
// 用内部标志追踪是否已设置过 src
let _srcSet = false

function getAudio() {
  if (_audio) return _audio
  _audio = uni.getBackgroundAudioManager()
  _audio.title = '半卷相思'
  _audio.epname = '背景音乐'
  _audio.onPlay(() => { isPlaying.value = true })
  _audio.onPause(() => { isPlaying.value = false })
  _audio.onStop(() => { isPlaying.value = false; _srcSet = false })
  // 播放结束后重置 src 实现循环，会自动触发 onPlay
  _audio.onEnded(() => { _audio.src = 'https://xiangsi.pages.dev/public/bg/bg.mp3' })
  return _audio
}

export function useBgMusic() {
  /** 自动播放（页面加载时调用） */
  function play() {
    const a = getAudio()
    if (!isPlaying.value) {
      a.src = 'https://xiangsi.pages.dev/public/bg/bg.mp3'
      _srcSet = true
    }
  }

  /** 点击切换播放 / 暂停 */
  function toggle() {
    const a = getAudio()
    if (isPlaying.value) {
      a.pause()
    } else if (_srcSet) {
      // 已加载过音频，直接恢复播放
      a.play()
    } else {
      a.src = 'https://xiangsi.pages.dev/public/bg/bg.mp3'
      _srcSet = true
    }
  }

  return { isPlaying, play, toggle }
}
