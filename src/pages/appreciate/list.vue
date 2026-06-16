<template>
  <view class="page appreciate-list" :style="pageStyle">
    <image class="appreciate-list__bg" src="/static/bg.jpg" mode="aspectFill" />
    <view class="appreciate-list__bg-mask" />

    <view class="appreciate-list__navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="appreciate-list__back-btn" @tap="goBack">
        <image class="appreciate-list__back-img" src="https://xiangsi.pages.dev/src/static/back.png" mode="aspectFit" />
      </view>
      <text class="appreciate-list__title text-serif">{{ categoryLabel }}</text>
    </view>

    <scroll-view class="appreciate-list__body" scroll-y :show-scrollbar="false">
      <view v-if="poems.length" class="appreciate-list__items">
        <view
          v-for="item in poems"
          :key="item.id"
          class="appreciate-list__item card"
          @tap="goDetail(item.id)"
        >
          <view class="appreciate-list__main">
            <text v-if="item.title" class="appreciate-list__poem-title text-serif">{{ item.title }}</text>
            <text class="appreciate-list__excerpt text-serif">{{ item.excerpt }}</text>
            <text class="appreciate-list__author text-secondary">{{ item.author }}</text>
          </view>
          <text v-if="item.sound" class="appreciate-list__sound text-secondary" @tap.stop="playItem(item)">♪</text>
        </view>
      </view>
      <view v-else class="appreciate-list__empty">
        <text class="appreciate-list__empty-text text-serif">暂无诗词</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onHide } from '@dcloudio/uni-app'
import { CATEGORY_LABELS } from '@/constants/appreciate'
import { getPoemsByCategory } from '@/utils/poem'
import { usePageLayout } from '@/composables/usePageLayout'
import { usePoemAudio } from '@/composables/usePoemAudio'

const { pageStyle, statusBarHeight } = usePageLayout({ withTabBar: false })
const { toggle: toggleSound, stop: stopSound } = usePoemAudio()

const categoryType = ref('')
const categoryKey = ref('')
const poems = ref([])

const categoryLabel = computed(() => CATEGORY_LABELS[categoryKey.value] || '诗词列表')

onLoad((query) => {
  categoryType.value = query?.type || ''
  categoryKey.value = query?.key || ''
  poems.value = getPoemsByCategory(categoryType.value, categoryKey.value)
})

onHide(() => {
  stopSound()
})

function goBack() {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
  } else {
    uni.switchTab({ url: '/pages/appreciate/index' })
  }
}

function goDetail(poemId) {
  uni.navigateTo({
    url: `/pages/detail/index?id=${poemId}`,
  })
}

function playItem(item) {
  toggleSound(item, 'quote')
}
</script>

<style lang="scss" scoped>
.appreciate-list {
  box-sizing: border-box;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.appreciate-list__bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
}

.appreciate-list__bg-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(247, 243, 237, 0.55);
  z-index: 1;
}

.appreciate-list__navbar {
  position: relative;
  z-index: 2;
  flex-shrink: 0;
  height: 44px;
  box-sizing: content-box;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: $spacing-page;
  padding-right: $spacing-page;
}

.appreciate-list__back-btn {
  position: absolute;
  left: $spacing-page;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 70rpx;
  height: 70rpx;
}

.appreciate-list__back-img {
  width: 60rpx;
  height: 60rpx;
  display: block;
}

.appreciate-list__title {
  font-size: 34rpx;
  color: $color-text;
  letter-spacing: 4rpx;
}

.appreciate-list__body {
  position: relative;
  z-index: 2;
  flex: 1;
  height: 0;
  box-sizing: border-box;
  padding: 0 $spacing-page 40rpx;
}

.appreciate-list__items {
  display: flex;
  flex-direction: column;
  gap: $spacing-section;
  padding-top: 16rpx;
}

.appreciate-list__item {
  padding: 36rpx 40rpx;
  display: flex;
  align-items: flex-start;
  gap: 24rpx;
}

.appreciate-list__main {
  flex: 1;
  min-width: 0;
}

.appreciate-list__poem-title {
  display: block;
  font-size: 30rpx;
  color: $color-accent;
  margin-bottom: 12rpx;
  letter-spacing: 2rpx;
}

.appreciate-list__excerpt {
  display: block;
  font-size: 34rpx;
  line-height: 1.7;
  margin-bottom: 12rpx;
}

.appreciate-list__author {
  font-size: 26rpx;
}

.appreciate-list__sound {
  flex-shrink: 0;
  font-size: 36rpx;
  padding: 8rpx 16rpx;
}

.appreciate-list__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
}

.appreciate-list__empty-text {
  font-size: 30rpx;
  color: $color-text-muted;
  letter-spacing: 4rpx;
}
</style>
