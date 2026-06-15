import { ref } from 'vue'
import { preloadCriticalAssets } from '@/utils/preloadAssets'

const isAppReady = ref(false)
let preloadPromise = null

export function useAppPreload() {
  function ensurePreload() {
    if (preloadPromise) return preloadPromise
    preloadPromise = preloadCriticalAssets()
      .catch(() => {})
      .finally(() => {
        isAppReady.value = true
      })
    return preloadPromise
  }

  return {
    isAppReady,
    ensurePreload,
  }
}
