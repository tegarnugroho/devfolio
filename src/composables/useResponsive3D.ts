import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

export type ResponsiveTier = 'desktop' | 'tablet' | 'mobile' | 'small-mobile'
export type ScreenOrientation = 'portrait' | 'landscape'

export interface ResponsiveSceneConfig<T = unknown> {
  desktop: T
  tablet?: T
  mobile: T
  smallMobile?: T
}

// Global reactive viewport state shared across 3D scenes
const viewportWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1200)
const viewportHeight = ref(typeof window !== 'undefined' ? window.innerHeight : 800)
const prefersReducedMotion = ref(
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false
)

let isListenerActive = false
let resizeTimeout: ReturnType<typeof setTimeout> | null = null

function updateViewport() {
  if (typeof window === 'undefined') return
  viewportWidth.value = window.innerWidth
  viewportHeight.value = window.innerHeight
}

function handleResize() {
  updateViewport()
}

export function checkWebGLSupport(): boolean {
  if (typeof document === 'undefined') return true
  try {
    const canvas = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch {
    return false
  }
}

export function useResponsive3D() {
  if (typeof window !== 'undefined' && !isListenerActive) {
    isListenerActive = true
    updateViewport()

    window.addEventListener('resize', handleResize, { passive: true })
    window.addEventListener('orientationchange', handleResize, { passive: true })

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    motionQuery.addEventListener?.('change', (e) => {
      prefersReducedMotion.value = e.matches
    })
  }

  const tier = computed<ResponsiveTier>(() => {
    const w = viewportWidth.value
    if (w < 390) return 'small-mobile'
    if (w < 768) return 'mobile'
    if (w < 1024) return 'tablet'
    return 'desktop'
  })

  const isSmallMobile = computed(() => tier.value === 'small-mobile')
  const isMobile = computed(() => tier.value === 'mobile' || tier.value === 'small-mobile')
  const isTablet = computed(() => tier.value === 'tablet')
  const isDesktop = computed(() => tier.value === 'desktop')

  const orientation = computed<ScreenOrientation>(() => {
    return viewportWidth.value >= viewportHeight.value ? 'landscape' : 'portrait'
  })

  // Capped device pixel ratios for battery, thermal & GPU protection
  const pixelRatio = computed<number>(() => {
    if (typeof window === 'undefined') return 1
    const dpr = window.devicePixelRatio || 1
    switch (tier.value) {
      case 'small-mobile':
        return Math.min(dpr, 1.25)
      case 'mobile':
        return Math.min(dpr, 1.5)
      case 'tablet':
        return Math.min(dpr, 1.75)
      case 'desktop':
      default:
        return Math.min(dpr, 2.0)
    }
  })

  /**
   * Helper to resolve tier-specific configurations with clean fallbacks
   */
  function getConfig<T>(options: ResponsiveSceneConfig<T>): T {
    const currentTier = tier.value
    if (currentTier === 'small-mobile' && options.smallMobile !== undefined) {
      return options.smallMobile
    }
    if ((currentTier === 'mobile' || currentTier === 'small-mobile') && options.mobile !== undefined) {
      return options.mobile
    }
    if (currentTier === 'tablet' && options.tablet !== undefined) {
      return options.tablet
    }
    return options.desktop
  }

  return {
    viewportWidth,
    viewportHeight,
    tier,
    isSmallMobile,
    isMobile,
    isTablet,
    isDesktop,
    orientation,
    pixelRatio,
    prefersReducedMotion,
    getConfig,
    checkWebGLSupport,
    createTouchTracker,
  }
}

export interface TouchTrackerOptions {
  onRotate: (deltaX: number, deltaY: number) => void
  onTap?: (clientX: number, clientY: number) => void
  onDoubleTap?: () => void
  threshold?: number
}

export function createTouchTracker(options: TouchTrackerOptions) {
  const threshold = options.threshold ?? 8
  let startX = 0
  let startY = 0
  let prevX = 0
  let prevY = 0
  let startTime = 0
  let lastTapTime = 0
  let intent: 'undecided' | 'rotate' | 'scroll' = 'undecided'
  let isPointerDown = false

  function onPointerDown(e: PointerEvent) {
    if (e.button !== 0) return
    isPointerDown = true
    startX = e.clientX
    startY = e.clientY
    prevX = e.clientX
    prevY = e.clientY
    startTime = performance.now()
    intent = 'undecided'
  }

  function onPointerMove(e: PointerEvent) {
    if (!isPointerDown) return
    const dx = e.clientX - prevX
    const dy = e.clientY - prevY
    const totalDistX = Math.abs(e.clientX - startX)
    const totalDistY = Math.abs(e.clientY - startY)

    if (intent === 'undecided') {
      if (Math.hypot(totalDistX, totalDistY) > threshold) {
        if (totalDistX > totalDistY * 1.1) {
          intent = 'rotate'
        } else {
          intent = 'scroll'
        }
      }
    }

    if (intent === 'rotate') {
      if (e.cancelable) e.preventDefault()
      options.onRotate(dx, dy)
    }

    prevX = e.clientX
    prevY = e.clientY
  }

  function onPointerUp(e: PointerEvent) {
    if (!isPointerDown) return
    isPointerDown = false

    const duration = performance.now() - startTime
    const dist = Math.hypot(e.clientX - startX, e.clientY - startY)

    if (dist < threshold && duration < 300) {
      const now = performance.now()
      if (now - lastTapTime < 320) {
        options.onDoubleTap?.()
        lastTapTime = 0
      } else {
        lastTapTime = now
        options.onTap?.(e.clientX, e.clientY)
      }
    }

    intent = 'undecided'
  }

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
  }
}
