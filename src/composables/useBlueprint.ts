import { onBeforeUnmount, ref } from 'vue'

export const blueprintEnabled = ref(false)

export function useBlueprintHold() {
  const progressVisible = ref(false)
  let progressTimer: ReturnType<typeof setTimeout> | undefined
  let holdTimer: ReturnType<typeof setTimeout> | undefined
  let suppressClick = false
  let origin: { x: number; y: number } | null = null
  function cancelHold() {
    clearTimeout(progressTimer)
    clearTimeout(holdTimer)
    progressVisible.value = false
    origin = null
  }
  function startHold(event: PointerEvent) {
    if (!event.isPrimary || event.button !== 0) return
    cancelHold()
    suppressClick = false
    origin = { x: event.clientX, y: event.clientY }
    progressTimer = setTimeout(() => { progressVisible.value = true }, 800)
    holdTimer = setTimeout(() => {
      suppressClick = true
      blueprintEnabled.value = true
      cancelHold()
    }, 1200)
  }
  function moveHold(event: PointerEvent) {
    if (origin && Math.hypot(event.clientX - origin.x, event.clientY - origin.y) > 12) {
      suppressClick = true
      cancelHold()
    }
  }
  function allowThemeClick() {
    if (!suppressClick) return true
    suppressClick = false
    return false
  }
  onBeforeUnmount(cancelHold)
  return { progressVisible, startHold, moveHold, cancelHold, allowThemeClick }
}
