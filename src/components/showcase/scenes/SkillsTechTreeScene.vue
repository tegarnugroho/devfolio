<template>
  <div
    ref="container"
    class="skills-space-universe-scene relative w-full h-full select-none overflow-hidden bg-[#020307]"
    @click="onBackgroundClick"
  >
    <!-- Deep Cosmic Ambient Glow -->
    <div class="pointer-events-none absolute inset-0 cosmic-deep-glow" aria-hidden="true"></div>

    <!-- WebGL Canvas for Immersive 3D Space & Constellations -->
    <canvas
      ref="canvas"
      class="w-full h-full block cursor-grab active:cursor-grabbing outline-none touch-none z-0"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @wheel="onWheel"
    ></canvas>

    <!-- Subtle Technical Vignette & Horizon Grid -->
    <div class="pointer-events-none absolute inset-0 opacity-[0.03] space-celestial-grid" aria-hidden="true"></div>
    <div class="pointer-events-none absolute inset-0 space-ambient-vignette" aria-hidden="true"></div>

    <!-- Section Header (Top-Left HUD) -->
    <div class="pointer-events-none absolute top-[max(4.25rem,calc(env(safe-area-inset-top)+3.5rem))] sm:top-20 left-4 sm:left-12 z-20 max-w-xs space-y-1 sm:space-y-1.5 select-none">
      <div class="flex items-center gap-2">
        <span class="font-mono text-[10px] text-zinc-500 tracking-widest font-semibold">03</span>
        <span class="w-3.5 h-[1px] bg-zinc-700"></span>
        <span class="font-mono text-[10px] text-zinc-400 uppercase tracking-widest font-medium">CONSTELLATION SPACE</span>
      </div>
      <h1 class="text-xl sm:text-2xl font-light tracking-tight text-white font-sans leading-tight">
        Interactive 3D<br /><span class="font-semibold text-sky-400">Technology Universe</span>
      </h1>
      <p class="hidden sm:block text-[11px] text-zinc-400 leading-relaxed font-sans max-w-[270px] font-normal pt-0.5">
        Explore engineering capabilities as interconnected stellar systems distributed across deep three-dimensional space.
      </p>
    </div>

    <!-- Category Filter Strip (Top-Right HUD) -->
    <div class="pointer-events-auto absolute top-[max(4.25rem,calc(env(safe-area-inset-top)+3.5rem))] sm:top-20 right-4 sm:right-12 z-20 flex flex-wrap items-center justify-end gap-1.5 max-w-md select-none">
      <div class="inline-flex items-center rounded-full border border-white/10 bg-black/80 p-0.5 backdrop-blur-md shadow-lg">
        <button
          type="button"
          class="px-2.5 py-1 rounded-full text-[9.5px] font-mono tracking-wider transition-all duration-200 cursor-pointer"
          :class="
            !selectedCategoryId
              ? 'bg-sky-500/25 text-white font-bold border border-sky-400/40 shadow-[0_0_10px_rgba(56,189,248,0.3)]'
              : 'text-zinc-400 hover:text-white border border-transparent'
          "
          title="Overview of all constellations across open space"
          @click.stop="filterByCategory(null)"
        >
          GALAXY
        </button>

        <button
          v-for="cat in categories"
          :key="cat.id"
          type="button"
          class="px-2.5 py-1 rounded-full text-[9.5px] font-mono tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-1.5"
          :class="
            selectedCategoryId === cat.id
              ? 'text-white font-bold border shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
          "
          :style="
            selectedCategoryId === cat.id
              ? {
                  backgroundColor: `${cat.color}25`,
                  borderColor: `${cat.color}55`,
                  boxShadow: `0 0 12px ${cat.color}35`,
                }
              : {}
          "
          @click.stop="filterByCategory(cat.id)"
        >
          <span
            class="w-1.5 h-1.5 rounded-full"
            :style="{ backgroundColor: cat.color }"
          ></span>
          <span>{{ cat.code }}</span>
        </button>
      </div>
    </div>

    <!-- Initial State Exploration Callout (Disappears once interacted) -->
    <Transition name="fade">
      <div
        v-if="!hasSelectedEver && !isDragging"
        class="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-28 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full border border-sky-400/30 bg-black/70 backdrop-blur-md shadow-2xl"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping"></span>
        <span class="font-mono text-[10px] uppercase tracking-widest text-sky-200 font-semibold">
          SELECT A STAR OR CATEGORY TO EXPLORE
        </span>
      </div>
    </Transition>

    <!-- Projected 3D Floating Constellation Labels (Near sector centroids) -->
    <div
      v-for="lbl in projectedLabels"
      :key="lbl.id"
      class="pointer-events-auto absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200"
      :style="{
        left: `${lbl.screenX}px`,
        top: `${lbl.screenY}px`,
        opacity: lbl.visible ? (selectedCategoryId === lbl.id ? 1.0 : (selectedCategoryId ? 0.25 : 0.70)) : 0,
        pointerEvents: lbl.visible ? 'auto' : 'none',
      }"
      @click.stop="filterByCategory(lbl.id)"
    >
      <div
        class="group flex items-center gap-1.5 px-2 py-0.5 rounded border bg-black/85 backdrop-blur-md cursor-pointer transition-all duration-200 hover:scale-105"
        :style="{
          borderColor: selectedCategoryId === lbl.id ? lbl.color : 'rgba(255, 255, 255, 0.12)',
          boxShadow: selectedCategoryId === lbl.id ? `0 0 12px ${lbl.color}40` : 'none',
        }"
      >
        <span class="w-1 h-1 rounded-full" :style="{ backgroundColor: lbl.color }"></span>
        <span class="font-mono text-[8.5px] uppercase tracking-widest text-zinc-300 group-hover:text-white">
          {{ lbl.name }}
        </span>
      </div>
    </div>

    <!-- Projected Hover Star Tooltip -->
    <div
      v-if="hoveredStar && (!selectedStar || selectedStar.id !== hoveredStar.id)"
      class="pointer-events-none absolute z-30 px-2.5 py-1 rounded bg-black/95 text-white border shadow-2xl font-mono text-[9px] uppercase tracking-wider -translate-x-1/2 -translate-y-8 backdrop-blur-md transition-opacity duration-150"
      :style="{
        left: `${hoverScreenPos.x}px`,
        top: `${hoverScreenPos.y}px`,
        borderColor: `${hoveredCategoryColor}66`,
        boxShadow: `0 0 14px ${hoveredCategoryColor}33`,
      }"
    >
      <span class="mr-1" :style="{ color: hoveredCategoryColor }">✦</span>
      <span>{{ hoveredStar.name }}</span>
      <span class="text-zinc-500 ml-1.5">// {{ hoveredStar.categoryName }}</span>
    </div>

    <!-- Editorial Star Detail Panel (Bottom-Left) -->
    <div
      v-if="selectedStar"
      class="editorial-panel absolute bottom-[max(4.5rem,calc(env(safe-area-inset-bottom)+3.5rem))] sm:bottom-10 left-4 right-4 sm:left-12 sm:right-auto z-20 max-w-sm sm:w-[340px] pointer-events-auto p-4 sm:p-5 rounded-xl border bg-black/90 backdrop-blur-xl shadow-2xl space-y-3 transition-all duration-300"
      :style="{
        borderColor: selectedCategoryColor ? `${selectedCategoryColor}40` : 'rgba(255, 255, 255, 0.12)',
        boxShadow: selectedCategoryColor ? `0 16px 40px rgba(0,0,0,0.8), 0 0 24px ${selectedCategoryColor}20` : '0 16px 40px rgba(0,0,0,0.8)',
      }"
      @click.stop
    >
      <!-- Telemetry Header -->
      <div class="space-y-1">
        <div class="flex items-center justify-between text-[9px] font-mono uppercase tracking-wider">
          <span class="font-semibold flex items-center gap-1.5" :style="{ color: selectedCategoryColor }">
            <span class="w-1.5 h-1.5 rounded-full animate-ping" :style="{ backgroundColor: selectedCategoryColor }"></span>
            STELLAR NODE // {{ selectedStar.id.toUpperCase() }}
          </span>
          <span class="text-zinc-400">
            {{ selectedStar.categoryName }}
          </span>
        </div>

        <h2 class="text-xl font-semibold tracking-tight text-white flex items-center gap-2 pt-0.5">
          {{ selectedStar.name }}
        </h2>
        <p class="text-[11px] font-mono text-zinc-400">
          {{ selectedStar.tagline }}
        </p>
      </div>

      <!-- Description -->
      <p class="text-xs text-zinc-300 leading-relaxed font-sans border-t border-white/10 pt-2.5 font-normal">
        {{ selectedStar.desc }}
      </p>

      <!-- Constellation Connected Stars -->
      <div class="space-y-1.5 pt-1">
        <p class="font-mono text-[8.5px] uppercase tracking-wider text-zinc-400">
          CONSTELLATION CONNECTIONS ({{ selectedStar.connections.length }})
        </p>
        <div class="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
          <button
            v-for="relId in selectedStar.connections"
            :key="relId"
            type="button"
            class="px-2 py-0.5 rounded text-[9.5px] font-mono text-zinc-300 bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/30 transition cursor-pointer flex items-center gap-1"
            @click.stop="selectStarById(relId)"
          >
            <span>✦</span>
            <span>{{ getStarName(relId) }}</span>
          </button>
        </div>
      </div>

      <!-- Actions Footer -->
      <div class="pt-2 border-t border-white/10 flex items-center justify-between font-mono text-[10px]">
        <button
          type="button"
          class="text-zinc-400 hover:text-white transition cursor-pointer uppercase tracking-wider flex items-center gap-1"
          @click.stop="resetToOverview"
        >
          <span>↺</span>
          <span>RESET TO GALAXY</span>
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-1 text-sky-400 hover:text-white transition cursor-pointer font-semibold uppercase tracking-wider"
          @click="viewProjects"
        >
          <span>VIEW PROJECTS</span>
          <span>↗</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { registerContentNavigator, setSection, markSectionReady } from '@/composables/useShowcase'
