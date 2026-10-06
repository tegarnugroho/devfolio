<template>
  <div
    ref="container"
    class="about-java-scene relative w-full h-full select-none overflow-hidden bg-[#060709]"
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

    <!-- Extremely Subtle Ambient Architectural Grid & Vignette -->
    <div class="pointer-events-none absolute inset-0 subtle-grid-bg opacity-[0.035]" aria-hidden="true"></div>
    <div class="pointer-events-none absolute inset-0 radial-vignette" aria-hidden="true"></div>

    <!-- Sequence Stage Indicator (Small top pill during intro) -->
    <Transition name="fade">
      <div
        v-if="!introCompleted"
        class="pointer-events-none absolute top-6 left-1/2 -translate-x-1/2 z-30 px-3 py-1 rounded-full bg-zinc-950/80 border border-white/10 backdrop-blur-md flex items-center gap-2 text-[10px] font-mono text-zinc-400 shadow-xl"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping"></span>
        <span class="tracking-wider uppercase text-zinc-300">
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
        <span class="font-mono text-[10px] text-zinc-500 tracking-widest font-semibold">02</span>
        <span class="w-3.5 h-[1px] bg-zinc-700"></span>
        <span class="font-mono text-[10px] text-zinc-400 uppercase tracking-widest font-medium">ABOUT // BASE LOCATION</span>
      </div>
      <h1 class="text-2xl sm:text-3xl font-light tracking-tight text-zinc-100 font-sans leading-tight">
        Sidoarjo, Indonesia
      </h1>
      <p class="text-[11.5px] text-zinc-400 leading-relaxed font-sans max-w-[270px] font-normal">
        Based in Sidoarjo, East Java. Engineering high-performance cross-platform software, mobile clients, and distributed architectures at Wolkk.
      </p>

      <!-- Live Clock & Status Badge -->
      <div class="pt-1 flex items-center gap-2.5">
        <div class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-900/90 border border-white/10 text-[10px] font-mono text-zinc-300">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{{ localTime }} WIB</span>
        </div>
        <span class="font-mono text-[9px] text-zinc-500 tracking-wide uppercase">UTC+7 · EAST JAVA</span>
      </div>
    </div>

    <!-- 3D Avatar Interactive Tooltip (Projected above 3D Avatar in Phase 4) -->
    <Transition name="fade">
      <div
        v-if="showDescription && avatarScreenPos"
        class="pointer-events-none absolute z-20 flex flex-col items-center -translate-x-1/2 -translate-y-full transition-all duration-300"
        :style="{ left: `${avatarScreenPos.x}px`, top: `${avatarScreenPos.y - 18}px` }"
      >
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-950/90 backdrop-blur-md border border-sky-500/30 shadow-[0_0_24px_rgba(56,189,248,0.25)]">
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
      class="pointer-events-none absolute z-20 px-2 py-0.5 rounded-md bg-zinc-950/90 text-zinc-200 border border-white/15 shadow-xl font-mono text-[9px] uppercase tracking-wider -translate-x-1/2 -translate-y-8 transition-opacity duration-150"
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
          <span class="font-mono text-[9px] text-zinc-500 tracking-wider">
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

