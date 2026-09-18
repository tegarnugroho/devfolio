import type { Directive } from 'vue'

const pending = new WeakMap<HTMLElement, () => void>()
export function finishReveal(element: HTMLElement) { pending.get(element)?.() }

export const reveal: Directive<HTMLElement, { delay?: number } | undefined> = {
  mounted(el, binding) {
    el.dataset.reveal = ''
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const transition = el.style.transition
    let timer: ReturnType<typeof setTimeout> | undefined
    const finish = () => {
      clearTimeout(timer)
      io.disconnect()
      Object.assign(el.style, { transition, opacity: '1', transform: 'translateY(0)' })
      pending.delete(el)
    }
    const io = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return
      // Navigation owns destination reveals; do not start another transform during travel.
      if (document.documentElement.dataset.sectionNavigating) { finish(); return }
      io.disconnect()
      timer = setTimeout(() => {
        if (document.documentElement.dataset.sectionNavigating) { finish(); return }
        el.style.opacity = '1'
        el.style.transform = 'translateY(0)'
        timer = setTimeout(finish, 350)
      }, binding.value?.delay ?? 0)
    }, { threshold: .12 })
    pending.set(el, finish)
    el.style.transition = 'opacity 350ms ease, transform 350ms ease'
    el.style.opacity = '0'
    el.style.transform = 'translateY(8px)'
    io.observe(el)
  },
  unmounted(el) { finishReveal(el) },
}