import {
  CONSTELLATION_CATEGORIES,
  CONSTELLATION_STARS,
  CONSTELLATION_EDGES,
  createStarSpriteTexture,
  createGasGiantTexture,
  createMoonTexture,
  type ConstellationCategory,
  type SkillStarNode,
} from '../skills/constellationData'

const categories = CONSTELLATION_CATEGORIES
const starsData = CONSTELLATION_STARS

const selectedStarId = ref<string>('flutter')
const selectedStar = computed(() => starsData.find(s => s.id === selectedStarId.value) || starsData[0])

const selectedCategoryId = ref<string | null>(null)
const hasSelectedEver = ref(false)

const selectedCategoryColor = computed(() => {
  if (!selectedStar.value) return '#38bdf8'
  const cat = categories.find(c => c.id === selectedStar.value.categoryId)
  return cat ? cat.color : '#38bdf8'
})

const hoveredStarId = ref<string | null>(null)
const hoveredStar = computed(() => starsData.find(s => s.id === hoveredStarId.value) || null)
const hoveredCategoryColor = computed(() => {
  if (!hoveredStar.value) return '#38bdf8'
  const cat = categories.find(c => c.id === hoveredStar.value?.categoryId)
  return cat ? cat.color : '#38bdf8'
})

const hoverScreenPos = ref({ x: 0, y: 0 })

