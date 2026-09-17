import type { Directive } from 'vue'

export const reveal: Directive<HTMLElement, { delay?: number } | undefined> = {
  mounted(el, binding) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const delay = binding.value?.delay ?? 0
    el.style.transition = `opacity 350ms ease, transform 350ms ease`
    el.style.opacity = '0'
    el.style.transform = 'translateY(8px)'

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              el.style.opacity = '1'
              el.style.transform = 'translateY(0)'
            }, delay)
            io.unobserve(el)
          }
        })
      },
      { threshold: 0.12 }
    )
    io.observe(el)
  },
}

