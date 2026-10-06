<template>
  <div ref="container" class="globe-viewport relative w-full h-full select-none touch-pan-y overflow-hidden">
    <!-- WebGL Canvas -->
    <canvas
      v-if="webglSupported"
      ref="canvas"
      class="w-full h-full block cursor-grab active:cursor-grabbing outline-none"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @pointerleave="onPointerLeave"
    ></canvas>

    <!-- WebGL Fallback -->
    <div v-else class="globe-fallback flex flex-col items-center justify-center p-6 text-center h-full">
      <div class="fallback-sphere mb-6">
        <svg viewBox="0 0 100 100" class="w-36 h-36 opacity-35 text-zinc-400">
          <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" stroke-width="1" />
          <ellipse cx="50" cy="50" rx="46" ry="16" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3" />
          <line x1="50" y1="4" x2="50" y2="96" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3" />
          <line x1="4" y1="50" x2="96" y2="50" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3" />
        </svg>
      </div>
      <p class="font-mono text-xs uppercase tracking-widest text-zinc-400 mb-2">Global Platform Visualization</p>
      <p class="text-xs text-zinc-500 max-w-sm">{{ fallbackText }}</p>
    </div>

    <!-- Projected 2D HTML Labels Layer -->
    <div v-if="webglSupported" class="globe-labels-layer absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <!-- 1. CLUSTER COUNTER LABELS (Visible in Global View for multi-project clusters) -->
      <template v-if="!isZoomed">
        <div
          v-for="cluster in multiProjectClusters"
          :key="cluster.id"
          :ref="el => setClusterLabelRef(cluster.id, el as HTMLElement)"
          class="cluster-label absolute left-0 top-0 transition-opacity duration-200"
        >
          <button
            type="button"
            class="cluster-anchor pointer-events-auto flex items-center gap-2 -translate-y-1/2 cursor-pointer transition-transform duration-200 hover:scale-105 group"
            :aria-label="`Zoom into ${cluster.name} (${cluster.projectCount} projects)`"
            @click.stop="onClusterClick(cluster.id)"
          >
            <!-- Glowing Cluster Core Dot -->
            <span class="cluster-pulse-dot w-3 h-3 rounded-full shrink-0 flex items-center justify-center bg-blue-500 shadow-[0_0_14px_#3b82f6]">
              <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
            </span>

            <!-- Counter Pill Badge -->
            <div class="cluster-card py-1 px-3 rounded-full border border-blue-500/40 bg-white/95 dark:bg-black/85 backdrop-blur-md shadow-xl dark:shadow-2xl flex items-center gap-2 group-hover:border-blue-400 group-hover:bg-white dark:group-hover:bg-black/95">
              <span class="font-mono text-[10px] font-bold text-zinc-900 dark:text-white tracking-wider flex items-center gap-1">
                <span class="text-blue-600 dark:text-blue-400 font-extrabold">{{ cluster.projectCount }}</span>
                <span>PROJECTS</span>
              </span>
              <span class="font-mono text-[9px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-l border-zinc-200 dark:border-white/20 pl-2">
                {{ cluster.name }}
              </span>
              <span class="text-[9px] font-mono text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">⊕</span>
            </div>
          </button>
        </div>
      </template>

      <!-- 2. PROJECT LABELS (Visible for single projects in global view, OR all sub-projects in satellite view) -->
      <div
        v-for="marker in visibleMarkers"
        :key="marker.id"
        :ref="el => setLabelRef(marker.id, el as HTMLElement)"
        class="globe-marker-label absolute left-0 top-0 transition-opacity duration-200"
        :class="{ 'label-active': activeId === marker.id }"
      >
        <button
          type="button"
          class="label-anchor pointer-events-auto flex items-center gap-2 -translate-y-1/2 cursor-pointer transition-transform duration-200 hover:scale-105 group"
          :aria-label="`Select ${marker.title}`"
          @click.stop="onMarkerClick(marker.id)"
        >
          <!-- Pulse Dot -->
          <span
            class="marker-dot-halo w-2.5 h-2.5 rounded-full shrink-0 flex items-center justify-center transition-transform duration-200"
            :style="{ backgroundColor: marker.accentColor, boxShadow: `0 0 12px ${marker.accentColor}` }"
          ></span>

          <!-- Label Card -->
          <div
            class="marker-card py-1 px-2.5 rounded border border-zinc-200/90 dark:border-white/10 bg-white/95 dark:bg-black/75 backdrop-blur-md shadow-lg dark:shadow-xl text-left transition-all duration-200 group-hover:border-zinc-300 dark:group-hover:border-white/30"
            :class="{ '!border-blue-500 !bg-white ring-1 ring-blue-500/30 dark:!border-white/50 dark:!bg-black/90 dark:ring-white/25': activeId === marker.id }"
          >
            <p class="text-[11px] font-semibold tracking-tight text-zinc-900 dark:text-white leading-tight flex items-center gap-1.5 whitespace-nowrap">
              {{ marker.title }}
              <span v-if="activeId === marker.id" class="text-[9px] opacity-70">↗</span>
            </p>
            <p class="text-[8.5px] font-mono tracking-wider uppercase text-zinc-500 dark:text-zinc-400 leading-tight whitespace-nowrap">
              {{ marker.subtitle }}
            </p>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import * as THREE from 'three'
import {
  latLngToVector3,
  createGridLines,
  createCoastlineGeometry,
  createLandPointsGeometry,
  createArcPoints,
  isWebGLAvailable,
} from './globeMath'
import { globeMarkers, globeClusters, globeArcs, type GlobeMarker, type GlobeCluster } from './globeData'
import { isDark } from '@/composables/useTheme'

const props = withDefaults(
  defineProps<{
    activeId: string
    isZoomed?: boolean
    activeClusterId?: string | null
    fallbackText?: string
  }>(),
  {
    isZoomed: false,
    activeClusterId: null,
  }
)

const emit = defineEmits<{
  (e: 'select', markerId: string): void
  (e: 'zoomCluster', clusterId: string): void
  (e: 'zoomOut'): void
}>()

const container = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const webglSupported = ref(true)

const labelRefs = new Map<string, HTMLElement>()
const clusterLabelRefs = new Map<string, HTMLElement>()

function setLabelRef(id: string, el: HTMLElement | null) {
  if (el) labelRefs.set(id, el)
  else labelRefs.delete(id)
}

function setClusterLabelRef(id: string, el: HTMLElement | null) {
  if (el) clusterLabelRefs.set(id, el)
  else clusterLabelRefs.delete(id)
}

// Multi-project clusters (> 1 project)
const multiProjectClusters = computed(() => {
  return globeClusters.value.filter(c => c.projectCount > 1)
})

