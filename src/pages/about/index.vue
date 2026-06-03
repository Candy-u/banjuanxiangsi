<template>
  <view class="page about" :style="pageStyle">
    <!-- 全页背景 -->
    <image class="about__bg" src="/static/about_bg.png" mode="aspectFill" />

    <!-- 自定义导航栏 -->
    <view class="about__navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <text class="about__navbar-title text-serif">关于</text>
    </view>

    <!-- 主场景 -->
    <view class="about__scene">
      <!-- 人物 -->
      <image class="about__person" src="/static/about_person.png" mode="heightFix" />
      <!-- 竖排诗句 -->
      <view class="about__poem">
        <text class="about__poem-text text-serif">相思了无益，</text>
        <text class="about__poem-text text-serif about__poem-text--reverse">悔当初相见。</text>
      </view>
    </view>

    <AppTabBar :current="2" />
  </view>
</template>

<script setup>
import { usePageLayout } from '@/composables/usePageLayout'
import AppTabBar from '@/components/AppTabBar.vue'

const { pageStyle, statusBarHeight } = usePageLayout({ withTabBar: true })
</script>

<style lang="scss" scoped>
.about {
  box-sizing: border-box;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* ── 背景 ── */
.about__bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
}

/* ── 导航栏 ── */
.about__navbar {
  position: relative;
  z-index: 2;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  box-sizing: content-box;
}

.about__navbar-title {
  font-size: 34rpx;
  color: $color-text;
  letter-spacing: 6rpx;
}

/* ── 主场景 ── */
.about__scene {
  position: relative;
  z-index: 2;
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 0 $spacing-page;
}

/* ── 人物 ── */
.about__person {
  height: 50vh;
  flex-shrink: 0;
  display: block;
}

/* ── 竖排诗句 ── */
.about__poem {
  display: flex;
  flex-direction: row-reverse;
  gap: 12rpx;
  margin-left: 48rpx;
}

.about__poem-text {
  writing-mode: vertical-rl;
  font-size: 46rpx;
  color: $color-text;
  letter-spacing: 10rpx;
}

.about__poem-text--reverse {
  // transform: scaleX(-1);
  margin-top: 100rpx;
}
</style>
