<template>
  <div
    class="showcase-3d-loader absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none select-none overflow-hidden"
    aria-live="polite"
    aria-busy="true"
  >
    <!-- Background Vignette / Soft Glow -->
    <div class="absolute inset-0 bg-gradient-radial from-blue-950/20 via-transparent to-transparent opacity-80 pointer-events-none" />

    <!-- 3D Three.js Canvas Container -->
    <div class="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
      <canvas
        ref="canvasRef"
        class="w-full h-full block outline-none"
        aria-hidden="true"
      />

      <!-- Corner Technical Reticles -->
      <div class="absolute top-2 left-2 text-[10px] font-mono text-cyan-400/30 select-none">┌</div>
      <div class="absolute top-2 right-2 text-[10px] font-mono text-cyan-400/30 select-none">┐</div>
      <div class="absolute bottom-2 left-2 text-[10px] font-mono text-cyan-400/30 select-none">└</div>
      <div class="absolute bottom-2 right-2 text-[10px] font-mono text-cyan-400/30 select-none">┘</div>
    </div>

    <!-- Editorial Technical Telemetry & Status HUD -->
    <div class="flex flex-col items-center gap-2 mt-2 px-6 text-center max-w-sm">
      <!-- High-tech Pill -->
      <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border border-cyan-500/20 bg-cyan-950/30 backdrop-blur-md">
        <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8] animate-pulse" />
        <span class="font-mono text-[9px] uppercase tracking-[0.2em] text-cyan-300/90 font-semibold">
          {{ badgeText || 'SYNCING REMOTE STREAM' }}
        </span>
      </div>

      <!-- Main Title -->
      <p class="font-mono text-xs sm:text-[13px] uppercase tracking-[0.22em] text-zinc-100 font-medium">
        {{ title || 'INITIALIZING KNOWLEDGE FIELD' }}
      </p>

      <!-- Subtitle -->
      <p class="font-mono text-[10px] tracking-wider text-zinc-400">
        {{ subtitle || 'FETCHING ARCHIVED DISPATCHES & NODES' }}
      </p>

      <!-- Minimal Scanning Line Progress -->
      <div class="w-44 h-[2px] bg-white/10 rounded-full overflow-hidden mt-2 relative">
        <div class="h-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full scanning-bar" />
      </div>

      <!-- Technical Hex / Stream Status -->
      <div class="flex items-center gap-3 font-mono text-[9px] text-zinc-400 mt-1">
        <span>TLS 1.3 // 200 OK</span>
        <span class="text-zinc-500">·</span>
        <span>LATENCY &lt; 24ms</span>
        <span class="text-zinc-500">·</span>
        <span>GRAPH: ACTIVE</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'

interface Props {
  title?: string
  subtitle?: string
  badgeText?: string
}

withDefaults(defineProps<Props>(), {
  title: 'INITIALIZING KNOWLEDGE FIELD',
  subtitle: 'FETCHING ARCHIVED DISPATCHES & NODES',
  badgeText: 'STREAMING DISPATCH API',
})

const canvasRef = ref<HTMLCanvasElement | null>(null)

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let animId: number | null = null
let resizeObserver: ResizeObserver | null = null

// 3D Objects refs for animation
let rootGroup: THREE.Group | null = null
let outerWireframe: THREE.LineSegments | null = null
let innerOcta: THREE.Mesh | null = null
let innerWireframe: THREE.LineSegments | null = null
let coreLightSphere: THREE.Mesh | null = null
let ringGroup1: THREE.Group | null = null
let ringGroup2: THREE.Group | null = null
let particlesMesh: THREE.Points | null = null
let gridPlane: THREE.LineSegments | null = null

