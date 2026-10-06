<template>
  <div
    ref="container"
    class="about-globe-scene relative w-full h-full select-none overflow-hidden bg-[#03060b]"
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

    <!-- Editorial Section Typography (Left Side - Revealed in Phase 3) -->
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

    <!-- Location Pinpoint HUD Badge (Projected above Sidoarjo Marker) -->
    <Transition name="fade">
      <div
        v-if="showDescription && markerScreenPos"
        class="pointer-events-none absolute z-20 flex flex-col items-center -translate-x-1/2 -translate-y-full transition-all duration-200"
        :style="{ left: `${markerScreenPos.x}px`, top: `${markerScreenPos.y - 8}px` }"
      >
        <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-950/90 backdrop-blur-md border border-sky-500/40 shadow-[0_0_20px_rgba(56,189,248,0.35)]">
          <span class="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping"></span>
          <span class="font-mono text-[9.5px] text-zinc-100 uppercase tracking-wider font-semibold">
            Sidoarjo
          </span>
          <span class="text-zinc-600">·</span>
          <span class="font-mono text-[9px] text-sky-400 uppercase tracking-wider">
            East Java, ID
          </span>
        </div>
        <div class="w-[1px] h-3 bg-gradient-to-b from-sky-400/80 to-transparent"></div>
      </div>
    </Transition>

    <!-- Hovered Feature Tooltip (Cities / Points) -->
    <div
      v-if="hoveredFeature && hoveredFeature.id !== 'sidoarjo-pin'"
      class="pointer-events-none absolute z-20 px-2.5 py-1 rounded-md bg-zinc-950/90 text-zinc-200 border border-white/15 shadow-2xl font-mono text-[9px] uppercase tracking-wider -translate-x-1/2 -translate-y-8 transition-opacity duration-150"
      :style="{ left: `${hoverScreenPos.x}px`, top: `${hoverScreenPos.y}px` }"
    >
      {{ hoveredFeature.name }} · {{ hoveredFeature.type }}
    </div>

    <!-- Compact Editorial Description Panel (Bottom-Left - Revealed in Phase 3) -->
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
            GLOBE VIEW
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
import { latLngToVector3 } from '@/components/globe/globeMath'

// Globe Radius
const GLOBE_RADIUS = 2.2

// Geographic center of Pulau Jawa (balances West Java, Central Java, and East Java in frame)
const JAVA_CENTER_GEO = { lat: -7.3, lng: 111.2 }
const javaCenterPos = latLngToVector3(JAVA_CENTER_GEO.lat, JAVA_CENTER_GEO.lng, GLOBE_RADIUS)

// Sidoarjo Coordinates
const SIDOARJO_GEO = { lat: -7.4478, lng: 112.7183 }
const sdaPos = latLngToVector3(SIDOARJO_GEO.lat, SIDOARJO_GEO.lng, GLOBE_RADIUS)
const sdaNormal = sdaPos.clone().normalize()

// Rotation angles to lock Pulau Jawa directly front-and-center
// Using Euler rotation order 'YXZ' ensures Yaw (Y) brings the meridian front, and Pitch (X) centers latitude
const LOCKED_ROT_Y = -Math.atan2(javaCenterPos.x, javaCenterPos.z)
const LOCKED_ROT_X = -JAVA_CENTER_GEO.lat * (Math.PI / 180) // Positive angle brings southern latitude UP to equator

