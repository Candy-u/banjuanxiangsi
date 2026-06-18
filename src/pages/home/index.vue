<template>
  <view class="page home" :style="pageStyle">
    <!-- 全页背景图 -->
    <image class="home__bg" src="/static/bg.jpg" mode="aspectFill" />
    <view class="home__bg-mask" />

    <!-- 自定义导航栏（铺满至状态栏） -->
    <view class="home__navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <text class="home__navbar-title text-serif">半卷相思</text>
      <view class="home__music-btn" @tap="toggleBgMusic">
        <image class="home__music-img" :class="{ 'home__music-img--spinning': bgMusicPlaying }"
          src="https://xiangsi.pages.dev/src/static/music.png" mode="aspectFit" />
      </view>
    </view>

    <!-- 主内容区（左右滑动） -->
    <view class="home__main" @touchstart="touchStart" @touchend="touchEnd">
      <!-- 诗句卡片 -->
      <view class="home__card" :style="cardAnimStyle">
        <view class="home__card-body">
          <image class="home__quote-icon" src="/static/quote.png" mode="aspectFit" />
          <view v-if="currentPoem?.sound" class="home__audio-btn" :class="{ 'home__audio-btn--playing': quotePlaying }"
            @tap.stop="toggleQuoteAudio">
            <image class="home__audio-img" :src="quotePlaying ? '/static/audio-on.png' : '/static/audio-off.png'"
              mode="aspectFit" />
            <text class="home__audio-text">朗读</text>
          </view>
          <text v-for="(line, i) in excerptLines" :key="i" class="home__excerpt text-ndd">{{ line }}</text>
          <text v-if="currentPoem" class="home__meta text-secondary">— {{ currentPoem.author }}</text>
          <!-- 查看全文 -->
          <view class="home__detail-btn" @tap="goDetail">
            <text class="home__detail-text">查看全文</text>
          </view>
        </view>
      </view>

      <!-- 卡片正下方：收藏 + 分享 -->
      <view class="home__card-actions">
        <view class="home__action-item" @tap="toggleFavorite">
          <image class="home__action-img" :src="favorited ? '/static/collection_active.png' : '/static/collection.png'"
            mode="aspectFit" />
          <text class="home__action-label text-muted">{{ favorited ? '已收藏' : '收藏' }}</text>
        </view>
        <view class="home__action-divider" />
        <button class="home__action-item home__action-share" open-type="share">
          <image class="home__action-img" src="/static/share.png" mode="aspectFit" />
          <text class="home__action-label text-muted">分享</text>
        </button>
      </view>

      <!-- 圆点指示 -->
      <view class="home__dots-viewport">
        <view class="home__dots-track" :style="dotsTrackStyle">
          <view v-for="i in TRACK_DOT_COUNT" :key="i" class="home__dot"
            :class="{ 'home__dot--active': i - 1 === scrollIndex }" />
        </view>
      </view>
    </view>

    <AppTabBar :current="0" />

    <view v-if="!isAppReady" class="home__loading">
      <view class="home__loading-panel">
        <text class="home__loading-title text-serif">半卷相思</text>
        <view class="home__loading-spinner" />
        <text class="home__loading-text text-muted">正在载入...</text>
      </view>
    </view>

    <!-- 合成分享图用的离屏 canvas，隐藏在屏幕外 -->
    <canvas canvas-id="shareCanvas"
      style="position: fixed; bottom: -500px; left: -600px; width: 500px; height: 400px;" />
  </view>
</template>

<script setup>
import { ref, computed, onMounted, getCurrentInstance, watch } from 'vue'
import { onShareAppMessage, onLoad, onHide, onShow } from '@dcloudio/uni-app'
import { getRandomPoem, getPoemById, resetShuffleQueue } from '@/utils/poem'
import { useFavoritesStore } from '@/stores/favorites'
import { usePageLayout } from '@/composables/usePageLayout'
import { useBgMusic } from '@/composables/useBgMusic'
import { usePoemAudio } from '@/composables/usePoemAudio'
import { preloadMedia } from '@/utils/mediaCache'
import { useAppPreload } from '@/composables/useAppPreload'
import AppTabBar from '@/components/AppTabBar.vue'

const { pageStyle, statusBarHeight } = usePageLayout({ withTabBar: true })
const internalInstance = getCurrentInstance()
const shareImagePath = ref('')
const { isPlaying: bgMusicPlaying, play: playBgMusic, toggle: toggleBgMusic } = useBgMusic()
const { isPlayingPoem, toggle: togglePoemAudio, stop: stopPoemAudio, preload: preloadPoemAudio } = usePoemAudio()
const { isAppReady, ensurePreload } = useAppPreload()

