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
        class="pointer-events-none absolute z-20 flex flex-col items-center -translate-x-1/2 -translate-y-full transition-all duration-300"
        :style="{ left: `${markerScreenPos.x}px`, top: `${markerScreenPos.y - 12}px` }"
      >
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-950/90 backdrop-blur-md border border-sky-500/40 shadow-[0_0_25px_rgba(56,189,248,0.35)]">
          <span class="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
          <span class="font-mono text-[10px] text-zinc-100 uppercase tracking-wider font-semibold">
            Sidoarjo
          </span>
          <span class="text-zinc-600">·</span>
          <span class="font-mono text-[9.5px] text-sky-400 uppercase tracking-wider">
            East Java, ID
          </span>
        </div>
        <div class="w-[1px] h-3.5 bg-gradient-to-b from-sky-400/80 to-transparent"></div>
      </div>
    </Transition>

    <!-- Hovered Feature Tooltip -->
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

// Sidoarjo Coordinates
const SIDOARJO_GEO = { lat: -7.4478, lng: 112.7183 }
const sdaPos = latLngToVector3(SIDOARJO_GEO.lat, SIDOARJO_GEO.lng, GLOBE_RADIUS)
const sdaNormal = sdaPos.clone().normalize()

// Pre-calculated Globe Rotations to Lock Front & Center on Pulau Jawa / Sidoarjo
const LOCKED_ROT_Y = -Math.atan2(sdaPos.x, sdaPos.z)
const LOCKED_ROT_X = ((SIDOARJO_GEO.lat) * Math.PI / 180) * 0.85

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

// Target Camera Positions
const camTargetPos = new THREE.Vector3()
const camLookAtTarget = new THREE.Vector3()
const currentLookAt = new THREE.Vector3()

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
  // Clean zoom looking directly at Sidoarjo and Pulau Jawa
  camTargetPos.set(isMobile ? 0 : 0.45, 0.22, 3.25)
  camLookAtTarget.set(0, 0.08, GLOBE_RADIUS)
}

