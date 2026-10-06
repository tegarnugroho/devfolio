import type { Directive } from 'vue'

type RevealOptions = { delay?: number; kind?: 'heading' | 'accent'; whenVisible?: boolean }
type SectionState = { finish?: () => void; settled?: Promise<void> }

const options = new WeakMap<HTMLElement, RevealOptions>()
const pending = new WeakMap<HTMLElement, () => void>()
const sections = new Map<HTMLElement, SectionState>()
const viewed = new Set<string>()
const waitingItems = new Map<HTMLElement, HTMLElement>()
const activeItems = new Map<HTMLElement, { section: HTMLElement; finish: () => void }>()
let observer: IntersectionObserver | undefined
let motion: MediaQueryList | undefined
let navigationTarget: HTMLElement | null = null
let scanFrame = 0
let disabled = false

export function finishReveal(element: HTMLElement) { pending.get(element)?.() }

function visible(element: HTMLElement) {
  const bounds = element.getBoundingClientRect()
  const top = 80 // Match the sticky navigation clearance.
  const height = Math.max(0, Math.min(bounds.bottom, innerHeight) - Math.max(bounds.top, top))
  // Tall mobile sections must not require an unreachable fraction of their full height.
  return height > 0 && height >= Math.min(bounds.height * .2, (innerHeight - top) * .8)
}

function finishSection(section: HTMLElement) {
  const state = sections.get(section)
  viewed.add(section.id)
  section.dataset.sectionReveal = 'revealed'
  observer?.unobserve(section)
  state?.finish?.()
  for (const [element, owner] of waitingItems) if (owner === section) finishItem(element)
  for (const [element, item] of activeItems) if (item.section === section) finishItem(element)
}

function disableReveals() {
  disabled = true
  observer?.disconnect()
  for (const section of sections.keys()) finishSection(section)
}

function finishItem(element: HTMLElement) {
  delete element.dataset.revealWaiting
  waitingItems.delete(element)
  observer?.unobserve(element)
  activeItems.get(element)?.finish()
}

const EASING = 'cubic-bezier(0.22, 1, 0.36, 1)'

function animateItem(element: HTMLElement, opacity: string, delay?: number) {
  const isReduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  if (isReduced) {
    return element.animate([{ opacity }, { opacity }], { duration: 0, fill: 'both' })
  }
  const isMobile = matchMedia('(max-width: 767px)').matches
  const settings = options.get(element) ?? {}
  const isHeading = settings.kind === 'heading'
  const isAccent = settings.kind === 'accent'

  const distance = isMobile ? (isAccent ? 8 : 10) : (isAccent ? 12 : (isHeading ? 18 : 16))
  const from: Keyframe = { opacity: 0, translate: `0 ${distance}px` }
  const to: Keyframe = { opacity, translate: '0 0' }
  if (isHeading && !isMobile) {
    from.scale = '0.985'
    to.scale = '1'
  }

  const duration = isMobile
    ? (isHeading ? 460 : (isAccent ? 380 : 420))
    : (isHeading ? 500 : (isAccent ? 420 : 460))

  const baseDelay = delay ?? settings.delay ?? 0
  const finalDelay = isMobile ? Math.round(baseDelay * 0.7) : baseDelay

  return element.animate([from, to], {
    duration,
    delay: Math.min(600, Math.max(0, finalDelay)),
    easing: EASING,
    fill: 'both',
  })
}

function fallbackDuration(animations: Animation[]) {
  return Math.max(0, ...animations.map(animation => Number(animation.effect?.getComputedTiming().endTime) || 0)) + 200
}

function revealVisibleItems() {
  // Offscreen rows keep their first entrance until they can actually be seen.
  const isMobile = matchMedia('(max-width: 767px)').matches
  const stagger = isMobile ? 45 : 60
  let index = 0
  for (const [element, section] of waitingItems) {
    if ((navigationTarget && navigationTarget !== section) || !visible(element)) continue
    finishItem(element)
    try {
      const animation = animateItem(element, getComputedStyle(element).opacity, 60 + index++ * stagger)
      const finish = () => {
        clearTimeout(timer)
        animation.cancel()
        activeItems.delete(element)
      }
      const timer = setTimeout(finish, fallbackDuration([animation]))
      activeItems.set(element, { section, finish })
      void animation.finished.then(finish, finish)
    } catch { finishItem(element) }
  }
}

/** Navigation and the observer share this once-only entrance; neither owns scroll transforms. */
export function revealSection(section: HTMLElement, immediate = false): Promise<void> {
  const state = sections.get(section)
  if (!state) {
    if (immediate) section.querySelectorAll<HTMLElement>('[data-reveal]').forEach(finishReveal)
    return Promise.resolve()
  }
  if (immediate || motion?.matches || disabled) {
    finishSection(section)
    return Promise.resolve()
  }
  if (viewed.has(section.id)) return state.settled ?? Promise.resolve()
  if ((navigationTarget && navigationTarget !== section) || !visible(section)) return Promise.resolve()

  viewed.add(section.id)
  observer?.unobserve(section)
  section.dataset.sectionReveal = 'revealing'
  const elements = Array.from(section.querySelectorAll<HTMLElement>('[data-reveal]'))
    .filter(element => !element.parentElement?.closest('[data-reveal]'))
  const animations: Animation[] = []
  let timer: ReturnType<typeof setTimeout> | undefined
  let resolve!: () => void
  state.settled = new Promise<void>(done => { resolve = done })
  state.finish = () => {
    clearTimeout(timer)
    animations.forEach(animation => animation.cancel())
    section.dataset.sectionReveal = 'revealed'
    state.finish = undefined
    resolve()
  }

  try {
    // Read final styles before starting effects so each element retains its design opacity.
    const items = elements.map(element => ({ element, opacity: getComputedStyle(element).opacity }))
    items.forEach(({ element, opacity }) => {
      if (options.get(element)?.whenVisible && !visible(element)) {
        observer!.observe(element)
        waitingItems.set(element, section)
        element.dataset.revealWaiting = ''
      } else animations.push(animateItem(element, opacity))
    })
    void Promise.allSettled(animations.map(animation => animation.finished)).then(() => state.finish?.())
    // A failed/interrupted animation must never keep content hidden.
    timer = setTimeout(() => state.finish?.(), fallbackDuration(animations))
  } catch {
    finishSection(section)
  }
  return state.settled
}