const favoritesStore = useFavoritesStore()
// 轨道圆点数量（装饰用，不对应具体诗词 id）
const TRACK_DOT_COUNT = 21
const DOT_SIZE_RPX = 10
const DOT_ACTIVE_SIZE_RPX = 14
const DOT_GAP_RPX = 12
const DOT_STEP_RPX = DOT_SIZE_RPX + DOT_GAP_RPX
const VIEWPORT_W_RPX = 280

const currentPoem = ref(null)
const switching = ref(false)
const scrollIndex = ref(Math.floor(TRACK_DOT_COUNT / 2))
const dotsTransition = ref('')
let touchStartX = 0
let isFirstShow = true
let skipRefreshFromDetail = false

const favorited = computed(() =>
  currentPoem.value ? favoritesStore.isFavorite(currentPoem.value.id) : false
)

const quotePlaying = computed(() =>
  currentPoem.value ? isPlayingPoem(currentPoem.value.id, 'quote') : false
)

const excerptLines = computed(() => {
  if (!currentPoem.value?.excerpt) return []
  return currentPoem.value.excerpt
    .replace(/([，。！？；])/g, '$1\n')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
})

const cardAnimStyle = computed(() => ({
  opacity: switching.value ? 0 : 1,
  transform: switching.value ? 'translateX(20rpx)' : 'translateX(0)',
  transition: 'opacity 0.25s ease, transform 0.25s ease',
}))

const dotsTrackStyle = computed(() => {
  // 激活点宽 14rpx，在 flex 中向右扩展，用其宽度的一半来居中
  const centerOffset = VIEWPORT_W_RPX / 2 - DOT_ACTIVE_SIZE_RPX / 2
  const dotOffset = scrollIndex.value * DOT_STEP_RPX
  return {
    transform: `translateX(${centerOffset - dotOffset}rpx)`,
    transition: dotsTransition.value,
  }
})

function shiftDots(direction) {
  dotsTransition.value = 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)'
  scrollIndex.value += direction

  setTimeout(() => {
    const mid = Math.floor(TRACK_DOT_COUNT / 2)
    const edge = 5
    if (scrollIndex.value > mid + edge || scrollIndex.value < mid - edge) {
      dotsTransition.value = 'none'
      scrollIndex.value = mid
    }
    setTimeout(() => {
      dotsTransition.value = 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)'
    }, 20)
  }, 280)
}

function splitShareLines(text) {
  const clean = text.replace(/[\n\s]/g, '')
  const segments = clean.match(/[^，。！？；]+[，。！？；]?/g) || [clean]
  const lines = []
  let buf = ''
  for (const seg of segments) {
    if (!buf) {
      buf = seg
    } else if ((buf + seg).length <= 13) {
      buf += seg
    } else {
      lines.push(buf)
      buf = seg
    }
  }
  if (buf) lines.push(buf)
  return lines.slice(0, 3)
}

function renderShareImage() {
  if (!currentPoem.value) return
  return new Promise((resolve) => {
    const ctx = uni.createCanvasContext('shareCanvas', internalInstance)
    const W = 500
    const H = 400
    const BG_H = 1122

    ctx.drawImage('/static/share_bg.png', 0, 0, W, H)

    const { excerpt, author } = currentPoem.value
    const lines = splitShareLines(excerpt)

    const fontSize = 36
    const lineH = 52
    const authorFontSize = 24
    // share_bg 内层展板区域（按原图 1122 高比例换算）
    const boardTop = Math.round(H * (468 / BG_H))
    const boardBottom = Math.round(H * (1030 / BG_H))
    const paddingTop = 45
    const startY = boardTop + paddingTop + fontSize

    ctx.setFontSize(fontSize)
    ctx.setFillStyle('#5a4535')
    ctx.setTextAlign('center')
    lines.forEach((line, i) => {
      ctx.fillText(line, W / 2, startY + i * lineH)
    })

    const authorY = startY + lines.length * lineH + 12
    if (authorY + authorFontSize <= boardBottom - 8) {
      ctx.setFontSize(authorFontSize)
      ctx.setFillStyle('#8a7a6a')
      ctx.fillText(`—— ${author}`, W / 2, authorY)
    }

    ctx.draw(false, () => {
      uni.canvasToTempFilePath(
        {
          canvasId: 'shareCanvas',
          success: (res) => {
            shareImagePath.value = res.tempFilePath
            resolve(res.tempFilePath)
          },
          fail: () => resolve(''),
        },
        internalInstance,
      )
    })
  })
}