// Markers that should display HTML cards:
// - When zoomed in: only markers belonging to the active cluster
// - When not zoomed in: only markers from clusters that have exactly 1 project
const visibleMarkers = computed(() => {
  if (props.isZoomed && props.activeClusterId) {
    return globeMarkers.value.filter(m => m.clusterId === props.activeClusterId)
  }
  return globeMarkers.value.filter(m => {
    const cluster = globeClusters.value.find(c => c.id === m.clusterId)
    return !cluster || cluster.projectCount <= 1
  })
})

function onMarkerClick(id: string) {
  emit('select', id)
}

function onClusterClick(clusterId: string) {
  emit('zoomCluster', clusterId)
}

// Three.js Scene Variables
let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let globeGroup: THREE.Group | null = null

// Meshes & Geometries
interface MarkerMeshItem {
  id: string
  clusterId: string
  dotMesh: THREE.Mesh
  hitMesh: THREE.Mesh
  normalVec: THREE.Vector3
  centerPos: THREE.Vector3
  satelliteAngle: number
  maxSatelliteRadius: number
  currentRadius: number
}

let markerMeshes: MarkerMeshItem[] = []
let clusterHubMeshes: {
  id: string
  mesh: THREE.Mesh
  hitMesh: THREE.Mesh
  pos: THREE.Vector3
  normal: THREE.Vector3
}[] = []

let arcMeshList: {
  line: THREE.Line
  pulseMesh: THREE.Mesh
  fromId: string
  toId: string
  curvePoints: THREE.Vector3[]
  speed: number
  offset: number
}[] = []

// Satellite Connector Lines
let satelliteBeamLines: THREE.LineSegments | null = null
let beamLinePositions: Float32Array | null = null

// Dynamic Theme Materials
let baseSphereMat: THREE.MeshBasicMaterial | null = null
let gridLineMat: THREE.LineBasicMaterial | null = null
let landPointsMat: THREE.PointsMaterial | null = null
let coastMat: THREE.LineBasicMaterial | null = null
let satelliteBeamMat: THREE.LineBasicMaterial | null = null

// Lights for 3D Volumetric Shading
let sunLight: THREE.DirectionalLight | null = null
let ambientLight: THREE.AmbientLight | null = null

// Celestial Space Objects (Stars, Moon, Satellites, Planets, Meteor)
let celestialGroup: THREE.Group | null = null
let starPointsMesh: THREE.Points | null = null
let starPointsMat: THREE.PointsMaterial | null = null
let moonMesh: THREE.Mesh | null = null
let moonMat: THREE.MeshStandardMaterial | null = null
let moonOrbitLine: THREE.LineLoop | null = null
let moonOrbitMat: THREE.LineBasicMaterial | null = null
let orbitSatellites: {
  group: THREE.Group
  orbitRadius: number
  inclinationX: number
  inclinationZ: number
  speed: number
  phase: number
}[] = []
let satOrbitLinesMat: THREE.LineBasicMaterial | null = null
let saturnGroup: THREE.Group | null = null
let saturnMat: THREE.MeshStandardMaterial | null = null
let saturnRingMat: THREE.MeshStandardMaterial | null = null
let marsMesh: THREE.Mesh | null = null
let marsMat: THREE.MeshStandardMaterial | null = null
let jupiterMesh: THREE.Mesh | null = null
let jupiterMat: THREE.MeshStandardMaterial | null = null
let meteorLine: THREE.Line | null = null
let meteorHeadMesh: THREE.Mesh | null = null
let meteorMat: THREE.LineBasicMaterial | null = null
let meteorHeadMat: THREE.MeshBasicMaterial | null = null
let meteorLinePosAttr: THREE.BufferAttribute | null = null

interface MeteorState {
  active: boolean
  startTime: number
  duration: number
  nextSpawnTime: number
  startPos: THREE.Vector3
  endPos: THREE.Vector3
}

const meteorState: MeteorState = {
  active: false,
  startTime: 0,
  duration: 750,
  nextSpawnTime: 3500,
  startPos: new THREE.Vector3(),
  endPos: new THREE.Vector3(),
}

let animFrameId = 0
let resizeObserver: ResizeObserver | null = null

// Interaction & Camera State
let isDragging = false
let pointerDownPos = { x: 0, y: 0 }
let lastPointerPos = { x: 0, y: 0 }
let dragVelocity = { x: 0, y: 0 }
let mousePosNDC = new THREE.Vector2(-10, -10)
let raycaster = new THREE.Raycaster()
let targetCamTilt = { x: 0, y: 0 }
let currentCamTilt = { x: 0, y: 0 }

// Target Rotation towards active target
let isTargetingMarker = false
let targetRotationY = -1.45
let targetRotationX = 0.1
let lastUserInteractionTime = 0

const GLOBE_RADIUS = 1.5

function calculateTargetRotation(markerId: string) {
  const m = globeMarkers.value.find(item => item.id === markerId)
  if (!m) return

  const pos = latLngToVector3(m.lat, m.lng, GLOBE_RADIUS)
  targetRotationY = -Math.atan2(pos.x, pos.z)
  targetRotationX = Math.max(-0.45, Math.min(0.45, (m.lat * Math.PI / 180) * 0.35))
  isTargetingMarker = true
}

function calculateClusterRotation(clusterId: string) {
  const c = globeClusters.value.find(item => item.id === clusterId)
  if (!c) return

  const pos = latLngToVector3(c.lat, c.lng, GLOBE_RADIUS)
  targetRotationY = -Math.atan2(pos.x, pos.z)
  targetRotationX = Math.max(-0.45, Math.min(0.45, (c.lat * Math.PI / 180) * 0.35))
  isTargetingMarker = true
}

function shortestAngleDiff(target: number, current: number): number {
  const diff = (target - current) % (Math.PI * 2)
  return ((diff + Math.PI * 3) % (Math.PI * 2)) - Math.PI
}

// Compute tangent position on sphere surface for satellite orbit
function computeSatellitePosition(centerPos: THREE.Vector3, angle: number, radius: number): THREE.Vector3 {
  if (radius <= 0.001) return centerPos.clone()

  const normal = centerPos.clone().normalize()
  const up = Math.abs(normal.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0)
  const u = new THREE.Vector3().crossVectors(normal, up).normalize()
  const v = new THREE.Vector3().crossVectors(normal, u).normalize()

  const offset = u.clone().multiplyScalar(Math.cos(angle) * radius).add(v.clone().multiplyScalar(Math.sin(angle) * radius))
  const pos = centerPos.clone().add(offset).normalize().multiplyScalar(GLOBE_RADIUS * 1.014)
  return pos
}

