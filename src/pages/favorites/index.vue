<template>
  <view class="page favorites" :style="pageStyle">
    <!-- 全页背景 -->
    <image class="fav__bg" src="/static/bg.jpg" mode="aspectFill" />
    <view class="fav__bg-mask" />

    <!-- 内容区 -->
    <view class="fav__body">
      <view v-if="favoritesStore.items.length" class="favorites__list">
        <view v-for="item in favoritesStore.items" :key="item.poemId + '-' + item.savedAt" class="favorites__item card">
          <view class="favorites__main" @tap="goDetail(item.poemId)">
            <text class="favorites__excerpt text-serif">{{ item.excerpt }}</text>
            <text class="favorites__author text-secondary">{{ item.author }}</text>
            <view v-if="item.tags?.length" class="favorites__tags">
              <text v-for="tag in item.tags" :key="tag" class="favorites__tag">{{ tag }}</text>
            </view>
            <text class="favorites__time text-muted">{{ formatTime(item.savedAt) }}</text>
          </view>
          <text v-if="item.sound" class="favorites__sound text-secondary" @tap.stop="playItem(item)">♪</text>
        </view>
      </view>
      <view v-else class="favorites__empty">
        <text class="favorites__empty-text text-serif">你还没有收藏任何句子</text>
      </view>
    </view>

    <AppTabBar :current="2" />
  </view>
</template>

<script setup>
import { onHide } from '@dcloudio/uni-app'
import { useFavoritesStore } from '@/stores/favorites'
import { usePageLayout } from '@/composables/usePageLayout'
import { usePoemAudio } from '@/composables/usePoemAudio'
import { getPoemById } from '@/utils/poem'
import AppTabBar from '@/components/AppTabBar.vue'

const { pageStyle } = usePageLayout({ withTabBar: true })
const favoritesStore = useFavoritesStore()
const { toggle: toggleSound, stop: stopSound } = usePoemAudio()

onHide(() => {
  stopSound()
})

function formatTime(timestamp) {
  const d = new Date(timestamp)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}.${m}.${day}`
}

function goDetail(poemId) {
  uni.navigateTo({
    url: `/pages/detail/index?id=${poemId}`,
  })
}

function playItem(item) {
  const poem = getPoemById(item.poemId) || {
    id: item.poemId,
    sound: item.sound,
    excerpt: item.excerpt,
    author: item.author,
  }
  toggleSound(poem)
}
</script>

<style lang="scss" scoped>
.favorites {
  box-sizing: border-box;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* ── 背景 ── */
.fav__bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
}

.fav__bg-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(247, 243, 237, 0.55);
  z-index: 1;
}


/* ── 内容区 ── */
.fav__body {
  position: relative;
  z-index: 2;
  flex: 1;
  padding: $spacing-page;
  padding-top: $spacing-section;
}

.favorites__list {
  display: flex;
  flex-direction: column;
  gap: $spacing-section;
}

.favorites__item {
  padding: 40rpx;
  display: flex;
  align-items: flex-start;
  gap: 24rpx;
}

.favorites__main {
  flex: 1;
  min-width: 0;
}

.favorites__excerpt {
  display: block;
  font-size: 36rpx;
  line-height: 1.7;
  margin-bottom: 16rpx;
}

.favorites__author {
  font-size: 28rpx;
}

.favorites__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 20rpx;
}

.favorites__tag {
  font-size: 24rpx;
  color: $color-text-muted;
}

.favorites__time {
  display: block;
  margin-top: 20rpx;
  font-size: 22rpx;
}

.favorites__sound {
  flex-shrink: 0;
  font-size: 36rpx;
  padding: 8rpx 16rpx;
}

.favorites__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
}

.favorites__empty-text {
  font-size: 30rpx;
  color: $color-text-muted;
  letter-spacing: 4rpx;
}
</style>
