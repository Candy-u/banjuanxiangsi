/** 赏析页分类配置 */
export const APPRECIATE_GROUPS = [
  {
    title: '教材',
    type: 'textbook',
    items: [
      {
        key: 'primary',
        label: '小学必背',
        subtitle: '陪伴孩子的诗词启蒙',
        image: '/static/category/primary.png',
      },
      {
        key: 'middle',
        label: '初中必背',
        subtitle: '课内经典诗词精选',
        image: '/static/category/middle.png',
      },
      {
        key: 'high',
        label: '高中必背',
        subtitle: '高考常见诗词合集',
        image: '/static/category/middle.png',
      },
    ],
  },
  {
    title: '主题',
    type: 'theme',
    items: [
      {
        key: 'landscape',
        label: '山水',
        subtitle: '寄情山水之间',
        image: '/static/category/shan.png',
      },
      {
        key: 'love',
        label: '爱情',
        subtitle: '愿得一心人',
        image: '/static/category/aiqing.png',
      },
      {
        key: 'homesick',
        label: '思乡',
        subtitle: '写给远方的牵挂',
        image: '/static/category/sixiang.png',
      },
      {
        key: 'patriotic',
        label: '爱国',
        subtitle: '家国情怀',
        image: '/static/category/aiguo.png',
      },
      {
        key: 'farewell',
        label: '离别',
        subtitle: '执手相看泪眼',
        image: '/static/category/libie.png',
      },
      {
        key: 'inspirational',
        label: '励志',
        subtitle: '不负韶华',
        image: '/static/category/lizhi.png',
      },
    ],
  },
]

export const CATEGORY_LABELS = {
  primary: '小学必背',
  middle: '初中必背',
  high: '高中必背',
  landscape: '山水',
  love: '爱情',
  homesick: '思乡',
  patriotic: '爱国',
  farewell: '离别',
  inspirational: '励志',
}
