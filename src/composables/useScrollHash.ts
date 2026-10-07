import { onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'

import { updateSectionUrl } from './useTranslation'
import { navigationTarget } from './useSectionNavigation'

export const activeScrollSection = ref<string>('hero')

export function useScrollHash(selector = 'section[id]'): { current: Ref<string | null> } {
  const current = ref<string | null>(null)
  let observer: IntersectionObserver | null = null

  // Synchronize activeScrollSection immediately when programmatic navigation starts
  watch(navigationTarget, (target) => {
    if (target) {
      activeScrollSection.value = target
      current.value = target
    }
  })

  function onScroll() {
    if (navigationTarget.value) return
    const scrollY = window.scrollY || window.pageYOffset || 0
    const innerH = window.innerHeight || 800
    const docH = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight
    )
    if (scrollY <= 50) {
      if (activeScrollSection.value !== 'hero') {
        activeScrollSection.value = 'hero'
        current.value = 'hero'
        updateSectionUrl('hero')
      }
      return
    }
    if (scrollY + innerH >= docH - 50) {
      if (activeScrollSection.value !== 'contact') {
        activeScrollSection.value = 'contact'
        current.value = 'contact'
        updateSectionUrl('contact')
      }
      return
    }
  }

  onMounted(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>(selector))
    if (!sections.length) return

    window.addEventListener('scroll', onScroll, { passive: true })

    observer = new IntersectionObserver(
      (entries) => {
        if (navigationTarget.value) return
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        if (!visible.length) return
        const id = (visible[0].target as HTMLElement).id
        if (id && current.value !== id) {
          current.value = id
          activeScrollSection.value = id
          // Update hash without adding a new history entry or causing a jump
          updateSectionUrl(id)
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
    window.removeEventListener('scroll', onScroll)
    observer?.disconnect()
  })

  return { current }
}