function applyThemeMaterials(dark: boolean) {
  if (baseSphereMat) {
    baseSphereMat.color.setHex(dark ? 0x07090e : 0xf1f5f9)
    baseSphereMat.opacity = dark ? 0.98 : 0.98
  }
  if (gridLineMat) {
    gridLineMat.color.setHex(dark ? 0x334155 : 0x94a3b8)
    gridLineMat.opacity = dark ? 0.16 : 0.28
  }
  if (landPointsMat) {
    landPointsMat.color.setHex(dark ? 0x94a3b8 : 0x334155)
    landPointsMat.opacity = dark ? 0.8 : 0.85
  }
  if (coastMat) {
    coastMat.color.setHex(dark ? 0x475569 : 0x64748b)
    coastMat.opacity = dark ? 0.35 : 0.45
  }
  if (satelliteBeamMat) {
    satelliteBeamMat.color.setHex(dark ? 0x38bdf8 : 0x0284c7)
    satelliteBeamMat.opacity = dark ? 0.35 : 0.5
  }
  for (const a of arcMeshList) {
    const lMat = a.line.material as THREE.LineBasicMaterial
    lMat.color.setHex(dark ? 0x64748b : 0x94a3b8)
    const pMat = a.pulseMesh.material as THREE.MeshBasicMaterial
    pMat.color.setHex(dark ? 0xf8fafc : 0x2563eb)
  }

  // Celestial Objects Theme Updates
  if (starPointsMat) {
    starPointsMat.color.setHex(dark ? 0xf8fafc : 0x64748b)
    starPointsMat.opacity = dark ? 0.65 : 0.35
  }
  if (moonMat) {
    moonMat.color.setHex(dark ? 0xe2e8f0 : 0x94a3b8)
    moonMat.roughness = dark ? 0.85 : 0.75
  }
  if (moonOrbitMat) {
    moonOrbitMat.color.setHex(dark ? 0x64748b : 0x94a3b8)
    moonOrbitMat.opacity = dark ? 0.15 : 0.22
  }
  if (satOrbitLinesMat) {
    satOrbitLinesMat.color.setHex(dark ? 0x38bdf8 : 0x0284c7)
    satOrbitLinesMat.opacity = dark ? 0.18 : 0.26
  }
  if (saturnMat) {
    saturnMat.color.setHex(dark ? 0xf59e0b : 0xd97706)
  }
  if (saturnRingMat) {
    saturnRingMat.color.setHex(dark ? 0xfde68a : 0xb45309)
  }
  if (marsMat) {
    marsMat.color.setHex(dark ? 0xef4444 : 0xdc2626)
  }
  if (jupiterMat) {
    jupiterMat.color.setHex(dark ? 0xfde68a : 0xc2410c)
  }
  if (sunLight) {
    sunLight.intensity = dark ? 2.4 : 1.8
  }
  if (ambientLight) {
    ambientLight.intensity = dark ? 0.4 : 0.65
  }
  if (meteorMat) {
    meteorMat.color.setHex(dark ? 0xffffff : 0x0284c7)
  }
  if (meteorHeadMat) {
    meteorHeadMat.color.setHex(dark ? 0xffffff : 0x0284c7)
  }
}

watch(isDark, dark => {
  applyThemeMaterials(dark)
})

watch(() => props.activeId, newId => {
  if (newId) {
    calculateTargetRotation(newId)
  }
})

watch(() => props.activeClusterId, cId => {
  if (cId && props.isZoomed) {
    calculateClusterRotation(cId)
  }
})

watch(() => props.isZoomed, zoomed => {
  if (zoomed && props.activeClusterId) {
    calculateClusterRotation(props.activeClusterId)
  }
})

function initThree() {
  if (!canvas.value || !container.value) return

  const width = container.value.clientWidth || window.innerWidth
  const height = container.value.clientHeight || window.innerHeight

  // 1. Scene & Camera
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100)
  const initialDist = width < 640 ? 4.8 : (width < 1024 ? 4.3 : 3.8)
  camera.position.set(0, 0, initialDist)

  // Ambient & Sun Lights for Volumetric 3D Shading
  ambientLight = new THREE.AmbientLight(0xffffff, isDark.value ? 0.4 : 0.65)
  scene.add(ambientLight)

  sunLight = new THREE.DirectionalLight(0xffffff, isDark.value ? 2.4 : 1.8)
  sunLight.position.set(6, 4, 5)
  scene.add(sunLight)

  // 2. WebGL Renderer
  renderer = new THREE.WebGLRenderer({
    canvas: canvas.value,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))

  // 3. Main Globe Group
  globeGroup = new THREE.Group()
  globeGroup.rotation.z = 0.12
  scene.add(globeGroup)

  // 4. Base Sphere
  const sphereGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64)
  baseSphereMat = new THREE.MeshBasicMaterial({
    color: 0x07090e,
    transparent: true,
    opacity: 0.98,
  })
  const baseSphere = new THREE.Mesh(sphereGeo, baseSphereMat)
  globeGroup.add(baseSphere)

  // 5. Lat/Long Grid Lines
  const gridGeo = createGridLines(GLOBE_RADIUS * 1.002)
  gridLineMat = new THREE.LineBasicMaterial({
    color: 0x334155,
    transparent: true,
    opacity: 0.16,
  })
  const gridLineMesh = new THREE.LineSegments(gridGeo, gridLineMat)
  globeGroup.add(gridLineMesh)

  // 7. Land Point Cloud
  const landPointsGeo = createLandPointsGeometry(GLOBE_RADIUS * 1.006)
  landPointsMat = new THREE.PointsMaterial({
    color: 0x94a3b8,
    size: 0.024,
    transparent: true,
    opacity: 0.8,
  })
  const landPointsMesh = new THREE.Points(landPointsGeo, landPointsMat)
  globeGroup.add(landPointsMesh)

  // 8. Coastlines
  const coastGeo = createCoastlineGeometry(GLOBE_RADIUS * 1.008)
  coastMat = new THREE.LineBasicMaterial({
    color: 0x475569,
    transparent: true,
    opacity: 0.35,
  })
  const coastMesh = new THREE.LineSegments(coastGeo, coastMat)
  globeGroup.add(coastMesh)

  // 9. Arcs, Hubs & Markers
  buildArcs()
  buildClusterHubs()
  buildMarkers()
  buildSatelliteBeams()

  // 10. Celestial Space Environment (Stars, Moon, Satellites, Planets, Meteor)
  celestialGroup = new THREE.Group()
  scene.add(celestialGroup)
  buildStarfield()
  buildMoon()
  buildOrbitalSatellites()
  buildDistantPlanets()
  buildMeteor()

  // Apply active theme materials
  applyThemeMaterials(isDark.value)

  // Initial target alignment
  if (props.activeId) {
    calculateTargetRotation(props.activeId)
    if (globeGroup) {
      globeGroup.rotation.y = targetRotationY
      globeGroup.rotation.x = targetRotationX
    }
  }
}

