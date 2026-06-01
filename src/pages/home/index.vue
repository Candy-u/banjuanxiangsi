<template>
  <view class="page home" :style="pageStyle">
    <!-- 全页背景图 -->
    <image class="home__bg" src="/static/bg.jpg" mode="aspectFill" />
    <view class="home__bg-mask" />

    <!-- 自定义导航栏（铺满至状态栏） -->
    <view class="home__navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <text class="home__navbar-title text-serif">半卷相思</text>
      <view class="home__music-btn" @tap="toggleBgMusic">
        <image class="home__music-img" :class="{ 'home__music-img--spinning': bgMusicPlaying }" src="/static/music.png"
          mode="aspectFit" />
      </view>
    </view>

    <!-- 主内容区（左右滑动） -->
    <view class="home__main" @touchstart="touchStart" @touchend="touchEnd">
      <!-- 诗句卡片 -->
      <view class="home__card" :style="cardAnimStyle">
        <image class="home__card-bg" src="/static/p_bg.png" mode="scaleToFill" />
        <view class="home__card-body">
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

      <!-- 轮播圆点提示（装饰性，中间点常亮） -->
      <view class="home__dots">
        <view v-for="i in 5" :key="i" :class="['home__dot', i === activeDot ? 'home__dot--active' : '']" />
      </view>
    </view>

    <AppTabBar :current="0" />
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onShareAppMessage } from '@dcloudio/uni-app'
import { getRandomPoem } from '@/utils/poem'
import { useFavoritesStore } from '@/stores/favorites'
import { usePageLayout } from '@/composables/usePageLayout'
import { useBgMusic } from '@/composables/useBgMusic'
import AppTabBar from '@/components/AppTabBar.vue'

const { pageStyle, statusBarHeight } = usePageLayout({ withTabBar: true })
const { isPlaying: bgMusicPlaying, play: playBgMusic, toggle: toggleBgMusic } = useBgMusic()

const favoritesStore = useFavoritesStore()
const currentPoem = ref(null)
const switching = ref(false)
const activeDot = ref(3)   // 5个点，默认第3个（中间）亮起
let touchStartX = 0

const favorited = computed(() =>
  currentPoem.value ? favoritesStore.isFavorite(currentPoem.value.id) : false
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

function pickRandom(excludeId, direction = 1) {
  if (switching.value) return
  switching.value = true
  // 圆点跟随滑动方向移动，到头再循环
  activeDot.value = activeDot.value + direction < 1 ? 5
    : activeDot.value + direction > 5 ? 1
      : activeDot.value + direction
  setTimeout(() => {
    currentPoem.value = getRandomPoem(excludeId)
    switching.value = false
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

onMounted(() => {
  pickRandom()
  playBgMusic()
})

onShareAppMessage(() => ({
  title: currentPoem.value
    ? `${currentPoem.value.excerpt} — ${currentPoem.value.author}`
    : '半卷相思',
  path: '/pages/home/index',
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

/* ── 诗句卡片 ── */
.home__card {
  position: relative;
  width: 100%;
  border-radius: 24rpx;
  overflow: hidden;
  will-change: opacity, transform;
}

.home__card-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.home__card-body {
  position: relative;
  z-index: 1;
  padding: 104rpx 64rpx 96rpx;
  text-align: center;
  background: rgba(255, 252, 245, 0.3);
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
  width: 40rpx;
  height: 40rpx;
  flex-shrink: 0;
}

.home__action-label {
  font-size: 26rpx;
  letter-spacing: 1rpx;
}

.home__action-divider {
  width: 1rpx;
  height: 36rpx;
  background: transparent;
  flex-shrink: 0;
}

/* ── 轮播圆点 ── */
.home__dots {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14rpx;
  margin-top: 36rpx;
}

.home__dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: rgba(107, 93, 79, 0.2);
  transition: width 0.3s ease, background 0.3s ease, border-radius 0.3s ease;
}

.home__dot--active {
  width: 32rpx;
  border-radius: 8rpx;
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
</style>
