import purePoetry from '@/data/pure_poetry.json'

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
      sound: p.quote_audio || '',
      audio: p.audio || '',
      soundPic: p.sound_pic || '',
    }))
}

const poems = buildPoems()

export function getAllPoems() {
  return poems
}

export function getPoemById(id) {
  return poems.find((p) => p.id === String(id)) || null
}

export function getRandomPoem(excludeId) {
  const list = excludeId
    ? poems.filter((p) => p.id !== String(excludeId))
    : poems
  if (!list.length) return poems[0] || null
  return list[Math.floor(Math.random() * list.length)]
}
