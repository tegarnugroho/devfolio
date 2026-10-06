import { ref, onBeforeUnmount, type Ref } from 'vue'
import * as THREE from 'three'

export interface ThreeSceneOptions {
  canvas: HTMLCanvasElement
  container: HTMLElement
  cameraFov?: number
  cameraNear?: number
  cameraFar?: number
  cameraDistance?: number
  onAnimate?: (currentTime: number, delta: number, reducedMotion: boolean) => void
  onResize?: (width: number, height: number) => void
}

export function useThreeScene() {
  let scene: THREE.Scene | null = null
  let camera: THREE.PerspectiveCamera | null = null
  let renderer: THREE.WebGLRenderer | null = null
  let animFrameId = 0
  let resizeObserver: ResizeObserver | null = null
  let lastTime = 0
  let isPaused = false

  const isSupported = ref(true)
  const isMobile = ref(false)
  const isReducedMotion = ref(false)

  function checkWebGL(): boolean {
    try {
      const c = document.createElement('canvas')
      return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')))
    } catch {
      return false
    }
  }

  function init(options: ThreeSceneOptions) {
    if (!checkWebGL()) {
      isSupported.value = false
      return { scene: null, camera: null, renderer: null }
    }

    const {
      canvas,
      container,
      cameraFov = 45,
      cameraNear = 0.1,
      cameraFar = 100,
      cameraDistance = 5,
      onAnimate,
      onResize,
    } = options

    const width = container.clientWidth || window.innerWidth
    const height = container.clientHeight || window.innerHeight

    isMobile.value = width < 768
    isReducedMotion.value = typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false

    // 1. Scene & Camera
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(cameraFov, width / height, cameraNear, cameraFar)
    camera.position.set(0, 0, cameraDistance)

    // 2. WebGL Renderer with capped DPR for performance
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !isMobile.value,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(dpr)

    // 3. Resize handling via ResizeObserver
    function handleResize() {
      if (!container || !camera || !renderer) return
      const w = container.clientWidth || window.innerWidth
      const h = container.clientHeight || window.innerHeight
      if (w === 0 || h === 0) return

      isMobile.value = w < 768
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
      onResize?.(w, h)
    }

    resizeObserver = new ResizeObserver(() => {
      handleResize()
    })
    resizeObserver.observe(container)

    // 4. Animation loop
    lastTime = performance.now()
    function loop(now: number) {
      animFrameId = requestAnimationFrame(loop)
      if (isPaused) return

      const delta = Math.min((now - lastTime) / 1000, 0.1)
      lastTime = now

      onAnimate?.(now, delta, isReducedMotion.value)

      if (renderer && scene && camera) {
        renderer.render(scene, camera)
      }
    }
    animFrameId = requestAnimationFrame(loop)

    return { scene, camera, renderer }
  }

  function pause() {
    isPaused = true
  }

  function resume() {
    isPaused = false
    lastTime = performance.now()
  }

  function dispose() {
    if (animFrameId) {
      cancelAnimationFrame(animFrameId)
      animFrameId = 0
    }

    if (resizeObserver) {
      resizeObserver.disconnect()
      resizeObserver = null
    }

    if (scene) {
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Points || obj instanceof THREE.LineSegments) {
          if (obj.geometry) {
            obj.geometry.dispose()
          }
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              for (const m of obj.material) disposeMaterial(m)
            } else {
              disposeMaterial(obj.material)
            }
          }
        }
      })
      scene.clear()
      scene = null
    }

    if (renderer) {
      renderer.dispose()
      renderer.forceContextLoss()
      renderer = null
    }

    camera = null
  }

  function disposeMaterial(mat: THREE.Material) {
    // Dispose any textures
    const anyMat = mat as unknown as Record<string, unknown>
    for (const key of Object.keys(anyMat)) {
      const val = anyMat[key]
      if (val && typeof val === 'object' && val instanceof THREE.Texture) {
        val.dispose()
      }
    }
    mat.dispose()
  }

  onBeforeUnmount(() => {
    dispose()
  })

  return {
    isSupported,
    isMobile,
    isReducedMotion,
    init,
    pause,
    resume,
    dispose,
  }
}

