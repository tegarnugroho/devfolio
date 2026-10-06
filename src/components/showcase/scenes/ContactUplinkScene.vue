<template>
  <div ref="container" class="contact-uplink-scene relative w-full h-full select-none overflow-hidden bg-[#010206]">
    <!-- WebGL Canvas -->
    <canvas
      ref="canvas"
      class="w-full h-full block cursor-grab active:cursor-grabbing outline-none"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    ></canvas>

    <!-- Technical Header -->
    <div class="pointer-events-none absolute top-6 sm:top-8 left-6 sm:left-8 z-10 font-mono text-[10px] tracking-wider text-zinc-400">
      <p class="text-white font-semibold flex items-center gap-2">
        <span class="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
        SATELLITE UPLINK // TRANSMISSION TERMINAL
      </p>
      <p class="text-zinc-500 uppercase mt-0.5">
        FREQ 14.240 GHz · DIRECT COMM ARRAY · READY
      </p>
    </div>

    <!-- Active Terminal Card (Bottom Overlay) -->
    <div
      class="absolute bottom-6 sm:bottom-8 left-6 sm:left-8 right-6 sm:right-auto z-10 max-w-sm sm:max-w-md w-full pointer-events-auto"
    >
      <div class="p-4 sm:p-5 rounded-2xl border border-white/15 bg-black/85 backdrop-blur-xl shadow-2xl space-y-3.5">
        <div class="flex items-center justify-between gap-2">
          <span class="font-mono text-[9px] uppercase tracking-widest text-indigo-400 font-bold flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            CHANNEL ACTIVE
          </span>
          <span class="font-mono text-[9px] text-zinc-500">
            SECURE DIRECT LINK
          </span>
        </div>

        <div>
          <h3 class="text-base sm:text-lg font-bold text-white tracking-tight">
            {{ contact.title }}
          </h3>
          <p class="text-xs text-zinc-300 leading-relaxed font-sans mt-0.5">
            {{ contact.description }}
          </p>
        </div>

        <!-- Real Channels -->
        <div class="space-y-1.5 pt-1 border-t border-white/10 font-mono text-xs">
          <a
            v-for="item in contact.items"
            :key="item.type"
            :href="item.href"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 transition cursor-pointer text-[11px]"
          >
            <span class="text-zinc-400 uppercase text-[9px]">{{ item.label }}</span>
            <span class="text-white font-medium flex items-center gap-1">
              {{ item.value }}
              <span class="text-zinc-500 text-[10px]">↗</span>
            </span>
          </a>
        </div>

        <!-- Primary Action: Real Email Dispatch -->
        <div class="pt-1">
          <a
            :href="`mailto:${emailContact?.value || 'tegar@wolkk.com'}?subject=Hello%20Tegar%20-%20Project%20Inquiry`"
            class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-mono text-xs uppercase tracking-wider font-bold transition shadow-lg shadow-indigo-600/30 cursor-pointer"
          >
            <span>TRANSMIT MESSAGE</span>
            <span>→</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { portfolioContent } from '@/content/portfolioContent'

const contact = portfolioContent.contact
const emailContact = computed(() => contact.items.find(i => i.type === 'email'))

const container = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let animFrameId = 0
let uplinkGroup: THREE.Group | null = null
let waveRings: THREE.Mesh[] = []

let isDragging = false
let prevX = 0
let prevY = 0