// 3D Projected Constellation Labels
interface ProjectedLabel {
  id: string
  name: string
  color: string
  screenX: number
  screenY: number
  visible: boolean
}
const projectedLabels = ref<ProjectedLabel[]>([])

function getStarName(id: string): string {
  return starsData.find(s => s.id === id)?.name || id
}

function selectStarById(id: string) {
  selectedStarId.value = id
  hasSelectedEver.value = true
  const target = starsData.find(s => s.id === id)
  if (target) {
    selectedCategoryId.value = target.categoryId
    smoothGlideToCategory(target.categoryId)
  }
  updateVisualHighlights()
}

function filterByCategory(catId: string | null) {
  selectedCategoryId.value = catId
  hasSelectedEver.value = true

  if (catId) {
    const primaryStar = starsData.find(s => s.categoryId === catId && s.magnitude > 1.0) ||
                        starsData.find(s => s.categoryId === catId)
    if (primaryStar) {
      selectedStarId.value = primaryStar.id
    }
    smoothGlideToCategory(catId)
  } else {
    // Reset to galactic overview
    resetToOverview()
  }
  updateVisualHighlights()
}

function resetToOverview() {
  selectedCategoryId.value = null
  selectedStarId.value = 'flutter'
  hasSelectedEver.value = false

  targetCameraPos.set(0, 0, 5.8)
  targetCameraLookAt.set(0, 0, 0)
  targetOrbitRotY = 0
  targetOrbitRotX = 0
  updateVisualHighlights()
}

