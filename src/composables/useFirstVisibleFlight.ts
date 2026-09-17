import { onBeforeUnmount, onMounted, type Ref } from 'vue'

export function useFirstVisibleFlight(target: Ref<HTMLElement | null>, launch: () => void) {
  let observer: IntersectionObserver | undefined
  let timer: ReturnType<typeof setTimeout> | undefined
  let disposed = false

  onMounted(async () => {
    await document.fonts.ready
    if (disposed || !target.value || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return
      observer?.disconnect()
      // Let the existing text reveal finish before measuring its flight path.
      timer = setTimeout(launch, 600)
    }, { threshold: 0.6 })
    observer.observe(target.value)
  })

  onBeforeUnmount(() => {
    disposed = true
    observer?.disconnect()
    clearTimeout(timer)
  })
}