function initScene() {
  if (!container.value || !canvas.value) return

  const width = container.value.clientWidth || window.innerWidth
  const height = container.value.clientHeight || window.innerHeight
  const isMobile = width < 768

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100)
  camera.position.set(0, 0.5, isMobile ? 6.2 : 4.8)

  renderer = new THREE.WebGLRenderer({
    canvas: canvas.value,
    antialias: !isMobile,
    alpha: true,
    powerPreference: 'high-performance',
  })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))

  const ambient = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambient)
  const dir = new THREE.DirectionalLight(0x818cf8, 2.0)
  dir.position.set(4, 5, 4)
  scene.add(dir)

  uplinkGroup = new THREE.Group()
  uplinkGroup.position.set(0, -0.4, 0)
  scene.add(uplinkGroup)

  // 1. Base Pedestal
  const baseGeo = new THREE.CylinderGeometry(0.5, 0.65, 0.15, 24)
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x1e1b4b,
    metalness: 0.8,
    roughness: 0.3,
  })
  const baseMesh = new THREE.Mesh(baseGeo, baseMat)
  uplinkGroup.add(baseMesh)

  // Radar ground ring
  const radarGeo = new THREE.RingGeometry(0.8, 1.4, 32)
  const radarMat = new THREE.MeshBasicMaterial({
    color: 0x6366f1,
    transparent: true,
    opacity: 0.25,
    side: THREE.DoubleSide,
  })
  const radarMesh = new THREE.Mesh(radarGeo, radarMat)
  radarMesh.rotation.x = -Math.PI / 2
  radarMesh.position.y = 0.08
  uplinkGroup.add(radarMesh)

  // 2. Dish Gimbal Arm
  const armGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.7, 12)
  const armMat = new THREE.MeshStandardMaterial({ color: 0x312e81, metalness: 0.9 })
  const armMesh = new THREE.Mesh(armGeo, armMat)
  armMesh.position.set(0, 0.4, 0)
  uplinkGroup.add(armMesh)

  // 3. Parabolic Dish
  const dishGeo = new THREE.SphereGeometry(0.85, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.42)
  const dishMat = new THREE.MeshStandardMaterial({
    color: 0x4338ca,
    metalness: 0.85,
    roughness: 0.25,
    side: THREE.DoubleSide,
  })
  const dishMesh = new THREE.Mesh(dishGeo, dishMat)
  dishMesh.position.set(0, 0.75, 0)
  dishMesh.rotation.x = Math.PI * 0.65 // pointed upwards into sky
  uplinkGroup.add(dishMesh)

  // Feedhorn probe at focus of dish
  const probeGeo = new THREE.SphereGeometry(0.06, 12, 12)
  const probeMat = new THREE.MeshBasicMaterial({ color: 0xa5b4fc })
  const probeMesh = new THREE.Mesh(probeGeo, probeMat)
  probeMesh.position.set(0, 1.25, 0.45)
  uplinkGroup.add(probeMesh)

  // 4. Expanding Concentric Radio Signal Propagation Waves
  waveRings = []
  for (let i = 0; i < 4; i++) {
    const ringGeo = new THREE.RingGeometry(0.1, 0.15, 28)
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x818cf8,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.position.set(0, 1.25, 0.45)
    ring.rotation.x = Math.PI * 0.65
    uplinkGroup.add(ring)
    waveRings.push(ring)
  }

  // 5. Background Cosmic Dust
  const dustCount = isMobile ? 400 : 1000
  const dustPos = new Float32Array(dustCount * 3)
  for (let i = 0; i < dustCount; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 16
    dustPos[i * 3 + 1] = (Math.random() - 0.5) * 12
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 3
  }
  const dustGeo = new THREE.BufferGeometry()
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3))
  const dustMat = new THREE.PointsMaterial({
    color: 0x4f46e5,
    size: 0.02,
    transparent: true,
    opacity: 0.5,
  })
  scene.add(new THREE.Points(dustGeo, dustMat))

  let lastTime = performance.now()
  function loop(now: number) {
    animFrameId = requestAnimationFrame(loop)
    const delta = Math.min((now - lastTime) / 1000, 0.1)
    lastTime = now

    // Radiate signal waves
    waveRings.forEach((ring, i) => {
      const progress = ((now * 0.0012 + i * 0.25) % 1)
      const scale = 1.0 + progress * 5.0
      ring.scale.set(scale, scale, 1)
      const mat = ring.material as THREE.MeshBasicMaterial
      mat.opacity = Math.max(0, 0.8 * (1.0 - progress))
    })

    if (!isDragging && uplinkGroup) {
      uplinkGroup.rotation.y += delta * 0.06
    }

    if (renderer && scene && camera) {
      renderer.render(scene, camera)
    }
  }
  animFrameId = requestAnimationFrame(loop)
}

function onPointerDown(e: PointerEvent) {
  isDragging = true
  prevX = e.clientX
  prevY = e.clientY
}

function onPointerMove(e: PointerEvent) {
  if (isDragging && uplinkGroup) {
    const dx = e.clientX - prevX
    prevX = e.clientX
    uplinkGroup.rotation.y += dx * 0.005
  }
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

