import { ref, computed } from 'vue'
import type { ShowcaseSection } from '@/types/showcase'

export interface SectionLoadingIdentity {
  id: ShowcaseSection
  code: string
  title: string
  subtitle: string
  status: string
  accentColor: string
}

export const SECTION_LOADING_IDENTITIES: Record<ShowcaseSection, SectionLoadingIdentity> = {
  hero: {
    id: 'hero',
    code: 'CORE // 01',
    title: 'INITIALIZING DIGITAL CORE',
    subtitle: 'Preparing orbital space scene and personal introduction...',
    status: 'SPACE OBSERVATORY · ENVIRONMENT READYING',
    accentColor: '#38bdf8',
  },
  about: {
    id: 'about',
    code: 'PROFILE // 02',
    title: 'LOADING ENGINEER PROFILE',
    subtitle: 'Preparing journey timeline and career trajectory...',
    status: 'CHRONOLOGY ENGINE · DATA STREAM ACTIVE',
    accentColor: '#60a5fa',
  },
  skills: {
    id: 'skills',
    code: 'STELLAR // 03',
    title: 'MAPPING TECHNOLOGY CONSTELLATIONS',
    subtitle: 'Preparing technology nodes and stellar connections...',
    status: 'CONSTELLATION MAPPER · NODES ALIGNING',
    accentColor: '#22d3ee',
  },
  projects: {
    id: 'projects',
    code: 'ORBITS // 04',
    title: 'ESTABLISHING PROJECT ORBITS',
    subtitle: 'Preparing project telemetry, geospatial markers, and 3D globe...',
    status: 'GEOSPATIAL CORE · TELEMETRY STABILIZING',
    accentColor: '#38bdf8',
  },
  writing: {
    id: 'writing',
    code: 'ARCHIVE // 05',
    title: 'INDEXING KNOWLEDGE FIELD',
    subtitle: 'Preparing publication archive and editorial dispatches...',
    status: 'KNOWLEDGE GRAPH · DISPATCH INDEXING',
    accentColor: '#38bdf8',
  },
  contact: {
    id: 'contact',
    code: 'UPLINK // 06',
    title: 'OPENING COMMUNICATION CHANNELS',
    subtitle: 'Preparing deep space uplink and telemetry probes...',
    status: 'COMMUNICATION UPLINK · FREQUENCIES SYNCHRONIZING',
    accentColor: '#06b6d4',
  },
}

export type TransitionPhase =
  | 'idle'
  | 'preparing'
  | 'loading'
  | 'initializing'
  | 'ready'
  | 'error'

// Reactive state
export const transitionPhase = ref<TransitionPhase>('idle')
export const targetSection = ref<ShowcaseSection>('projects')
export const transitionErrorMessage = ref<string | null>(null)

// Set of sections that have completed initialization during this session
const initializedSections = new Set<ShowcaseSection>()

let transitionTimer: ReturnType<typeof setTimeout> | null = null
let safetyTimeoutTimer: ReturnType<typeof setTimeout> | null = null

export const isTransitioning = computed(() => transitionPhase.value !== 'idle')

export const currentLoadingIdentity = computed<SectionLoadingIdentity>(() => {
  return SECTION_LOADING_IDENTITIES[targetSection.value] || SECTION_LOADING_IDENTITIES.projects
})

export const currentPhaseMessage = computed(() => {
  switch (transitionPhase.value) {
    case 'preparing':
      return 'PREPARING SPATIAL ENVIRONMENT...'
    case 'loading':
      return 'LOADING REQUIRED 3D ASSETS...'
    case 'initializing':
      return 'INITIALIZING SCENE RENDER PIPELINE...'
    case 'ready':
      return 'ENVIRONMENT SYNCHRONIZED · READY'
    case 'error':
      return 'INITIALIZATION TIMEOUT'
    default:
      return 'SYSTEM READY'
  }
})

/**
 * Initiates a controlled transition to a new 3D showcase section.
 */
export function startSectionTransition(
  destination: ShowcaseSection,
  onApplySection: (sec: ShowcaseSection) => void,
  forceReload = false
) {
  // Clear any existing pending transition timers
  if (transitionTimer) {
    clearTimeout(transitionTimer)
    transitionTimer = null
  }
  if (safetyTimeoutTimer) {
    clearTimeout(safetyTimeoutTimer)
    safetyTimeoutTimer = null
  }

  targetSection.value = destination
  transitionErrorMessage.value = null

  const isAlreadyInitialized = initializedSections.has(destination) && !forceReload

  if (isAlreadyInitialized) {
    // Fast path for previously cached/initialized sections:
    // A brief, elegant micro-crossfade to prevent visual popping without delaying navigation.
    transitionPhase.value = 'preparing'
    onApplySection(destination)

    transitionTimer = setTimeout(() => {
      transitionPhase.value = 'ready'
      transitionTimer = setTimeout(() => {
        transitionPhase.value = 'idle'
        transitionTimer = null
      }, 180)
    }, 120)
    return
  }

  // Full initialization path for first-time section entry:
  transitionPhase.value = 'preparing'
  onApplySection(destination)

  // Step into loading & initializing
  transitionTimer = setTimeout(() => {
    if (transitionPhase.value === 'preparing') {
      transitionPhase.value = 'loading'
    }
  }, 100)

  // Safety timeout: Never leave the user stuck on endless loading
  safetyTimeoutTimer = setTimeout(() => {
    if (transitionPhase.value !== 'idle' && transitionPhase.value !== 'ready') {
      transitionPhase.value = 'error'
      transitionErrorMessage.value =
        'Scene initialization took longer than expected. WebGL resources may be strained.'
    }
  }, 8500)
}

/**
 * Called by each 3D scene component when its canvas, geometry, and initial frame are ready.
 */
export function markSectionReady(section: ShowcaseSection) {
  initializedSections.add(section)

  // Only complete if this is the currently targeted section
  if (targetSection.value === section || transitionPhase.value !== 'idle') {
    if (safetyTimeoutTimer) {
      clearTimeout(safetyTimeoutTimer)
      safetyTimeoutTimer = null
    }

    transitionPhase.value = 'ready'

    if (transitionTimer) {
      clearTimeout(transitionTimer)
    }

    // Smooth exit delay for the transition overlay
    transitionTimer = setTimeout(() => {
      transitionPhase.value = 'idle'
      transitionTimer = null
    }, 280)
  }
}

/**
 * Mark a section as failed/errored with an optional message.
 */
export function markSectionError(section: ShowcaseSection, message?: string) {
  if (targetSection.value === section) {
    if (safetyTimeoutTimer) {
      clearTimeout(safetyTimeoutTimer)
      safetyTimeoutTimer = null
    }
    transitionPhase.value = 'error'
    transitionErrorMessage.value = message || 'Failed to initialize 3D scene resources.'
  }
}

/**
 * Reset transition state when closing showcase.
 */
export function resetTransitionState() {
  if (transitionTimer) clearTimeout(transitionTimer)
  if (safetyTimeoutTimer) clearTimeout(safetyTimeoutTimer)
  transitionTimer = null
  safetyTimeoutTimer = null
  transitionPhase.value = 'idle'
  transitionErrorMessage.value = null
}