// High-Definition Geographic Polygon for Pulau Jawa (Java Island)
const javaCoords: [number, number][] = [
  [-6.75, 105.22], // Tanjung Layar / Ujung Kulon
  [-6.38, 105.82], // Labuan / Carita
  [-5.92, 105.99], // Anyer / Merak (Sunda Strait)
  [-5.98, 106.15], // Teluk Banten
  [-6.01, 106.63], // Tangerang coast
  [-6.10, 106.88], // Jakarta Bay
  [-5.95, 107.03], // Muara Gembong
  [-5.98, 107.38], // Karawang coast
  [-6.22, 107.65], // Subang coast
  [-6.24, 108.35], // Indramayu
  [-6.71, 108.57], // Cirebon
  [-6.83, 108.88], // Brebes
  [-6.85, 109.14], // Tegal
  [-6.88, 109.40], // Pemalang
  [-6.88, 109.68], // Pekalongan
  [-6.90, 110.15], // Kendal
  [-6.95, 110.42], // Semarang
  [-6.85, 110.55], // Demak
  [-6.58, 110.66], // Jepara (Muria peninsula)
  [-6.40, 110.92], // Tanjung Bugel
  [-6.55, 111.08], // Pati / Tayu
  [-6.69, 111.45], // Rembang
  [-6.89, 112.06], // Tuban
  [-6.86, 112.28], // Lamongan
  [-6.86, 112.56], // Gresik / Ujung Pangkah
  [-7.19, 112.74], // Surabaya / Tanjung Perak
  [-7.44, 112.73], // Sidoarjo Coastline / Porong
  [-7.63, 112.92], // Pasuruan
  [-7.73, 113.22], // Probolinggo
  [-7.70, 113.50], // Paiton
  [-7.69, 113.92], // Panarukan
  [-7.71, 114.02], // Situbondo
  [-7.83, 114.47], // Baluran
  [-8.14, 114.40], // Ketapang (Banyuwangi)
  [-8.22, 114.37], // Banyuwangi
  [-8.43, 114.34], // Muncar
  [-8.77, 114.60], // Semenanjung Blambangan
  [-8.73, 114.36], // Plengkung / G-Land
  [-8.60, 114.22], // Teluk Grajagan
  [-8.54, 113.88], // Sukamade
  [-8.38, 113.48], // Puger
  [-8.31, 113.12], // Pasirian
  [-8.44, 112.68], // Sendang Biru / Malang south
  [-8.41, 112.44], // Balekambang
  [-8.34, 112.14], // Blitar south
  [-8.27, 111.80], // Popoh / Tulungagung
  [-8.29, 111.72], // Prigi / Trenggalek
  [-8.22, 111.10], // Teluk Pacitan
  [-8.18, 110.85], // Wonogiri south
  [-8.13, 110.55], // Gunungkidul
  [-8.03, 110.31], // Parangtritis / Yogyakarta
  [-7.92, 110.07], // Glagah
  [-7.82, 109.85], // Purworejo south
  [-7.72, 109.41], // Kebumen south
  [-7.73, 109.02], // Cilacap
  [-7.71, 108.66], // Pangandaran
  [-7.75, 108.01], // Tasikmalaya south
  [-7.67, 107.69], // Garut south
  [-7.50, 107.28], // Cianjur south
  [-7.37, 106.40], // Sukabumi south
  [-6.99, 106.54], // Pelabuhan Ratu
  [-6.94, 106.25], // Cisolok
  [-6.84, 105.88], // Malingping
  [-6.80, 105.54], // Cibaliung / Ujung Kulon south
]

// High-Definition Geographic Polygon for Pulau Madura
const maduraCoords: [number, number][] = [
  [-7.06, 112.67], // Kamal / Bangkalan
  [-6.90, 112.82], // Klampis / Arosbaya
  [-6.89, 113.25], // Ketapang
  [-6.86, 113.67], // Ambunten
  [-6.91, 114.07], // Dungkek / East tip
  [-7.05, 113.93], // Sumenep / Kalianget
  [-7.21, 113.52], // Pamekasan south
  [-7.22, 113.29], // Sampang south
  [-7.16, 112.86], // Kwanyar
]

// Volcanic Mountain Summits
const volcanicPeaks = [
  { name: 'Mt. Salak / Gede', lat: -6.78, lng: 106.98, height: 0.16 },
  { name: 'Mt. Tangkuban Perahu', lat: -6.76, lng: 107.60, height: 0.14 },
  { name: 'Mt. Ciremai', lat: -6.89, lng: 108.40, height: 0.18 },
  { name: 'Mt. Slamet', lat: -7.24, lng: 109.21, height: 0.22 },
  { name: 'Mt. Sindoro-Sumbing', lat: -7.30, lng: 109.99, height: 0.19 },
  { name: 'Mt. Merapi', lat: -7.54, lng: 110.44, height: 0.20 },
  { name: 'Mt. Lawu', lat: -7.63, lng: 111.19, height: 0.21 },
  { name: 'Mt. Bromo-Semeru', lat: -8.11, lng: 112.92, height: 0.24 }, // East Java Landmark
  { name: 'Mt. Arjuno-Welirang', lat: -7.76, lng: 112.58, height: 0.22 }, // West of Sidoarjo
  { name: 'Mt. Raung-Ijen', lat: -8.06, lng: 114.24, height: 0.21 },
]

// Cartographic Projection Constants
const LNG_CENTER = 109.8
const LAT_CENTER = -7.35
const MAP_SCALE = 0.8

function geoToWorld(lat: number, lng: number): { x: number; z: number } {
  const x = (lng - LNG_CENTER) * MAP_SCALE
  const z = -(lat - LAT_CENTER) * MAP_SCALE
  return { x, z }
}

