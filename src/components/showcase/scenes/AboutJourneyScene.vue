<template>
  <div
    ref="container"
    class="about-java-scene relative w-full h-full select-none overflow-hidden bg-[#04060a]"
    @click="onBackgroundClick"
  >
    <!-- WebGL Canvas -->
    <canvas
      ref="canvas"
      class="w-full h-full block cursor-grab active:cursor-grabbing outline-none"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @wheel="onWheel"
    ></canvas>

    <!-- Deep Space Atmospheric Vignette -->
    <div class="pointer-events-none absolute inset-0 orbital-atmosphere-vignette" aria-hidden="true"></div>

    <!-- Sequence Stage Indicator (Pill during intro) -->
    <Transition name="fade">
      <div
        v-if="!introCompleted"
        class="pointer-events-none absolute top-6 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1 rounded-full bg-zinc-950/85 border border-white/15 backdrop-blur-md flex items-center gap-2 text-[10px] font-mono text-zinc-300 shadow-2xl"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping"></span>
        <span class="tracking-wider uppercase text-zinc-200 font-medium">
          {{ stageLabel }}
        </span>
      </div>
    </Transition>

    <!-- Editorial Section Typography (Left Side - Revealed in Phase 4) -->
    <div
      class="pointer-events-none absolute top-16 sm:top-20 left-6 sm:left-12 z-10 max-w-xs space-y-2.5 transition-all duration-700 ease-out"
      :class="showDescription ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'"
    >
      <div class="flex items-center gap-2">
        <span class="font-mono text-[10px] text-zinc-400 tracking-widest font-semibold">02</span>
        <span class="w-3.5 h-[1px] bg-zinc-600"></span>
        <span class="font-mono text-[10px] text-zinc-300 uppercase tracking-widest font-medium">ABOUT // BASE LOCATION</span>
      </div>
      <h1 class="text-2xl sm:text-3xl font-light tracking-tight text-zinc-100 font-sans leading-tight">
        Sidoarjo, Indonesia
      </h1>
      <p class="text-[11.5px] text-zinc-400 leading-relaxed font-sans max-w-[270px] font-normal">
        Based in Sidoarjo, East Java. Engineering high-performance cross-platform software, mobile clients, and distributed architectures at Wolkk.
      </p>

      <!-- Live Clock & Status Badge -->
      <div class="pt-1 flex items-center gap-2.5">
        <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-900/90 border border-white/10 text-[10px] font-mono text-zinc-300 shadow-sm backdrop-blur-sm">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{{ localTime }} WIB</span>
        </div>
        <span class="font-mono text-[9px] text-zinc-400 tracking-wide uppercase">UTC+7 · EAST JAVA</span>
      </div>
    </div>

    <!-- 3D Avatar Interactive Tooltip (Projected above 3D Avatar in Phase 4) -->
    <Transition name="fade">
      <div
        v-if="showDescription && avatarScreenPos"
        class="pointer-events-none absolute z-20 flex flex-col items-center -translate-x-1/2 -translate-y-full transition-all duration-300"
        :style="{ left: `${avatarScreenPos.x}px`, top: `${avatarScreenPos.y - 18}px` }"
      >
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-950/90 backdrop-blur-md border border-sky-500/40 shadow-[0_0_25px_rgba(56,189,248,0.3)]">
          <span class="w-2 h-2 rounded-full bg-sky-400"></span>
          <span class="font-mono text-[10px] text-zinc-100 uppercase tracking-wider font-semibold">
            Tegar Nugroho
          </span>
          <span class="text-zinc-600">·</span>
          <span class="font-mono text-[9.5px] text-sky-400 uppercase tracking-wider">
            Sidoarjo, East Java
          </span>
        </div>
        <div class="w-[1px] h-3.5 bg-gradient-to-b from-sky-400/80 to-transparent"></div>
      </div>
    </Transition>

    <!-- Hovered Feature Tooltip -->
    <div
      v-if="hoveredFeature && (!avatarScreenPos || hoveredFeature.id !== 'avatar')"
      class="pointer-events-none absolute z-20 px-2.5 py-1 rounded-md bg-zinc-950/90 text-zinc-200 border border-white/15 shadow-2xl font-mono text-[9px] uppercase tracking-wider -translate-x-1/2 -translate-y-8 transition-opacity duration-150"
      :style="{ left: `${hoverScreenPos.x}px`, top: `${hoverScreenPos.y}px` }"
    >
      {{ hoveredFeature.name }} · {{ hoveredFeature.type }}
    </div>

    <!-- Compact Editorial Description Panel (Bottom-Left - Revealed in Phase 4) -->
    <div
      class="editorial-panel absolute bottom-6 sm:bottom-10 left-6 sm:left-12 right-6 sm:right-auto z-20 max-w-sm sm:w-88 pointer-events-auto p-4 sm:p-5 rounded-xl border border-white/10 bg-zinc-950/85 backdrop-blur-xl shadow-2xl space-y-3.5 transition-all duration-700 ease-out"
      :class="showDescription ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'"
      @click.stop
    >
      <!-- Panel Header -->
      <div class="space-y-1">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
            <span class="font-mono text-[9px] uppercase tracking-[0.2em] text-sky-400 font-semibold">
              CURRENT LOCATION
            </span>
          </div>
          <span class="font-mono text-[9px] text-zinc-400 tracking-wider">
            7.4478° S, 112.7183° E
          </span>
        </div>
        <h2 class="text-base sm:text-lg font-medium tracking-tight text-white flex items-center gap-2">
          Sidoarjo Regency
        </h2>
        <p class="text-[11px] font-mono text-zinc-400">
          East Java (Jawa Timur) · Pulau Jawa, Indonesia
        </p>
      </div>

      <!-- Quick Metrics Grid -->
      <div class="grid grid-cols-2 gap-2 pt-1 border-t border-white/5 text-[10.5px] font-mono">
        <div class="p-2 rounded bg-white/[0.02] border border-white/5 space-y-0.5">
          <span class="text-[9px] text-zinc-500 uppercase tracking-wider block">CURRENT ROLE</span>
          <span class="text-zinc-200 font-medium truncate block">Flutter Dev @ Wolkk</span>
        </div>
        <div class="p-2 rounded bg-white/[0.02] border border-white/5 space-y-0.5">
          <span class="text-[9px] text-zinc-500 uppercase tracking-wider block">TIMEZONE</span>
          <span class="text-zinc-200 font-medium block">WIB (UTC+7)</span>
        </div>
        <div class="p-2 rounded bg-white/[0.02] border border-white/5 space-y-0.5">
          <span class="text-[9px] text-zinc-500 uppercase tracking-wider block">EXPERIENCE</span>
          <span class="text-zinc-200 font-medium block">8+ Years Production</span>
        </div>
        <div class="p-2 rounded bg-white/[0.02] border border-white/5 space-y-0.5">
          <span class="text-[9px] text-zinc-500 uppercase tracking-wider block">AVAILABILITY</span>
          <span class="text-emerald-400 font-medium block">Open for Remote / OSS</span>
        </div>
      </div>

      <!-- View Controls & Action Footer -->
      <div class="pt-2 border-t border-white/5 flex items-center justify-between">
        <div class="flex items-center gap-1.5">
          <button
            type="button"
            class="px-2.5 py-1 rounded text-[10px] font-mono transition-colors cursor-pointer border"
            :class="viewMode === 'sidoarjo' ? 'bg-sky-500/20 text-sky-300 border-sky-500/40' : 'text-zinc-400 hover:text-white hover:bg-white/10 border-white/10'"
            @click="focusSidoarjo"
          >
            SIDOARJO
          </button>
          <button
            type="button"
            class="px-2.5 py-1 rounded text-[10px] font-mono transition-colors cursor-pointer border"
            :class="viewMode === 'overview' ? 'bg-sky-500/20 text-sky-300 border-sky-500/40' : 'text-zinc-400 hover:text-white hover:bg-white/10 border-white/10'"
            @click="focusOverview"
          >
            OVERVIEW
          </button>
          <button
            type="button"
            class="px-2 py-1 rounded text-[10px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
            title="Replay sequence animation"
            @click="restartSequence"
          >
            ↻
          </button>
        </div>

        <button
          type="button"
          @click="viewContact"
          class="inline-flex items-center gap-1 text-[10.5px] font-mono text-sky-400 hover:text-sky-300 transition-colors cursor-pointer font-medium tracking-wider uppercase"
        >
          <span>GET IN TOUCH</span>
          <span>→</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { registerContentNavigator, setSection } from '@/composables/useShowcase'

