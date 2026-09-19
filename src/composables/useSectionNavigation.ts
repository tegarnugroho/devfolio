import { onBeforeUnmount, onMounted, ref } from 'vue'
import { parseLocalePath, updateSectionUrl } from './useTranslation'
import { revealSection, setRevealNavigationTarget } from '@/directives/reveal'

export const navigationTarget = ref<string | null>(null)
let frame = 0
let removeInputs: (() => void) | undefined
let navigationId = 0

export function cancelSectionNavigation() {
  navigationId++
  cancelAnimationFrame(frame)
  removeInputs?.()
  removeInputs = undefined
  navigationTarget.value = null
  setRevealNavigationTarget(null)
  document.documentElement.style.removeProperty('--navigation-duration')
  delete document.documentElement.dataset.sectionNavigating
}

export function navigateToSection(section: HTMLElement, top = false) {
  cancelSectionNavigation()
  const id = navigationId
  const start = window.scrollY
  const margin = parseFloat(getComputedStyle(section).scrollMarginTop) || 0
  const navbar = document.querySelector<HTMLElement>('.graphite-navbar')
  const offset = Math.max(margin, navbar?.getBoundingClientRect().height ?? 0)
  const destination = Math.max(0, Math.min(top ? 0 : section.getBoundingClientRect().top + start - offset,
    document.documentElement.scrollHeight - window.innerHeight))
  const distance = destination - start
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || Math.abs(distance) < 2) {
    window.scrollTo({ top: destination, behavior: 'instant' })
    void revealSection(section, matchMedia('(prefers-reduced-motion: reduce)').matches)
    updateSectionUrl(section.id, 'push')
    window.dispatchEvent(new Event('scroll'))
    return
  }
  const duration = Math.min(850, 420 + Math.abs(distance) * .1)
  document.documentElement.dataset.sectionNavigating = 'true'
  document.documentElement.style.setProperty('--navigation-duration', `${duration}ms`)
  navigationTarget.value = section.id
  setRevealNavigationTarget(section)
  updateSectionUrl(section.id, 'push')
  const cancel = () => cancelSectionNavigation()
  const key = (event: KeyboardEvent) => {
    if (['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' ','Escape'].includes(event.key) &&
      !(event.target instanceof HTMLElement && event.target.closest('input,textarea,select,[contenteditable="true"],[role="slider"]'))) cancel()
  }
  window.addEventListener('wheel', cancel, { passive: true })
  window.addEventListener('touchstart', cancel, { passive: true })
  window.addEventListener('pointerdown', cancel, { passive: true })
  window.addEventListener('keydown', key)
  window.addEventListener('resize', cancel)
  window.addEventListener('popstate', cancel)
  window.addEventListener('locale-changing', cancel)
  const motion = matchMedia('(prefers-reduced-motion: reduce)')
  motion.addEventListener('change', cancel)
  removeInputs = () => {
    window.removeEventListener('wheel', cancel)
    window.removeEventListener('touchstart', cancel)
    window.removeEventListener('pointerdown', cancel)
    window.removeEventListener('keydown', key)
    window.removeEventListener('resize', cancel)
    window.removeEventListener('popstate', cancel)
    window.removeEventListener('locale-changing', cancel)
    motion.removeEventListener('change', cancel)
  }
  const started = performance.now()
  let revealed = false
  function tick(now: number) {
    const progress = Math.min(1, (now - started) / duration)
    const eased = progress * progress * (3 - 2 * progress)
    window.scrollTo({ top: start + distance * eased, behavior: 'instant' })
    if (!revealed && progress >= .78) { revealed = true; void revealSection(section) }
    if (progress < 1) frame = requestAnimationFrame(tick)
    else {
      window.scrollTo({ top: destination, behavior: 'instant' })
      // Keep cancellation available until the last staggered item settles.
      void revealSection(section).then(() => {
        if (navigationId === id) cancelSectionNavigation()
      })
    }
  }
  frame = requestAnimationFrame(tick)
}

export function useSectionNavigation() {
  function click(event: MouseEvent) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const link = (event.target as Element).closest<HTMLAnchorElement>('a[href]')
    if (!link || link.target || link.hasAttribute('download')) return
    const url = new URL(link.href)
    if (url.origin !== location.origin || url.search !== location.search) return
    const route = parseLocalePath(url.pathname)
    const current = parseLocalePath(location.pathname)
    if (route.locale !== current.locale || !/^\/(en|id)(\/(about|skills|projects|writing|contact))?\/?$/.test(url.pathname)) return
    const section = document.getElementById(url.hash ? url.hash.slice(1) : route.section)
    if (!section?.matches('main section[id]')) return
    event.preventDefault()
    navigateToSection(section, section.id === 'hero')
  }
  onMounted(() => document.addEventListener('click', click))
  onBeforeUnmount(() => { document.removeEventListener('click', click); cancelSectionNavigation() })
}
