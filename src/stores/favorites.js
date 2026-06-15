import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const STORAGE_KEY = 'banjuan_favorites'

function loadFromStorage() {
  try {
    const raw = uni.getStorageSync(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveToStorage(list) {
  uni.setStorageSync(STORAGE_KEY, JSON.stringify(list))
}

export const useFavoritesStore = defineStore('favorites', () => {
  const items = ref(loadFromStorage())

  const count = computed(() => items.value.length)

  function persist() {
    saveToStorage(items.value)
  }

  function isFavorite(poemId) {
    return items.value.some((item) => item.poemId === String(poemId))
  }

  function add(poem) {
    const poemId = String(poem.id)
    if (isFavorite(poemId)) return false
    items.value.unshift({
      poemId,
      title: poem.title,
      excerpt: poem.excerpt,
      author: poem.author,
      tags: poem.tags || [],
      sound: poem.sound || '',
      audio: poem.audio || '',
      savedAt: Date.now(),
    })
    persist()
    return true
  }

  function remove(poemId) {
    const id = String(poemId)
    const before = items.value.length
    items.value = items.value.filter((item) => item.poemId !== id)
    if (items.value.length !== before) {
      persist()
      return true
    }
    return false
  }

  function toggle(poem) {
    const poemId = String(poem.id)
    if (isFavorite(poemId)) {
      remove(poemId)
      return false
    }
    add(poem)
    return true
  }

  return {
    items,
    count,
    isFavorite,
    add,
    remove,
    toggle,
  }
})
