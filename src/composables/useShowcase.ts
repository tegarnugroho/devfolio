import { ref, computed } from 'vue'
import type { ShowcaseSection, ShowcaseTransitionState } from '@/types/showcase'
import { SHOWCASE_SECTIONS, sectionIds, isValidShowcaseSection, activePageShowcaseSection } from './useShowcaseNavigation'
import { globeMarkers, globeClusters, type GlobeMarker, type GlobeCluster } from '@/components/globe/globeData'

// ==========================================
// UNIFIED SHOWCASE STATE
// ==========================================
export const isShowcaseOpen = ref(false)
export const currentSection = ref<ShowcaseSection>('projects')
export const previousScrollY = ref(0)
export const transitionState = ref<ShowcaseTransitionState>('idle')
export const isSceneLoading = ref(false)
export const isSceneError = ref(false)

// Backwards-compatible project globe state
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

let previousOverflow = ''
let triggerOriginElement: HTMLElement | null = null

// ==========================================
// UNIFIED SHOWCASE API
// ==========================================

export function openShowcase(sectionOrProjectId?: ShowcaseSection | string) {
  // Save active element to return focus upon closing
  if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
    triggerOriginElement = document.activeElement
  }

  // 1. Determine target section
  if (sectionOrProjectId && isValidShowcaseSection(sectionOrProjectId)) {
    currentSection.value = sectionOrProjectId
  } else if (typeof sectionOrProjectId === 'string') {
    // If a project id was passed, target 'projects' section and activate that project
    currentSection.value = 'projects'
    const idx = globeMarkers.value.findIndex(m => m.id === sectionOrProjectId)
    if (idx !== -1) {
      activeMarkerIndex.value = idx
      activeClusterId.value = globeMarkers.value[idx].clusterId
    }
  } else {
    // Default to the current active section on page
    currentSection.value = activePageShowcaseSection.value || 'projects'
  }

  // 2. Reset transient states
  isSatelliteZoomed.value = false
  isSceneError.value = false
  transitionState.value = 'entering'

  // 3. Save scroll position and lock body scroll
  if (typeof window !== 'undefined') {
    previousScrollY.value = window.scrollY
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }

  // 4. Activate showcase
  isShowcaseOpen.value = true

  // Transition to active
  setTimeout(() => {
    transitionState.value = 'active'
  }, 600)
}

export function closeShowcase() {
  if (!isShowcaseOpen.value) return

  transitionState.value = 'exiting'

  setTimeout(() => {
    isShowcaseOpen.value = false
    isSatelliteZoomed.value = false
    activeClusterId.value = null
    transitionState.value = 'idle'

    // Restore body scroll
    if (typeof document !== 'undefined') {
      document.body.style.overflow = previousOverflow
    }

    // Restore scroll position
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: previousScrollY.value,
        behavior: 'instant',
      })
    }

    // Restore focus to original trigger element
    if (triggerOriginElement && typeof triggerOriginElement.focus === 'function') {
      triggerOriginElement.focus()
      triggerOriginElement = null
    }
  }, 400)
}

export function toggleShowcase(section?: ShowcaseSection) {
  if (isShowcaseOpen.value) {
    closeShowcase()
  } else {
    openShowcase(section)
  }
}

export function setSection(section: ShowcaseSection) {
  if (currentSection.value === section) return
  currentSection.value = section
  isSatelliteZoomed.value = false
}

export function nextSection() {
  const currentIdx = sectionIds.indexOf(currentSection.value)
  const nextIdx = (currentIdx + 1) % sectionIds.length
  setSection(sectionIds[nextIdx])
}

export function prevSection() {
  const currentIdx = sectionIds.indexOf(currentSection.value)
  const prevIdx = (currentIdx - 1 + sectionIds.length) % sectionIds.length
  setSection(sectionIds[prevIdx])
}

// ==========================================
// PROJECTS GLOBE HELPERS
// ==========================================

export function zoomInToCluster(clusterId: string, projectId?: string) {
  activeClusterId.value = clusterId
  isSatelliteZoomed.value = true

  if (projectId) {
    const idx = globeMarkers.value.findIndex(m => m.id === projectId)
    if (idx !== -1) activeMarkerIndex.value = idx
  } else {
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

// ==========================================
// SCENE CONTENT NAVIGATION (LEFT / RIGHT)
// ==========================================
type ContentNavHandler = (direction: 'prev' | 'next') => void
let currentContentNavigator: ContentNavHandler | null = null

export function registerContentNavigator(fn: ContentNavHandler) {
  currentContentNavigator = fn
  return () => {
    if (currentContentNavigator === fn) {
      currentContentNavigator = null
    }
  }
}

export function navigateContent(direction: 'prev' | 'next') {
  if (currentContentNavigator) {
    currentContentNavigator(direction)
  }
}

/**
 * useShowcase() composable hook
 */
export function useShowcase() {
  return {
    isOpen: isShowcaseOpen,
    currentSection,
    previousScrollY,
    transitionState,
    isLoading: isSceneLoading,
    isError: isSceneError,
    openShowcase,
    closeShowcase,
    toggleShowcase,
    setSection,
    nextSection,
    prevSection,
    navigateContent,
    registerContentNavigator,
    // Project specifics
    activeMarker,
    activeCluster,
    clusterProjects,
    isSatelliteZoomed,
    activeClusterId,
    activeMarkerIndex,
    zoomInToCluster,
    zoomOutToGlobal,
    toggleSatelliteZoom,
    nextProject,
    prevProject,
    setActiveProjectId,
  }
}