function buildSatelliteBeams() {
  if (!globeGroup) return

  // Satellite connector lines (connecting center to fanning satellite dots)
  const maxBeams = 16
  beamLinePositions = new Float32Array(maxBeams * 2 * 3)
  const beamGeo = new THREE.BufferGeometry()
  beamGeo.setAttribute('position', new THREE.BufferAttribute(beamLinePositions, 3))

  satelliteBeamMat = new THREE.LineBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.35,
  })
  satelliteBeamLines = new THREE.LineSegments(beamGeo, satelliteBeamMat)
  satelliteBeamLines.visible = false
  globeGroup.add(satelliteBeamLines)
}

function buildArcs() {
  if (!globeGroup) return
  arcMeshList = []

  const arcs = globeArcs.value
  for (let i = 0; i < arcs.length; i++) {
    const arc = arcs[i]
    const p1 = latLngToVector3(arc.fromLatLng[0], arc.fromLatLng[1], GLOBE_RADIUS * 1.01)
    const p2 = latLngToVector3(arc.toLatLng[0], arc.toLatLng[1], GLOBE_RADIUS * 1.01)

    const points = createArcPoints(p1, p2, GLOBE_RADIUS, 42)
    const curveGeo = new THREE.BufferGeometry().setFromPoints(points)
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x64748b,
      transparent: true,
      opacity: 0.28,
    })
    const line = new THREE.Line(curveGeo, lineMat)
    globeGroup.add(line)

    const pulseGeo = new THREE.SphereGeometry(0.016, 8, 8)
    const pulseMat = new THREE.MeshBasicMaterial({
      color: 0xf8fafc,
      transparent: true,
      opacity: 0.85,
    })
    const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat)
    pulseMesh.position.copy(points[0])
    globeGroup.add(pulseMesh)

    arcMeshList.push({
      line,
      pulseMesh,
      fromId: arc.fromId,
      toId: arc.toId,
      curvePoints: points,
      speed: 0.24 + (i % 3) * 0.08,
      offset: i * 0.22,
    })
  }
}

function buildClusterHubs() {
  if (!globeGroup) return
  clusterHubMeshes = []

  const clusters = globeClusters.value
  for (const c of clusters) {
    if (c.projectCount <= 1) continue // Single project nodes handled directly

    const pos = latLngToVector3(c.lat, c.lng, GLOBE_RADIUS * 1.012)
    const normal = pos.clone().normalize()

    // Cluster Central Glowing Sphere Point
    const hubGeo = new THREE.SphereGeometry(0.046, 16, 16)
    const hubMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6 })
    const hubMesh = new THREE.Mesh(hubGeo, hubMat)
    hubMesh.position.copy(pos)

    // Hit Sphere for Raycasting
    const hitGeo = new THREE.SphereGeometry(0.24, 8, 8)
    const hitMat = new THREE.MeshBasicMaterial({ visible: false })
    const hitMesh = new THREE.Mesh(hitGeo, hitMat)
    hitMesh.position.copy(pos)
    hitMesh.userData = { clusterId: c.id }

    globeGroup.add(hubMesh)
    globeGroup.add(hitMesh)

    clusterHubMeshes.push({
      id: c.id,
      mesh: hubMesh,
      hitMesh,
      pos,
      normal,
    })
  }
}

function buildMarkers() {
  if (!globeGroup) return
  markerMeshes = []

  const list = globeMarkers.value
  for (const m of list) {
    const pos = latLngToVector3(m.lat, m.lng, GLOBE_RADIUS * 1.012)
    const normal = pos.clone().normalize()

    // Core 3D Dot Point
    const dotGeo = new THREE.SphereGeometry(0.034, 16, 16)
    const dotMat = new THREE.MeshBasicMaterial({ color: m.accentColor })
    const dotMesh = new THREE.Mesh(dotGeo, dotMat)
    dotMesh.position.copy(pos)

    // Hit Sphere for Raycasting
    const hitGeo = new THREE.SphereGeometry(0.16, 8, 8)
    const hitMat = new THREE.MeshBasicMaterial({ visible: false })
    const hitMesh = new THREE.Mesh(hitGeo, hitMat)
    hitMesh.position.copy(pos)
    hitMesh.userData = { markerId: m.id }

    globeGroup.add(dotMesh)
    globeGroup.add(hitMesh)

    markerMeshes.push({
      id: m.id,
      clusterId: m.clusterId,
      dotMesh,
      hitMesh,
      normalVec: normal,
      centerPos: pos,
      satelliteAngle: m.satelliteAngle,
      maxSatelliteRadius: m.satelliteRadius,
      currentRadius: 0,
    })
  }
}

function buildStarfield() {
  if (!celestialGroup) return

  const starCount = 750
  const positions = new Float32Array(starCount * 3)

  for (let i = 0; i < starCount; i++) {
    const r = 14 + Math.random() * 11
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1) - Math.PI / 2

    positions[i * 3] = r * Math.cos(phi) * Math.cos(theta)
    positions[i * 3 + 1] = r * Math.sin(phi)
    positions[i * 3 + 2] = r * Math.cos(phi) * Math.sin(theta)
  }

  const starGeo = new THREE.BufferGeometry()
  starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  starPointsMat = new THREE.PointsMaterial({
    color: isDark.value ? 0xf8fafc : 0x64748b,
    size: 0.034,
    transparent: true,
    opacity: isDark.value ? 0.65 : 0.35,
  })

  starPointsMesh = new THREE.Points(starGeo, starPointsMat)
  celestialGroup.add(starPointsMesh)
}

function buildMoon() {
  if (!celestialGroup) return

  const MOON_ORBIT_R = 3.05

  // 1. Orbit Path Ring
  const points: THREE.Vector3[] = []
  const segments = 64
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2
    points.push(new THREE.Vector3(Math.cos(a) * MOON_ORBIT_R, 0, Math.sin(a) * MOON_ORBIT_R))
  }
  const orbitGeo = new THREE.BufferGeometry().setFromPoints(points)
  moonOrbitMat = new THREE.LineBasicMaterial({
    color: isDark.value ? 0x64748b : 0x94a3b8,
    transparent: true,
    opacity: isDark.value ? 0.15 : 0.22,
  })
  moonOrbitLine = new THREE.LineLoop(orbitGeo, moonOrbitMat)
  moonOrbitLine.rotation.x = 0.38
  moonOrbitLine.rotation.z = -0.15
  celestialGroup.add(moonOrbitLine)

  // 2. Moon Body
  const moonGeo = new THREE.SphereGeometry(0.14, 32, 32)
  moonMat = new THREE.MeshStandardMaterial({
    color: isDark.value ? 0xe2e8f0 : 0x94a3b8,
    roughness: 0.85,
    metalness: 0.05,
  })
  moonMesh = new THREE.Mesh(moonGeo, moonMat)

  // Initialize initial orbit position
  const initAngle = 0.6
  const localX = Math.cos(initAngle) * MOON_ORBIT_R
  const localZ = Math.sin(initAngle) * MOON_ORBIT_R
  const initPos = new THREE.Vector3(localX, 0, localZ)
  initPos.applyAxisAngle(new THREE.Vector3(1, 0, 0), 0.38)
  initPos.applyAxisAngle(new THREE.Vector3(0, 0, 1), -0.15)
  moonMesh.position.copy(initPos)

  celestialGroup.add(moonMesh)
}

