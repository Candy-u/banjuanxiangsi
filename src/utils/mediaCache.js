const localCache = new Map()
const downloading = new Map()

/** 远程资源下载到本地临时文件，重复访问直接读缓存 */
export function resolveCachedMedia(src) {
  if (!src) return Promise.resolve('')
  if (!src.startsWith('http')) return Promise.resolve(src)
  if (localCache.has(src)) return Promise.resolve(localCache.get(src))
  if (downloading.has(src)) return downloading.get(src)

  const task = new Promise((resolve) => {
    uni.downloadFile({
      url: src,
      success: (res) => {
        const local = res.statusCode === 200 ? res.tempFilePath : src
        localCache.set(src, local)
        resolve(local)
      },
      fail: () => {
        localCache.set(src, src)
        resolve(src)
      },
    })
  })

  downloading.set(src, task)
  return task.finally(() => {
    downloading.delete(src)
  })
}

export function preloadMedia(src) {
  if (src?.startsWith('http')) resolveCachedMedia(src)
}