// Sidoarjo, East Java Coordinates (Hero Focal Point)
const SIDOARJO_GEO = { lat: -7.4478, lng: 112.7183 }
const sdaWorld = geoToWorld(SIDOARJO_GEO.lat, SIDOARJO_GEO.lng)

// Live Clock for WIB (UTC+7)
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

// UI & Animation Sequence State
type IntroPhase = 'island' | 'marker' | 'avatar' | 'desc'
const currentPhase = ref<IntroPhase>('island')
const showDescription = ref(false)
const introCompleted = ref(false)

const stageLabel = computed(() => {
  switch (currentPhase.value) {
    case 'island': return 'Exploring Pulau Jawa...'
    case 'marker': return 'Locating Sidoarjo, East Java...'
    case 'avatar': return 'Establishing Presence...'
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
let islandGroup: THREE.Group | null = null

// Animated 3D Components
let sidoarjoMarkerGroup: THREE.Group | null = null
let markerDotMesh: THREE.Mesh | null = null
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
  camTargetPos.set(sdaWorld.x + (isMobile ? 0 : 0.65), 2.1, sdaWorld.z + (isMobile ? 3.2 : 2.5))
  camLookAtTarget.set(sdaWorld.x, 0.85, sdaWorld.z)
}

function focusOverview() {
  viewMode.value = 'overview'
  const isMobile = window.innerWidth < 768
  camTargetPos.set(isMobile ? 0 : 0.6, isMobile ? 5.8 : 4.4, isMobile ? 6.2 : 5.4)
  camLookAtTarget.set(0, 0, 0)
}

// Staged Choreographed Intro Animation
function startIntroSequence() {
  // Clear any pending timeouts
  sequenceTimerIds.forEach(id => clearTimeout(id))
  sequenceTimerIds = []

  // 1. Initial State: Overview of Pulau Jawa
  currentPhase.value = 'island'
  showDescription.value = false
  introCompleted.value = false
  viewMode.value = 'overview'

  // Set camera to overview
  focusOverview()
  if (camera) {
    camera.position.copy(camTargetPos)
    currentLookAt.copy(camLookAtTarget)
    camera.lookAt(currentLookAt)
  }

  // Reset 3D element scales
  if (sidoarjoMarkerGroup) sidoarjoMarkerGroup.scale.set(0.001, 0.001, 0.001)
  if (verticalBeamMesh) verticalBeamMesh.scale.set(0.001, 0.001, 0.001)
  if (avatarGroup) avatarGroup.scale.set(0.001, 0.001, 0.001)
  radarRings.forEach(r => {
    ;(r.material as THREE.MeshBasicMaterial).opacity = 0
  })

  // 2. Phase 2: Muncul Marker di Sidoarjo (t = 1.0s)
  const t1 = window.setTimeout(() => {
    currentPhase.value = 'marker'
    focusSidoarjo() // Camera glides towards Sidoarjo

    // Pop marker into view with spring effect
    let progress = 0
    const markerInterval = setInterval(() => {
      progress += 0.06
      if (progress >= 1) {
        progress = 1
        clearInterval(markerInterval)
      }
      // Elastic overshoot
      const s = Math.sin(progress * Math.PI * 0.5) * (1 + (1 - progress) * 0.3)
      if (sidoarjoMarkerGroup) sidoarjoMarkerGroup.scale.set(s, s, s)
    }, 16)
  }, 1000)
  sequenceTimerIds.push(t1)

  // 3. Phase 3: Marker Berubah Menjadi Avatar 3D (t = 2.4s)
  const t2 = window.setTimeout(() => {
    currentPhase.value = 'avatar'

    // Grow vertical beam and spawn 3D Avatar
    let progress = 0
    const avatarInterval = setInterval(() => {
      progress += 0.05
      if (progress >= 1) {
        progress = 1
        clearInterval(avatarInterval)
      }

      // Beam grows vertically
      if (verticalBeamMesh) {
        verticalBeamMesh.scale.set(1, progress, 1)
      }

      // Avatar pops & springs up
      const s = Math.sin(progress * Math.PI * 0.5) * (1 + (1 - progress) * 0.2)
      if (avatarGroup) {
        avatarGroup.scale.set(s, s, s)
      }
    }, 16)
  }, 2400)
  sequenceTimerIds.push(t2)

  // 4. Phase 4: Show Tooltip & Sections Description (t = 3.6s)
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

  // 3. Lighting Setup (Restrained Architectural Lighting)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.45)
  scene.add(ambientLight)

  const sunLight = new THREE.DirectionalLight(0xf8fafc, 1.4)
  sunLight.position.set(6, 10, 7)
  scene.add(sunLight)

  const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.6)
  rimLight.position.set(-6, 4, -5)
  scene.add(rimLight)

  const sidoarjoBeaconLight = new THREE.PointLight(0x38bdf8, 2.2, 5.0, 1.2)
  sidoarjoBeaconLight.position.set(sdaWorld.x, 1.2, sdaWorld.z)
  scene.add(sidoarjoBeaconLight)

  // 4. Island Main Group
  islandGroup = new THREE.Group()
  scene.add(islandGroup)

  // 5. Build Extruded 3D Landmass of Pulau Jawa
  const javaShape = new THREE.Shape()
  javaCoords.forEach(([lat, lng], i) => {
    const { x, z } = geoToWorld(lat, lng)
    if (i === 0) javaShape.moveTo(x, -z)
    else javaShape.lineTo(x, -z)
  })
  javaShape.closePath()

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: 0.18,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.035,
    bevelThickness: 0.035,
  }

  const javaGeometry = new THREE.ExtrudeGeometry(javaShape, extrudeSettings)
  const islandMaterial = new THREE.MeshStandardMaterial({
    color: 0x121721,
    metalness: 0.75,
    roughness: 0.35,
  })
  const javaMesh = new THREE.Mesh(javaGeometry, islandMaterial)
  javaMesh.rotation.x = -Math.PI / 2
  javaMesh.position.y = 0
  islandGroup.add(javaMesh)

  // 6. Glowing Technical Coastline Outline for Java
  const coastlinePoints: THREE.Vector3[] = javaCoords.map(([lat, lng]) => {
    const { x, z } = geoToWorld(lat, lng)
    return new THREE.Vector3(x, 0.22, z)
  })
  const coastlineGeo = new THREE.BufferGeometry().setFromPoints(coastlinePoints)
  const coastlineMat = new THREE.LineBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.65,
  })
  const coastlineLine = new THREE.LineLoop(coastlineGeo, coastlineMat)
  islandGroup.add(coastlineLine)

  // 7. Build Extruded 3D Landmass of Pulau Madura
  const maduraShape = new THREE.Shape()
  maduraCoords.forEach(([lat, lng], i) => {
    const { x, z } = geoToWorld(lat, lng)
    if (i === 0) maduraShape.moveTo(x, -z)
    else maduraShape.lineTo(x, -z)
  })
  maduraShape.closePath()

  const maduraGeometry = new THREE.ExtrudeGeometry(maduraShape, extrudeSettings)
  const maduraMesh = new THREE.Mesh(maduraGeometry, islandMaterial)
  maduraMesh.rotation.x = -Math.PI / 2
  maduraMesh.position.y = 0
  islandGroup.add(maduraMesh)

  const maduraLinePoints: THREE.Vector3[] = maduraCoords.map(([lat, lng]) => {
    const { x, z } = geoToWorld(lat, lng)
    return new THREE.Vector3(x, 0.22, z)
  })
  const maduraLineGeo = new THREE.BufferGeometry().setFromPoints(maduraLinePoints)
  const maduraCoastline = new THREE.LineLoop(maduraLineGeo, coastlineMat)
  islandGroup.add(maduraCoastline)

  // 8. Architectural Datum Grid Plane
  const datumGrid = new THREE.GridHelper(10, 20, 0x1e293b, 0x0f172a)
  datumGrid.position.y = -0.01
  islandGroup.add(datumGrid)

  const datumRingsGeo = new THREE.RingGeometry(4.8, 4.82, 64)
  const datumRingsMat = new THREE.MeshBasicMaterial({
    color: 0x334155,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.3,
  })
  const datumRing = new THREE.Mesh(datumRingsGeo, datumRingsMat)
  datumRing.rotation.x = -Math.PI / 2
  datumRing.position.y = -0.005
  islandGroup.add(datumRing)

  // 9. Volcanic Mountain Peaks
  const peakGeo = new THREE.ConeGeometry(0.12, 0.2, 6)
  const peakMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.8,
    roughness: 0.4,
  })
  volcanicPeaks.forEach(peak => {
    const { x, z } = geoToWorld(peak.lat, peak.lng)
    const pMesh = new THREE.Mesh(peakGeo, peakMat)
    pMesh.scale.set(1, peak.height / 0.2, 1)
    pMesh.position.set(x, 0.21 + peak.height * 0.5, z)
    islandGroup!.add(pMesh)

    const summitGeo = new THREE.SphereGeometry(0.018, 8, 8)
    const summitMat = new THREE.MeshBasicMaterial({ color: 0x64748b })
    const summit = new THREE.Mesh(summitGeo, summitMat)
    summit.position.set(x, 0.21 + peak.height, z)
    islandGroup!.add(summit)
  })

  // 10. Secondary Major Reference Cities on Java
  const majorCities = [
    { name: 'Jakarta', lat: -6.2088, lng: 106.8456 },
    { name: 'Bandung', lat: -6.9175, lng: 107.6191 },
    { name: 'Semarang', lat: -6.9667, lng: 110.4167 },
    { name: 'Yogyakarta', lat: -7.7956, lng: 110.3695 },
    { name: 'Surabaya', lat: -7.2575, lng: 112.7521 },
    { name: 'Malang', lat: -7.9666, lng: 112.6326 },
  ]
  const cityDotGeo = new THREE.SphereGeometry(0.025, 12, 12)
  const cityDotMat = new THREE.MeshBasicMaterial({ color: 0x475569 })
  majorCities.forEach(c => {
    const { x, z } = geoToWorld(c.lat, c.lng)
    const dot = new THREE.Mesh(cityDotGeo, cityDotMat)
    dot.position.set(x, 0.22, z)
    dot.userData = { name: c.name, type: 'Hub City', id: `city-${c.name}` }
    islandGroup!.add(dot)
  })

  // 11. SIDOARJO HERO PINPOINT MARKER (Starts at scale 0, pops in Phase 2)
  sidoarjoMarkerGroup = new THREE.Group()
  sidoarjoMarkerGroup.position.set(sdaWorld.x, 0.22, sdaWorld.z)
  sidoarjoMarkerGroup.scale.set(0.001, 0.001, 0.001)
  sidoarjoMarkerGroup.userData = { name: 'Sidoarjo', type: 'Current Location', id: 'sidoarjo-pin' }
  islandGroup.add(sidoarjoMarkerGroup)

  // Ground beacon base pin
  const sdaDotGeo = new THREE.SphereGeometry(0.06, 16, 16)
  const sdaDotMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
  markerDotMesh = new THREE.Mesh(sdaDotGeo, sdaDotMat)
  sidoarjoMarkerGroup.add(markerDotMesh)

  // Ground Pinpoint Needle Cone
  const needleGeo = new THREE.ConeGeometry(0.045, 0.16, 16)
  const needleMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.6,
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
    ringMesh.position.set(sdaWorld.x, 0.225, sdaWorld.z)
    islandGroup.add(ringMesh)
    radarRings.push(ringMesh)
  }

  // Vertical Light Conduit Beam (Jakarta Ground to 3D Avatar)
  const beamHeight = 1.15
  const beamGeo = new THREE.CylinderGeometry(0.008, 0.008, beamHeight, 12)
  beamGeo.translate(0, beamHeight / 2, 0) // Anchor at bottom
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.5,
  })
  verticalBeamMesh = new THREE.Mesh(beamGeo, beamMat)
  verticalBeamMesh.position.set(sdaWorld.x, 0.22, sdaWorld.z)
  verticalBeamMesh.scale.set(0.001, 0.001, 0.001)
  islandGroup.add(verticalBeamMesh)

  // 12. 3D PHYSICAL AVATAR OBJECT (Morphs in Phase 3)
  avatarGroup = new THREE.Group()
  avatarGroup.position.set(sdaWorld.x, 0.22 + beamHeight + 0.32, sdaWorld.z)
  avatarGroup.scale.set(0.001, 0.001, 0.001)
  avatarGroup.userData = { id: 'avatar', name: 'Tegar Nugroho', type: 'Base of Operations' }
  islandGroup.add(avatarGroup)

  // Texture Loader for Profile Avatar Image
  const textureLoader = new THREE.TextureLoader()
  const avatarTexture = textureLoader.load('/assets/avatar.webp')
  avatarTexture.colorSpace = THREE.SRGBColorSpace

  // Medallion Bezel Body
  const medallionGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.06, 48)
  const medallionRimMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.85,
    roughness: 0.2,
  })
  const medallionBody = new THREE.Mesh(medallionGeo, medallionRimMat)
  medallionBody.rotation.x = Math.PI / 2
  avatarGroup.add(medallionBody)

  // Front Face: Avatar Photo
  const photoGeo = new THREE.CircleGeometry(0.35, 48)
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
    opacity: 0.7,
  })
  avatarHaloMesh = new THREE.Mesh(haloGeo, haloMat)
  avatarGroup.add(avatarHaloMesh)

  // Subtle Atmospheric Micro-Dust
  const dustCount = isMobile ? 100 : 250
  const dustPos = new Float32Array(dustCount * 3)
  for (let i = 0; i < dustCount; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 14
    dustPos[i * 3 + 1] = Math.random() * 4
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * 8
  }
  const dustGeo = new THREE.BufferGeometry()
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3))
  const dustMat = new THREE.PointsMaterial({
    color: 0x475569,
    size: 0.015,
    transparent: true,
    opacity: 0.3,
  })
  scene.add(new THREE.Points(dustGeo, dustMat))

  // 13. Main Render Loop
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

    // Island Subtle Idle Rotation or Drag Interaction
    if (islandGroup) {
      if (!isDragging && introCompleted.value) {
        targetRotY += delta * 0.015
      }
      islandGroup.rotation.y = THREE.MathUtils.lerp(islandGroup.rotation.y, targetRotY, 0.06)
      islandGroup.rotation.x = THREE.MathUtils.lerp(islandGroup.rotation.x, targetRotX, 0.06)
    }

    // Animated Radar Sonar Rings (Active from Phase 2 onwards)
    if (currentPhase.value !== 'island') {
      radarRings.forEach((ring, idx) => {
        const progress = ((now * 0.001 + idx * 0.33) % 1)
        const scale = 0.5 + progress * 5.5
        ring.scale.set(scale, scale, 1)
        const mat = ring.material as THREE.MeshBasicMaterial
        mat.opacity = (1 - progress) * 0.65
      })
    }

    // 3D Avatar Dynamic Floating Bobbing & Orientation (Active from Phase 3)
    if (avatarGroup && currentPhase.value !== 'island' && currentPhase.value !== 'marker') {
      const floatOffset = Math.sin(now * 0.0022) * 0.05
      avatarGroup.position.y = (0.22 + beamHeight + 0.32) + floatOffset

      if (avatarHaloMesh) {
        avatarHaloMesh.rotation.z += delta * 0.6
        avatarHaloMesh.rotation.y = Math.sin(now * 0.001) * 0.3
      }

      if (camera) {
        avatarGroup.quaternion.slerp(camera.quaternion, 0.08)
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
  if (!camera || !container.value || !avatarGroup || !islandGroup) return
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

  if (isDragging && islandGroup) {
    const dx = e.clientX - prevPointerX
    const dy = e.clientY - prevPointerY
    prevPointerX = e.clientX
    prevPointerY = e.clientY

    targetRotY += dx * 0.005
    targetRotX = THREE.MathUtils.clamp(targetRotX + dy * 0.005, -0.4, 0.4)
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
    camTargetPos.y = THREE.MathUtils.clamp(camTargetPos.y + e.deltaY * 0.002, 1.4, 3.8)
    camTargetPos.z = THREE.MathUtils.clamp(camTargetPos.z + e.deltaY * 0.003, sdaWorld.z + 1.8, sdaWorld.z + 4.8)
  } else {
    camTargetPos.y = THREE.MathUtils.clamp(camTargetPos.y + e.deltaY * 0.003, 3.0, 7.5)
    camTargetPos.z = THREE.MathUtils.clamp(camTargetPos.z + e.deltaY * 0.004, 3.8, 8.5)
  }
}

function checkRaycast(e: PointerEvent, isClick: boolean) {
  if (!camera || !container.value || !scene) return

  raycaster.setFromCamera(mouseNDC, camera)
  const clickableObjects: THREE.Object3D[] = []

  if (avatarGroup) clickableObjects.push(avatarGroup)
  if (sidoarjoMarkerGroup) clickableObjects.push(sidoarjoMarkerGroup)
  if (islandGroup) {
    islandGroup.traverse(obj => {
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
  // Clear hover or keep state
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

  // Keyboard navigation (<kbd>←</kbd> / <kbd>→</kbd>)
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
/* Subtle Editorial Grid */
.subtle-grid-bg {
  background-image:
    linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px);
  background-size: 64px 64px;
}

/* Faint Depth Vignette */
.radial-vignette {
  background: radial-gradient(circle at 60% 50%, rgba(15, 23, 42, 0.25) 0%, rgba(6, 7, 9, 0.95) 80%, #060709 100%);
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
