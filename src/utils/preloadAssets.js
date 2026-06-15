import { CRITICAL_CDN_IMAGES, CRITICAL_LOCAL_IMAGES } from '@/constants/cdn'

function preloadImage(src) {
  if (!src) return Promise.resolve(false)
  return new Promise((resolve) => {
    uni.getImageInfo({
      src,
      success: () => resolve(true),
      fail: () => resolve(false),
    })
  })
}

/** 预加载首屏关键图片，失败不阻塞启动 */
export function preloadCriticalAssets() {
  const urls = [...CRITICAL_CDN_IMAGES, ...CRITICAL_LOCAL_IMAGES]
  return Promise.all(urls.map(preloadImage))
}