function viewProjects() {
  setSection('projects')
}

// -------------------------------------------------------------
// THREE.JS 3D OPEN UNIVERSE & CONSTELLATION ENGINE
// -------------------------------------------------------------
const container = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let animFrameId = 0
let spaceMasterGroup: THREE.Group | null = null

// Runtime Node Representation
interface StarMeshRuntime {
  star: SkillStarNode
  group: THREE.Group
  spriteMesh: THREE.Sprite
  glowRing: THREE.Mesh
  baseScale: number
}
const starRuntimes: StarMeshRuntime[] = []

// Dynamic Constellation Lines
interface ConstellationLineRuntime {
  u: SkillStarNode
  v: SkillStarNode
  lineMesh: THREE.Line
  isInterConstellation: boolean
  categoryId: string
  currentOpacity: number
  targetOpacity: number
}
const lineRuntimes: ConstellationLineRuntime[] = []

// Environmental 3D Planet (Single celestial anchor for depth)
let celestialPlanetMesh: THREE.Mesh | null = null
let planetaryRingMesh: THREE.Mesh | null = null

// Centroids for 3D Category Labels
const categoryCentroids = new Map<string, THREE.Vector3>()

// Interaction, Camera & Glide Target
const raycaster = new THREE.Raycaster()
raycaster.params.Sprite = {}
const mouseNDC = new THREE.Vector2(-999, -999)
const pickableObjects: THREE.Object3D[] = []

let isDragging = false
let prevPointerX = 0
let prevPointerY = 0
let pointerStartX = 0
let pointerStartY = 0

// Cinematic Camera Interpolation Vectors
const currentCameraPos = new THREE.Vector3(0, 0, 5.8)
const targetCameraPos = new THREE.Vector3(0, 0, 5.8)
const currentCameraLookAt = new THREE.Vector3(0, 0, 0)
const targetCameraLookAt = new THREE.Vector3(0, 0, 0)

let orbitRotY = 0
let orbitRotX = 0
let targetOrbitRotY = 0
let targetOrbitRotX = 0

let unregisterContentNav: (() => void) | null = null

function smoothGlideToCategory(catId: string) {
  const cat = categories.find(c => c.id === catId)
  if (!cat) return

  targetCameraPos.set(...cat.cameraPos)
  targetCameraLookAt.set(...cat.cameraTarget)
}