// Volcanic Mountains on Java (Topographic Displacement Peaks)
const volcanicPeaks = [
  { name: 'Semeru', lat: -8.11, lng: 112.92, h: 0.44, radius: 0.17 }, // Highest in Java (3,676m)
  { name: 'Bromo', lat: -7.94, lng: 112.95, h: 0.32, radius: 0.14 },  // Famous Caldera
  { name: 'Arjuno-Welirang', lat: -7.76, lng: 112.58, h: 0.38, radius: 0.16 }, // West of Sidoarjo (3,339m)
  { name: 'Lawu', lat: -7.63, lng: 111.19, h: 0.36, radius: 0.16 },   // Solo / Karanganyar (3,265m)
  { name: 'Merapi', lat: -7.54, lng: 110.44, h: 0.34, radius: 0.14 }, // Yogyakarta (2,930m)
  { name: 'Merbabu', lat: -7.45, lng: 110.43, h: 0.35, radius: 0.14 },
  { name: 'Slamet', lat: -7.24, lng: 109.21, h: 0.41, radius: 0.18 }, // Central Java (3,428m)
  { name: 'Sindoro-Sumbing', lat: -7.30, lng: 109.99, h: 0.35, radius: 0.15 },
  { name: 'Ciremai', lat: -6.89, lng: 108.40, h: 0.34, radius: 0.15 }, // Kuningan (3,078m)
  { name: 'Tangkuban Perahu', lat: -6.76, lng: 107.60, h: 0.28, radius: 0.14 },
  { name: 'Gede-Pangrango', lat: -6.78, lng: 106.98, h: 0.35, radius: 0.16 }, // West Java (3,008m)
  { name: 'Salak', lat: -6.71, lng: 106.73, h: 0.28, radius: 0.14 },
  { name: 'Raung-Ijen', lat: -8.06, lng: 114.24, h: 0.37, radius: 0.16 }, // East Java (3,332m)
]