function buildOrbitalSatellites() {
  if (!celestialGroup) return
  orbitSatellites = []

  satOrbitLinesMat = new THREE.LineBasicMaterial({
    color: isDark.value ? 0x38bdf8 : 0x0284c7,
    transparent: true,
    opacity: isDark.value ? 0.18 : 0.26,
  })

  const satConfigs = [
    {
      radius: 1.86,
      inclinationX: 0.88,
      inclinationZ: 0.2,
      speed: 0.00075,
      phase: 0.5,
      busColor: 0xe2e8f0,
      panelColor: 0x0284c7,
    },
    {
      radius: 2.18,
      inclinationX: 1.36,
      inclinationZ: -0.4,
      speed: 0.00055,
      phase: 2.4,
      busColor: 0xf1f5f9,
      panelColor: 0x6366f1,
    },
  ]

  for (const config of satConfigs) {
    // 1. Orbit track
    const points: THREE.Vector3[] = []
    const segs = 64
    for (let i = 0; i <= segs; i++) {
      const a = (i / segs) * Math.PI * 2
      points.push(new THREE.Vector3(Math.cos(a) * config.radius, 0, Math.sin(a) * config.radius))
    }
    const orbitGeo = new THREE.BufferGeometry().setFromPoints(points)
    const trackLine = new THREE.LineLoop(orbitGeo, satOrbitLinesMat)
    trackLine.rotation.x = config.inclinationX
    trackLine.rotation.z = config.inclinationZ
    celestialGroup.add(trackLine)

    // 2. Satellite Group (3D Volumetric Metallic Probe)
    const satGroup = new THREE.Group()

    // Central bus with shiny metallic foil material
    const busGeo = new THREE.BoxGeometry(0.045, 0.028, 0.028)
    const busMat = new THREE.MeshStandardMaterial({
      color: config.busColor,
      metalness: 0.85,
      roughness: 0.25,
    })
    const busMesh = new THREE.Mesh(busGeo, busMat)
    satGroup.add(busMesh)

    // Solar array wings with blue metallic sheen
    const wingGeo = new THREE.BoxGeometry(0.08, 0.003, 0.032)
    const wingMat = new THREE.MeshStandardMaterial({
      color: config.panelColor,
      metalness: 0.9,
      roughness: 0.15,
    })
    const wingLeft = new THREE.Mesh(wingGeo, wingMat)
    wingLeft.position.x = 0.065
    const wingRight = new THREE.Mesh(wingGeo, wingMat)
    wingRight.position.x = -0.065
    satGroup.add(wingLeft)
    satGroup.add(wingRight)

    const beaconGeo = new THREE.SphereGeometry(0.008, 8, 8)
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat)
    beaconMesh.position.y = 0.02
    satGroup.add(beaconMesh)

    // Set initial position
    const initPos = new THREE.Vector3(Math.cos(config.phase) * config.radius, 0, Math.sin(config.phase) * config.radius)
    initPos.applyAxisAngle(new THREE.Vector3(1, 0, 0), config.inclinationX)
    initPos.applyAxisAngle(new THREE.Vector3(0, 0, 1), config.inclinationZ)
    satGroup.position.copy(initPos)
    satGroup.rotation.y = config.phase + Math.PI / 2

    celestialGroup.add(satGroup)

    orbitSatellites.push({
      group: satGroup,
      orbitRadius: config.radius,
      inclinationX: config.inclinationX,
      inclinationZ: config.inclinationZ,
      speed: config.speed,
      phase: config.phase,
    })
  }
}

function buildDistantPlanets() {
  if (!celestialGroup) return

  // 1. Saturn
  saturnGroup = new THREE.Group()
  saturnGroup.position.set(4.5, 2.2, -4.5)

  const saturnGeo = new THREE.SphereGeometry(0.28, 32, 32)
  saturnMat = new THREE.MeshStandardMaterial({
    color: isDark.value ? 0xf59e0b : 0xd97706,
    roughness: 0.55,
    metalness: 0.15,
  })
  const saturnMesh = new THREE.Mesh(saturnGeo, saturnMat)
  saturnGroup.add(saturnMesh)

  const ringGeo = new THREE.RingGeometry(0.36, 0.62, 48)
  saturnRingMat = new THREE.MeshStandardMaterial({
    color: isDark.value ? 0xfde68a : 0xb45309,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.75,
    roughness: 0.4,
  })
  const ringMesh = new THREE.Mesh(ringGeo, saturnRingMat)
  ringMesh.rotation.x = 1.15
  ringMesh.rotation.y = 0.35
  saturnGroup.add(ringMesh)
  celestialGroup.add(saturnGroup)

  // 2. Mars
  const marsGeo = new THREE.SphereGeometry(0.14, 24, 24)
  marsMat = new THREE.MeshStandardMaterial({
    color: isDark.value ? 0xef4444 : 0xdc2626,
    roughness: 0.75,
    metalness: 0.1,
  })
  marsMesh = new THREE.Mesh(marsGeo, marsMat)
  marsMesh.position.set(-4.0, -2.0, -4.0)
  celestialGroup.add(marsMesh)

  // 3. Jupiter
  const jupiterGeo = new THREE.SphereGeometry(0.40, 32, 32)
  jupiterMat = new THREE.MeshStandardMaterial({
    color: isDark.value ? 0xfde68a : 0xc2410c,
    roughness: 0.6,
    metalness: 0.1,
  })
  jupiterMesh = new THREE.Mesh(jupiterGeo, jupiterMat)
  jupiterMesh.position.set(-4.8, 2.6, -5.5)
  celestialGroup.add(jupiterMesh)
}