// High-precision geographic coastline polygon for Pulau Jawa (Java Island)
const JAVA_COASTLINE: [number, number][] = [
  [-6.02, 105.9], [-5.95, 106.1], [-6.05, 106.3], [-6.12, 106.8], [-6.20, 107.0],
  [-6.25, 107.6], [-6.35, 108.3], [-6.70, 108.55], [-6.85, 109.15], [-6.88, 109.68],
  [-6.95, 110.42], [-6.55, 110.65], [-6.42, 110.92], [-6.58, 111.08], [-6.72, 111.45],
  [-6.85, 112.05], [-6.92, 112.55], [-7.20, 112.75], [-7.45, 112.78], // Sidoarjo coast
  [-7.60, 112.90], [-7.72, 113.25], [-7.70, 113.95], [-7.75, 114.40], [-8.15, 114.45], // Banyuwangi
  [-8.65, 114.40], [-8.75, 114.60], [-8.65, 114.25], // Blambangan Peninsula
  [-8.45, 113.55], [-8.35, 113.15], [-8.38, 112.65], [-8.30, 112.15], [-8.32, 111.80],
  [-8.25, 111.10], [-8.15, 110.80], [-8.02, 110.28], [-7.90, 109.95], [-7.75, 109.50],
  [-7.70, 109.02], [-7.68, 108.65], [-7.75, 108.15], [-7.68, 107.75], [-7.45, 106.80],
  [-7.00, 106.50], [-7.20, 106.40], [-6.85, 105.75], [-6.70, 105.25], [-6.60, 105.35],
  [-6.02, 105.9]
]

// Madura Island Coastline Polygon
const MADURA_COASTLINE: [number, number][] = [
  [-7.05, 112.72], [-6.90, 112.95], [-6.88, 113.40], [-6.92, 113.95],
  [-7.05, 114.05], [-7.15, 113.85], [-7.22, 113.50], [-7.18, 113.10],
  [-7.15, 112.75], [-7.05, 112.72]
]

// Key Reference Cities on Pulau Jawa for Immediate Landmark Recognition
const JAVA_CITIES = [
  { name: 'Jakarta', type: 'Capital City', lat: -6.2088, lng: 106.8456 },
  { name: 'Bandung', type: 'West Java', lat: -6.9175, lng: 107.6191 },
  { name: 'Semarang', type: 'Central Java', lat: -6.9932, lng: 110.4203 },
  { name: 'Yogyakarta', type: 'Special Region', lat: -7.7956, lng: 110.3695 },
  { name: 'Surabaya', type: 'East Java Capital', lat: -7.2575, lng: 112.7521 },
  { name: 'Malang', type: 'East Java', lat: -7.9666, lng: 112.6326 },
]

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
type IntroPhase = 'island' | 'marker' | 'desc'
const currentPhase = ref<IntroPhase>('island')
const showDescription = ref(false)
const introCompleted = ref(false)

const stageLabel = computed(() => {
  switch (currentPhase.value) {
    case 'island': return 'Orbiting Earth // Pulau Jawa Locked'
    case 'marker': return 'Targeting Sidoarjo, East Java...'
    case 'desc': return 'Location Synchronized'
  }
})

const viewMode = ref<'overview' | 'sidoarjo'>('overview')
const hoveredFeature = ref<{ name: string; type: string; id: string } | null>(null)
const hoverScreenPos = ref({ x: 0, y: 0 })
const markerScreenPos = ref<{ x: number; y: number } | null>(null)

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

let globeGroup: THREE.Group | null = null
let cloudsMesh: THREE.Mesh | null = null
let sidoarjoMarkerGroup: THREE.Group | null = null
let beaconGemMesh: THREE.Mesh | null = null
let radarRings: THREE.Mesh[] = []
const interactiveObjects: THREE.Object3D[] = []

// Target Camera Positions
const camTargetPos = new THREE.Vector3()
const camLookAtTarget = new THREE.Vector3(0, 0, 0)
const currentLookAt = new THREE.Vector3(0, 0, 0)

// Mouse / Orbit Controls
let isDragging = false
let prevPointerX = 0
let prevPointerY = 0
let targetRotY = LOCKED_ROT_Y
let targetRotX = LOCKED_ROT_X
const raycaster = new THREE.Raycaster()
const mouseNDC = new THREE.Vector2(-999, -999)

let unregisterContentNav: (() => void) | null = null
let sequenceTimerIds: number[] = []

