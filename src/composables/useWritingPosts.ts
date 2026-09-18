import { onBeforeUnmount, onMounted, ref } from 'vue'
import { portfolioContent } from '@/content/portfolioContent'

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  tags: string[]
  date: string | null
  dateLabel: string
}

function parseDate(value: unknown): { date: string | null; dateLabel: string } {
  if (typeof value !== 'string') return { date: null, dateLabel: '' }
  const day = value.match(/^(\d{4}-\d{2}-\d{2})(?:[ T]|$)/)?.[1]
  if (!day) return { date: null, dateLabel: '' }
  const date = new Date(`${day}T00:00:00Z`)
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== day) return { date: null, dateLabel: '' }
  return { date: day, dateLabel: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(date).toUpperCase() }
}

export function parseWritingPosts(response: unknown): BlogPost[] {
  if (!response || typeof response !== 'object' || !('data' in response) || !Array.isArray(response.data)) throw new Error('Invalid writing response')
  const posts: BlogPost[] = []
  const slugs = new Set<string>()
  for (const value of response.data) {
    if (!value || typeof value !== 'object' || value.published === false) continue
    if (typeof value.title !== 'string' || !value.title.trim() || typeof value.slug !== 'string' || !value.slug.trim()) continue
    const slug = value.slug.trim()
    if (/[\/\\?#]/.test(slug) || slug === '.' || slug === '..' || slugs.has(slug)) continue
    try { encodeURIComponent(slug) } catch { continue }
    slugs.add(slug)
    posts.push({
      id: typeof value.id === 'string' ? value.id : slug,
      title: value.title, slug,
      excerpt: typeof value.excerpt === 'string' ? value.excerpt : '',
      tags: Array.isArray(value.tags) ? value.tags.filter((tag: unknown): tag is string => typeof tag === 'string' && !!tag.trim()) : [],
      ...parseDate(value.created_at),
    })
  }
  return posts
}

export function useWritingPosts() {
  const posts = ref<BlogPost[]>([])
  const loading = ref(true)
  const failed = ref(false)
  const controller = new AbortController()
  let timeout: ReturnType<typeof setTimeout> | undefined
  let disposed = false
  onMounted(async () => {
    timeout = setTimeout(() => controller.abort(), 8000)
    try {
      const response = await fetch(portfolioContent.writing.postsEndpoint, { signal: controller.signal })
      if (!response.ok) throw new Error('Writing request failed')
      const result = parseWritingPosts(await response.json())
      if (!disposed) posts.value = result
    } catch {
      if (!disposed) failed.value = true
    } finally {
      clearTimeout(timeout)
      if (!disposed) loading.value = false
    }
  })
  onBeforeUnmount(() => { disposed = true; controller.abort(); clearTimeout(timeout) })
  return { posts, loading, failed }
}