function buildMeteor() {
  if (!celestialGroup) return

  const positions = new Float32Array(2 * 3)
  const meteorGeo = new THREE.BufferGeometry()
  meteorLinePosAttr = new THREE.BufferAttribute(positions, 3)
  meteorGeo.setAttribute('position', meteorLinePosAttr)

  meteorMat = new THREE.LineBasicMaterial({
    color: isDark.value ? 0xffffff : 0x0284c7,
    transparent: true,
    opacity: 0,
  })
  meteorLine = new THREE.Line(meteorGeo, meteorMat)
  meteorLine.visible = false
  celestialGroup.add(meteorLine)

  const headGeo = new THREE.SphereGeometry(0.026, 8, 8)
  meteorHeadMat = new THREE.MeshBasicMaterial({
    color: isDark.value ? 0xffffff : 0x0284c7,
    transparent: true,
    opacity: 0,
  })
  meteorHeadMesh = new THREE.Mesh(headGeo, meteorHeadMat)
  meteorHeadMesh.visible = false
  celestialGroup.add(meteorHeadMesh)
}

function animateCelestialObjects(currentTime: number, delta: number, reducedMotion: boolean) {
  if (!celestialGroup) return

  if (!reducedMotion) {
    celestialGroup.rotation.y = currentTime * 0.00002
  }

  // 1. Moon Orbit & Rotation
  if (moonMesh) {
    const moonAngle = currentTime * 0.00016
    const r = 3.05
    const localX = Math.cos(moonAngle) * r
    const localZ = Math.sin(moonAngle) * r
    const pos = new THREE.Vector3(localX, 0, localZ)
    pos.applyAxisAngle(new THREE.Vector3(1, 0, 0), 0.38)
    pos.applyAxisAngle(new THREE.Vector3(0, 0, 1), -0.15)
    moonMesh.position.copy(pos)
    if (!reducedMotion) {
      moonMesh.rotation.y += delta * 0.15
    }
  }

  // 2. Artificial Satellites in Earth Orbit
  for (const sat of orbitSatellites) {
    const angle = currentTime * sat.speed + sat.phase
    const r = sat.orbitRadius
    const pos = new THREE.Vector3(Math.cos(angle) * r, 0, Math.sin(angle) * r)
    pos.applyAxisAngle(new THREE.Vector3(1, 0, 0), sat.inclinationX)
    pos.applyAxisAngle(new THREE.Vector3(0, 0, 1), sat.inclinationZ)
    sat.group.position.copy(pos)
    sat.group.rotation.y = angle + Math.PI / 2
  }

  // 3. Distant Planets
  if (!reducedMotion) {
    if (saturnGroup) saturnGroup.rotation.y += delta * 0.06
    if (marsMesh) marsMesh.rotation.y += delta * 0.08
    if (jupiterMesh) jupiterMesh.rotation.y += delta * 0.04
  }

  // 4. Periodic Meteor / Shooting Star Streak
  if (meteorLine && meteorHeadMesh && meteorLinePosAttr && !reducedMotion) {
    if (!meteorState.active && currentTime > meteorState.nextSpawnTime) {
      meteorState.active = true
      meteorState.startTime = currentTime
      meteorState.duration = 650 + Math.random() * 250
      meteorState.nextSpawnTime = currentTime + 7000 + Math.random() * 6000

      const startX = -6 + Math.random() * 12
      const startY = 3.5 + Math.random() * 3
      const startZ = -3 - Math.random() * 3
      meteorState.startPos.set(startX, startY, startZ)

      const dirX = startX > 0 ? -1 - Math.random() * 0.5 : 1 + Math.random() * 0.5
      const dirY = -0.7 - Math.random() * 0.5
      const dirZ = -0.1 + Math.random() * 0.3
      const dir = new THREE.Vector3(dirX, dirY, dirZ).normalize()
      const length = 9 + Math.random() * 4
      meteorState.endPos.copy(meteorState.startPos).addScaledVector(dir, length)

      meteorLine.visible = true
      meteorHeadMesh.visible = true
    } else if (meteorState.active) {
      const progress = (currentTime - meteorState.startTime) / meteorState.duration
      if (progress >= 1) {
        meteorState.active = false
        meteorLine.visible = false
        meteorHeadMesh.visible = false
      } else {
        const headPos = new THREE.Vector3().lerpVectors(meteorState.startPos, meteorState.endPos, progress)
        const tailProgress = Math.max(0, progress - 0.22)
        const tailPos = new THREE.Vector3().lerpVectors(meteorState.startPos, meteorState.endPos, tailProgress)

        const arr = meteorLinePosAttr.array as Float32Array
        arr[0] = tailPos.x
        arr[1] = tailPos.y
        arr[2] = tailPos.z
        arr[3] = headPos.x
        arr[4] = headPos.y
        arr[5] = headPos.z
        meteorLinePosAttr.needsUpdate = true

        meteorHeadMesh.position.copy(headPos)

        const alpha = Math.sin(progress * Math.PI)
        if (meteorMat) meteorMat.opacity = alpha * (isDark.value ? 0.95 : 0.8)
        if (meteorHeadMat) meteorHeadMat.opacity = alpha
      }
    }
  }
}

let lastTime = performance.now()