function scan() {
  scanFrame = 0
  for (const section of sections.keys()) void revealSection(section)
  revealVisibleItems()
}

function scheduleScan() {
  cancelAnimationFrame(scanFrame)
  scanFrame = requestAnimationFrame(scan)
}

export function setRevealNavigationTarget(section: HTMLElement | null) {
  navigationTarget = section
  // A replacement navigation sets its destination before this cancellation scan runs.
  scheduleScan()
}

function onMotionChange() {
  if (motion?.matches) for (const section of sections.keys()) finishSection(section)
}

function onFocus(event: FocusEvent) {
  if (!(event.target instanceof HTMLElement)) return
  const section = event.target.closest<HTMLElement>('[data-section-reveal]')
  if (section) finishSection(section)
}

function initialize() {
  motion = matchMedia('(prefers-reduced-motion: reduce)')
  motion.addEventListener('change', onMotionChange)
  window.addEventListener('pageshow', scheduleScan)
  window.addEventListener('resize', scheduleScan)
  window.addEventListener('blueprint-layout', scheduleScan)
  document.addEventListener('focusin', onFocus)
  try {
    // One observer for all sections. Fine thresholds also cover very tall mobile layouts.
    observer = new IntersectionObserver(entries => {
      try {
        for (const entry of entries) {
          if (entry.isIntersecting && sections.has(entry.target as HTMLElement)) void revealSection(entry.target as HTMLElement)
        }
        revealVisibleItems()
      } catch { disableReveals() }
    }, { rootMargin: '-80px 0px 0px', threshold: Array.from({ length: 101 }, (_, index) => index / 100) })
  } catch { disableReveals() }
}

export const sectionReveal: Directive<HTMLElement> = {
  beforeMount(section) { section.dataset.sectionReveal = '' },
  mounted(section) {
    sections.set(section, {})
    if (sections.size === 1) initialize()
    if (disabled || motion?.matches || viewed.has(section.id) || typeof section.animate !== 'function') {
      finishSection(section)
      return
    }
    try {
      observer!.observe(section)
      // Content is visible by default; hide only after observation is successfully installed.
      section.dataset.sectionReveal = 'pending'
      scheduleScan()
    } catch { disableReveals() }
  },
  unmounted(section) {
    finishSection(section)
    sections.delete(section)
    if (sections.size) return
    observer?.disconnect()
    observer = undefined
    motion?.removeEventListener('change', onMotionChange)
    window.removeEventListener('pageshow', scheduleScan)
    window.removeEventListener('resize', scheduleScan)
    window.removeEventListener('blueprint-layout', scheduleScan)
    document.removeEventListener('focusin', onFocus)
    cancelAnimationFrame(scanFrame)
    navigationTarget = null
  },
}

export const reveal: Directive<HTMLElement, RevealOptions | undefined> = {
  beforeMount(element, binding) {
    element.dataset.reveal = binding.value?.kind ?? ''
    options.set(element, binding.value ?? {})
  },
  mounted(element, binding) {
    // Section items belong to the shared observer, including asynchronously mounted cards.
    if (element.closest('[data-section-reveal]')) return
    // Preserve the dedicated initial hero timing; returning to the hero never replays it.
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || typeof element.animate !== 'function') return
    let animation: Animation | undefined
    let timer: ReturnType<typeof setTimeout> | undefined
    const preference = matchMedia('(prefers-reduced-motion: reduce)')
    const finish = () => {
      clearTimeout(timer)
      animation?.cancel()
      preference.removeEventListener('change', finish)
      pending.delete(element)
    }
    try {
      const isMobile = matchMedia('(max-width: 767px)').matches
      const kind = binding.value?.kind
      const isHeading = kind === 'heading'
      const isAccent = kind === 'accent'

      const distance = isMobile ? (isAccent ? 8 : 10) : (isAccent ? 12 : (isHeading ? 18 : 16))
      const from: Keyframe = { opacity: 0, translate: `0 ${distance}px` }
      const to: Keyframe = { opacity: getComputedStyle(element).opacity || '1', translate: '0 0' }
      if (isHeading && !isMobile) {
        from.scale = '0.985'
        to.scale = '1'
      }

      const duration = isMobile
        ? (isHeading ? 460 : (isAccent ? 380 : 420))
        : (isHeading ? 520 : (isAccent ? 440 : 480))

      const baseDelay = binding.value?.delay ?? 0
      const delay = isMobile ? Math.round(baseDelay * 0.7) : baseDelay

      animation = element.animate([from, to], {
        duration,
        delay,
        easing: EASING,
        fill: 'both',
      })
      pending.set(element, finish)
      preference.addEventListener('change', finish)
      void animation.finished.then(finish, finish)
      timer = setTimeout(finish, duration + delay + 200)
    } catch { finish() }
  },
  updated(element, binding) { options.set(element, binding.value ?? {}) },
  unmounted(element) { finishReveal(element); finishItem(element) },
}