function initScene() {
  if (!container.value || !canvas.value) return

  const width = container.value.clientWidth || window.innerWidth
  const height = container.value.clientHeight || window.innerHeight
  const isMobile = width < 768

  // 1. Scene & Camera in Open 3D Space
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 120)

  const initialDist = isMobile ? (width < 390 ? 7.0 : 6.4) : 5.8
  currentCameraPos.set(0, 0, initialDist)
  targetCameraPos.set(0, 0, initialDist)
  camera.position.copy(currentCameraPos)
  camera.lookAt(currentCameraLookAt)

  // 2. High-Performance WebGL Renderer
  renderer = new THREE.WebGLRenderer({
    canvas: canvas.value,
    antialias: !isMobile,
    alpha: true,
    powerPreference: 'high-performance',
  })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))

  // 3. Studio Celestial Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.45)
  scene.add(ambientLight)

  const sunLight = new THREE.DirectionalLight(0xe0f2fe, 2.4)
  sunLight.position.set(12, 10, 14)
  scene.add(sunLight)

  const distantNebulaLight = new THREE.PointLight(0x38bdf8, 1.5, 40, 1.2)
  distantNebulaLight.position.set(-8, 6, -10)
  scene.add(distantNebulaLight)

  // 4. Master Space Group
  spaceMasterGroup = new THREE.Group()
  scene.add(spaceMasterGroup)

  // 5. Environmental 3D Planets (Establishing rich foreground, midground & background depth)
  buildEnvironmentalPlanets()

  // 6. Multi-Layer Deep Space Starfield & Cosmic Nebula
  buildDeepSpaceCosmos()

  // 7. Technology Stars in 3D Space
  buildTechnologyStars()

  // 8. Dynamic Constellation Lines
  buildDynamicConstellationLines()

  // 9. Calculate Category Centroids
  calculateCategoryCentroids()

  updateVisualHighlights()

  // 10. Cinematic Open Space Render Loop
  let lastTime = performance.now()
  function animate(now: number) {
    animFrameId = requestAnimationFrame(animate)
    const delta = Math.min((now - lastTime) / 1000, 0.1)
    lastTime = now

    // Smooth Orbit Drag / Gentle Idle Drift
    if (spaceMasterGroup) {
      if (!isDragging) {
        targetOrbitRotY += delta * 0.025
      }
      orbitRotY = THREE.MathUtils.lerp(orbitRotY, targetOrbitRotY, 0.065)
      orbitRotX = THREE.MathUtils.clamp(THREE.MathUtils.lerp(orbitRotX, targetOrbitRotX, 0.065), -0.65, 0.65)

      spaceMasterGroup.rotation.y = orbitRotY
      spaceMasterGroup.rotation.x = orbitRotX
    }

    // Environmental Planet Slow Axial Rotation
    if (celestialPlanetMesh) {
      celestialPlanetMesh.rotation.y += delta * 0.035
    }

    // Dynamic Line Opacity Interpolation (Smooth reveal and fade of constellations)
    lineRuntimes.forEach(lr => {
      lr.currentOpacity = THREE.MathUtils.lerp(lr.currentOpacity, lr.targetOpacity, delta * 4.5)
      const lineMat = lr.lineMesh.material as THREE.LineBasicMaterial
      lineMat.opacity = lr.currentOpacity
      lr.lineMesh.visible = lr.currentOpacity > 0.015
    })

    // Gentle Breathing Pulse for Active/Selected Star
    const curStarId = selectedStarId.value
    starRuntimes.forEach(sr => {
      const isSel = sr.star.id === curStarId
      const isHov = sr.star.id === hoveredStarId.value

      const scaleMult = isSel ? (1.35 + Math.sin(now * 0.003) * 0.08) : (isHov ? 1.25 : 1.0)
      const finalScale = sr.baseScale * scaleMult
      sr.spriteMesh.scale.set(finalScale, finalScale, 1)

      if (sr.glowRing) {
        sr.glowRing.visible = isSel || isHov
        if (sr.glowRing.visible) {
          sr.glowRing.rotation.z += delta * 0.5
        }
      }
    })

    // Smooth Camera Gliding Transition
    if (camera) {
      currentCameraPos.lerp(targetCameraPos, delta * 2.8)
      currentCameraLookAt.lerp(targetCameraLookAt, delta * 3.2)
      camera.position.copy(currentCameraPos)
      camera.lookAt(currentCameraLookAt)
    }

    // Update Projected 2D Screen Positions for Labels and Tooltips
    updateProjectedPositions()

    if (renderer && scene && camera) {
      renderer.render(scene, camera)
    }
  }

  animFrameId = requestAnimationFrame(animate)
}

function buildEnvironmentalPlanets() {
  if (!spaceMasterGroup) return

  // Single Majestic Ringed Celestial Body in the distant background (z = -8.5)
  const planetGeo = new THREE.SphereGeometry(1.35, 48, 48)
  const planetMat = new THREE.MeshStandardMaterial({
    map: createGasGiantTexture(),
    roughness: 0.65,
    metalness: 0.15,
  })
  celestialPlanetMesh = new THREE.Mesh(planetGeo, planetMat)
  celestialPlanetMesh.position.set(6.8, 3.4, -8.5)
  spaceMasterGroup.add(celestialPlanetMesh)

  // Subtle Atmospheric Fresnel Rim Glow
  const atmosGeo = new THREE.SphereGeometry(1.41, 32, 32)
  const atmosMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.15,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
  })
  const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat)
  celestialPlanetMesh.add(atmosMesh)

  // Delicate Planetary Ring
  const ringGeo = new THREE.RingGeometry(1.7, 2.55, 64)
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.20,
    side: THREE.DoubleSide,
  })
  planetaryRingMesh = new THREE.Mesh(ringGeo, ringMat)
  planetaryRingMesh.rotation.x = Math.PI / 2.3
  planetaryRingMesh.rotation.y = 0.25
  celestialPlanetMesh.add(planetaryRingMesh)
}

