/** 资源更新后改这个版本号，强制刷新 CDN / 小程序本地缓存 */
export const ASSET_VERSION = '2'

export function withAssetVersion(url) {
  if (!url?.startsWith('http')) return url || ''
  if (/[?&]v=/.test(url)) return url
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${ASSET_VERSION}`
}