function pickRandom(excludeId, direction = 1) {
  if (switching.value) return
  stopPoemAudio()
  switching.value = true
  if (excludeId !== undefined) shiftDots(direction)
  setTimeout(() => {
    currentPoem.value = getRandomPoem(excludeId)
    switching.value = false
    renderShareImage()
  }, 250)
}

function touchStart(e) {
  touchStartX = e.changedTouches[0].clientX
}

function touchEnd(e) {
  const deltaX = e.changedTouches[0].clientX - touchStartX
  if (deltaX < -60) pickRandom(currentPoem.value?.id, 1)
  else if (deltaX > 60) pickRandom(currentPoem.value?.id, -1)
}

function goDetail() {
  if (!currentPoem.value) return
  skipRefreshFromDetail = true
  stopPoemAudio()
  uni.navigateTo({
    url: `/pages/detail/index?id=${currentPoem.value.id}`,
  })
}

function toggleFavorite() {
  if (!currentPoem.value) return
  const added = favoritesStore.toggle(currentPoem.value)
  uni.showToast({
    title: added ? '已收藏' : '已取消收藏',
    icon: 'none',
  })
}

function toggleQuoteAudio() {
  if (!currentPoem.value) return
  togglePoemAudio(currentPoem.value, 'quote')
}

watch(currentPoem, (poem) => {
  if (!poem) return
  preloadPoemAudio(poem, 'quote')
  if (poem.soundPic) preloadMedia(poem.soundPic)
})

onLoad(async (options) => {
  await ensurePreload()
  if (options?.id) {
    const poem = getPoemById(options.id)
    if (poem) {
      currentPoem.value = poem
      renderShareImage()
      return
    }
  }
  resetShuffleQueue()
  pickRandom()
})

onShow(() => {
  if (isFirstShow) {
    isFirstShow = false
    return
  }
  if (skipRefreshFromDetail) {
    skipRefreshFromDetail = false
    return
  }
  if (currentPoem.value?.id) {
    pickRandom(currentPoem.value.id)
  } else {
    resetShuffleQueue()
    pickRandom()
  }
})

onMounted(() => {
  playBgMusic()
})

onHide(() => {
  stopPoemAudio()
})

onShareAppMessage(() => ({
  title: currentPoem.value
    ? `${currentPoem.value.excerpt} — ${currentPoem.value.author}`
    : '半卷相思',
  path: currentPoem.value
    ? `/pages/home/index?id=${currentPoem.value.id}`
    : '/pages/home/index',
  imageUrl: shareImagePath.value || '/static/share_bg.png',
}))
</script>

<style lang="scss" scoped>
/* ── 页面容器 ── */
.home {
  box-sizing: border-box;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-left: $spacing-page;
  padding-right: $spacing-page;
  position: relative;
  overflow: hidden;
}

/* ── 自定义导航栏 ── */
.home__navbar {
  position: relative;
  z-index: 10;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  box-sizing: content-box;
}

.home__navbar-title {
  font-size: 34rpx;
  color: $color-text;
  letter-spacing: 6rpx;
}

.home__music-btn {
  position: absolute;
  right: 0;
  top: 186rpx;
  // transform: translateY(0%);
  padding: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.home__music-img {
  width: 52rpx;
  height: 52rpx;
  display: block;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.home__music-img--spinning {
  animation: spin 4s linear infinite;
}

/* ── 全页背景（fixed 确保真机始终铺满整个视口） ── */
.home__bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
}

.home__bg-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(247, 243, 237, 0.55);
  z-index: 1;
}