// Geographic Bounding Box for the Satellite View
const LNG_MIN = 104.5
const LNG_MAX = 115.5
const LAT_MIN = -9.2
const LAT_MAX = -5.4
const TERRAIN_WIDTH = 11.0
const TERRAIN_DEPTH = 3.8

function geoTo3D(lat: number, lng: number): { x: number; z: number } {
  const u = (lng - LNG_MIN) / (LNG_MAX - LNG_MIN)
  const v = (LAT_MAX - lat) / (LAT_MAX - LAT_MIN)
  const x = (u - 0.5) * TERRAIN_WIDTH
  const z = (v - 0.5) * TERRAIN_DEPTH
  return { x, z }
}

// Sidoarjo Hero Location
const SIDOARJO_GEO = { lat: -7.4478, lng: 112.7183 }
const sda3D = geoTo3D(SIDOARJO_GEO.lat, SIDOARJO_GEO.lng)

// Live WIB Clock
const localTime = ref('')
let timerInterval = 0
function updateClock() {
  const now = new Date()
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const jktDate = new Date(utc + 3600000 * 7)
  const hh = String(jktDate.getHours()).padStart(2, '0')
  const mm = String(jktDate.getMinutes()).padStart(2, '0')
  const ss = String(jktDate.getSeconds()).padStart(2, '0')
  localTime.value = `${hh}:${mm}:${ss}`
}

// Sequence Phases
type IntroPhase = 'island' | 'marker' | 'avatar' | 'desc'
const currentPhase = ref<IntroPhase>('island')
const showDescription = ref(false)
const introCompleted = ref(false)

const stageLabel = computed(() => {
  switch (currentPhase.value) {
    case 'island': return 'Orbital Satellite View // Java Island'
    case 'marker': return 'Locating Sidoarjo, East Java...'
    case 'avatar': return 'Synchronizing Presence...'
    case 'desc': return 'Location Synchronized'
  }
})

const viewMode = ref<'overview' | 'sidoarjo'>('overview')
const hoveredFeature = ref<{ name: string; type: string; id: string } | null>(null)
const hoverScreenPos = ref({ x: 0, y: 0 })
const avatarScreenPos = ref<{ x: number; y: number } | null>(null)

function viewContact() {
  setSection('contact')
}

// Three.js Core Variables
const container = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let animFrameId = 0
let sceneGroup: THREE.Group | null = null

// 3D Objects
let cloudsMesh: THREE.Mesh | null = null
let sidoarjoMarkerGroup: THREE.Group | null = null
let verticalBeamMesh: THREE.Mesh | null = null
let avatarGroup: THREE.Group | null = null
let avatarHaloMesh: THREE.Mesh | null = null
let radarRings: THREE.Mesh[] = []

