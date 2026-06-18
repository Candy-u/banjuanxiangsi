<template>
  <view class="page appreciate" :style="pageStyle">
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
            class="appreciate__item"
            @tap="goList(group.title, item.key)"
          >
            <image class="appreciate__item-bg" :src="item.image" mode="aspectFill" />
            <view class="appreciate__item-content">
              <text class="appreciate__item-label text-serif">{{ item.label }}</text>
              <text class="appreciate__item-subtitle">{{ item.subtitle }}</text>
              <text class="appreciate__item-count">{{ getCount(group.title, item.key) }} 首</text>
            </view>
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
  background: $color-bg;
}

.appreciate__navbar {
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
  font-weight: bold;
  color: $color-text;
  letter-spacing: 4rpx;
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
  background: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  position: relative;
  min-height: 160rpx;
}

.appreciate__item-bg {
  position: absolute;
  top: 0;
  right: 0;
  width: 55%;
  height: 100%;
  z-index: 0;
}

.appreciate__item-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 28rpx 24rpx;
  background: linear-gradient(
    to right,
    #ffffff 0%,
    #ffffff 45%,
    rgba(255, 255, 255, 0.6) 70%,
    rgba(255, 255, 255, 0) 100%
  );
}

.appreciate__item-label {
  display: block;
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
  letter-spacing: 2rpx;
  line-height: 1.4;
}

.appreciate__item-subtitle {
  display: block;
  font-size: 24rpx;
  color: #666666;
  margin-top: 6rpx;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.appreciate__item-count {
  display: block;
  font-size: 22rpx;
  color: #a68a64;
  margin-top: 12rpx;
  letter-spacing: 1rpx;
}
</style>
