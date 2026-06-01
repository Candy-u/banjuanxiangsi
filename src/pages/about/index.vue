<template>
  <view class="page about" :style="pageStyle">
    <!-- 全页背景 -->
    <image class="about__bg" src="/static/bg.jpg" mode="aspectFill" />
    <view class="about__bg-mask" />

    <!-- 自定义导航栏 -->
    <view class="about__navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <text class="about__navbar-title text-serif">关于</text>
      <view class="about__music-btn" @tap="toggleBgMusic">
        <image class="about__music-img" :class="{ 'about__music-img--spinning': bgMusicPlaying }"
          src="/static/music.png" mode="aspectFit" />
      </view>
    </view>

    <!-- 内容区 -->
    <view class="about__content">
      <text class="about__title text-serif">半卷相思</text>
      <text class="about__desc text-serif">
        愿你在人间，\n总能遇见一句懂你的诗。
      </text>
    </view>

    <AppTabBar :current="2" />
  </view>
</template>

<script setup>
import { usePageLayout } from '@/composables/usePageLayout'
import { useBgMusic } from '@/composables/useBgMusic'
import AppTabBar from '@/components/AppTabBar.vue'

const { pageStyle, statusBarHeight } = usePageLayout({ withTabBar: true })
const { isPlaying: bgMusicPlaying, toggle: toggleBgMusic } = useBgMusic()
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

.about__bg-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(247, 243, 237, 0.55);
  z-index: 1;
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
  padding-left: $spacing-page;
  padding-right: $spacing-page;
}

.about__navbar-title {
  font-size: 34rpx;
  color: $color-text;
  letter-spacing: 6rpx;
}

.about__music-btn {
  position: absolute;
  right: 0;
  top: 186rpx;
  // transform: translateY(-50%);
  padding: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.about__music-img {
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

.about__music-img--spinning {
  animation: spin 4s linear infinite;
}

/* ── 内容区 ── */
.about__content {
  position: relative;
  z-index: 2;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-page;
  text-align: center;
}

.about__title {
  font-size: 48rpx;
  letter-spacing: 12rpx;
  color: $color-accent;
  margin-bottom: 64rpx;
}

.about__desc {
  font-size: 32rpx;
  line-height: 2;
  color: $color-text;
  white-space: pre-wrap;
  margin-bottom: 48rpx;
}
</style>