function animate(currentTime: number) {
  animFrameId = requestAnimationFrame(animate)

  const delta = Math.min(0.05, (currentTime - lastTime) / 1000)
  lastTime = currentTime

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches

  // 1. Camera Zoom Level Interpolation
  if (camera && container.value) {
    const w = container.value.clientWidth
    const baseGlobalDist = w < 640 ? 4.8 : (w < 1024 ? 4.3 : 3.8)
    const satelliteZoomDist = w < 640 ? 2.55 : 2.2
    const targetCamDist = props.isZoomed ? satelliteZoomDist : baseGlobalDist

    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamDist, 0.065)
  }

  // 2. Globe Rotation / Drag
  if (globeGroup) {
    if (isDragging) {
      isTargetingMarker = false
      lastUserInteractionTime = currentTime
    } else if (isTargetingMarker) {
      const diffY = shortestAngleDiff(targetRotationY, globeGroup.rotation.y)
      const diffX = targetRotationX - globeGroup.rotation.x

      globeGroup.rotation.y += diffY * 0.075
      globeGroup.rotation.x += diffX * 0.075

      if (Math.abs(diffY) < 0.002 && Math.abs(diffX) < 0.002) {
        isTargetingMarker = false
      }
    } else {
      if (Math.abs(dragVelocity.x) > 0.0001 || Math.abs(dragVelocity.y) > 0.0001) {
        globeGroup.rotation.y += dragVelocity.x
        globeGroup.rotation.x = Math.max(-0.55, Math.min(0.55, globeGroup.rotation.x + dragVelocity.y))
        dragVelocity.x *= 0.92
        dragVelocity.y *= 0.92
      } else if (!reducedMotion && !props.isZoomed && (currentTime - lastUserInteractionTime > 2500)) {
        globeGroup.rotation.y += delta * 0.02
      }
    }
  }

  // 3. Camera Parallax
  if (camera && !reducedMotion && !props.isZoomed) {
    currentCamTilt.x += (targetCamTilt.x - currentCamTilt.x) * 0.06
    currentCamTilt.y += (targetCamTilt.y - currentCamTilt.y) * 0.06
    camera.position.x = currentCamTilt.x
    camera.position.y = currentCamTilt.y
    camera.lookAt(0, 0, 0)
  }

  // 4. Update Satellite Orbits & Positions
  updateSatellitePositions(currentTime)

  // 5. Animate Arcs & Pulses
  if (!reducedMotion) {
    for (const a of arcMeshList) {
      const isArcActive = a.toId === props.activeId || a.fromId === props.activeId
      const targetOpacity = isArcActive ? 0.75 : 0.18
      const lineMat = a.line.material as THREE.LineBasicMaterial
      lineMat.opacity = THREE.MathUtils.lerp(lineMat.opacity, targetOpacity, 0.1)

      const t = ((currentTime * 0.001 * a.speed + a.offset) % 1)
      const index = Math.floor(t * (a.curvePoints.length - 1))
      const nextIndex = Math.min(a.curvePoints.length - 1, index + 1)
      const alpha = (t * (a.curvePoints.length - 1)) - index

      const pt = a.curvePoints[index].clone().lerp(a.curvePoints[nextIndex], alpha)
      a.pulseMesh.position.copy(pt)

      const pulseMat = a.pulseMesh.material as THREE.MeshBasicMaterial
      pulseMat.opacity = isArcActive ? 0.95 : 0.4
    }
  }

  // 6. Animate Celestial Space Objects (Stars, Moon, Satellites, Planets, Meteor)
  animateCelestialObjects(currentTime, delta, reducedMotion)

  // 7. Raycasting Cursor State
  if (camera && globeGroup && canvas.value) {
    raycaster.setFromCamera(mousePosNDC, camera)
    const targetHitMeshes = [
      ...markerMeshes.map(m => m.hitMesh),
      ...clusterHubMeshes.map(c => c.hitMesh),
    ]
    const intersects = raycaster.intersectObjects(targetHitMeshes, false)
    if (intersects.length > 0) {
      canvas.value.style.cursor = 'pointer'
    } else {
      canvas.value.style.cursor = isDragging ? 'grabbing' : 'grab'
    }
  }

  // 8. Update 2D Projected HTML Labels
  updateHtmlLabels()

  // 9. Render
  if (renderer && scene && camera) {
    renderer.render(scene, camera)
  }
}

function updateSatellitePositions(currentTime: number) {
  let beamIndex = 0

  // Update each marker position
  for (const m of markerMeshes) {
    const isThisClusterActive = props.isZoomed && props.activeClusterId === m.clusterId
    const targetRadius = isThisClusterActive ? m.maxSatelliteRadius : 0

    // Smoothly expand/collapse satellite orbits
    m.currentRadius = THREE.MathUtils.lerp(m.currentRadius, targetRadius, 0.08)

    // Compute updated 3D coordinate
    const newPos = computeSatellitePosition(m.centerPos, m.satelliteAngle, m.currentRadius)
    m.dotMesh.position.copy(newPos)
    m.hitMesh.position.copy(newPos)

    // Visibility: in global view, if part of a multi-project cluster, the individual dots merge into the cluster hub
    const cluster = globeClusters.value.find(c => c.id === m.clusterId)
    const isMultiProject = cluster && cluster.projectCount > 1

    if (isMultiProject && !props.isZoomed) {
      m.dotMesh.visible = false
      m.hitMesh.visible = false
    } else {
      m.dotMesh.visible = true
      m.hitMesh.visible = true
    }

    // Update connector beam lines from cluster center to satellite dot
    if (isThisClusterActive && satelliteBeamLines && beamLinePositions && m.currentRadius > 0.05) {
      const idx = beamIndex * 6
      beamLinePositions[idx] = m.centerPos.x
      beamLinePositions[idx + 1] = m.centerPos.y
      beamLinePositions[idx + 2] = m.centerPos.z
      beamLinePositions[idx + 3] = newPos.x
      beamLinePositions[idx + 4] = newPos.y
      beamLinePositions[idx + 5] = newPos.z
      beamIndex++
    }
  }

  // Clear remaining beam lines
  if (satelliteBeamLines && beamLinePositions) {
    for (let i = beamIndex * 6; i < beamLinePositions.length; i++) {
      beamLinePositions[i] = 0
    }
    const posAttr = satelliteBeamLines.geometry.getAttribute('position') as THREE.BufferAttribute
    posAttr.needsUpdate = true
    satelliteBeamLines.visible = props.isZoomed && beamIndex > 0
  }

  // Cluster Hubs visibility
  for (const ch of clusterHubMeshes) {
    ch.mesh.visible = !props.isZoomed || props.activeClusterId === ch.id
    ch.hitMesh.visible = !props.isZoomed
  }
}

function updateHtmlLabels() {
  if (!camera || !container.value || !globeGroup) return

  const width = container.value.clientWidth
  const height = container.value.clientHeight

  const camWorldPos = new THREE.Vector3()
  camera.getWorldPosition(camWorldPos)

  // 1. Cluster Hub Counter Labels (in Global View)
  for (const ch of clusterHubMeshes) {
    const labelEl = clusterLabelRefs.get(ch.id)
    if (!labelEl) continue

    if (props.isZoomed) {
      labelEl.style.opacity = '0'
      labelEl.style.pointerEvents = 'none'
      continue
    }

    const worldPos = new THREE.Vector3()
    ch.mesh.getWorldPosition(worldPos)

    const dirToCam = camWorldPos.clone().sub(worldPos).normalize()
    const worldNormal = ch.normal.clone().applyQuaternion(globeGroup.quaternion).normalize()
    const dot = worldNormal.dot(dirToCam)

    if (dot > 0.15) {
      const projected = worldPos.clone().project(camera)
      const screenX = (projected.x * 0.5 + 0.5) * width
      const screenY = (-projected.y * 0.5 + 0.5) * height

      labelEl.style.transform = `translate3d(${screenX}px, ${screenY}px, 0)`

      const horizonFade = Math.min(1, Math.max(0, (dot - 0.15) / 0.25))
      labelEl.style.opacity = `${horizonFade}`
      labelEl.style.pointerEvents = horizonFade > 0.4 ? 'auto' : 'none'
    } else {
      labelEl.style.opacity = '0'
      labelEl.style.pointerEvents = 'none'
    }
  }

  // 2. Individual Project Labels
  for (const m of markerMeshes) {
    const labelEl = labelRefs.get(m.id)
    if (!labelEl) continue

    const cluster = globeClusters.value.find(c => c.id === m.clusterId)
    const isMultiProject = cluster && cluster.projectCount > 1

    // If multi-project and not zoomed in, hide individual project labels
    if (isMultiProject && !props.isZoomed) {
      labelEl.style.opacity = '0'
      labelEl.style.pointerEvents = 'none'
      continue
    }

    // If zoomed in to another cluster, hide labels not in active cluster
    if (props.isZoomed && props.activeClusterId && m.clusterId !== props.activeClusterId) {
      labelEl.style.opacity = '0'
      labelEl.style.pointerEvents = 'none'
      continue
    }

    const worldPos = new THREE.Vector3()
    m.dotMesh.getWorldPosition(worldPos)

    const dirToCam = camWorldPos.clone().sub(worldPos).normalize()
    const worldNormal = m.normalVec.clone().applyQuaternion(globeGroup.quaternion).normalize()
    const dot = worldNormal.dot(dirToCam)

    const isActive = props.activeId === m.id
    const targetScale = isActive ? 1.35 : 0.95
    m.dotMesh.scale.setScalar(THREE.MathUtils.lerp(m.dotMesh.scale.x, targetScale, 0.15))

    if (dot > 0.12) {
      const projected = worldPos.clone().project(camera)
      const screenX = (projected.x * 0.5 + 0.5) * width
      const screenY = (-projected.y * 0.5 + 0.5) * height

      labelEl.style.transform = `translate3d(${screenX}px, ${screenY}px, 0)`

      if (screenX > width * 0.65) {
        labelEl.classList.add('label-flipped')
      } else {
        labelEl.classList.remove('label-flipped')
      }

      const horizonFade = Math.min(1, Math.max(0, (dot - 0.12) / 0.22))
      const targetOpacity = isActive ? 1 : (horizonFade * 0.88)
      labelEl.style.opacity = `${targetOpacity}`
      labelEl.style.pointerEvents = horizonFade > 0.4 ? 'auto' : 'none'
    } else {
      labelEl.style.opacity = '0'
      labelEl.style.pointerEvents = 'none'
    }
  }
}