// Target Camera Positions
const camTargetPos = new THREE.Vector3()
const camLookAtTarget = new THREE.Vector3()
const currentLookAt = new THREE.Vector3()

// Mouse / Orbit Controls
let isDragging = false
let prevPointerX = 0
let prevPointerY = 0
let targetRotY = 0
let targetRotX = 0
const raycaster = new THREE.Raycaster()
const mouseNDC = new THREE.Vector2(-999, -999)

let unregisterContentNav: (() => void) | null = null
let sequenceTimerIds: number[] = []

function focusSidoarjo() {
  viewMode.value = 'sidoarjo'
  const isMobile = window.innerWidth < 768
  // Perfectly framed: comfortable distance so Tegar's face and the Sidoarjo terrain are both clearly visible
  camTargetPos.set(sda3D.x + (isMobile ? 0 : 0.8), isMobile ? 1.85 : 1.65, sda3D.z + (isMobile ? 3.8 : 3.2))
  camLookAtTarget.set(sda3D.x, 0.72, sda3D.z)
}

function focusOverview() {
  viewMode.value = 'overview'
  const isMobile = window.innerWidth < 768
  camTargetPos.set(isMobile ? 0 : 0.4, isMobile ? 5.5 : 4.4, isMobile ? 6.0 : 5.0)
  camLookAtTarget.set(0, 0, 0)
}

// Staged Choreographed Intro Sequence
function startIntroSequence() {
  sequenceTimerIds.forEach(id => clearTimeout(id))
  sequenceTimerIds = []

  currentPhase.value = 'island'
  showDescription.value = false
  introCompleted.value = false
  viewMode.value = 'overview'

  focusOverview()
  if (camera) {
    camera.position.copy(camTargetPos)
    currentLookAt.copy(camLookAtTarget)
    camera.lookAt(currentLookAt)
  }

  // Reset 3D scales
  if (sidoarjoMarkerGroup) sidoarjoMarkerGroup.scale.set(0.001, 0.001, 0.001)
  if (verticalBeamMesh) verticalBeamMesh.scale.set(0.001, 0.001, 0.001)
  if (avatarGroup) avatarGroup.scale.set(0.001, 0.001, 0.001)
  radarRings.forEach(r => {
    ;(r.material as THREE.MeshBasicMaterial).opacity = 0
  })

  // Phase 2: Marker appears at Sidoarjo
  const t1 = window.setTimeout(() => {
    currentPhase.value = 'marker'
    focusSidoarjo()

    let progress = 0
    const markerInterval = setInterval(() => {
      progress += 0.06
      if (progress >= 1) {
        progress = 1
        clearInterval(markerInterval)
      }
      const s = Math.sin(progress * Math.PI * 0.5) * (1 + (1 - progress) * 0.35)
      if (sidoarjoMarkerGroup) sidoarjoMarkerGroup.scale.set(s, s, s)
    }, 16)
  }, 1000)
  sequenceTimerIds.push(t1)

  // Phase 3: Marker morphs into 3D Avatar
  const t2 = window.setTimeout(() => {
    currentPhase.value = 'avatar'

    let progress = 0
    const avatarInterval = setInterval(() => {
      progress += 0.05
      if (progress >= 1) {
        progress = 1
        clearInterval(avatarInterval)
      }

      if (verticalBeamMesh) {
        verticalBeamMesh.scale.set(1, progress, 1)
      }

      const s = Math.sin(progress * Math.PI * 0.5) * (1 + (1 - progress) * 0.25)
      if (avatarGroup) {
        avatarGroup.scale.set(s, s, s)
      }
    }, 16)
  }, 2400)
  sequenceTimerIds.push(t2)

  // Phase 4: Show Tooltip & Sections Description
  const t3 = window.setTimeout(() => {
    currentPhase.value = 'desc'
    showDescription.value = true
    introCompleted.value = true
  }, 3600)
  sequenceTimerIds.push(t3)
}

function restartSequence() {
  startIntroSequence()
}

