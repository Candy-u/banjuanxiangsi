import { ref, computed, onMounted } from 'vue'
import { TAB_BAR_HEIGHT_PX } from '@/constants/tabBar'

/** 状态栏 + 底部 tabBar 占位（微信开发者工具与真机） */
export function usePageLayout(options = {}) {
  const { withTabBar = true, tabBarHeightPx = TAB_BAR_HEIGHT_PX } = options

  const statusBarHeight = ref(0)
  const safeAreaBottom = ref(0)

  onMounted(() => {
    const sys = uni.getSystemInfoSync()
    statusBarHeight.value = sys.statusBarHeight || 0
    safeAreaBottom.value = sys.safeAreaInsets?.bottom ?? 0
  })

  const headerStyle = computed(() => ({
    paddingTop: `${statusBarHeight.value}px`,
  }))

  const pageStyle = computed(() => {
    if (!withTabBar) {
      return {
        paddingBottom: `${safeAreaBottom.value}px`,
      }
    }
    return {
      paddingBottom: `calc(${tabBarHeightPx}px + ${safeAreaBottom.value}px)`,
    }
  })

  return {
    statusBarHeight,
    safeAreaBottom,
    headerStyle,
    pageStyle,
  }
}
