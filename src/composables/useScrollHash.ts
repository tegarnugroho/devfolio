import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

export function useScrollHash(selector = 'section[id]'): { current: Ref<string | null> } {
  const current = ref<string | null>(null)
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>(selector))
    if (!sections.length) return

    observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        if (!visible.length) return
        const id = (visible[0].target as HTMLElement).id
        if (id && current.value !== id) {
          current.value = id
          // Update hash without adding a new history entry or causing a jump
          history.replaceState(null, '', `#${id}`)
        }
      },
      {
        // Favor the middle of the viewport; accommodate sticky header
        root: null,
        threshold: [0, 0.25, 0.5, 0.75, 1],
        rootMargin: '-40% 0px -60% 0px',
      }
    )

    sections.forEach((s) => observer!.observe(s))
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
  })

  return { current }
}

