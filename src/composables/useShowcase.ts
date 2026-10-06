import { ref, computed } from 'vue'
import { globeMarkers } from '@/components/globe/globeData'

export const isShowcaseOpen = ref(false)
export const activeMarkerIndex = ref(0)

export const activeMarker = computed(() => {
  const list = globeMarkers.value
  return list[activeMarkerIndex.value] || list[0]
})

let previousScrollY = 0
let previousOverflow = ''

export function openShowcase(initialProjectId?: string) {
  if (initialProjectId) {
    const idx = globeMarkers.value.findIndex(m => m.id === initialProjectId)
    if (idx !== -1) activeMarkerIndex.value = idx
  }

  // 1. Record current scroll position
  previousScrollY = window.scrollY

  // 2. Lock body scroll
  previousOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'

  // 3. Activate showcase mode
  isShowcaseOpen.value = true
}

export function closeShowcase() {
  if (!isShowcaseOpen.value) return

  // 1. Deactivate showcase mode
  isShowcaseOpen.value = false

  // 2. Restore body scroll
  document.body.style.overflow = previousOverflow

  // 3. Restore previous scroll position immediately
  window.scrollTo({
    top: previousScrollY,
    behavior: 'instant',
  })
}

export function nextProject() {
  const count = globeMarkers.value.length
  if (count > 0) {
    activeMarkerIndex.value = (activeMarkerIndex.value + 1) % count
  }
}

export function prevProject() {
  const count = globeMarkers.value.length
  if (count > 0) {
    activeMarkerIndex.value = (activeMarkerIndex.value - 1 + count) % count
  }
}

export function setActiveProjectId(id: string) {
  const idx = globeMarkers.value.findIndex(m => m.id === id)
  if (idx !== -1) {
    activeMarkerIndex.value = idx
  }
}
