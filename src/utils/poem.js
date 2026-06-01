import songPoems from '@/data/poems_song.json'
import tangPoems from '@/data/poems_tang,.json'
import wudaiPoems from '@/data/poems_wudai.json'

function buildPoems() {
  const sources = [
    { list: songPoems, prefix: 'song' },
    { list: tangPoems, prefix: 'tang' },
    { list: wudaiPoems, prefix: 'wudai' },
  ]

  const list = []
  sources.forEach(({ list: src, prefix }) => {
    src.forEach((p) => {
      const excerpt = (p.quote || '').trim()
      const content = (p.content || p.full_poem || '').trim()
      if (!excerpt && !content) return
      list.push({
        id: `${prefix}_${p.id}`,
        title: p.title || '',
        excerpt,
        content,
        author: p.author || '',
        dynasty: p.dynasty || '',
      })
    })
  })
  return list
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
