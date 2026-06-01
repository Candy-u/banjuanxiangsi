/** 自定义 TabBar 内容区高度（px），与 usePageLayout、variables 一致 */
export const TAB_BAR_HEIGHT_PX = 64

/** 图标+文字已合成在图片内，未选中 / 选中各一张 */
export const TAB_ITEMS = [
  {
    pagePath: 'pages/home/index',
    text: '今日',
    icon: '/static/tab/tab-home.png',
    selectedIcon: '/static/tab/tab-home-active.png',
  },
  {
    pagePath: 'pages/favorites/index',
    text: '收藏',
    icon: '/static/tab/tab-fav.png',
    selectedIcon: '/static/tab/tab-fav-active.png',
  },
  {
    pagePath: 'pages/about/index',
    text: '关于',
    icon: '/static/tab/tab-about.png',
    selectedIcon: '/static/tab/tab-about-active.png',
  },
]
