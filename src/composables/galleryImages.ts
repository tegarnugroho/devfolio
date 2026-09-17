// Retain decoded images across dialog visits without retaining every project asset.
const cache = new Map<string, { image: HTMLImageElement; ready: Promise<HTMLImageElement> }>()
const limit = 32
export function loadGalleryImage(source: string, priority: 'high' | 'low' = 'high') {
  source = new URL(source, document.baseURI).href
  const existing = cache.get(source)
  if (existing) {
    if (priority === 'high') existing.image.fetchPriority = 'high'
    cache.delete(source)
    cache.set(source, existing)
    return existing.ready
  }
  const image = new Image()
  image.fetchPriority = priority
  image.decoding = 'async'
  const ready = new Promise<HTMLImageElement>((resolve, reject) => {
    image.onload = async () => {
      try {
        await image.decode()
        resolve(image)
      } catch (error) { reject(error) }
      finally { image.onload = image.onerror = null }
    }
    image.onerror = () => {
      image.onload = image.onerror = null
      reject(new Error('Gallery image failed to load'))
    }
  })
  const entry = { image, ready }
  cache.set(source, entry)
  ready.catch(() => { if (cache.get(source) === entry) cache.delete(source) })
  while (cache.size > limit) cache.delete(cache.keys().next().value!)
  image.src = source
  return ready
}
