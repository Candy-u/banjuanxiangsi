export const CDN_BASE = 'https://xiangsi.pages.dev/src/static'

export function cdnStatic(path) {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${CDN_BASE}${normalized}`
}

/** 首屏常用静态图（CDN） */
export const CRITICAL_CDN_IMAGES = [
  '/bg.jpg',
  '/p_bg.png',
  '/quote.png',
  '/music.png',
  '/collection.png',
  '/collection_active.png',
  '/share.png',
  '/audio-on.png',
  '/audio-off.png',
  '/back.png',
].map(cdnStatic)

/** TabBar 等本地静态图 */
export const CRITICAL_LOCAL_IMAGES = [
  '/static/tab/tab-home.png',
  '/static/tab/tab-home-active.png',
  '/static/tab/tab-fav.png',
  '/static/tab/tab-fav-active.png',
  '/static/tab/tab-about.png',
  '/static/tab/tab-about-active.png',
]