/* ── 主内容 ── */
.home__main {
  position: relative;
  z-index: 2;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* ── 诗句卡片（纯 CSS 宣纸质感） ── */
.home__card {
  position: relative;
  width: 100%;
  box-sizing: border-box;
  padding: 10rpx;
  border-radius: 24rpx;
  background: linear-gradient(160deg,
      rgba(215, 200, 180, 0.28) 0%,
      rgba(195, 180, 160, 0.16) 50%,
      rgba(215, 200, 180, 0.22) 100%);
  box-shadow:
    0 10rpx 36rpx rgba(107, 93, 79, 0.1),
    0 2rpx 6rpx rgba(107, 93, 79, 0.06);
  overflow: hidden;
  will-change: opacity, transform;
}

.home__card-body {
  position: relative;
  z-index: 1;
  padding: 120rpx 36rpx 64rpx;
  text-align: center;
  border-radius: 16rpx;
  // background: rgba(255, 252, 245, 0.9);
  // border: 1rpx solid rgba(190, 175, 155, 0.32);
  // box-shadow: inset 0 2rpx 10rpx rgba(210, 190, 165, 0.14);
  overflow: hidden;
}

.home__quote-icon {
  position: absolute;
  top: 40rpx;
  left: 40rpx;
  width: 64rpx;
  height: 64rpx;
}

.home__audio-btn {
  position: absolute;
  top: 40rpx;
  right: 40rpx;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  min-height: 48rpx;
  padding: 8rpx 14rpx;
  border-radius: 999rpx;
  background: rgba(107, 93, 79, 0.16);
  line-height: 1;
  overflow: visible;
}

.home__audio-btn--playing {
  background: rgba(107, 93, 79, 0.24);
}

.home__audio-img {
  width: 36rpx;
  height: 36rpx;
  display: block;
  flex-shrink: 0;
}

.home__audio-text {
  font-size: 20rpx;
  color: $color-accent;
  letter-spacing: 2rpx;
  line-height: 1;
}

.home__excerpt {
  display: block;
  font-size: 54rpx;
  line-height: 2.1;
  color: $color-text;
  letter-spacing: 5rpx;
}

.home__meta {
  display: block;
  margin-top: 40rpx;
  font-size: 28rpx;
  color: $color-text-secondary;
  letter-spacing: 2rpx;
  text-align: right;
}

/* ── 卡片操作区（收藏 + 分享）── */
.home__card-actions {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-top: 32rpx;
  background: transparent;
  border-radius: 999rpx;
  overflow: hidden;
}

.home__action-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 14rpx;
  padding: 22rpx 56rpx;
  background: transparent;
  border: none;
  line-height: 1;

  &::after {
    display: none;
    border: none;
  }
}

/* 微信 button 默认样式完整重置 */
.home__action-share {
  margin: 0;
  padding: 22rpx 56rpx;
  background-color: transparent !important;
  box-shadow: none;
  color: inherit;
  font-size: inherit;
}

.home__action-share::after {
  display: none;
  border: none;
}

.home__action-img {
  width: 46rpx;
  height: 46rpx;
  flex-shrink: 0;
}

.home__action-label {
  font-size: 28rpx;
  letter-spacing: 1rpx;
}

.home__action-divider {
  width: 1rpx;
  height: 36rpx;
  background: transparent;
  flex-shrink: 0;
}

/* ── 轮播圆点 ── */
.home__dots-viewport {
  position: relative;
  width: 280rpx;
  height: 24rpx;
  margin-top: 36rpx;
  overflow: hidden;
  flex-shrink: 0;
  -webkit-mask-image: linear-gradient(90deg,
      transparent 0%,
      #000 18%,
      #000 82%,
      transparent 100%);
  mask-image: linear-gradient(90deg,
      transparent 0%,
      #000 18%,
      #000 82%,
      transparent 100%);
}

.home__dots-track {
  display: flex;
  align-items: center;
  gap: 12rpx;
  height: 100%;
  will-change: transform;
}

.home__dot {
  flex-shrink: 0;
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: rgba(107, 93, 79, 0.28);
  transition: width 0.28s cubic-bezier(0.4, 0, 0.2, 1),
    height 0.28s cubic-bezier(0.4, 0, 0.2, 1),
    border-radius 0.28s cubic-bezier(0.4, 0, 0.2, 1),
    background 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}

.home__dot--active {
  width: 14rpx;
  height: 8rpx;
  border-radius: 6rpx;
  background: $color-accent;
}

/* ── 卡片内查看全文 ── */
.home__detail-btn {
  margin-top: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.home__detail-text {
  font-size: 26rpx;
  color: $color-text-secondary;
  letter-spacing: 3rpx;
  padding: 16rpx 48rpx;
  border-radius: 999rpx;
  border: 1rpx solid rgba(107, 93, 79, 0.25);
}

.home__loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(247, 243, 237, 0.92);
}

.home__loading-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28rpx;
}

.home__loading-title {
  font-size: 40rpx;
  color: $color-text;
  letter-spacing: 8rpx;
}

.home__loading-spinner {
  width: 48rpx;
  height: 48rpx;
  border: 4rpx solid rgba(107, 93, 79, 0.18);
  border-top-color: $color-accent;
  border-radius: 50%;
  animation: home-spin 0.9s linear infinite;
}

.home__loading-text {
  font-size: 24rpx;
  letter-spacing: 4rpx;
}

@keyframes home-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
