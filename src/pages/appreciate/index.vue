<template>
  <view class="page appreciate" :style="pageStyle">
    <image class="appreciate__bg" src="/static/bg.jpg" mode="aspectFill" />
    <view class="appreciate__bg-mask" />

    <view class="appreciate__navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <text class="appreciate__navbar-title text-serif">雅集</text>
    </view>

    <view class="appreciate__body">
      <view v-for="group in APPRECIATE_GROUPS" :key="group.title" class="appreciate__section">
        <text class="appreciate__section-title text-serif">{{ group.title }}</text>
        <view class="appreciate__grid">
          <view
            v-for="item in group.items"
            :key="item.key"
            class="appreciate__item card"
            @tap="goList(group.title, item.key)"
          >
            <text class="appreciate__item-label text-serif">{{ item.label }}</text>
            <text class="appreciate__item-count text-muted">{{ getCount(group.title, item.key) }} 首</text>
          </view>
        </view>
      </view>
    </view>

    <AppTabBar :current="1" />
  </view>
</template>

<script setup>
import { APPRECIATE_GROUPS } from '@/constants/appreciate'
import { getPoemsByCategory } from '@/utils/poem'
import { usePageLayout } from '@/composables/usePageLayout'
import AppTabBar from '@/components/AppTabBar.vue'

const { pageStyle, statusBarHeight } = usePageLayout({ withTabBar: true })

const GROUP_TYPE_MAP = {
  教材: 'textbook',
  主题: 'theme',
}

function getCount(groupTitle, key) {
  const type = GROUP_TYPE_MAP[groupTitle]
  return getPoemsByCategory(type, key).length
}

function goList(groupTitle, key) {
  const type = GROUP_TYPE_MAP[groupTitle]
  uni.navigateTo({
    url: `/pages/appreciate/list?type=${type}&key=${key}`,
  })
}
</script>

<style lang="scss" scoped>
.appreciate {
  box-sizing: border-box;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  background: transparent;
}

.appreciate__bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
}

.appreciate__bg-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(247, 243, 237, 0.55);
  z-index: 1;
}

.appreciate__navbar {
  position: relative;
  z-index: 2;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  box-sizing: content-box;
}

.appreciate__navbar-title {
  font-size: 34rpx;
  color: $color-text;
  letter-spacing: 6rpx;
}

.appreciate__body {
  position: relative;
  z-index: 2;
  flex: 1;
  padding: $spacing-page;
  padding-top: $spacing-section;
}

.appreciate__section + .appreciate__section {
  margin-top: 56rpx;
}

.appreciate__section-title {
  display: block;
  font-size: 32rpx;
  color: $color-accent;
  letter-spacing: 6rpx;
  margin-bottom: 24rpx;
  padding-left: 20rpx;
  border-left: 6rpx solid rgba(107, 93, 79, 0.35);
}

.appreciate__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}

.appreciate__item {
  box-sizing: border-box;
  min-height: 120rpx;
  padding: 32rpx 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  text-align: center;
}

.appreciate__item-label {
  font-size: 30rpx;
  color: $color-text;
  letter-spacing: 3rpx;
  line-height: 1.4;
}

.appreciate__item-count {
  font-size: 22rpx;
  letter-spacing: 1rpx;
}
</style>
