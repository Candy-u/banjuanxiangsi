<template>
  <view class="app-tabbar">
    <view
      v-for="(item, index) in TAB_ITEMS"
      :key="item.pagePath"
      class="app-tabbar__item"
      @tap="onTap(index, item)"
    >
      <image
        class="app-tabbar__img"
        :src="current === index ? item.selectedIcon : item.icon"
        mode="aspectFit"
      />
      <text :class="['app-tabbar__label', current === index ? 'app-tabbar__label--active' : '']">{{ item.text }}</text>
    </view>
  </view>
</template>

<script setup>
import { TAB_ITEMS } from '@/constants/tabBar'

const props = defineProps({
  /** 当前选中的 tab 索引：0 今日 / 1 赏析 / 2 收藏 / 3 关于 */
  current: {
    type: Number,
    default: 0,
  },
})

function onTap(index, item) {
  if (index === props.current) return
  uni.switchTab({ url: `/${item.pagePath}` })
}
</script>

<style lang="scss" scoped>
.app-tabbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  min-height: $tab-bar-height;
  padding: 8rpx 16rpx 0;
  padding-bottom: env(safe-area-inset-bottom);
  background-color: $color-bg;
  border-top: 1rpx solid $color-border;
  box-sizing: content-box;
}

.app-tabbar__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rpx 0 6rpx;
  gap: 4rpx;
}

.app-tabbar__img {
  width: 88rpx;
  height: 88rpx;
  display: block;
}

.app-tabbar__label {
  font-size: 20rpx;
  line-height: 1.2;
  color: $color-text-secondary;
  letter-spacing: 1rpx;
}

.app-tabbar__label--active {
  color: $color-accent;
}
</style>