// Pointer Events
function onPointerDown(e: PointerEvent) {
  if (e.button !== 0) return
  isDragging = true
  pointerDownPos = { x: e.clientX, y: e.clientY }
  lastPointerPos = { x: e.clientX, y: e.clientY }
  dragVelocity = { x: 0, y: 0 }
  isTargetingMarker = false
  lastUserInteractionTime = performance.now()
}

function onPointerMove(e: PointerEvent) {
  if (!container.value) return

  const rect = container.value.getBoundingClientRect()
  mousePosNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
  mousePosNDC.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1)

  targetCamTilt.x = mousePosNDC.x * 0.18
  targetCamTilt.y = mousePosNDC.y * 0.14

  if (isDragging && globeGroup) {
    const dx = e.clientX - lastPointerPos.x
    const dy = e.clientY - lastPointerPos.y

    const rotScale = props.isZoomed ? 0.0035 : 0.0055
    globeGroup.rotation.y += dx * rotScale
    globeGroup.rotation.x = Math.max(-0.55, Math.min(0.55, globeGroup.rotation.x + dy * rotScale))

    dragVelocity = { x: dx * 0.0025, y: dy * 0.0025 }
    lastPointerPos = { x: e.clientX, y: e.clientY }
    lastUserInteractionTime = performance.now()
  }
}

function onPointerUp(e: PointerEvent) {
  if (!isDragging) return
  isDragging = false

  const moveDist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y)
  if (moveDist < 6 && camera && globeGroup) {
    raycaster.setFromCamera(mousePosNDC, camera)

    // Raycast on clusters first in global view
    if (!props.isZoomed) {
      const clusterHits = clusterHubMeshes.map(c => c.hitMesh)
      const cIntersects = raycaster.intersectObjects(clusterHits, false)
      if (cIntersects.length > 0) {
        const cId = cIntersects[0].object.userData.clusterId as string
        if (cId) {
          emit('zoomCluster', cId)
          return
        }
      }
    }

    // Raycast on project markers
    const markerHits = markerMeshes.filter(m => m.hitMesh.visible).map(m => m.hitMesh)
    const mIntersects = raycaster.intersectObjects(markerHits, false)
    if (mIntersects.length > 0) {
      const hitId = mIntersects[0].object.userData.markerId as string
      if (hitId) emit('select', hitId)
    }
  }
}

function onPointerLeave() {
  isDragging = false
  mousePosNDC.set(-10, -10)
  targetCamTilt.x = 0
  targetCamTilt.y = 0
}

function handleResize() {
  if (!container.value || !renderer || !camera) return
  const w = container.value.clientWidth
  const h = container.value.clientHeight
  if (w <= 0 || h <= 0) return

  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
}

onMounted(() => {
  webglSupported.value = isWebGLAvailable()
  if (!webglSupported.value) return

  initThree()
  animFrameId = requestAnimationFrame(animate)

  if (container.value) {
    resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(container.value)
  }
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animFrameId)
  resizeObserver?.disconnect()

  if (scene) {
    scene.traverse(obj => {
      if (obj instanceof THREE.Mesh || obj instanceof THREE.Line || obj instanceof THREE.Points) {
        obj.geometry?.dispose()
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose())
        else obj.material?.dispose()
      }
    })
  }
  renderer?.dispose()
  renderer = null
  scene = null
  camera = null
  sunLight = null
  ambientLight = null
  globeGroup = null
  baseSphereMat = null
  gridLineMat = null
  landPointsMat = null
  coastMat = null
  satelliteBeamMat = null
  celestialGroup = null
  starPointsMesh = null
  starPointsMat = null
  moonMesh = null
  moonMat = null
  moonOrbitLine = null
  moonOrbitMat = null
  orbitSatellites = []
  satOrbitLinesMat = null
  saturnGroup = null
  saturnMat = null
  saturnRingMat = null
  marsMesh = null
  marsMat = null
  jupiterMesh = null
  jupiterMat = null
  meteorLine = null
  meteorHeadMesh = null
  meteorMat = null
  meteorHeadMat = null
  meteorLinePosAttr = null
})
</script>

<style scoped>
.globe-viewport {
  contain: layout size;
}

.cluster-pulse-dot {
  animation: cluster-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes cluster-pulse {
  0%, 100% { transform: scale(1); opacity: 0.95; }
  50% { transform: scale(1.35); opacity: 0.7; }
}

.marker-dot-halo {
  animation: pulse-ring 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse-ring {
  0%, 100% { transform: scale(1); opacity: 0.95; }
  50% { transform: scale(1.35); opacity: 0.65; }
}

.label-active .marker-card {
  transform: scale(1.06);
}

.label-flipped .label-anchor,
.label-flipped .cluster-anchor {
  flex-direction: row-reverse;
  transform: translate(-100%, -50%);
}

@media (prefers-reduced-motion: reduce) {
  .marker-dot-halo,
  .cluster-pulse-dot { animation: none !important; }
}
</style>