function initScene() {
  if (!container.value || !canvas.value) return

  const width = container.value.clientWidth || window.innerWidth
  const height = container.value.clientHeight || window.innerHeight
  const isMobile = width < 768

  // 1. Scene & Camera
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100)

  // 2. High-Performance WebGL Renderer
  renderer = new THREE.WebGLRenderer({
    canvas: canvas.value,
    antialias: !isMobile,
    alpha: true,
    powerPreference: 'high-performance',
  })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.15

  // 3. Natural Orbital Sunlight & Ambient Atmospheric Lighting
  const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.65)
  scene.add(ambientLight)

  // Main Directional Sun (Casting crisp 3D shadow relief across Java's volcanic ridges)
  const sunLight = new THREE.DirectionalLight(0xfffaed, 2.0)
  sunLight.position.set(7, 12, 6)
  scene.add(sunLight)

  // Blue Rayleigh Atmospheric Fill
  const skyFill = new THREE.DirectionalLight(0x38bdf8, 0.45)
  skyFill.position.set(-8, 5, -6)
  scene.add(skyFill)

  // Hero Point Light at Sidoarjo
  const sidoarjoBeaconLight = new THREE.PointLight(0x38bdf8, 2.5, 5.0, 1.2)
  sidoarjoBeaconLight.position.set(sda3D.x, 1.2, sda3D.z)
  scene.add(sidoarjoBeaconLight)

  // 4. Main Stage Group
  sceneGroup = new THREE.Group()
  scene.add(sceneGroup)

  // 5. Build 3D TOPOGRAPHIC RELIEF TERRAIN MESH
  const terrainGeo = new THREE.PlaneGeometry(TERRAIN_WIDTH, TERRAIN_DEPTH, 256, 128)
  const posAttr = terrainGeo.attributes.position

  // Calculate 3D Topographic Elevation for Every Vertex
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i)
    const y = posAttr.getY(i)

    // Convert plane (x, y) to (lat, lng)
    const u = x / TERRAIN_WIDTH + 0.5
    const v = y / TERRAIN_DEPTH + 0.5
    const lng = LNG_MIN + u * (LNG_MAX - LNG_MIN)
    const lat = LAT_MIN + v * (LAT_MAX - LAT_MIN)

    // Calculate Gaussian elevation displacement from volcanic summits
    let elevation = 0
    volcanicPeaks.forEach(vp => {
      const d2 = (lat - vp.lat) ** 2 + (lng - vp.lng) ** 2
      elevation += vp.h * Math.exp(-d2 / (2 * vp.radius ** 2))
    })

    // Natural volcanic mountain spine elevation
    posAttr.setZ(i, elevation)
  }
  terrainGeo.computeVertexNormals()

  // Real High-Resolution Photographic Satellite Imagery (Google Maps / Earth Satellite Style)
  const textureLoader = new THREE.TextureLoader()
  const satelliteTexture = textureLoader.load('/textures/java_satellite.jpg')
  satelliteTexture.colorSpace = THREE.SRGBColorSpace

  const terrainMat = new THREE.MeshStandardMaterial({
    map: satelliteTexture,
    roughness: 0.78,
    metalness: 0.05,
  })

  const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat)
  terrainMesh.rotation.x = -Math.PI / 2
  sceneGroup.add(terrainMesh)

  // 6. Realistic Atmospheric Clouds Layer
  const cloudsTexture = textureLoader.load('/textures/earth/earth_clouds.png')
  cloudsTexture.wrapS = THREE.RepeatWrapping
  cloudsTexture.wrapT = THREE.RepeatWrapping

  const cloudsGeo = new THREE.PlaneGeometry(TERRAIN_WIDTH * 1.1, TERRAIN_DEPTH * 1.1)
  const cloudsMat = new THREE.MeshStandardMaterial({
    map: cloudsTexture,
    transparent: true,
    opacity: 0.38,
    blending: THREE.NormalBlending,
    depthWrite: false,
    roughness: 0.9,
  })
  cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat)
  cloudsMesh.rotation.x = -Math.PI / 2
  cloudsMesh.position.y = 0.28 // Floating slightly above the mountain summits
  sceneGroup.add(cloudsMesh)

  // 7. Subtle Datum Grid Underneath the Orbital Surface
  const datumGrid = new THREE.GridHelper(12, 24, 0x1e293b, 0x0f172a)
  datumGrid.position.y = -0.05
  sceneGroup.add(datumGrid)

  // 8. Secondary Landmark Reference Nodes
  const majorCities = [
    { name: 'Jakarta', lat: -6.2088, lng: 106.8456 },
    { name: 'Bandung', lat: -6.9175, lng: 107.6191 },
    { name: 'Semarang', lat: -6.9667, lng: 110.4167 },
    { name: 'Yogyakarta', lat: -7.7956, lng: 110.3695 },
    { name: 'Surabaya', lat: -7.2575, lng: 112.7521 },
    { name: 'Malang', lat: -7.9666, lng: 112.6326 },
  ]
  const cityDotGeo = new THREE.SphereGeometry(0.024, 12, 12)
  const cityDotMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8 })
  majorCities.forEach(c => {
    const { x, z } = geoTo3D(c.lat, c.lng)
    const dot = new THREE.Mesh(cityDotGeo, cityDotMat)
    dot.position.set(x, 0.05, z)
    dot.userData = { name: c.name, type: 'Hub City', id: `city-${c.name}` }
    sceneGroup!.add(dot)
  })

  // 9. SIDOARJO HERO PINPOINT MARKER
  sidoarjoMarkerGroup = new THREE.Group()
  sidoarjoMarkerGroup.position.set(sda3D.x, 0.08, sda3D.z)
  sidoarjoMarkerGroup.scale.set(0.001, 0.001, 0.001)
  sidoarjoMarkerGroup.userData = { name: 'Sidoarjo', type: 'Current Location', id: 'sidoarjo-pin' }
  sceneGroup.add(sidoarjoMarkerGroup)

  // Ground beacon base pin
  const sdaDotGeo = new THREE.SphereGeometry(0.055, 16, 16)
  const sdaDotMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
  const markerDotMesh = new THREE.Mesh(sdaDotGeo, sdaDotMat)
  sidoarjoMarkerGroup.add(markerDotMesh)

  // Pinpoint needle cone
  const needleGeo = new THREE.ConeGeometry(0.04, 0.16, 16)
  const needleMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.7,
    metalness: 0.8,
  })
  const needleMesh = new THREE.Mesh(needleGeo, needleMat)
  needleMesh.rotation.x = Math.PI
  needleMesh.position.y = 0.08
  sidoarjoMarkerGroup.add(needleMesh)

  // Radar Pulse Sonar Rings
  radarRings = []
  for (let i = 0; i < 3; i++) {
    const ringGeo = new THREE.RingGeometry(0.04, 0.055, 32)
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    })
    const ringMesh = new THREE.Mesh(ringGeo, ringMat)
    ringMesh.rotation.x = -Math.PI / 2
    ringMesh.position.set(sda3D.x, 0.085, sda3D.z)
    sceneGroup.add(ringMesh)
    radarRings.push(ringMesh)
  }

  // Vertical Light Conduit Beam (Sidoarjo Ground to 3D Avatar)
  const beamHeight = 0.55
  const beamGeo = new THREE.CylinderGeometry(0.008, 0.008, beamHeight, 12)
  beamGeo.translate(0, beamHeight / 2, 0)
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.55,
  })
  verticalBeamMesh = new THREE.Mesh(beamGeo, beamMat)
  verticalBeamMesh.position.set(sda3D.x, 0.08, sda3D.z)
  verticalBeamMesh.scale.set(0.001, 0.001, 0.001)
  sceneGroup.add(verticalBeamMesh)

  // 10. 3D PHYSICAL AVATAR OBJECT (Morphs in Phase 3)
  avatarGroup = new THREE.Group()
  avatarGroup.position.set(sda3D.x, 0.08 + beamHeight + 0.22, sda3D.z)
  avatarGroup.scale.set(0.001, 0.001, 0.001)
  avatarGroup.userData = { id: 'avatar', name: 'Tegar Nugroho', type: 'Base of Operations' }
  sceneGroup.add(avatarGroup)

  const avatarTexture = textureLoader.load('/assets/avatar.webp')
  avatarTexture.colorSpace = THREE.SRGBColorSpace

  // Medallion Bezel Body
  const medallionGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.06, 48)
  const medallionRimMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.85,
    roughness: 0.2,
  })
  const medallionBody = new THREE.Mesh(medallionGeo, medallionRimMat)
  medallionBody.rotation.x = Math.PI / 2
  avatarGroup.add(medallionBody)

  // Front Face: Avatar Photo (Prominent & sharp)
  const photoGeo = new THREE.CircleGeometry(0.39, 48)
  const photoMat = new THREE.MeshBasicMaterial({
    map: avatarTexture,
    side: THREE.FrontSide,
  })
  const photoDisc = new THREE.Mesh(photoGeo, photoMat)
  photoDisc.position.z = 0.032
  avatarGroup.add(photoDisc)

  // Back Face: Monogram Crest
  const backCanvas = document.createElement('canvas')
  backCanvas.width = 256
  backCanvas.height = 256
  const ctx = backCanvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = '#090d16'
    ctx.fillRect(0, 0, 256, 256)
    ctx.strokeStyle = '#38bdf8'
    ctx.lineWidth = 6
    ctx.beginPath()
    ctx.arc(128, 128, 110, 0, Math.PI * 2)
    ctx.stroke()
    ctx.fillStyle = '#f8fafc'
    ctx.font = 'bold 54px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('TN', 128, 115)
    ctx.fillStyle = '#38bdf8'
    ctx.font = '15px monospace'
    ctx.fillText('SIDOARJO // WOLKK', 128, 165)
  }
  const backTexture = new THREE.CanvasTexture(backCanvas)
  const backMat = new THREE.MeshBasicMaterial({
    map: backTexture,
    side: THREE.BackSide,
  })
  const backDisc = new THREE.Mesh(photoGeo, backMat)
  backDisc.position.z = -0.032
  avatarGroup.add(backDisc)

  // Outer Gimbal Halo Ring
  const haloGeo = new THREE.TorusGeometry(0.48, 0.01, 16, 64)
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.75,
  })
  avatarHaloMesh = new THREE.Mesh(haloGeo, haloMat)
  avatarGroup.add(avatarHaloMesh)

  // 11. Main Render Loop
  let lastTime = performance.now()
  function loop(now: number) {
    animFrameId = requestAnimationFrame(loop)
    const delta = Math.min((now - lastTime) / 1000, 0.1)
    lastTime = now

    // Smooth Camera Transition toward Target View
    if (camera) {
      camera.position.lerp(camTargetPos, 0.05)
      currentLookAt.lerp(camLookAtTarget, 0.05)
      camera.lookAt(currentLookAt)
    }

    // Gentle Orbital Idle Drift
    if (sceneGroup) {
      if (!isDragging && introCompleted.value) {
        targetRotY += delta * 0.012
      }
      sceneGroup.rotation.y = THREE.MathUtils.lerp(sceneGroup.rotation.y, targetRotY, 0.06)
      sceneGroup.rotation.x = THREE.MathUtils.lerp(sceneGroup.rotation.x, targetRotX, 0.06)
    }

    // Drifting Tropical Clouds
    if (cloudsMesh) {
      cloudsMesh.position.x = Math.sin(now * 0.00015) * 0.15
    }

    // Animated Radar Sonar Rings (Active from Phase 2)
    if (currentPhase.value !== 'island') {
      radarRings.forEach((ring, idx) => {
        const progress = ((now * 0.001 + idx * 0.33) % 1)
        const scale = 0.5 + progress * 5.5
        ring.scale.set(scale, scale, 1)
        const mat = ring.material as THREE.MeshBasicMaterial
        mat.opacity = (1 - progress) * 0.65
      })
    }

    // 3D Avatar Dynamic Floating Bobbing & Orientation (Phase 3+)
    if (avatarGroup && currentPhase.value !== 'island' && currentPhase.value !== 'marker') {
      const floatOffset = Math.sin(now * 0.0022) * 0.035
      avatarGroup.position.y = (0.08 + beamHeight + 0.22) + floatOffset

      if (avatarHaloMesh) {
        avatarHaloMesh.rotation.z += delta * 0.6
        avatarHaloMesh.rotation.y = Math.sin(now * 0.001) * 0.3
      }

      if (camera) {
        // Face the user camera directly so the avatar photo is always in full view
        avatarGroup.lookAt(camera.position)
      }
    }

    updateScreenPositions()

    if (renderer && scene && camera) {
      renderer.render(scene, camera)
    }
  }

  animFrameId = requestAnimationFrame(loop)

  // Start the Choreographed Sequence on Mount!
  startIntroSequence()
}