function buildDeepSpaceCosmos() {
  // 1. Distant Starfield (1,500 pinprick stars)
  const count = 1500
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {
    const r = 12 + Math.random() * 26
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1) - Math.PI / 2

    positions[i * 3] = r * Math.cos(phi) * Math.cos(theta)
    positions[i * 3 + 1] = r * Math.sin(phi)
    positions[i * 3 + 2] = r * Math.cos(phi) * Math.sin(theta)

    const cChoice = Math.random()
    if (cChoice > 0.75) {
      colors[i * 3] = 0.35; colors[i * 3 + 1] = 0.75; colors[i * 3 + 2] = 0.98
    } else if (cChoice > 0.5) {
      colors[i * 3] = 0.65; colors[i * 3 + 1] = 0.55; colors[i * 3 + 2] = 0.95
    } else {
      colors[i * 3] = 0.82; colors[i * 3 + 1] = 0.88; colors[i * 3 + 2] = 0.96
    }
  }

  const starGeo = new THREE.BufferGeometry()
  starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const starMat = new THREE.PointsMaterial({
    size: 0.045,
    vertexColors: true,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending,
  })

  const deepStars = new THREE.Points(starGeo, starMat)
  scene!.add(deepStars)

  // 2. Subtle Cosmic Dust / Nebula Particles
  const dustCount = 200
  const dustPos = new Float32Array(dustCount * 3)
  for (let i = 0; i < dustCount; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 24
    dustPos[i * 3 + 1] = (Math.random() - 0.5) * 16
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * 16 - 2
  }
  const dustGeo = new THREE.BufferGeometry()
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3))
  const dustMat = new THREE.PointsMaterial({
    color: 0x38bdf8,
    size: 0.08,
    transparent: true,
    opacity: 0.25,
    blending: THREE.AdditiveBlending,
  })
  scene!.add(new THREE.Points(dustGeo, dustMat))
}

function buildTechnologyStars() {
  starRuntimes.length = 0
  pickableObjects.length = 0

  const ringGeo = new THREE.RingGeometry(0.12, 0.14, 32)

  starsData.forEach(star => {
    const cat = categories.find(c => c.id === star.categoryId)
    const starColor = cat ? cat.color : '#38bdf8'

    const nodeGroup = new THREE.Group()
    nodeGroup.position.set(...star.pos)
    spaceMasterGroup!.add(nodeGroup)

    // Luminous Star Sprite
    const texture = createStarSpriteTexture(starColor)
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      color: 0xffffff,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const spriteMesh = new THREE.Sprite(spriteMat)

    const baseScale = 0.38 * star.magnitude
    spriteMesh.scale.set(baseScale, baseScale, 1)
    spriteMesh.userData = { id: star.id }
    nodeGroup.add(spriteMesh)

    // Ring target reticle for active selection
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(starColor),
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    })
    const glowRing = new THREE.Mesh(ringGeo, ringMat)
    glowRing.visible = false
    nodeGroup.add(glowRing)

    // Invisible larger hit sphere for effortless touch/click targeting
    const hitGeo = new THREE.SphereGeometry(0.26, 8, 8)
    const hitMat = new THREE.MeshBasicMaterial({ visible: false })
    const hitMesh = new THREE.Mesh(hitGeo, hitMat)
    hitMesh.userData = { id: star.id }
    nodeGroup.add(hitMesh)
    pickableObjects.push(hitMesh)

    starRuntimes.push({
      star,
      group: nodeGroup,
      spriteMesh,
      glowRing,
      baseScale,
    })
  })
}

function buildDynamicConstellationLines() {
  lineRuntimes.length = 0

  CONSTELLATION_EDGES.forEach(([uId, vId]) => {
    const u = starsData.find(s => s.id === uId)
    const v = starsData.find(s => s.id === vId)
    if (!u || !v) return

    const isInterConstellation = u.categoryId !== v.categoryId
    const categoryId = isInterConstellation ? 'bridge' : u.categoryId
    const cat = categories.find(c => c.id === u.categoryId)
    const lineColor = isInterConstellation ? 0x475569 : (cat ? cat.hex : 0x38bdf8)

    const points = [new THREE.Vector3(...u.pos), new THREE.Vector3(...v.pos)]
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points)
    const lineMat = new THREE.LineBasicMaterial({
      color: lineColor,
      transparent: true,
      opacity: 0.0, // Initially invisible, revealed dynamically!
      blending: THREE.AdditiveBlending,
    })
    const lineMesh = new THREE.Line(lineGeo, lineMat)
    lineMesh.visible = false
    spaceMasterGroup!.add(lineMesh)

    lineRuntimes.push({
      u,
      v,
      lineMesh,
      isInterConstellation,
      categoryId,
      currentOpacity: 0.0,
      targetOpacity: 0.0,
    })
  })
}

