<template>
  <view class="page detail" :style="pageStyle">
    <!-- 全页背景图 -->
    <image class="detail__bg" src="/static/bg.jpg" mode="aspectFill" />
    <view class="detail__bg-mask" />

    <!-- 导航栏：back.png 与胶囊按钮同行 -->
    <view class="detail__navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="detail__back-btn" @tap="goBack">
        <image class="detail__back-img" src="/static/back.png" mode="aspectFit" />
      </view>
      <view class="detail__music-btn" @tap="toggleBgMusic">
        <image
          class="detail__music-img"
          :class="{ 'detail__music-img--spinning': bgMusicPlaying }"
          src="/static/music.png"
          mode="aspectFit"
        />
      </view>
    </view>

    <!-- 主内容滚动区 -->
    <scroll-view class="detail__body" scroll-y :show-scrollbar="false">
      <view v-if="poem" class="detail__inner">
        <!-- 标题 + 作者 -->
        <view class="detail__heading">
          <text class="detail__title text-serif">{{ poem.title }}</text>
          <view class="detail__meta">
            <text class="detail__author text-serif">{{ poem.author }}</text>
            <text v-if="poem.dynasty" class="detail__dynasty text-muted">{{ poem.dynasty }}</text>
          </view>
        </view>

        <!-- 诗词正文卡片 -->
        <view class="detail__card">
          <image class="detail__card-bg" src="/static/p_bg.png" mode="scaleToFill" />
          <view class="detail__card-body">
            <text v-for="(line, i) in contentLines" :key="i" class="detail__line text-serif">{{ line }}</text>
          </view>
        </view>

        <!-- 收藏 + 分享（复用首页样式） -->
        <view class="detail__actions">
          <view class="detail__action-item" @tap="toggleFavorite">
            <image class="detail__action-img"
              :src="favorited ? '/static/collection_active.png' : '/static/collection.png'" mode="aspectFit" />
            <text class="detail__action-label text-muted">{{ favorited ? '已收藏' : '收藏' }}</text>
          </view>
          <view class="detail__action-divider" />
          <button class="detail__action-item detail__action-share" open-type="share">
            <image class="detail__action-img" src="/static/share.png" mode="aspectFit" />
            <text class="detail__action-label text-muted">分享</text>
          </button>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app'
import { getPoemById } from '@/utils/poem'
import { useFavoritesStore } from '@/stores/favorites'
import { usePageLayout } from '@/composables/usePageLayout'
import { useBgMusic } from '@/composables/useBgMusic'

const { statusBarHeight, pageStyle } = usePageLayout({ withTabBar: false })
const { isPlaying: bgMusicPlaying, toggle: toggleBgMusic } = useBgMusic()

const favoritesStore = useFavoritesStore()
const poem = ref(null)

const favorited = computed(() =>
  poem.value ? favoritesStore.isFavorite(poem.value.id) : false
)

const contentLines = computed(() => {
  if (!poem.value?.content) return []
  return poem.value.content
    .split(/[，。！？；]/)
    .map((s) => s.trim())
    .filter(Boolean)
})

function goBack() {
  uni.navigateBack()
}

function toggleFavorite() {
  if (!poem.value) return
  const added = favoritesStore.toggle(poem.value)
  uni.showToast({
    title: added ? '已收藏' : '已取消收藏',
    icon: 'none',
  })
}

onLoad((query) => {
  if (query?.id) {
    poem.value = getPoemById(query.id)
  }
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
  padding: 0 $spacing-page;
}

.detail__inner {
  padding-bottom: 60rpx;
}

/* ── 标题 + 作者 ── */
.detail__heading {
  padding-top: 40rpx;
  padding-bottom: 40rpx;
  text-align: center;
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

.detail__card-body {
  position: relative;
  z-index: 1;
  padding: 64rpx 48rpx;
  text-align: center;
  background: rgba(255, 252, 245, 0.3);
}

.detail__line {
  display: block;
  font-size: 44rpx;
  line-height: 2.2;
  color: $color-accent;
  letter-spacing: 4rpx;
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
  width: 40rpx;
  height: 40rpx;
  flex-shrink: 0;
}

.detail__action-label {
  font-size: 26rpx;
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
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.detail__music-img--spinning {
  animation: spin 4s linear infinite;
}
</style>