function updateScreenPositions() {
  if (!camera || !container.value || !avatarGroup || !sceneGroup) return
  const w = container.value.clientWidth
  const h = container.value.clientHeight

  const avatarWorldPos = new THREE.Vector3()
  avatarGroup.getWorldPosition(avatarWorldPos)
  const projectedAvatar = avatarWorldPos.clone().project(camera)

  if (projectedAvatar.z < 1 && avatarGroup.scale.x > 0.3) {
    avatarScreenPos.value = {
      x: (projectedAvatar.x * 0.5 + 0.5) * w,
      y: (-projectedAvatar.y * 0.5 + 0.5) * h,
    }
  } else {
    avatarScreenPos.value = null
  }
}

// Interaction Handlers (Drag, Zoom, Raycasting)
function onPointerDown(e: PointerEvent) {
  isDragging = true
  prevPointerX = e.clientX
  prevPointerY = e.clientY
  checkRaycast(e, true)
}

function onPointerMove(e: PointerEvent) {
  if (!container.value) return
  const rect = container.value.getBoundingClientRect()
  mouseNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
  mouseNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

  if (isDragging && sceneGroup) {
    const dx = e.clientX - prevPointerX
    const dy = e.clientY - prevPointerY
    prevPointerX = e.clientX
    prevPointerY = e.clientY

    targetRotY += dx * 0.005
    targetRotX = THREE.MathUtils.clamp(targetRotX + dy * 0.005, -0.35, 0.35)
  } else {
    checkRaycast(e, false)
  }
}

