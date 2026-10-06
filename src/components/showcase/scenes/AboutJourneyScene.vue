<template>
  <div ref="container" class="about-journey-scene relative w-full h-full select-none overflow-hidden bg-[#010206]">
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
        <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
        JOURNEY TIMELINE // CAREER & PHILOSOPHY
      </p>
      <p class="text-zinc-500 uppercase mt-0.5">
        CLICK MILESTONE NODES TO INSPECT · DRAG TO EXPLORE
      </p>
    </div>

    <!-- Active Milestone Information Card (Bottom Overlay) -->
    <div
      v-if="activeMilestone"
      class="absolute bottom-6 sm:bottom-8 left-6 sm:left-8 right-6 sm:right-auto z-10 max-w-sm sm:max-w-md w-full pointer-events-auto"
    >
      <div class="p-4 sm:p-5 rounded-2xl border border-white/15 bg-black/85 backdrop-blur-xl shadow-2xl space-y-2.5">
        <div class="flex items-center justify-between gap-2">
          <span class="font-mono text-[9px] uppercase tracking-widest text-cyan-400 font-bold">
            {{ activeMilestone.year }} · MILESTONE {{ activeMilestone.step }}
          </span>
          <span class="font-mono text-[9px] px-2 py-0.5 rounded-full bg-white/10 text-zinc-300">
            {{ activeMilestone.tag }}
          </span>
        </div>

        <h3 class="text-sm sm:text-base font-bold text-white tracking-tight">
          {{ activeMilestone.title }}
        </h3>

        <p class="text-xs text-zinc-300 leading-relaxed font-sans">
          {{ activeMilestone.description }}
        </p>

        <!-- Navigation Buttons between milestones -->
        <div class="flex items-center justify-between pt-2 border-t border-white/10">
          <span class="font-mono text-[9px] text-zinc-500">
            {{ activeIndex + 1 }} OF {{ milestones.length }}
          </span>
          <div class="flex items-center gap-1.5">
            <button
              type="button"
              class="px-2.5 py-1 rounded-full border border-white/15 text-[10px] font-mono text-zinc-300 hover:text-white hover:bg-white/10 active:scale-95 transition cursor-pointer"
              @click="prevMilestone"
            >
              PREV
            </button>
            <button
              type="button"
              class="px-2.5 py-1 rounded-full border border-cyan-400/50 bg-cyan-500/20 text-[10px] font-mono text-cyan-300 hover:text-white hover:bg-cyan-500/30 active:scale-95 transition cursor-pointer"
              @click="nextMilestone"
            >
              NEXT
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { portfolioContent } from '@/content/portfolioContent'

const about = portfolioContent.about

interface Milestone {
  id: string
  step: string
  year: string
  tag: string
  title: string
  description: string
  pos: THREE.Vector3
}

const milestones: Milestone[] = [
  {
    id: 'foundation',
    step: '01',
    year: 'FOUNDATION',
    tag: 'CORE FOCUS',
    title: 'High-Performance Flutter Engineering',
    description: about.paragraphs[0] || 'Flutter developer focused on building accessible, high-performance applications.',
    pos: new THREE.Vector3(-2.2, 0.4, 0),
  },
  {
    id: 'architecture',
    step: '02',
    year: 'ENGINEERING',
    tag: 'ARCHITECTURE',
    title: 'Clean Architecture & Scalability',
    description: about.paragraphs[1] || 'Favoring clean architecture and maintainable code so every product feels smooth, consistent, and easy to evolve.',
    pos: new THREE.Vector3(-0.7, -0.3, 0.4),
  },
  {
    id: 'cross-platform',
    step: '03',
    year: 'EXPERIENCE',
    tag: 'MULTI-PLATFORM',
    title: 'Mobile, Web & Desktop Deployments',
    description: about.paragraphs[2] || 'Shipped mobile, web, and desktop projects with a strong emphasis on performance, consistency, and scalability.',
    pos: new THREE.Vector3(0.8, 0.5, -0.2),
  },
  {
    id: 'wolkk',
    step: '04',
    year: 'PRESENT',
    tag: `${about.company.toUpperCase()} (REMOTE)`,
    title: `${about.role} at ${about.company}`,
    description: about.paragraphs[3] || 'Building cross-platform solutions that combine clear design with robust engineering.',
    pos: new THREE.Vector3(2.3, -0.2, 0.2),
  },
]

const activeIndex = ref(0)
const activeMilestone = computed(() => milestones[activeIndex.value])

const container = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let animFrameId = 0
let timelineGroup: THREE.Group | null = null
let nodeMeshes: { mesh: THREE.Mesh; ring: THREE.Mesh; id: string }[] = []
let pulseLight: THREE.Mesh | null = null
let curvePath: THREE.CatmullRomCurve3 | null = null

const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2(-999, -999)

