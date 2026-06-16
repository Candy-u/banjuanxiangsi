import purePoetry from '@/data/pure_poetry.json'
import poemCategories from '@/data/poem_categories.json'
import { withAssetVersion } from '@/utils/assetUrl'

function buildPoems() {
  return purePoetry
    .filter((p) => !p.disabled && p.content && p.quote)
    .map((p, index) => ({
      id: `${p.id}_${index}`,
      poetryId: p.id,
      title: p.title || '',
      excerpt: (p.quote || '').trim(),
      content: (p.content || '').trim(),
      author: p.author || '',
      dynasty: p.dynasty || '',
      sound: withAssetVersion(p.quote_audio || ''),
      audio: withAssetVersion(p.audio || ''),
      soundPic: withAssetVersion(p.sound_pic || ''),
    }))
}

const poems = buildPoems()
let shuffleQueue = []

function shuffleList(list) {
  const arr = [...list]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function getExcludePoetryId(excludeId) {
  const exclude = String(excludeId || '')
  if (!exclude) return null
  return poems.find((p) => p.id === exclude)?.poetryId || null
}

function buildPool(excludeId) {
  const exclude = String(excludeId || '')
  const excludePoetryId = getExcludePoetryId(exclude)
  let pool = [...poems]

  if (excludePoetryId) {
    pool = poems.filter((p) => p.poetryId !== excludePoetryId)
  } else if (exclude) {
    pool = poems.filter((p) => p.id !== exclude)
  }

  if (!pool.length) pool = [...poems]
  return pool
}

function refillQueue(excludeId) {
  shuffleQueue = shuffleList(buildPool(excludeId))
}

/** 清空洗牌队列，下次取诗时重新随机 */
export function resetShuffleQueue() {
  shuffleQueue = []
}

export function getAllPoems() {
  return poems
}

export function getPoemById(id) {
  return poems.find((p) => p.id === String(id)) || null
}

/** 按赏析分类取诗词（每首诗词只保留一条代表条目） */
export function getPoemsByCategory(group, key) {
  const ids = poemCategories[group]?.[key]
  if (!ids?.length) return []

  const seen = new Set()
  const result = []

  for (const poetryId of ids) {
    if (seen.has(poetryId)) continue
    const poem = poems.find((p) => p.poetryId === String(poetryId))
    if (poem) {
      seen.add(poetryId)
      result.push(poem)
    }
  }

  return result
}

/** 洗牌队列：一轮内不重复，轮完再重新洗牌 */
export function getRandomPoem(excludeId) {
  const exclude = excludeId ? String(excludeId) : ''
  const excludePoetryId = getExcludePoetryId(exclude)

  if (!shuffleQueue.length) {
    refillQueue(exclude)
  } else if (excludePoetryId) {
    shuffleQueue = shuffleQueue.filter((p) => p.poetryId !== excludePoetryId)
    if (!shuffleQueue.length) refillQueue(exclude)
  } else if (exclude) {
    shuffleQueue = shuffleQueue.filter((p) => p.id !== exclude)
    if (!shuffleQueue.length) refillQueue(exclude)
  }

  let poem = shuffleQueue.shift()

  if (!poem) {
    refillQueue(exclude)
    poem = shuffleQueue.shift() || poems[0] || null
  }

  return poem
}