function calculateCategoryCentroids() {
  categoryCentroids.clear()

  categories.forEach(cat => {
    const catStars = starsData.filter(s => s.categoryId === cat.id)
    if (catStars.length === 0) return

    const center = new THREE.Vector3()
    catStars.forEach(s => {
      center.add(new THREE.Vector3(...s.pos))
    })
    center.divideScalar(catStars.length)
    center.y += 0.35 // Position label slightly above constellation
    categoryCentroids.set(cat.id, center)
  })
}

function updateVisualHighlights() {
  const activeCatId = selectedCategoryId.value
  const activeStarId = selectedStarId.value

  // 1. Update Star Sprite Opacities & Colors
  starRuntimes.forEach(sr => {
    const isThisCategory = !activeCatId || sr.star.categoryId === activeCatId
    const isThisStar = sr.star.id === activeStarId

    const mat = sr.spriteMesh.material
    if (isThisStar) {
      mat.opacity = 1.0
    } else if (isThisCategory) {
      mat.opacity = activeCatId ? 0.95 : 0.85
    } else {
      mat.opacity = 0.20 // Dim unrelated constellations softly
    }

    if (sr.glowRing) {
      sr.glowRing.visible = isThisStar
    }
  })

  // 2. Dynamic Constellation Line Opacity (Key feature: only reveal relevant lines!)
  lineRuntimes.forEach(lr => {
    const connectsSelectedStar = lr.u.id === activeStarId || lr.v.id === activeStarId
    const isThisCat = activeCatId && lr.categoryId === activeCatId

    if (connectsSelectedStar) {
      lr.targetOpacity = 0.85
      const mat = lr.lineMesh.material as THREE.LineBasicMaterial
      mat.color.setHex(0x38bdf8)
    } else if (isThisCat && !lr.isInterConstellation) {
      lr.targetOpacity = 0.50
      const cat = categories.find(c => c.id === lr.categoryId)
      if (cat) {
        const mat = lr.lineMesh.material as THREE.LineBasicMaterial
        mat.color.setHex(cat.hex)
      }
    } else if (!activeCatId) {
      // In galactic overview, keep lines very faint and subtle
      lr.targetOpacity = lr.isInterConstellation ? 0.05 : 0.12
    } else {
      // Faded out when other constellation is selected
      lr.targetOpacity = 0.0
    }
  })
}

function updateProjectedPositions() {
  if (!camera || !container.value || !spaceMasterGroup) return
  const w = container.value.clientWidth
  const h = container.value.clientHeight

  // Update Hover Star projected position
  if (hoveredStar.value) {
    const pos = new THREE.Vector3(...hoveredStar.value.pos)
    pos.applyMatrix4(spaceMasterGroup.matrixWorld)
    const projected = pos.project(camera)
    hoverScreenPos.value = {
      x: (projected.x * 0.5 + 0.5) * w,
      y: (-projected.y * 0.5 + 0.5) * h,
    }
  }

  // Update Category Label Positions
  const labels: ProjectedLabel[] = []
  categoryCentroids.forEach((pos3D, catId) => {
    const cat = categories.find(c => c.id === catId)
    if (!cat) return

    const worldPos = pos3D.clone().applyMatrix4(spaceMasterGroup!.matrixWorld)
    const projected = worldPos.clone().project(camera!)

    // Visible only if in front of camera
    const isFacing = projected.z < 1.0

    labels.push({
      id: cat.id,
      name: `${cat.code} // ${cat.name.toUpperCase()}`,
      color: cat.color,
      screenX: (projected.x * 0.5 + 0.5) * w,
      screenY: (-projected.y * 0.5 + 0.5) * h,
      visible: isFacing,
    })
  })
  projectedLabels.value = labels
}