function initThree() {
  const canvas = canvasRef.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  const width = rect.width || 280
  const height = rect.height || 280

  // Scene
  scene = new THREE.Scene()

  // Camera
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
  camera.position.set(0, 0, 7.2)

  // Renderer
  renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  })
  renderer.setSize(width, height, false)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setClearColor(0x000000, 0)

  // Root Group
  rootGroup = new THREE.Group()
  scene.add(rootGroup)

  // 1. Outer Polyhedron (Icosahedron Wireframe)
  const outerGeom = new THREE.IcosahedronGeometry(1.65, 0)
  const outerWireGeom = new THREE.WireframeGeometry(outerGeom)
  const outerMat = new THREE.LineBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.38,
    blending: THREE.AdditiveBlending,
  })
  outerWireframe = new THREE.LineSegments(outerWireGeom, outerMat)
  rootGroup.add(outerWireframe)

  // Outer vertices node points
  const outerPointsMat = new THREE.PointsMaterial({
    color: 0xbae6fd,
    size: 0.08,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
  })
  const outerPoints = new THREE.Points(outerGeom, outerPointsMat)
  outerWireframe.add(outerPoints)

  // 2. Inner Floating Octahedron (Semi-translucent crystalline core)
  const octaGeom = new THREE.OctahedronGeometry(0.95, 0)
  const octaMat = new THREE.MeshBasicMaterial({
    color: 0x0284c7,
    wireframe: false,
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  })
  innerOcta = new THREE.Mesh(octaGeom, octaMat)
  rootGroup.add(innerOcta)

  const octaWireGeom = new THREE.WireframeGeometry(octaGeom)
  const octaWireMat = new THREE.LineBasicMaterial({
    color: 0x7dd3fc,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
  })
  innerWireframe = new THREE.LineSegments(octaWireGeom, octaWireMat)
  innerOcta.add(innerWireframe)

  // 3. Central Energy Beacon (Pulsing Light Point)
  const coreSphereGeom = new THREE.SphereGeometry(0.18, 16, 16)
  const coreSphereMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.95,
  })
  coreLightSphere = new THREE.Mesh(coreSphereGeom, coreSphereMat)
  rootGroup.add(coreLightSphere)

  // Halo around core
  const haloGeom = new THREE.SphereGeometry(0.32, 16, 16)
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
  })
  const haloMesh = new THREE.Mesh(haloGeom, haloMat)
  coreLightSphere.add(haloMesh)

  // 4. Orbital Data Gimbal Rings
  // Ring 1 (Inclined ~60 deg)
  ringGroup1 = new THREE.Group()
  ringGroup1.rotation.x = Math.PI / 3
  ringGroup1.rotation.y = Math.PI / 6
  const ring1Geom = new THREE.TorusGeometry(2.15, 0.012, 8, 80)
  const ring1Mat = new THREE.MeshBasicMaterial({
    color: 0x60a5fa,
    transparent: true,
    opacity: 0.45,
    blending: THREE.AdditiveBlending,
  })
  const ring1Mesh = new THREE.Mesh(ring1Geom, ring1Mat)
  ringGroup1.add(ring1Mesh)

  // Ring 1 Orbiting packet node
  const packet1Geom = new THREE.SphereGeometry(0.06, 12, 12)
  const packet1Mat = new THREE.MeshBasicMaterial({ color: 0x93c5fd })
  const packet1 = new THREE.Mesh(packet1Geom, packet1Mat)
  packet1.position.set(2.15, 0, 0)
  ring1Mesh.add(packet1)
  rootGroup.add(ringGroup1)

  // Ring 2 (Counter-inclined)
  ringGroup2 = new THREE.Group()
  ringGroup2.rotation.x = -Math.PI / 4
  ringGroup2.rotation.z = Math.PI / 5
  const ring2Geom = new THREE.TorusGeometry(2.35, 0.01, 8, 80)
  const ring2Mat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
  })
  const ring2Mesh = new THREE.Mesh(ring2Geom, ring2Mat)
  ringGroup2.add(ring2Mesh)

  const packet2 = new THREE.Mesh(packet1Geom, packet1Mat)
  packet2.position.set(0, 2.35, 0)
  ring2Mesh.add(packet2)
  rootGroup.add(ringGroup2)

  // 5. Floating Data Spark Particles
  const particleCount = 42
  const particlePositions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    const radius = 1.2 + Math.random() * 1.6
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
    particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
    particlePositions[i * 3 + 2] = radius * Math.cos(phi)
  }
  const particleGeom = new THREE.BufferGeometry()
  particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
  const particleMat = new THREE.PointsMaterial({
    color: 0x7dd3fc,
    size: 0.045,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending,
  })
  particlesMesh = new THREE.Points(particleGeom, particleMat)
  rootGroup.add(particlesMesh)

  // 6. Subtle Ground Scanning Elevation Grid (Lower plane)
  const gridHelper = new THREE.GridHelper(3.8, 12, 0x0284c7, 0x0369a1)
  gridHelper.position.y = -2.1
  const gridMat = gridHelper.material as THREE.Material
  gridMat.transparent = true
  gridMat.opacity = 0.18
  gridMat.blending = THREE.AdditiveBlending
  rootGroup.add(gridHelper)

  // Animation Loop
  let clock = new THREE.Clock()
  function animate() {
    animId = requestAnimationFrame(animate)
    const elapsed = clock.getElapsedTime()

    if (rootGroup) {
      // Gentle floating sine wave
      rootGroup.position.y = Math.sin(elapsed * 1.4) * 0.08
    }

    if (outerWireframe) {
      // Complex tumble
      outerWireframe.rotation.y = elapsed * 0.28
      outerWireframe.rotation.x = Math.sin(elapsed * 0.4) * 0.35
      outerWireframe.rotation.z = Math.cos(elapsed * 0.3) * 0.2
    }

    if (innerOcta) {
      // Counter-rotation for parallax depth
      innerOcta.rotation.y = -elapsed * 0.45
      innerOcta.rotation.x = Math.cos(elapsed * 0.5) * 0.4
    }

    if (coreLightSphere) {
      // Core pulse
      const pulse = 1 + Math.sin(elapsed * 4.2) * 0.18
      coreLightSphere.scale.set(pulse, pulse, pulse)
    }

    if (ringGroup1) {
      ringGroup1.rotation.z = elapsed * 0.65
    }

    if (ringGroup2) {
      ringGroup2.rotation.y = -elapsed * 0.55
      ringGroup2.rotation.x = -Math.PI / 4 + Math.sin(elapsed * 0.8) * 0.1
    }

    if (particlesMesh) {
      particlesMesh.rotation.y = elapsed * 0.12
      particlesMesh.rotation.x = elapsed * 0.06
    }

    if (renderer && scene && camera) {
      renderer.render(scene, camera)
    }
  }

  animate()

  // Resize Handling
  if (window.ResizeObserver && canvas.parentElement) {
    resizeObserver = new ResizeObserver(() => {
      if (!canvas || !renderer || !camera) return
      const rect = canvas.getBoundingClientRect()
      const w = rect.width || 280
      const h = rect.height || 280
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h, false)
    })
    resizeObserver.observe(canvas.parentElement)
  }
}

function cleanup() {
  if (animId !== null) {
    cancelAnimationFrame(animId)
    animId = null
  }
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }

  // Dispose scene geometries & materials
  if (scene) {
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments || obj instanceof THREE.Points) {
        obj.geometry?.dispose()
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose())
        } else {
          obj.material?.dispose()
        }
      }
    })
  }

  if (renderer) {
    renderer.dispose()
    renderer = null
  }
  scene = null
  camera = null
}

onMounted(() => {
  initThree()
})

onBeforeUnmount(() => {
  cleanup()
})
</script>

<style scoped>
.scanning-bar {
  animation: scan-move 1.5s ease-in-out infinite;
  width: 50%;
}

@keyframes scan-move {
  0% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(250%);
  }
}
</style>