function focusOverview() {
  viewMode.value = 'overview'
  const isMobile = window.innerWidth < 768
  // Full Earth view, locked on Java
  camTargetPos.set(isMobile ? 0 : 0.35, isMobile ? 0.2 : 0.15, isMobile ? 6.4 : 5.4)
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

  // Phase 2: Camera zooms down from orbit into Sidoarjo on the Globe
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

  // Phase 3: Show Tooltip & Sections Description
  const t2 = window.setTimeout(() => {
    currentPhase.value = 'desc'
    showDescription.value = true
    introCompleted.value = true
  }, 2400)
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
  renderer.toneMappingExposure = 1.15

  // 3. Natural Orbital Sunlight & Space Ambient
  const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.5)
  scene.add(ambientLight)

  const sunLight = new THREE.DirectionalLight(0xfffaed, 2.2)
  sunLight.position.set(6, 6, 8)
  scene.add(sunLight)

  const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.6)
  rimLight.position.set(-8, -4, -6)
  scene.add(rimLight)

  // 4. Main Globe Group
  globeGroup = new THREE.Group()
  globeGroup.rotation.y = LOCKED_ROT_Y
  globeGroup.rotation.x = LOCKED_ROT_X
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
    roughness: 0.65,
    metalness: 0.1,
  })
  const earthMesh = new THREE.Mesh(earthGeo, earthMat)
  globeGroup.add(earthMesh)

  // 6. Floating Clouds Sphere Layer
  const cloudsTexture = textureLoader.load('/textures/earth/earth_clouds.png')
  const cloudsGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.012, 64, 64)
  const cloudsMat = new THREE.MeshStandardMaterial({
    map: cloudsTexture,
    transparent: true,
    opacity: 0.55,
    blending: THREE.NormalBlending,
    depthWrite: false,
    roughness: 0.9,
  })
  cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat)
  globeGroup.add(cloudsMesh)

  // 7. Outer Atmospheric Fresnel Halo Ring
  const atmosphereGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.035, 64, 64)
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
        gl_FragColor = vec4(uColor, intensity * 0.9);
      }
    `,
  })
  const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat)
  globeGroup.add(atmosphereMesh)

  // 8. Subtle Starfield / Orbital Background Particles
  const starCount = isMobile ? 120 : 300
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
    size: 0.015,
    transparent: true,
    opacity: 0.35,
  })
  scene.add(new THREE.Points(starGeo, starMat))

  // 9. SIDOARJO HERO PINPOINT MARKER
  sidoarjoMarkerGroup = new THREE.Group()
  sidoarjoMarkerGroup.position.copy(sdaPos)
  sidoarjoMarkerGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), sdaNormal)
  sidoarjoMarkerGroup.scale.set(0.001, 0.001, 0.001)
  sidoarjoMarkerGroup.userData = { name: 'Sidoarjo', type: 'Current Location', id: 'sidoarjo-pin' }
  globeGroup.add(sidoarjoMarkerGroup)

  // Ground beacon base dot
  const sdaDotGeo = new THREE.SphereGeometry(0.045, 16, 16)
  const sdaDotMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
  const markerDotMesh = new THREE.Mesh(sdaDotGeo, sdaDotMat)
  sidoarjoMarkerGroup.add(markerDotMesh)

  // Ground needle pin
  const needleGeo = new THREE.ConeGeometry(0.035, 0.15, 16)
  const needleMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.85,
    metalness: 0.85,
    roughness: 0.2,
  })
  const needleMesh = new THREE.Mesh(needleGeo, needleMat)
  needleMesh.rotation.x = Math.PI
  needleMesh.position.y = 0.075
  sidoarjoMarkerGroup.add(needleMesh)

  // Ground Sonar Radar Rings
  radarRings = []
  for (let i = 0; i < 3; i++) {
    const ringGeo = new THREE.RingGeometry(0.03, 0.048, 32)
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    })
    const ringMesh = new THREE.Mesh(ringGeo, ringMat)
    ringMesh.rotation.x = -Math.PI / 2
    ringMesh.position.y = 0.01
    sidoarjoMarkerGroup.add(ringMesh)
    radarRings.push(ringMesh)
  }

  // Vertical Light Conduit Beam
  const beamHeight = 0.45
  const beamGeo = new THREE.CylinderGeometry(0.008, 0.008, beamHeight, 12)
  beamGeo.translate(0, beamHeight / 2, 0)
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.75,
  })
  const verticalBeamMesh = new THREE.Mesh(beamGeo, beamMat)
  sidoarjoMarkerGroup.add(verticalBeamMesh)

  // Floating Diamond Prism Beacon at the Top of the Pin
  const gemGeo = new THREE.OctahedronGeometry(0.045, 0)
  const gemMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.9,
    metalness: 0.9,
    roughness: 0.15,
  })
  beaconGemMesh = new THREE.Mesh(gemGeo, gemMat)
  beaconGemMesh.position.y = beamHeight + 0.03
  sidoarjoMarkerGroup.add(beaconGemMesh)

  // Outer Gimbal Halo Ring around the Beacon Prism
  const haloGeo = new THREE.TorusGeometry(0.09, 0.006, 16, 32)
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.8,
  })
  const haloMesh = new THREE.Mesh(haloGeo, haloMat)
  haloMesh.position.y = beamHeight + 0.03
  haloMesh.rotation.x = Math.PI / 3
  sidoarjoMarkerGroup.add(haloMesh)

  // 10. Main Render Loop
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

    // Globe Rotation: Lock onto Pulau Jawa / Sidoarjo (or follow drag)
    if (globeGroup) {
      if (!isDragging && introCompleted.value && viewMode.value === 'overview') {
        targetRotY = LOCKED_ROT_Y + Math.sin(now * 0.0003) * 0.08
        targetRotX = LOCKED_ROT_X + Math.cos(now * 0.0004) * 0.04
      } else if (!isDragging && introCompleted.value && viewMode.value === 'sidoarjo') {
        targetRotY = LOCKED_ROT_Y
        targetRotX = LOCKED_ROT_X
      }

      globeGroup.rotation.y = THREE.MathUtils.lerp(globeGroup.rotation.y, targetRotY, 0.06)
      globeGroup.rotation.x = THREE.MathUtils.lerp(globeGroup.rotation.x, targetRotX, 0.06)
    }

    // Drifting Clouds Layer
    if (cloudsMesh) {
      cloudsMesh.rotation.y += delta * 0.006
    }

    // Animated Radar Sonar Rings
    if (currentPhase.value !== 'island') {
      radarRings.forEach((ring, idx) => {
        const progress = ((now * 0.001 + idx * 0.33) % 1)
        const scale = 0.5 + progress * 5.5
        ring.scale.set(scale, scale, 1)
        const mat = ring.material as THREE.MeshBasicMaterial
        mat.opacity = (1 - progress) * 0.75
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

  // Start the Choreographed Sequence on Mount!
  startIntroSequence()
}

function updateScreenPositions() {
  if (!camera || !container.value || !sidoarjoMarkerGroup || !globeGroup) return
  const w = container.value.clientWidth
  const h = container.value.clientHeight

  const markerWorldPos = new THREE.Vector3()
  sidoarjoMarkerGroup.getWorldPosition(markerWorldPos)
  const normal = markerWorldPos.clone().normalize()
  // Project above the top of the beacon pin
  const label3DPos = markerWorldPos.clone().addScaledVector(normal, 0.55)
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

    targetRotY += dx * 0.005
    targetRotX = THREE.MathUtils.clamp(targetRotX + dy * 0.005, -0.65, 0.65)
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
    camTargetPos.z = THREE.MathUtils.clamp(camTargetPos.z + e.deltaY * 0.003, 2.6, 4.4)
  } else {
    camTargetPos.z = THREE.MathUtils.clamp(camTargetPos.z + e.deltaY * 0.004, 4.2, 7.8)
  }
}

function checkRaycast(e: PointerEvent, isClick: boolean) {
  if (!camera || !container.value || !scene) return

  raycaster.setFromCamera(mouseNDC, camera)
  const clickableObjects: THREE.Object3D[] = []

  if (sidoarjoMarkerGroup) clickableObjects.push(sidoarjoMarkerGroup)

  const hits = raycaster.intersectObjects(clickableObjects, true)

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