// -------------------------------------------------------------
// USER INTERACTION HANDLERS (Drag, Orbit, Tap)
// -------------------------------------------------------------
function onPointerDown(e: PointerEvent) {
  isDragging = true
  prevPointerX = e.clientX
  prevPointerY = e.clientY
  pointerStartX = e.clientX
  pointerStartY = e.clientY
}

function onPointerMove(e: PointerEvent) {
  if (!container.value) return
  const rect = container.value.getBoundingClientRect()
  mouseNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
  mouseNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

  if (isDragging) {
    const dx = e.clientX - prevPointerX
    const dy = e.clientY - prevPointerY
    prevPointerX = e.clientX
    prevPointerY = e.clientY

    targetOrbitRotY += dx * 0.005
    targetOrbitRotX = THREE.MathUtils.clamp(targetOrbitRotX + dy * 0.005, -0.65, 0.65)
  } else {
    checkRaycast(false)
  }
}

function onPointerUp(e: PointerEvent) {
  if (isDragging) {
    const dist = Math.hypot(e.clientX - pointerStartX, e.clientY - pointerStartY)
    if (dist < 6) {
      checkRaycast(true)
    }
  }
  isDragging = false
  if (canvas.value) canvas.value.style.cursor = 'grab'
}

function onWheel(e: WheelEvent) {
  e.preventDefault()
  targetCameraPos.z = THREE.MathUtils.clamp(targetCameraPos.z + e.deltaY * 0.003, 2.5, 8.5)
}

function checkRaycast(isClick: boolean) {
  if (!camera || !container.value || !scene) return

  raycaster.setFromCamera(mouseNDC, camera)
  const hits = raycaster.intersectObjects(pickableObjects, true)

  if (hits.length > 0) {
    const hitObj = hits[0].object
    const id = hitObj.userData?.id
    if (id) {
      if (isClick) {
        selectStarById(id)
      } else {
        hoveredStarId.value = id
        if (canvas.value) canvas.value.style.cursor = 'pointer'
      }
      return
    }
  }

  if (!isClick) {
    hoveredStarId.value = null
    if (canvas.value) canvas.value.style.cursor = isDragging ? 'grabbing' : 'grab'
  }
}

function onBackgroundClick() {
  // If user clicks on empty space outside panel, keep state clean
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
  markSectionReady('skills')
  window.addEventListener('resize', onResize)

  unregisterContentNav = registerContentNavigator((direction) => {
    const list = starsData.map(s => s.id)
    const curr = list.indexOf(selectedStarId.value)
    if (direction === 'prev') {
      const prevIdx = (curr - 1 + list.length) % list.length
      selectStarById(list[prevIdx])
    } else {
      const nextIdx = (curr + 1) % list.length
      selectStarById(list[nextIdx])
    }
  })
})

onBeforeUnmount(() => {
  unregisterContentNav?.()
  window.removeEventListener('resize', onResize)

  if (animFrameId) cancelAnimationFrame(animFrameId)

  if (scene) {
    scene.traverse(obj => {
      if (obj instanceof THREE.Mesh || obj instanceof THREE.Points || obj instanceof THREE.Line || obj instanceof THREE.Sprite) {
        if (obj.geometry) obj.geometry.dispose()
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => {
              if (m.map) m.map.dispose()
              m.dispose()
            })
          } else {
            if (obj.material.map) obj.material.map.dispose()
            obj.material.dispose()
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
})
</script>

<style scoped>
.skills-space-universe-scene {
  background: radial-gradient(circle at 55% 45%, #040812 0%, #020409 65%, #010205 100%);
}

.cosmic-deep-glow {
  background:
    radial-gradient(circle at 75% 25%, rgba(56, 189, 248, 0.06) 0%, transparent 55%),
    radial-gradient(circle at 25% 75%, rgba(167, 139, 250, 0.05) 0%, transparent 60%);
}

.space-celestial-grid {
  background-size: 48px 48px;
  background-image:
    linear-gradient(to right, rgba(255, 255, 255, 0.06) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.06) 1px, transparent 1px);
}

.space-ambient-vignette {
  background: radial-gradient(circle at 50% 50%, transparent 40%, rgba(1, 2, 5, 0.75) 85%, #010205 100%);
}

@media (prefers-reduced-motion: reduce) {
  .editorial-panel {
    transition: opacity 150ms ease !important;
  }
}
</style>
