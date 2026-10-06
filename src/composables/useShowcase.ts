import { ref, computed } from 'vue'
import { globeMarkers, globeClusters, type GlobeMarker, type GlobeCluster } from '@/components/globe/globeData'

export const isShowcaseOpen = ref(false)
export const activeMarkerIndex = ref(0)
export const isSatelliteZoomed = ref(false)
export const activeClusterId = ref<string | null>(null)

export const activeMarker = computed<GlobeMarker>(() => {
  const list = globeMarkers.value
  return list[activeMarkerIndex.value] || list[0]
})

export const activeCluster = computed<GlobeCluster | null>(() => {
  if (!activeClusterId.value) return null
  return globeClusters.value.find(c => c.id === activeClusterId.value) || null
})

export const clusterProjects = computed<GlobeMarker[]>(() => {
  if (!activeClusterId.value) return []
  return globeMarkers.value.filter(m => m.clusterId === activeClusterId.value)
})

let previousScrollY = 0
let previousOverflow = ''

export function openShowcase(initialProjectId?: string) {
  if (initialProjectId) {
    const idx = globeMarkers.value.findIndex(m => m.id === initialProjectId)
    if (idx !== -1) {
      activeMarkerIndex.value = idx
      activeClusterId.value = globeMarkers.value[idx].clusterId
    }
  } else {
    activeClusterId.value = globeMarkers.value[0]?.clusterId || null
  }

  isSatelliteZoomed.value = false

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
  isSatelliteZoomed.value = false
  activeClusterId.value = null

  // 2. Restore body scroll
  document.body.style.overflow = previousOverflow

  // 3. Restore previous scroll position immediately
  window.scrollTo({
    top: previousScrollY,
    behavior: 'instant',
  })
}

export function zoomInToCluster(clusterId: string, projectId?: string) {
  activeClusterId.value = clusterId
  isSatelliteZoomed.value = true

  if (projectId) {
    const idx = globeMarkers.value.findIndex(m => m.id === projectId)
    if (idx !== -1) activeMarkerIndex.value = idx
  } else {
    // Select first project in this cluster
    const idx = globeMarkers.value.findIndex(m => m.clusterId === clusterId)
    if (idx !== -1) activeMarkerIndex.value = idx
  }
}

export function zoomOutToGlobal() {
  isSatelliteZoomed.value = false
}

export function toggleSatelliteZoom(clusterId?: string) {
  if (isSatelliteZoomed.value) {
    zoomOutToGlobal()
  } else if (clusterId) {
    zoomInToCluster(clusterId)
  } else if (activeMarker.value) {
    zoomInToCluster(activeMarker.value.clusterId, activeMarker.value.id)
  }
}

export function nextProject() {
  const count = globeMarkers.value.length
  if (count > 0) {
    activeMarkerIndex.value = (activeMarkerIndex.value + 1) % count
    const cur = globeMarkers.value[activeMarkerIndex.value]
    if (cur) activeClusterId.value = cur.clusterId
  }
}

export function prevProject() {
  const count = globeMarkers.value.length
  if (count > 0) {
    activeMarkerIndex.value = (activeMarkerIndex.value - 1 + count) % count
    const cur = globeMarkers.value[activeMarkerIndex.value]
    if (cur) activeClusterId.value = cur.clusterId
  }
}

export function setActiveProjectId(id: string) {
  const idx = globeMarkers.value.findIndex(m => m.id === id)
  if (idx !== -1) {
    activeMarkerIndex.value = idx
    activeClusterId.value = globeMarkers.value[idx].clusterId
  }
}
