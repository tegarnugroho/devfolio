<template>
  <div ref="container" class="hero-space-scene relative w-full h-full select-none overflow-hidden bg-[#010206]">
    <!-- WebGL Canvas -->
    <canvas
      ref="canvas"
      class="w-full h-full block cursor-grab active:cursor-grabbing outline-none"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    ></canvas>

    <!-- Technical Readout HUD Overlay (Editorial & Restrained) -->
    <div class="pointer-events-none absolute inset-0 p-6 sm:p-8 flex flex-col justify-between">
      <!-- Top Left Observatory Coordinate Header -->
      <div class="space-y-1 font-mono text-[10px] tracking-wider text-zinc-400">
        <p class="text-white font-semibold flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
          ORBITAL OBSERVATORY // SECTOR 01
        </p>
        <p class="text-zinc-500 uppercase">
          ORIGIN: JAKARTA, INDONESIA · 6.2088° S, 106.8456° E
        </p>
      </div>

      <!-- Bottom Center Editorial Motto -->
      <div class="text-center space-y-1.5 self-center max-w-md pb-4 sm:pb-6">
        <p class="font-mono text-[9px] uppercase tracking-[0.3em] text-blue-400 font-bold">
          DIGITAL ARCHITECTURE & CROSS-PLATFORM SYSTEMS
        </p>
        <h2 class="text-xl sm:text-2xl font-bold tracking-tight text-white">
          {{ hero.motto.join(' ') }}
        </h2>
        <p class="text-xs text-zinc-400 font-sans leading-relaxed">
          {{ hero.description }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { portfolioContent } from '@/content/portfolioContent'

const hero = portfolioContent.hero

const container = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let animFrameId = 0
let observatoryGroup: THREE.Group | null = null
let satelliteProbes: { mesh: THREE.Mesh; orbitRadius: number; speed: number; angle: number; tilt: number }[] = []

// Interaction Drag state
let isDragging = false
let prevMouseX = 0
let prevMouseY = 0
let rotVelocityX = 0
let rotVelocityY = 0.002

function initScene() {
  if (!container.value || !canvas.value) return

  const width = container.value.clientWidth || window.innerWidth
  const height = container.value.clientHeight || window.innerHeight
  const isMobile = width < 768

  // 1. Scene & Camera
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100)
  camera.position.set(0, 0, isMobile ? 6.2 : 5.0)

  // 2. Renderer
  renderer = new THREE.WebGLRenderer({
    canvas: canvas.value,
    antialias: !isMobile,
    alpha: true,
    powerPreference: 'high-performance',
  })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))

  // 3. Ambient & Directional Light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)
  const dirLight = new THREE.DirectionalLight(0x60a5fa, 2.0)
  dirLight.position.set(5, 5, 4)
  scene.add(dirLight)

  // 4. Distant Starfield
  const starCount = isMobile ? 800 : 2000
  const starPositions = new Float32Array(starCount * 3)
  const starColors = new Float32Array(starCount * 3)
  for (let i = 0; i < starCount; i++) {
    const r = 15 + Math.random() * 20
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1) - Math.PI / 2
    starPositions[i * 3] = r * Math.cos(phi) * Math.cos(theta)
    starPositions[i * 3 + 1] = r * Math.sin(phi)
    starPositions[i * 3 + 2] = r * Math.cos(phi) * Math.sin(theta)

    const c = Math.random()
    if (c > 0.8) {
      starColors[i * 3] = 0.5; starColors[i * 3 + 1] = 0.8; starColors[i * 3 + 2] = 1.0 // cyan/blue
    } else {
      starColors[i * 3] = 0.9; starColors[i * 3 + 1] = 0.95; starColors[i * 3 + 2] = 1.0 // white
    }
  }
  const starGeo = new THREE.BufferGeometry()
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
  starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3))
  const starMat = new THREE.PointsMaterial({
    vertexColors: true,
    size: 0.035,
    transparent: true,
    opacity: 0.85,
  })
  const starPoints = new THREE.Points(starGeo, starMat)
  scene.add(starPoints)

  // 5. Main Orbital Observatory Structure
  observatoryGroup = new THREE.Group()
  scene.add(observatoryGroup)

  // Central Crystalline Core
  const coreGeo = new THREE.OctahedronGeometry(0.38, 0)
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0x3b82f6,
    metalness: 0.9,
    roughness: 0.2,
    emissive: 0x1d4ed8,
    emissiveIntensity: 0.6,
  })
  const coreMesh = new THREE.Mesh(coreGeo, coreMat)
  observatoryGroup.add(coreMesh)

  // Outer Wireframe Cage around Core
  const cageGeo = new THREE.IcosahedronGeometry(0.65, 1)
  const cageMat = new THREE.MeshBasicMaterial({
    color: 0x93c5fd,
    wireframe: true,
    transparent: true,
    opacity: 0.22,
  })
  const cageMesh = new THREE.Mesh(cageGeo, cageMat)
  observatoryGroup.add(cageMesh)

  // Concentric Gimbal Orbital Rings
  const ringRadii = [1.1, 1.45, 1.8]
  for (let i = 0; i < ringRadii.length; i++) {
    const radius = ringRadii[i]
    const torusGeo = new THREE.TorusGeometry(radius, 0.008, 12, 64)
    const torusMat = new THREE.MeshBasicMaterial({
      color: i === 0 ? 0x60a5fa : 0x334155,
      transparent: true,
      opacity: 0.45 + i * 0.1,
    })
    const ringMesh = new THREE.Mesh(torusGeo, torusMat)
    ringMesh.rotation.x = 0.3 * (i + 1)
    ringMesh.rotation.y = 0.4 * (i + 1)
    observatoryGroup.add(ringMesh)
  }

  // 6. Subtle Satellites Orbiting on Orbital Paths
  satelliteProbes = []
  const probeConfigs = [
    { radius: 1.1, speed: 0.6, tilt: 0.3 },
    { radius: 1.45, speed: -0.4, tilt: 0.8 },
    { radius: 1.8, speed: 0.3, tilt: -0.5 },
  ]
  for (const cfg of probeConfigs) {
    const probeGeo = new THREE.BoxGeometry(0.04, 0.04, 0.08)
    const probeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x60a5fa,
      emissiveIntensity: 0.8,
      metalness: 0.8,
    })
    const probeMesh = new THREE.Mesh(probeGeo, probeMat)
    observatoryGroup.add(probeMesh)
    satelliteProbes.push({
      mesh: probeMesh,
      orbitRadius: cfg.radius,
      speed: cfg.speed,
      angle: Math.random() * Math.PI * 2,
      tilt: cfg.tilt,
    })
  }

  // 7. Animation Loop
  let lastTime = performance.now()
  function animate(now: number) {
    animFrameId = requestAnimationFrame(animate)
    const delta = Math.min((now - lastTime) / 1000, 0.1)
    lastTime = now

    if (observatoryGroup) {
      if (!isDragging) {
        rotVelocityX *= 0.95
        rotVelocityY = THREE.MathUtils.lerp(rotVelocityY, 0.002, 0.05)
        observatoryGroup.rotation.y += rotVelocityY
        observatoryGroup.rotation.x += rotVelocityX
      }

      coreMesh.rotation.y += delta * 0.8
      coreMesh.rotation.x += delta * 0.4
      cageMesh.rotation.y -= delta * 0.3
      cageMesh.rotation.z += delta * 0.2

      // Orbit satellites
      for (const sp of satelliteProbes) {
        sp.angle += delta * sp.speed
        const x = Math.cos(sp.angle) * sp.orbitRadius
        const z = Math.sin(sp.angle) * sp.orbitRadius
        const y = Math.sin(sp.angle) * Math.sin(sp.tilt) * (sp.orbitRadius * 0.4)
        sp.mesh.position.set(x, y, z)
        sp.mesh.lookAt(0, 0, 0)
      }
    }

    if (renderer && scene && camera) {
      renderer.render(scene, camera)
    }
  }
  animFrameId = requestAnimationFrame(animate)
}

function onPointerDown(e: PointerEvent) {
  isDragging = true
  prevMouseX = e.clientX
  prevMouseY = e.clientY
  rotVelocityX = 0
  rotVelocityY = 0
}

function onPointerMove(e: PointerEvent) {
  if (!isDragging || !observatoryGroup) return
  const dx = e.clientX - prevMouseX
  const dy = e.clientY - prevMouseY
  prevMouseX = e.clientX
  prevMouseY = e.clientY

  observatoryGroup.rotation.y += dx * 0.006
  observatoryGroup.rotation.x += dy * 0.006
  rotVelocityY = dx * 0.004
  rotVelocityX = dy * 0.004
}

function onPointerUp() {
  isDragging = false
}

function onResize() {
  if (!container.value || !camera || !renderer) return
  const w = container.value.clientWidth || window.innerWidth
  const h = container.value.clientHeight || window.innerHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
}

onMounted(() => {
  initScene()
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  if (animFrameId) cancelAnimationFrame(animFrameId)
  if (scene) {
    scene.traverse(obj => {
      if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) {
        if (obj.geometry) obj.geometry.dispose()
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose())
          else obj.material.dispose()
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
})
</script>

