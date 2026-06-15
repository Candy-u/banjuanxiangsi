<template>
  <view class="page detail" :style="pageStyle">
    <!-- 全页背景图 -->
    <image class="detail__bg" src="https://xiangsi.pages.dev/src/static/bg.jpg" mode="aspectFill" />
    <view class="detail__bg-mask" />

    <!-- 导航栏：back.png 与胶囊按钮同行 -->
    <view class="detail__navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="detail__back-btn" @tap="goBack">
        <image class="detail__back-img" src="https://xiangsi.pages.dev/src/static/back.png" mode="aspectFit" />
      </view>
    </view>

    <view v-if="poem" class="detail__heading">
      <text class="detail__title text-serif">{{ poem.title }}</text>
      <view class="detail__meta">
        <text class="detail__author text-serif">{{ poem.author }}</text>
        <text v-if="poem.dynasty" class="detail__dynasty text-muted">{{ poem.dynasty }}</text>
      </view>
    </view>

    <!-- 主内容滚动区 -->
    <scroll-view class="detail__body" scroll-y :show-scrollbar="false">
      <view v-if="poem" class="detail__inner">
        <view class="detail__card">
          <image class="detail__card-bg" src="https://xiangsi.pages.dev/src/static/p_bg.png" mode="scaleToFill" />
          <view class="detail__card-inner">
            <image v-if="contentBgSrc" class="detail__card-pic" :src="contentBgSrc" mode="aspectFill" />
            <view class="detail__card-body" :class="{ 'detail__card-body--with-pic': contentBgSrc }">
              <view class="detail__audio-btn" @tap.stop="toggleFullAudio">
                <image class="detail__audio-img"
                  :src="fullPlaying ? 'https://xiangsi.pages.dev/src/static/audio-on.png' : 'https://xiangsi.pages.dev/src/static/audio-off.png'"
                  mode="aspectFit" />
              </view>
              <text v-for="(line, i) in contentLines" :key="i" class="detail__line text-serif"
                :class="{ 'detail__line--highlight': isHighlightLine(line) }">{{ line }}</text>
            </view>
          </view>
        </view>

        <!-- 收藏 + 分享 -->
        <view class="detail__actions">
          <view class="detail__action-item" @tap="toggleFavorite">
            <image class="detail__action-img"
              :src="favorited ? 'https://xiangsi.pages.dev/src/static/collection_active.png' : 'https://xiangsi.pages.dev/src/static/collection.png'"
              mode="aspectFit" />
            <text class="detail__action-label text-muted">{{ favorited ? '已收藏' : '收藏' }}</text>
          </view>
          <view class="detail__action-divider" />
          <button class="detail__action-item detail__action-share" open-type="share">
            <image class="detail__action-img" src="https://xiangsi.pages.dev/src/static/share.png" mode="aspectFit" />
            <text class="detail__action-label text-muted">分享</text>
          </button>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { onLoad, onShareAppMessage, onHide, onUnload } from '@dcloudio/uni-app'
import { getPoemById } from '@/utils/poem'
import { useFavoritesStore } from '@/stores/favorites'
import { usePageLayout } from '@/composables/usePageLayout'
import { usePoemAudio } from '@/composables/usePoemAudio'
import { resolveCachedMedia, preloadMedia } from '@/utils/mediaCache'

const { statusBarHeight, pageStyle } = usePageLayout({ withTabBar: false })

const favoritesStore = useFavoritesStore()
const { isPlayingPoem, toggle: togglePoemAudio, stop: stopPoemAudio, preload: preloadPoemAudio } = usePoemAudio()
const poem = ref(null)

const favorited = computed(() =>
  poem.value ? favoritesStore.isFavorite(poem.value.id) : false
)

const fullPlaying = computed(() =>
  poem.value ? isPlayingPoem(poem.value.id, 'full') : false
)

const cardSoundPic = computed(() => poem.value?.soundPic?.trim() || '')
const contentBgSrc = ref('')

const contentLines = computed(() => {
  if (!poem.value?.content) return []
  return poem.value.content
    .split(/[，。！？；]/)
    .map((s) => s.trim())
    .filter(Boolean)
})

const excerptLineSet = computed(() => {
  if (!poem.value?.excerpt) return new Set()
  const lines = poem.value.excerpt
    .split(/[，。！？；]/)
    .map((s) => normalizeLine(s))
    .filter(Boolean)
  return new Set(lines)
})

function normalizeLine(text = '') {
  return text.replace(/\s+/g, '').trim()
}

function isHighlightLine(line) {
  return excerptLineSet.value.has(normalizeLine(line))
}

function goBack() {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
  } else {
    uni.switchTab({ url: '/pages/home/index' })
  }
}

function toggleFavorite() {
  if (!poem.value) return
  const added = favoritesStore.toggle(poem.value)
  uni.showToast({
    title: added ? '已收藏' : '已取消收藏',
    icon: 'none',
  })
}

