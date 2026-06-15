import purePoetry from '@/data/pure_poetry.json'
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

function refillQueue(excludeId) {
  const exclude = String(excludeId || '')
  let pool = exclude ? poems.filter((p) => p.id !== exclude) : [...poems]
  if (!pool.length) pool = [...poems]
  shuffleQueue = shuffleList(pool)
}

export function getAllPoems() {
  return poems
}

export function getPoemById(id) {
  return poems.find((p) => p.id === String(id)) || null
}

/** 洗牌队列：一轮内不重复，轮完再重新洗牌 */
export function getRandomPoem(excludeId) {
  const exclude = excludeId ? String(excludeId) : ''

  if (!shuffleQueue.length) {
    refillQueue(exclude)
  }

  let poem = shuffleQueue.shift()
  if (exclude && poem?.id === exclude) {
    if (!shuffleQueue.length) refillQueue(exclude)
    poem = shuffleQueue.shift()
  }

  if (!poem) {
    refillQueue(exclude)
    poem = shuffleQueue.shift() || poems[0] || null
  }

  return poem
}