function focusSidoarjo() {
  viewMode.value = 'sidoarjo'
  const isMobile = window.innerWidth < 768
  // Balanced zoom: Pulau Jawa spans clearly with comfortable padding
  camTargetPos.set(0, 0, isMobile ? 5.0 : 4.3)
  camLookAtTarget.set(0, 0, 0)
}

function focusOverview() {
  viewMode.value = 'overview'
  const isMobile = window.innerWidth < 768
  // Overview view: Whole globe with generous breathing room
  camTargetPos.set(0, 0, isMobile ? 6.8 : 5.8)
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

  targetRotY = LOCKED_ROT_Y
  targetRotX = LOCKED_ROT_X

  focusOverview()
  if (camera) {
    camera.position.copy(camTargetPos)
    currentLookAt.copy(camLookAtTarget)
    camera.lookAt(currentLookAt)
  }

  // Reset 3D scale
  if (sidoarjoMarkerGroup) sidoarjoMarkerGroup.scale.set(0.001, 0.001, 0.001)
  radarRings.forEach(r => {
    ;(r.material as THREE.MeshBasicMaterial).opacity = 0
  })

  // Phase 2: Camera zooms down smoothly into Sidoarjo on the Globe
  const t1 = window.setTimeout(() => {
    currentPhase.value = 'marker'
    focusSidoarjo()

    let progress = 0
    const markerInterval = setInterval(() => {
      progress += 0.07
      if (progress >= 1) {
        progress = 1
        clearInterval(markerInterval)
      }
      const s = Math.sin(progress * Math.PI * 0.5) * (1 + (1 - progress) * 0.25)
      if (sidoarjoMarkerGroup) sidoarjoMarkerGroup.scale.set(s, s, s)
    }, 16)
  }, 1000)
  sequenceTimerIds.push(t1)

  // Phase 3: Show Tooltip & Sections Description
  const t2 = window.setTimeout(() => {
    currentPhase.value = 'desc'
    showDescription.value = true
    introCompleted.value = true
  }, 2200)
  sequenceTimerIds.push(t2)
}

function restartSequence() {
  startIntroSequence()
}