// Dragging
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
  camera.position.set(0, 0, isMobile ? 6.5 : 5.2)

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
  const dir = new THREE.DirectionalLight(0x38bdf8, 2.0)
  dir.position.set(4, 4, 4)
  scene.add(dir)

  timelineGroup = new THREE.Group()
  scene.add(timelineGroup)

  // 1. CatmullRom Curve for Conduit Line
  const points = milestones.map(m => m.pos)
  curvePath = new THREE.CatmullRomCurve3(points)
  const curvePoints = curvePath.getPoints(80)
  const curveGeo = new THREE.BufferGeometry().setFromPoints(curvePoints)
  const curveMat = new THREE.LineBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.5,
  })
  const curveLine = new THREE.Line(curveGeo, curveMat)
  timelineGroup.add(curveLine)

  // 2. Travelling Pulse Light along curve
  const pulseGeo = new THREE.SphereGeometry(0.04, 12, 12)
  const pulseMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
  pulseLight = new THREE.Mesh(pulseGeo, pulseMat)
  timelineGroup.add(pulseLight)

  // 3. Milestone 3D Nodes
  nodeMeshes = []
  milestones.forEach((m, idx) => {
    // Core Node
    const nodeGeo = new THREE.SphereGeometry(0.12, 16, 16)
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x0369a1,
      emissiveIntensity: 0.8,
      metalness: 0.8,
      roughness: 0.2,
    })
    const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat)
    nodeMesh.position.copy(m.pos)
    nodeMesh.userData = { index: idx }
    timelineGroup!.add(nodeMesh)

    // Pulsing Outer Sonar Ring
    const ringGeo = new THREE.RingGeometry(0.16, 0.24, 24)
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    })
    const ringMesh = new THREE.Mesh(ringGeo, ringMat)
    ringMesh.position.copy(m.pos)
    timelineGroup!.add(ringMesh)

    nodeMeshes.push({ mesh: nodeMesh, ring: ringMesh, id: m.id })
  })

  // 4. Background Star Dust
  const dustCount = isMobile ? 400 : 1000
  const dustPos = new Float32Array(dustCount * 3)
  for (let i = 0; i < dustCount; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 16
    dustPos[i * 3 + 1] = (Math.random() - 0.5) * 12
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 4
  }
  const dustGeo = new THREE.BufferGeometry()
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3))
  const dustMat = new THREE.PointsMaterial({
    color: 0x64748b,
    size: 0.02,
    transparent: true,
    opacity: 0.5,
  })
  scene.add(new THREE.Points(dustGeo, dustMat))

  // 5. Animation
  let lastTime = performance.now()
  function loop(now: number) {
    animFrameId = requestAnimationFrame(loop)
    const delta = Math.min((now - lastTime) / 1000, 0.1)
    lastTime = now

    // Pulse light progress along curve
    if (curvePath && pulseLight) {
      const t = (now * 0.0003) % 1
      const pos = curvePath.getPointAt(t)
      pulseLight.position.copy(pos)
    }

    // Node rings pulse & rotate
    nodeMeshes.forEach((nm, i) => {
      nm.ring.lookAt(camera!.position)
      const isSel = activeIndex.value === i
      const pulse = ((now * 0.002 + i * 0.4) % 1)
      const scale = isSel ? 1.2 + pulse * 0.4 : 1.0 + pulse * 0.2
      nm.ring.scale.set(scale, scale, 1)
      const rMat = nm.ring.material as THREE.MeshBasicMaterial
      rMat.opacity = isSel ? Math.max(0.2, 0.8 * (1 - pulse)) : Math.max(0.1, 0.4 * (1 - pulse))
    })

    if (!isDragging && timelineGroup) {
      timelineGroup.rotation.y = Math.sin(now * 0.0004) * 0.12
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
  checkRaycast(e)
}

function onPointerMove(e: PointerEvent) {
  if (!container.value) return
  const rect = container.value.getBoundingClientRect()
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

  if (isDragging && timelineGroup) {
    const dx = e.clientX - prevX
    const dy = e.clientY - prevY
    prevX = e.clientX
    prevY = e.clientY
    timelineGroup.rotation.y += dx * 0.005
    timelineGroup.rotation.x += dy * 0.005
  }
}

function onPointerUp() {
  isDragging = false
}

function checkRaycast(e: PointerEvent) {
  if (!camera || !container.value) return
  const rect = container.value.getBoundingClientRect()
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

  raycaster.setFromCamera(mouse, camera)
  const targets = nodeMeshes.map(n => n.mesh)
  const hits = raycaster.intersectObjects(targets, false)
  if (hits.length > 0) {
    const idx = hits[0].object.userData.index
    if (typeof idx === 'number') {
      activeIndex.value = idx
    }
  }
}

function prevMilestone() {
  activeIndex.value = (activeIndex.value - 1 + milestones.length) % milestones.length
}

function nextMilestone() {
  activeIndex.value = (activeIndex.value + 1) % milestones.length
}

function onResize() {
  if (!container.value || !camera || !renderer) return
  const w = container.value.clientWidth || window.innerWidth
  const h = container.value.clientHeight || window.innerHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
}

import { registerContentNavigator } from '@/composables/useShowcase'

let unregisterNav: (() => void) | null = null

onMounted(() => {
  initScene()
  window.addEventListener('resize', onResize)
  unregisterNav = registerContentNavigator((dir) => {
    if (dir === 'next') nextMilestone()
    else prevMilestone()
  })
})

onBeforeUnmount(() => {
  unregisterNav?.()
  window.removeEventListener('resize', onResize)
  if (animFrameId) cancelAnimationFrame(animFrameId)
  if (scene) {
    scene.traverse(obj => {
      if (obj instanceof THREE.Mesh || obj instanceof THREE.Points || obj instanceof THREE.Line) {
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

