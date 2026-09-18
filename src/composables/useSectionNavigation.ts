import { onBeforeUnmount, onMounted, ref } from 'vue'
import { finishReveal } from '@/directives/reveal'

export const navigationTarget = ref<string | null>(null)
let frame = 0
let animations: Animation[] = []
let removeInputs: (() => void) | undefined
let navigationId = 0

export function cancelSectionNavigation() {
  navigationId++
  cancelAnimationFrame(frame)
  animations.forEach(animation => animation.cancel())
  animations = []
  removeInputs?.()
  removeInputs = undefined
  navigationTarget.value = null
  document.documentElement.style.removeProperty('--navigation-duration')
  delete document.documentElement.dataset.sectionNavigating
}

function animate(element: HTMLElement, keyframes: Keyframe[], duration: number, delay = 0) {
  const animation = element.animate(keyframes, { duration, delay, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both' })
  animations.push(animation)
  void animation.finished.then(() => {
    animations = animations.filter(current => current !== animation)
    animation.cancel()
  }).catch(() => {})
}

function revealTarget(section: HTMLElement, direction: number) {
  section.querySelectorAll<HTMLElement>('[data-reveal]').forEach(finishReveal)
  const heading = section.querySelector<HTMLElement>('h1,h2')
  const label = section.querySelector<HTMLElement>('[class*="eyebrow"], span[data-reveal]')
  const description = section.querySelector<HTMLElement>('[class*="intro"], h2 + p, h1 + p')
  const cards = Array.from(section.querySelectorAll<HTMLElement>('.project-card,.capability-row,.writing-list > ul > li,.contact-rows > li'))
  const primary = Array.from(section.querySelectorAll<HTMLElement>('.about-copy > h3,.about-copy > p,.hero-actions > a'))
  const elements = [...new Set([label, heading, description, ...primary, ...cards].filter((element): element is HTMLElement => !!element))]
  // Do not animate both a parent and its descendants.
  const leaves = elements.filter(element => !elements.some(other => other !== element && other.contains(element)))
  const styles = leaves.map(element => ({ element, opacity: getComputedStyle(element).opacity, transform: getComputedStyle(element).transform }))
  styles.forEach(({ element, opacity, transform }, index) => {
    const base = transform === 'none' ? '' : transform
    animate(element, [
      { opacity: String(Number(opacity) * .92), transform: `translateY(${direction * 6}px) ${base}` },
      { opacity, transform: `translateY(0px) ${base}` },
    ], 200, Math.min(index, 5) * 25)
  })
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
    section.querySelectorAll<HTMLElement>('[data-reveal]').forEach(finishReveal)
    window.scrollTo({ top: destination, behavior: 'instant' })
    history.pushState(null, '', `#${section.id}`)
    window.dispatchEvent(new Event('scroll'))
    return
  }
  const direction = Math.sign(distance)
  const duration = Math.min(850, 420 + Math.abs(distance) * .1)
  document.documentElement.dataset.sectionNavigating = 'true'
  document.documentElement.style.setProperty('--navigation-duration', `${duration}ms`)
  navigationTarget.value = section.id
  history.pushState(null, '', `#${section.id}`)
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
  const motion = matchMedia('(prefers-reduced-motion: reduce)')
  motion.addEventListener('change', cancel)
  removeInputs = () => {
    window.removeEventListener('wheel', cancel)
    window.removeEventListener('touchstart', cancel)
    window.removeEventListener('pointerdown', cancel)
    window.removeEventListener('keydown', key)
    window.removeEventListener('resize', cancel)
    window.removeEventListener('popstate', cancel)
    motion.removeEventListener('change', cancel)
  }
  const started = performance.now()
  let revealed = false
  function tick(now: number) {
    const progress = Math.min(1, (now - started) / duration)
    const eased = progress * progress * (3 - 2 * progress)
    window.scrollTo({ top: start + distance * eased, behavior: 'instant' })
    if (!revealed && progress >= .78) { revealed = true; revealTarget(section, direction) }
    if (progress < 1) frame = requestAnimationFrame(tick)
    else {
      window.scrollTo({ top: destination, behavior: 'instant' })
      // Keep cancellation available until the last staggered item settles.
      void Promise.allSettled(animations.map(animation => animation.finished)).then(() => {
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
    if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || !url.hash) return
    const section = document.getElementById(url.hash.slice(1))
    if (!section?.matches('main section[id]')) return
    event.preventDefault()
    navigateToSection(section, section.id === 'hero')
  }
  onMounted(() => document.addEventListener('click', click))
  onBeforeUnmount(() => { document.removeEventListener('click', click); cancelSectionNavigation() })
}