function initScene() {
  if (!container.value || !canvas.value) return

  const width = container.value.clientWidth || window.innerWidth
  const height = container.value.clientHeight || window.innerHeight
  const isMobile = width < 768

  // 1. Scene & Perspective Camera
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
  renderer.toneMappingExposure = 1.35

  // 3. Bright, Crisp Sunlight & Atmospheric Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.3)
  scene.add(ambientLight)

  const sunLight = new THREE.DirectionalLight(0xfffaed, 2.4)
  sunLight.position.set(4, 5, 6)
  scene.add(sunLight)

  const fillLight = new THREE.DirectionalLight(0xbae6fd, 1.1)
  fillLight.position.set(-5, 1, 5)
  scene.add(fillLight)

  // 4. Main Globe Group
  globeGroup = new THREE.Group()
  globeGroup.rotation.order = 'YXZ'
  globeGroup.rotation.y = LOCKED_ROT_Y
  globeGroup.rotation.x = LOCKED_ROT_X
  // Position globe in center-right to preserve editorial negative space on the left
  globeGroup.position.set(isMobile ? 0 : 0.45, isMobile ? 0.15 : 0, 0)
  scene.add(globeGroup)

  const textureLoader = new THREE.TextureLoader()

  // 5. Realistic Earth Sphere (NASA Blue Marble Day Texture + Specular Water Map)
  const earthTexture = textureLoader.load('/textures/earth/earth_day.jpg')
  earthTexture.colorSpace = THREE.SRGBColorSpace
  const specularTexture = textureLoader.load('/textures/earth/earth_specular.jpg')

  const earthGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64)
  const earthMat = new THREE.MeshStandardMaterial({
    map: earthTexture,
    roughnessMap: specularTexture,
    roughness: 0.5,
    metalness: 0.05,
  })
  const earthMesh = new THREE.Mesh(earthGeo, earthMat)
  globeGroup.add(earthMesh)

  // 6. Floating Clouds Sphere Layer (Subtle wisps to keep landmass crystal-clear)
  const cloudsTexture = textureLoader.load('/textures/earth/earth_clouds.png')
  const cloudsGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.012, 64, 64)
  const cloudsMat = new THREE.MeshStandardMaterial({
    map: cloudsTexture,
    transparent: true,
    opacity: 0.16,
    blending: THREE.NormalBlending,
    depthWrite: false,
    roughness: 0.9,
  })
  cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat)
  globeGroup.add(cloudsMesh)

  // 7. Outer Atmospheric Fresnel Halo Ring
  const atmosphereGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.032, 64, 64)
  const atmosphereMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    uniforms: {
      uColor: { value: new THREE.Color(0x38bdf8) },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      uniform vec3 uColor;
      void main() {
        vec3 viewDir = normalize(vViewPosition);
        float edgeAlpha = clamp(dot(vNormal, viewDir) / 0.28, 0.0, 1.0);
        float intensity = pow(edgeAlpha, 1.8);
        gl_FragColor = vec4(uColor, intensity * 0.85);
      }
    `,
  })
  const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat)
  globeGroup.add(atmosphereMesh)

  // 8. Pulau Jawa Island Vector Contour Outline
  const javaOutlineGeo = new THREE.BufferGeometry()
  const javaPoints3D = JAVA_COASTLINE.map(([lat, lng]) => latLngToVector3(lat, lng, GLOBE_RADIUS * 1.002))
  javaOutlineGeo.setFromPoints(javaPoints3D)
  const javaOutlineMat = new THREE.LineBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.55,
  })
  const javaOutline = new THREE.LineLoop(javaOutlineGeo, javaOutlineMat)
  globeGroup.add(javaOutline)

  // Madura Island Vector Outline
  const maduraOutlineGeo = new THREE.BufferGeometry()
  const maduraPoints3D = MADURA_COASTLINE.map(([lat, lng]) => latLngToVector3(lat, lng, GLOBE_RADIUS * 1.002))
  maduraOutlineGeo.setFromPoints(maduraPoints3D)
  const maduraOutlineMat = new THREE.LineBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.45,
  })
  const maduraOutline = new THREE.LineLoop(maduraOutlineGeo, maduraOutlineMat)
  globeGroup.add(maduraOutline)

  // Reference City Waypoint Dots on Java
  JAVA_CITIES.forEach((city, index) => {
    const cityPos = latLngToVector3(city.lat, city.lng, GLOBE_RADIUS * 1.002)
    const dotGeo = new THREE.SphereGeometry(0.007, 12, 12)
    const dotMat = new THREE.MeshBasicMaterial({
      color: 0xbae6fd,
      transparent: true,
      opacity: 0.65,
    })
    const dotMesh = new THREE.Mesh(dotGeo, dotMat)
    dotMesh.position.copy(cityPos)
    dotMesh.userData = { name: city.name, type: city.type, id: `city-${index}` }
    globeGroup!.add(dotMesh)
    interactiveObjects.push(dotMesh)
  })

  // 9. SIDOARJO PRECISION HIGH-TECH MARKER
  sidoarjoMarkerGroup = new THREE.Group()
  sidoarjoMarkerGroup.position.copy(sdaPos)
  sidoarjoMarkerGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), sdaNormal)
  sidoarjoMarkerGroup.scale.set(0.001, 0.001, 0.001)
  sidoarjoMarkerGroup.userData = { name: 'Sidoarjo', type: 'Current Location', id: 'sidoarjo-pin' }
  globeGroup.add(sidoarjoMarkerGroup)
  interactiveObjects.push(sidoarjoMarkerGroup)

  // Delicate Ground Beacon Base Dot
  const sdaDotGeo = new THREE.SphereGeometry(0.012, 16, 16)
  const sdaDotMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
  const markerDotMesh = new THREE.Mesh(sdaDotGeo, sdaDotMat)
  sidoarjoMarkerGroup.add(markerDotMesh)

  // Sleek Ground Needle Cone Pin
  const needleHeight = 0.045
  const needleGeo = new THREE.ConeGeometry(0.01, needleHeight, 16)
  const needleMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.85,
    metalness: 0.9,
    roughness: 0.2,
  })
  const needleMesh = new THREE.Mesh(needleGeo, needleMat)
  needleMesh.rotation.x = Math.PI
  needleMesh.position.y = needleHeight / 2
  sidoarjoMarkerGroup.add(needleMesh)

  // Tight, Delicate Ground Sonar Radar Rings
  radarRings = []
  for (let i = 0; i < 3; i++) {
    const ringGeo = new THREE.RingGeometry(0.01, 0.014, 32)
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    })
    const ringMesh = new THREE.Mesh(ringGeo, ringMat)
    ringMesh.rotation.x = -Math.PI / 2
    ringMesh.position.y = 0.002
    sidoarjoMarkerGroup.add(ringMesh)
    radarRings.push(ringMesh)
  }

  // Thin Laser Light Conduit Beam
  const beamHeight = 0.11
  const beamGeo = new THREE.CylinderGeometry(0.0015, 0.0015, beamHeight, 8)
  beamGeo.translate(0, beamHeight / 2, 0)
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.8,
  })
  const verticalBeamMesh = new THREE.Mesh(beamGeo, beamMat)
  sidoarjoMarkerGroup.add(verticalBeamMesh)

  // Rotating Diamond Prism Beacon at the Top
  const gemGeo = new THREE.OctahedronGeometry(0.014, 0)
  const gemMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.9,
    metalness: 0.9,
    roughness: 0.15,
  })
  beaconGemMesh = new THREE.Mesh(gemGeo, gemMat)
  beaconGemMesh.position.y = beamHeight + 0.01
  sidoarjoMarkerGroup.add(beaconGemMesh)

  // Outer Gimbal Ring around Prism
  const haloGeo = new THREE.TorusGeometry(0.024, 0.0018, 12, 24)
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.75,
  })
  const haloMesh = new THREE.Mesh(haloGeo, haloMat)
  haloMesh.position.y = beamHeight + 0.01
  haloMesh.rotation.x = Math.PI / 3
  sidoarjoMarkerGroup.add(haloMesh)

  // 10. Subtle Starfield Particles
  const starCount = isMobile ? 120 : 250
  const starPos = new Float32Array(starCount * 3)
  for (let i = 0; i < starCount; i++) {
    starPos[i * 3] = (Math.random() - 0.5) * 16
    starPos[i * 3 + 1] = (Math.random() - 0.5) * 16
    starPos[i * 3 + 2] = -4 - Math.random() * 8
  }
  const starGeo = new THREE.BufferGeometry()
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
  const starMat = new THREE.PointsMaterial({
    color: 0x94a3b8,
    size: 0.014,
    transparent: true,
    opacity: 0.35,
  })
  scene.add(new THREE.Points(starGeo, starMat))

  // 11. Main Render Loop
  let lastTime = performance.now()
  function loop(now: number) {
    animFrameId = requestAnimationFrame(loop)
    const delta = Math.min((now - lastTime) / 1000, 0.1)
    lastTime = now

    // Smooth Camera Transition
    if (camera) {
      camera.position.lerp(camTargetPos, 0.05)
      currentLookAt.lerp(camLookAtTarget, 0.05)
      camera.lookAt(currentLookAt)
    }

    // Globe Rotation: Lock onto Pulau Jawa / Sidoarjo (or follow gentle user drag)
    if (globeGroup) {
      if (!isDragging && introCompleted.value && viewMode.value === 'overview') {
        targetRotY = LOCKED_ROT_Y + Math.sin(now * 0.0003) * 0.06
        targetRotX = LOCKED_ROT_X + Math.cos(now * 0.0004) * 0.03
      } else if (!isDragging && introCompleted.value && viewMode.value === 'sidoarjo') {
        targetRotY = LOCKED_ROT_Y
        targetRotX = LOCKED_ROT_X
      }

      globeGroup.rotation.y = THREE.MathUtils.lerp(globeGroup.rotation.y, targetRotY, 0.06)
      globeGroup.rotation.x = THREE.MathUtils.lerp(globeGroup.rotation.x, targetRotX, 0.06)
    }

    // Drifting Clouds Layer
    if (cloudsMesh) {
      cloudsMesh.rotation.y += delta * 0.005
    }

    // Animated Radar Sonar Rings
    if (currentPhase.value !== 'island') {
      radarRings.forEach((ring, idx) => {
        const progress = ((now * 0.0012 + idx * 0.33) % 1)
        const scale = 1.0 + progress * 2.2
        ring.scale.set(scale, scale, 1)
        const mat = ring.material as THREE.MeshBasicMaterial
        mat.opacity = (1 - progress) * 0.65
      })
    }

    // Spin Beacon Diamond Prism
    if (beaconGemMesh) {
      beaconGemMesh.rotation.y += delta * 1.5
      beaconGemMesh.rotation.z += delta * 0.8
    }

    updateScreenPositions()

    if (renderer && scene && camera) {
      renderer.render(scene, camera)
    }
  }

  animFrameId = requestAnimationFrame(loop)

  // Start the Choreographed Sequence on Mount
  startIntroSequence()
}

function updateScreenPositions() {
  if (!camera || !container.value || !sidoarjoMarkerGroup || !globeGroup) return
  const w = container.value.clientWidth
  const h = container.value.clientHeight

  const markerWorldPos = new THREE.Vector3()
  sidoarjoMarkerGroup.getWorldPosition(markerWorldPos)
  const normal = markerWorldPos.clone().sub(globeGroup.position).normalize()
  // Project above the top of the beacon pin
  const label3DPos = markerWorldPos.clone().addScaledVector(normal, 0.16)
  const projected = label3DPos.project(camera)

  if (projected.z < 1 && sidoarjoMarkerGroup.scale.x > 0.3) {
    markerScreenPos.value = {
      x: (projected.x * 0.5 + 0.5) * w,
      y: (-projected.y * 0.5 + 0.5) * h,
    }
  } else {
    markerScreenPos.value = null
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

  if (isDragging && globeGroup) {
    const dx = e.clientX - prevPointerX
    const dy = e.clientY - prevPointerY
    prevPointerX = e.clientX
    prevPointerY = e.clientY

    targetRotY += dx * 0.004
    targetRotX = THREE.MathUtils.clamp(targetRotX + dy * 0.004, -0.65, 0.65)
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
    camTargetPos.z = THREE.MathUtils.clamp(camTargetPos.z + e.deltaY * 0.003, 3.8, 5.5)
  } else {
    camTargetPos.z = THREE.MathUtils.clamp(camTargetPos.z + e.deltaY * 0.004, 5.0, 7.5)
  }
}

function checkRaycast(e: PointerEvent, isClick: boolean) {
  if (!camera || !container.value || !scene) return

  raycaster.setFromCamera(mouseNDC, camera)
  const hits = raycaster.intersectObjects(interactiveObjects, true)

  if (hits.length > 0) {
    let topObj: THREE.Object3D | null = hits[0].object
    while (topObj && !topObj.userData?.name && topObj.parent && topObj !== scene) {
      topObj = topObj.parent
    }

    if (topObj && topObj.userData?.name) {
      if (isClick) {
        if (topObj.userData.id === 'sidoarjo-pin') {
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
  if (!container.value || !camera || !renderer || !globeGroup) return
  const w = container.value.clientWidth || window.innerWidth
  const h = container.value.clientHeight || window.innerHeight
  const isMobile = w < 768

  globeGroup.position.set(isMobile ? 0 : 0.45, isMobile ? 0.15 : 0, 0)

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
  background: radial-gradient(circle at 50% 50%, rgba(12, 28, 55, 0.15) 0%, rgba(3, 6, 11, 0.75) 65%, #03060b 100%);
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