function onPointerUp() {
  isDragging = false
}

function onWheel(e: WheelEvent) {
  e.preventDefault()
  if (viewMode.value === 'sidoarjo') {
    camTargetPos.y = THREE.MathUtils.clamp(camTargetPos.y + e.deltaY * 0.002, 1.2, 3.2)
    camTargetPos.z = THREE.MathUtils.clamp(camTargetPos.z + e.deltaY * 0.003, sda3D.z + 1.4, sda3D.z + 4.2)
  } else {
    camTargetPos.y = THREE.MathUtils.clamp(camTargetPos.y + e.deltaY * 0.003, 2.5, 6.5)
    camTargetPos.z = THREE.MathUtils.clamp(camTargetPos.z + e.deltaY * 0.004, 3.2, 7.8)
  }
}

function checkRaycast(e: PointerEvent, isClick: boolean) {
  if (!camera || !container.value || !scene) return

  raycaster.setFromCamera(mouseNDC, camera)
  const clickableObjects: THREE.Object3D[] = []

  if (avatarGroup) clickableObjects.push(avatarGroup)
  if (sidoarjoMarkerGroup) clickableObjects.push(sidoarjoMarkerGroup)
  if (sceneGroup) {
    sceneGroup.traverse(obj => {
      if (obj.userData?.id) clickableObjects.push(obj)
    })
  }

  const hits = raycaster.intersectObjects(clickableObjects, true)

  if (hits.length > 0) {
    let topObj: THREE.Object3D | null = hits[0].object
    while (topObj && !topObj.userData?.name && topObj.parent && topObj !== scene) {
      topObj = topObj.parent
    }

    if (topObj && topObj.userData?.name) {
      if (isClick) {
        if (topObj.userData.id === 'avatar' || topObj.userData.id === 'sidoarjo-pin') {
          if (viewMode.value === 'sidoarjo') focusOverview()
          else focusSidoarjo()
        }
      } else {
        hoveredFeature.value = {
          name: topObj.userData.name,
          type: topObj.userData.type || 'Location',
          id: topObj.userData.id || 'loc',
        }
        hoverScreenPos.value = { x: e.clientX, y: e.clientY }
        if (canvas.value) canvas.value.style.cursor = 'pointer'
      }
      return
    }
  }

  if (!isClick) {
    hoveredFeature.value = null
    if (canvas.value) canvas.value.style.cursor = isDragging ? 'grabbing' : 'grab'
  }
}

function onBackgroundClick() {
  // Clear hover state
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
  updateClock()
  timerInterval = window.setInterval(updateClock, 1000)

  initScene()
  window.addEventListener('resize', onResize)

  unregisterContentNav = registerContentNavigator(() => {
    if (viewMode.value === 'sidoarjo') focusOverview()
    else focusSidoarjo()
  })
})

onBeforeUnmount(() => {
  if (timerInterval) clearInterval(timerInterval)
  sequenceTimerIds.forEach(id => clearTimeout(id))
  unregisterContentNav?.()
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

<style scoped>
/* Orbital Atmosphere Space Vignette */
.orbital-atmosphere-vignette {
  background: radial-gradient(circle at 50% 50%, rgba(12, 28, 55, 0.15) 0%, rgba(6, 12, 24, 0.7) 65%, #04060a 100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 300ms ease, transform 300ms ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -12px);
}

@media (prefers-reduced-motion: reduce) {
  .editorial-panel {
    transition: opacity 150ms ease !important;
  }
}
</style>
