import { onMounted, onUnmounted, ref } from 'vue'

export function useScrollProgress() {
  const progress = ref(0)

  const calc = () => {
    const doc = document.documentElement
    const body = document.body
    const scrollTop = doc.scrollTop || body.scrollTop
    const scrollHeight = Math.max(
      body.scrollHeight,
      doc.scrollHeight,
      body.offsetHeight,
      doc.offsetHeight,
      body.clientHeight,
      doc.clientHeight
    )
    const view = window.innerHeight
    const total = Math.max(1, scrollHeight - view)
    progress.value = Math.min(100, Math.max(0, (scrollTop / total) * 100))
  }

  onMounted(() => {
    calc()
    window.addEventListener('scroll', calc, { passive: true })
    window.addEventListener('resize', calc)
  })
  onUnmounted(() => {
    window.removeEventListener('scroll', calc)
    window.removeEventListener('resize', calc)
  })

  return progress
}