function toggleFullAudio() {
  if (!poem.value) return
  togglePoemAudio(poem.value, 'full')
}

onLoad((query) => {
  if (query?.id) {
    poem.value = getPoemById(query.id)
  }
})

watch(poem, (item) => {
  if (item) preloadPoemAudio(item, 'full')
})

watch(cardSoundPic, async (url) => {
  contentBgSrc.value = ''
  if (!url) return
  preloadMedia(url)
  contentBgSrc.value = await resolveCachedMedia(url)
})

onHide(() => {
  stopPoemAudio()
})

onUnload(() => {
  stopPoemAudio()
})

onShareAppMessage(() => ({
  title: poem.value
    ? `${poem.value.excerpt} — ${poem.value.author}`
    : '半卷相思',
  path: poem.value
    ? `/pages/detail/index?id=${poem.value.id}`
    : '/pages/home/index',
}))
</script>

<style lang="scss" scoped>
/* ── 页面容器 ── */
.detail {
  box-sizing: border-box;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

/* ── 背景图（与首页一致） ── */
.detail__bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
}

.detail__bg-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(247, 243, 237, 0.55);
  z-index: 1;
}

/* ── 导航栏（与胶囊按钮同行） ── */
.detail__navbar {
  position: relative;
  z-index: 2;
  flex-shrink: 0;
  height: 44px;
  box-sizing: content-box;
  display: flex;
  align-items: center;
  padding-left: $spacing-page;
}

.detail__back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 70rpx;
  height: 70rpx;
}

.detail__back-img {
  width: 60rpx;
  height: 60rpx;
  display: block;
}

/* ── 主内容滚动区 ── */
.detail__body {
  position: relative;
  z-index: 2;
  flex: 1;
  height: 0;
  box-sizing: border-box;
  padding: 0 $spacing-page 0;
}

.detail__inner {
  padding-bottom: 60rpx;
}

/* ── 标题 + 作者 ── */
.detail__heading {
  position: relative;
  z-index: 2;
  padding-top: 40rpx;
  padding-bottom: 24rpx;
  padding-left: $spacing-page;
  padding-right: $spacing-page;
  text-align: center;
  flex-shrink: 0;
}

.detail__title {
  display: block;
  font-size: 46rpx;
  color: $color-accent;
  letter-spacing: 4rpx;
  margin-bottom: 20rpx;
}

.detail__meta {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 16rpx;
}

.detail__author {
  font-size: 28rpx;
  color: $color-text;
}

.detail__dynasty {
  font-size: 24rpx;
}

/* ── 诗词正文卡片 ── */
.detail__card {
  position: relative;
  width: 100%;
  /* 与 p_bg 内层纸面对齐，避免插图超出边框阴影 */
  padding: 5% 4.2% 6.8% 4.2%;
  box-sizing: border-box;
  border-radius: 24rpx;
  overflow: hidden;
}

.detail__card-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.detail__card-inner {
  position: relative;
  z-index: 1;
  border-radius: 16rpx;
  overflow: hidden;
}

.detail__card-pic {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  opacity: 0.38;
}

.detail__card-body {
  position: relative;
  z-index: 1;
  padding: 48rpx 28rpx 40rpx;
  text-align: center;
  background: rgba(255, 252, 245, 0.3);
}

.detail__card-body--with-pic {
  background: transparent;
}

.detail__audio-btn {
  position: absolute;
  top: 20rpx;
  right: 16rpx;
  z-index: 2;
  padding: 4rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail__audio-img {
  width: 64rpx;
  height: 64rpx;
  display: block;
}

.detail__line {
  display: block;
  font-size: 44rpx;
  line-height: 2.2;
  color: $color-accent;
  letter-spacing: 4rpx;
}

.detail__line--highlight {
  color: #a02f22;
}

/* ── 收藏 + 分享（复用首页样式） ── */
.detail__actions {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-top: 32rpx;
  background: transparent;
  border-radius: 999rpx;
  overflow: hidden;
}

.detail__action-item {
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

.detail__action-share {
  margin: 0;
  padding: 22rpx 56rpx;
  background-color: transparent !important;
  box-shadow: none;
  color: inherit;
  font-size: inherit;
}

.detail__action-share::after {
  display: none;
  border: none;
}

.detail__action-img {
  width: 46rpx;
  height: 46rpx;
  flex-shrink: 0;
}

.detail__action-label {
  font-size: 28rpx;
  letter-spacing: 1rpx;
}

.detail__action-divider {
  width: 1rpx;
  height: 36rpx;
  background: rgba(107, 93, 79, 0.25);
  flex-shrink: 0;
}

/* ── 背景音乐按钮 ── */
.detail__music-btn {
  margin-left: auto;
  margin-right: $spacing-page;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12rpx;
}

.detail__music-img {
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

.detail__music-img--spinning {
  animation: spin 4s linear infinite;
}
</style>
