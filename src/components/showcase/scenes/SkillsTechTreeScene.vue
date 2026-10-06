<template>
  <div
    ref="container"
    class="skills-constellation-scene relative w-full h-full select-none overflow-hidden bg-[#060709]"
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

    <!-- Extremely Subtle Ambient Grid & Vignette -->
    <div class="pointer-events-none absolute inset-0 subtle-grid-bg opacity-[0.03]" aria-hidden="true"></div>
    <div class="pointer-events-none absolute inset-0 radial-vignette" aria-hidden="true"></div>

    <!-- Editorial Introduction (Top-Left) -->
    <div class="pointer-events-none absolute top-16 sm:top-20 left-6 sm:left-12 z-10 max-w-xs space-y-2.5">
      <div class="flex items-center gap-2">
        <span class="font-mono text-[10px] text-zinc-500 tracking-widest font-semibold">03</span>
        <span class="w-3.5 h-[1px] bg-zinc-700"></span>
        <span class="font-mono text-[10px] text-zinc-400 uppercase tracking-widest font-medium">SKILLS</span>
      </div>
      <h1 class="text-2xl sm:text-3xl font-light tracking-tight text-zinc-100 font-sans leading-tight">
        Technology<br />Constellation
      </h1>
      <p class="text-[11.5px] text-zinc-400 leading-relaxed font-sans max-w-[250px] font-normal">
        A 3D quantum map of the technologies I use and how they connect to build real products. Drag to rotate in full 3D space.
      </p>
    </div>

    <!-- Floating 2D Projected Hover Tag (Above hovered 3D node) -->
    <div
      v-if="hoveredNode && (!selectedNode || selectedNode.id !== hoveredNode.id)"
      class="pointer-events-none absolute z-20 px-2.5 py-1 rounded-md bg-zinc-950/90 text-zinc-200 border border-sky-500/30 shadow-[0_0_15px_rgba(56,189,248,0.2)] font-mono text-[9px] uppercase tracking-wider -translate-x-1/2 -translate-y-8 transition-opacity duration-150 backdrop-blur-md"
      :style="{ left: `${hoverScreenPos.x}px`, top: `${hoverScreenPos.y}px` }"
    >
      <span class="text-sky-400 mr-1">●</span>
      {{ hoveredNode.name }}
    </div>

    <!-- Editorial Information Panel (Bottom-Left) -->
    <div
      v-if="selectedNode"
      class="editorial-panel absolute bottom-6 sm:bottom-10 left-6 sm:left-12 right-6 sm:right-auto z-20 max-w-sm sm:w-80 pointer-events-auto p-4 sm:p-5 rounded-xl border border-white/10 bg-zinc-950/85 backdrop-blur-xl shadow-2xl space-y-3 transition-all duration-300"
      @click.stop
    >
      <div class="space-y-0.5">
        <div class="flex items-center justify-between">
          <span class="font-mono text-[9px] uppercase tracking-[0.2em] text-sky-400 font-semibold flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping"></span>
            SELECTED NODE
          </span>
          <span class="font-mono text-[9px] text-zinc-500 uppercase tracking-wider">
            {{ selectedNode.category }}
          </span>
        </div>
        <h2 class="text-lg font-medium tracking-tight text-white flex items-center gap-2">
          {{ selectedNode.name }}
        </h2>
        <p class="text-[11px] font-mono text-zinc-400">
          {{ selectedNode.tagline }}
        </p>
      </div>

      <p class="text-xs text-zinc-300 leading-relaxed font-sans border-t border-white/5 pt-2 font-normal">
        {{ selectedNode.desc }}
      </p>

      <!-- Connected technologies list -->
      <div class="pt-1 space-y-1.5">
        <p class="font-mono text-[9px] uppercase tracking-wider text-zinc-500">
          ORBITAL CONNECTIONS
        </p>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="relId in selectedNode.connections"
            :key="relId"
            type="button"
            @click.stop="selectNodeById(relId)"
            class="px-2 py-0.5 rounded text-[10px] font-mono text-zinc-300 bg-white/5 hover:bg-sky-500/20 hover:text-sky-300 border border-white/10 hover:border-sky-500/40 transition-colors cursor-pointer"
          >
            {{ getNodeName(relId) }}
          </button>
        </div>
      </div>

      <!-- Action Footer -->
      <div class="pt-2 border-t border-white/5 flex items-center justify-between">
        <button
          type="button"
          @click.stop="selectNodeById('flutter')"
          class="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer uppercase tracking-wider"
        >
          RESET TO FLUTTER
        </button>
        <button
          type="button"
          @click="viewProjects"
          class="inline-flex items-center gap-1 text-[10.5px] font-mono text-sky-400 hover:text-sky-300 transition-colors cursor-pointer font-medium tracking-wider uppercase"
        >
          <span>VIEW PROJECTS</span>
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

interface TechNode {
  id: string
  name: string
  category: string
  tagline: string
  desc: string
  pos: THREE.Vector3
  connections: string[]
  isCore?: boolean
}

// 1. Curated Connected Technologies with Full 3D Depth
const nodesData: TechNode[] = [
  {
    id: 'flutter',
    name: 'Flutter',
    category: 'Core Framework',
    tagline: 'Cross-platform application development',
    desc: 'Primary framework for building high-performance applications with shared business logic and pixel-perfect rendering across mobile, web, and desktop.',
    pos: new THREE.Vector3(0, 0, 0),
    connections: ['dart', 'android', 'ios', 'web', 'firebase', 'architecture', 'ui-ux', 'cicd'],
    isCore: true,
  },
  {
    id: 'dart',
    name: 'Dart',
    category: 'Core Language',
    tagline: 'Client-optimized type-safe language',
    desc: 'High-velocity object-oriented language featuring sound null safety, Ahead-Of-Time native compilation, and responsive reactive execution.',
    pos: new THREE.Vector3(-1.3, 0.85, 0.85),
    connections: ['flutter', 'architecture'],
  },
  {
    id: 'architecture',
    name: 'Architecture',
    category: 'System Design',
    tagline: 'Clean Architecture & reactive state',
    desc: 'Robust separation of domain, data, and presentation layers using BLoC, Cubit, and Riverpod for scalable, testable codebases.',
    pos: new THREE.Vector3(1.4, 0.8, -0.75),
    connections: ['flutter', 'dart', 'ui-ux'],
  },
  {
    id: 'android',
    name: 'Android',
    category: 'Mobile Platform',
    tagline: 'Platform channels & Gradle pipelines',
    desc: 'Deep platform-native Android configuration, Gradle orchestration, hardware channels, and Google Play packaging.',
    pos: new THREE.Vector3(-1.75, -0.55, 0.7),
    connections: ['flutter', 'ios', 'cicd'],
  },
  {
    id: 'ios',
    name: 'iOS',
    category: 'Apple Platform',
    tagline: 'Apple ecosystem & Cupertino fidelity',
    desc: 'Xcode workspace configuration, CocoaPods integration, iOS certificate management, and Apple App Store compliance.',
    pos: new THREE.Vector3(-1.45, -1.25, -0.8),
    connections: ['flutter', 'android', 'cicd'],
  },
  {
    id: 'web',
    name: 'Web',
    category: 'Web Platform',
    tagline: 'Responsive layouts & modern web runtimes',
    desc: 'Multi-screen responsive layouts, WebAssembly and CanvasKit rendering, cross-browser performance, and desktop parity.',
    pos: new THREE.Vector3(0.45, 1.65, -0.75),
    connections: ['flutter', 'ui-ux'],
  },
  {
    id: 'firebase',
    name: 'Firebase',
    category: 'Cloud Services',
    tagline: 'Realtime data & serverless infrastructure',
    desc: 'Cloud Firestore, Firebase Authentication, Cloud Messaging, Crashlytics analytics, and real-time synchronization.',
    pos: new THREE.Vector3(1.85, -0.4, 0.75),
    connections: ['flutter', 'nodejs'],
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    category: 'Backend & Cloud',
    tagline: 'REST APIs & serverless microservices',
    desc: 'Lightweight backend endpoints, Cloudflare Workers, WebSocket real-time connections, and developer tooling automation.',
    pos: new THREE.Vector3(2.35, -1.15, 0.45),
    connections: ['firebase'],
  },
  {
    id: 'ui-ux',
    name: 'UI/UX',
    category: 'Design Systems',
    tagline: 'Design systems & interaction ergonomics',
    desc: 'Fluid micro-interactions, responsive grid structures, typography hierarchy, accessibility, and human-centered design.',
    pos: new THREE.Vector3(0.7, -1.45, -0.65),
    connections: ['flutter', 'architecture', 'web'],
  },
  {
    id: 'cicd',
    name: 'CI/CD',
    category: 'DevOps & Tooling',
    tagline: 'Continuous integration & deployment',
    desc: 'Automated GitHub Actions pipelines, multi-platform artifact builds, automated linting, and zero-downtime releases.',
    pos: new THREE.Vector3(-2.1, 0.45, -0.6),
    connections: ['flutter', 'android', 'ios'],
  },
]

const selectedNodeId = ref<string>('flutter')
const selectedNode = computed(() => nodesData.find(n => n.id === selectedNodeId.value) || nodesData[0])

const hoveredNodeId = ref<string | null>(null)
const hoveredNode = computed(() => nodesData.find(n => n.id === hoveredNodeId.value) || null)
const hoverScreenPos = ref({ x: 0, y: 0 })

function getNodeName(id: string): string {
  return nodesData.find(n => n.id === id)?.name || id
}

function selectNodeById(id: string) {
  selectedNodeId.value = id
  updateHighlights()
}

function viewProjects() {
  setSection('projects')
}

// 2. Three.js Core Variables
const container = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let animFrameId = 0
let constellationGroup: THREE.Group | null = null
let centralFlutterMesh: THREE.Mesh | null = null
let accentPointLight: THREE.PointLight | null = null

// Orbital Electron Definitions
interface ElectronOrbit {
  a: number
  b: number
  rot: THREE.Euler
  speed: number
  color: number
}

const ORBIT_TRACKS: ElectronOrbit[] = [
  { a: 2.2, b: 1.45, rot: new THREE.Euler(1.15, 0.35, 0.4), speed: 1.4, color: 0x38bdf8 },
  { a: 2.5, b: 1.60, rot: new THREE.Euler(-1.05, 1.25, -0.4), speed: -1.1, color: 0x60a5fa },
  { a: 2.75, b: 1.75, rot: new THREE.Euler(0.45, -1.15, 0.95), speed: 1.3, color: 0x38bdf8 },
  { a: 3.0, b: 1.90, rot: new THREE.Euler(-1.35, -0.4, 1.2), speed: -0.95, color: 0x818cf8 },
]

interface ActiveElectron {
  trackIndex: number
  phaseOffset: number
  mesh: THREE.Mesh
  haloMesh: THREE.Mesh
  trailPoints: THREE.Points
  trailPositions: Float32Array
  trailHistory: THREE.Vector3[]
}

let activeElectrons: ActiveElectron[] = []

// Core Swirling Nucleus Particles
let nucleusParticles: THREE.Points | null = null
const NUCLEUS_PARTICLE_COUNT = 32
let nucleusParticleOffsets: { radius: number; speed: number; phi: number; theta: number }[] = []

// Node runtime meshes
interface NodeRuntime {
  node: TechNode
  group: THREE.Group
  sphereMesh: THREE.Mesh
  electronRing: THREE.LineLoop
  microElectron: THREE.Mesh
}

let nodeRuntimeMap = new Map<string, NodeRuntime>()

// Connection Lines & Traveling Photon Packets
interface ConnectionBeam {
  fromNode: TechNode
  toNode: TechNode
  line: THREE.Line
  photonMesh: THREE.Mesh
  speed: number
  offset: number
}

let connectionBeams: ConnectionBeam[] = []

// Raycasting & Interaction
const raycaster = new THREE.Raycaster()
const mouseNDC = new THREE.Vector2(-999, -999)
const interactiveObjects: THREE.Object3D[] = []

let isDragging = false
let prevPointerX = 0
let prevPointerY = 0
let targetRotX = 0
let targetRotY = 0
let targetCamZ = 5.2

let unregisterContentNav: (() => void) | null = null

// Helper to evaluate 3D Ellipse point
function getOrbitPoint(a: number, b: number, angle: number, rot: THREE.Euler): THREE.Vector3 {
  const p = new THREE.Vector3(a * Math.cos(angle), b * Math.sin(angle), 0)
  p.applyEuler(rot)
  return p
}

// Generate Flutter Mark Canvas Texture
function createFlutterEmblemTexture(): THREE.CanvasTexture {
  const size = 512
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  const ctx = c.getContext('2d')!

  ctx.clearRect(0, 0, size, size)
  const ox = size * 0.48
  const oy = size * 0.52
  const s = size * 0.38

  ctx.save()
  ctx.translate(ox, oy)

  // Top Chevron
  ctx.beginPath()
  ctx.moveTo(s * 0.65, -s * 0.85)
  ctx.lineTo(-s * 0.2, 0)
  ctx.lineTo(s * 0.25, 0)
  ctx.lineTo(s * 0.85, -s * 0.6)
  ctx.closePath()
  ctx.fillStyle = '#54c5f8'
  ctx.fill()

  // Bottom-Left Chevron
  ctx.beginPath()
  ctx.moveTo(s * 0.25, 0)
  ctx.lineTo(-s * 0.2, 0)
  ctx.lineTo(s * 0.25, s * 0.45)
  ctx.lineTo(s * 0.7, s * 0.45)
  ctx.closePath()
  ctx.fillStyle = '#0284c7'
  ctx.fill()

  // Bottom-Right Chevron
  ctx.beginPath()
  ctx.moveTo(s * 0.25, s * 0.45)
  ctx.lineTo(s * 0.02, s * 0.68)
  ctx.lineTo(s * 0.48, s * 0.68)
  ctx.lineTo(s * 0.85, s * 0.32)
  ctx.lineTo(s * 0.48, s * 0.32)
  ctx.closePath()
  ctx.fillStyle = '#38bdf8'
  ctx.fill()

  ctx.restore()

  const texture = new THREE.CanvasTexture(c)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function initScene() {
  if (!container.value || !canvas.value) return

  const width = container.value.clientWidth || window.innerWidth
  const height = container.value.clientHeight || window.innerHeight
  const isMobile = width < 768

  // 1. Scene & Camera
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100)

  targetCamZ = isMobile ? 6.2 : 5.1
  camera.position.set(0, 0, targetCamZ)

  // 2. Renderer
  renderer = new THREE.WebGLRenderer({
    canvas: canvas.value,
    antialias: !isMobile,
    alpha: true,
    powerPreference: 'high-performance',
  })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))

  // 3. Studio Ambient & Key Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
  scene.add(ambientLight)

  const keyLight = new THREE.DirectionalLight(0xfffaed, 2.2)
  keyLight.position.set(5, 6, 6)
  scene.add(keyLight)

  const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.2)
  rimLight.position.set(-6, -4, -4)
  scene.add(rimLight)

  accentPointLight = new THREE.PointLight(0x38bdf8, 2.0, 6, 1.5)
  accentPointLight.position.set(0, 0, 1.5)
  scene.add(accentPointLight)

  // 4. Main 3D Constellation Root Group
  constellationGroup = new THREE.Group()
  constellationGroup.position.x = isMobile ? 0 : 0.6
  scene.add(constellationGroup)

  interactiveObjects.length = 0

  // 5. 3D ATOMIC NUCLEUS (Flutter Core)
  const flutterNode = nodesData[0]

  // Inner Pulsing Core Sphere
  const coreGeo = new THREE.SphereGeometry(0.34, 32, 32)
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    emissive: 0x0369a1,
    emissiveIntensity: 0.85,
    roughness: 0.25,
    metalness: 0.8,
  })
  centralFlutterMesh = new THREE.Mesh(coreGeo, coreMat)
  centralFlutterMesh.position.copy(flutterNode.pos)
  centralFlutterMesh.userData = { id: flutterNode.id }
  constellationGroup.add(centralFlutterMesh)
  interactiveObjects.push(centralFlutterMesh)

  // Outer Fresnel Corona Shield
  const coronaGeo = new THREE.SphereGeometry(0.42, 32, 32)
  const coronaMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    transmission: 0.75,
    roughness: 0.1,
    transparent: true,
    opacity: 0.5,
    reflectivity: 0.8,
  })
  const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat)
  centralFlutterMesh.add(coronaMesh)

  // Flutter Emblem Billboard inside the nucleus
  const emblemTex = createFlutterEmblemTexture()
  const emblemGeo = new THREE.PlaneGeometry(0.36, 0.36)
  const emblemMat = new THREE.MeshBasicMaterial({
    map: emblemTex,
    transparent: true,
    opacity: 0.95,
    side: THREE.DoubleSide,
    depthWrite: false,
  })
  const emblemMesh = new THREE.Mesh(emblemGeo, emblemMat)
  centralFlutterMesh.add(emblemMesh)

  // Nucleus Swirling Energy Particles
  const nucPos = new Float32Array(NUCLEUS_PARTICLE_COUNT * 3)
  nucleusParticleOffsets = []
  for (let i = 0; i < NUCLEUS_PARTICLE_COUNT; i++) {
    const r = 0.18 + Math.random() * 0.14
    const phi = Math.random() * Math.PI * 2
    const theta = Math.random() * Math.PI
    nucPos[i * 3] = r * Math.sin(theta) * Math.cos(phi)
    nucPos[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi)
    nucPos[i * 3 + 2] = r * Math.cos(theta)
    nucleusParticleOffsets.push({
      radius: r,
      speed: 0.8 + Math.random() * 1.5,
      phi,
      theta,
    })
  }
  const nucGeo = new THREE.BufferGeometry()
  nucGeo.setAttribute('position', new THREE.BufferAttribute(nucPos, 3))
  const nucMat = new THREE.PointsMaterial({
    color: 0x7dd3fc,
    size: 0.035,
    transparent: true,
    opacity: 0.85,
  })
  nucleusParticles = new THREE.Points(nucGeo, nucMat)
  centralFlutterMesh.add(nucleusParticles)

  // 6. 3D ELECTRON ORBITAL SHELLS & ACTIVE ORBITING ELECTRONS
  activeElectrons = []
  ORBIT_TRACKS.forEach((track, trackIdx) => {
    // Generate 3D Elliptical Track LineLoop
    const segments = 96
    const points: THREE.Vector3[] = []
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      points.push(getOrbitPoint(track.a, track.b, angle, track.rot))
    }
    const trackGeo = new THREE.BufferGeometry().setFromPoints(points)
    const trackMat = new THREE.LineBasicMaterial({
      color: track.color,
      transparent: true,
      opacity: 0.35,
    })
    const trackLine = new THREE.LineLoop(trackGeo, trackMat)
    constellationGroup!.add(trackLine)

    // Add 2 active electrons per track with different phase offsets
    const electronCount = 2
    for (let e = 0; e < electronCount; e++) {
      const phaseOffset = (e / electronCount) * Math.PI * 2

      // Core Electron Sphere
      const eGeo = new THREE.SphereGeometry(0.045, 16, 16)
      const eMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
      const eMesh = new THREE.Mesh(eGeo, eMat)
      constellationGroup!.add(eMesh)

      // Outer Halo
      const hGeo = new THREE.SphereGeometry(0.08, 12, 12)
      const hMat = new THREE.MeshBasicMaterial({
        color: 0x0284c7,
        transparent: true,
        opacity: 0.45,
      })
      const hMesh = new THREE.Mesh(hGeo, hMat)
      eMesh.add(hMesh)

      // Electron Particle Spark Trail (8 points)
      const TRAIL_LENGTH = 8
      const trailPositions = new Float32Array(TRAIL_LENGTH * 3)
      const trailHistory: THREE.Vector3[] = []
      const initPos = getOrbitPoint(track.a, track.b, phaseOffset, track.rot)
      for (let k = 0; k < TRAIL_LENGTH; k++) {
        trailHistory.push(initPos.clone())
        trailPositions[k * 3] = initPos.x
        trailPositions[k * 3 + 1] = initPos.y
        trailPositions[k * 3 + 2] = initPos.z
      }
      const trailGeo = new THREE.BufferGeometry()
      trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3))
      const trailMat = new THREE.PointsMaterial({
        color: 0x38bdf8,
        size: 0.028,
        transparent: true,
        opacity: 0.6,
      })
      const trailPoints = new THREE.Points(trailGeo, trailMat)
      constellationGroup!.add(trailPoints)

      activeElectrons.push({
        trackIndex: trackIdx,
        phaseOffset,
        mesh: eMesh,
        haloMesh: hMesh,
        trailPoints,
        trailPositions,
        trailHistory,
      })
    }
  })

  // 7. SATELLITE TECHNOLOGY NODES (In True 3D Depth with Local Orbiting Micro-Electrons)
  nodeRuntimeMap.clear()
  for (let i = 1; i < nodesData.length; i++) {
    const node = nodesData[i]
    const nodeGroup = new THREE.Group()
    nodeGroup.position.copy(node.pos)
    constellationGroup.add(nodeGroup)

    // Node 3D Sphere
    const sGeo = new THREE.SphereGeometry(0.11, 24, 24)
    const sMat = new THREE.MeshStandardMaterial({
      color: 0x181f2c,
      roughness: 0.3,
      metalness: 0.8,
      emissive: 0x0f172a,
      emissiveIntensity: 0.2,
    })
    const sphereMesh = new THREE.Mesh(sGeo, sMat)
    sphereMesh.userData = { id: node.id }
    nodeGroup.add(sphereMesh)
    interactiveObjects.push(sphereMesh)

    // Micro Electron Orbit Ring around this node
    const ringRadius = 0.22
    const ringSegments = 48
    const ringPts: THREE.Vector3[] = []
    for (let r = 0; r < ringSegments; r++) {
      const theta = (r / ringSegments) * Math.PI * 2
      ringPts.push(new THREE.Vector3(ringRadius * Math.cos(theta), ringRadius * Math.sin(theta), 0))
    }
    const ringGeo = new THREE.BufferGeometry().setFromPoints(ringPts)
    const ringMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.25,
    })
    const electronRing = new THREE.LineLoop(ringGeo, ringMat)
    electronRing.rotation.x = 0.8 + i * 0.4
    electronRing.rotation.y = 0.5 + i * 0.3
    nodeGroup.add(electronRing)

    // Micro-Electron particle orbiting this node
    const microGeo = new THREE.SphereGeometry(0.022, 12, 12)
    const microMat = new THREE.MeshBasicMaterial({ color: 0x7dd3fc })
    const microElectron = new THREE.Mesh(microGeo, microMat)
    nodeGroup.add(microElectron)

    nodeRuntimeMap.set(node.id, {
      node,
      group: nodeGroup,
      sphereMesh,
      electronRing,
      microElectron,
    })
  }

  // 8. 3D CONNECTION BEAMS & TRAVELING PHOTON PACKETS
  connectionBeams = []
  const createdPairs = new Set<string>()

  nodesData.forEach(node => {
    node.connections.forEach(targetId => {
      const pairKey = [node.id, targetId].sort().join('--')
      if (createdPairs.has(pairKey)) return
      createdPairs.add(pairKey)

      const target = nodesData.find(n => n.id === targetId)
      if (!target) return

      const points = [node.pos.clone(), target.pos.clone()]
      const geo = new THREE.BufferGeometry().setFromPoints(points)
      const mat = new THREE.LineBasicMaterial({
        color: 0x1e293b,
        transparent: true,
        opacity: 0.3,
      })
      const line = new THREE.Line(geo, mat)
      constellationGroup!.add(line)

      // Traveling Energy Photon Packet
      const photonGeo = new THREE.SphereGeometry(0.028, 12, 12)
      const photonMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
      const photonMesh = new THREE.Mesh(photonGeo, photonMat)
      constellationGroup!.add(photonMesh)

      connectionBeams.push({
        fromNode: node,
        toNode: target,
        line,
        photonMesh,
        speed: 0.35 + Math.random() * 0.25,
        offset: Math.random(),
      })
    })
  })

  // 9. Sparse Ambient Quantum Starfield / Dust
  const dustCount = isMobile ? 120 : 250
  const dustPos = new Float32Array(dustCount * 3)
  for (let i = 0; i < dustCount; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 16
    dustPos[i * 3 + 1] = (Math.random() - 0.5) * 12
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2
  }
  const dustGeo = new THREE.BufferGeometry()
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3))
  const dustMat = new THREE.PointsMaterial({
    color: 0x475569,
    size: 0.016,
    transparent: true,
    opacity: 0.3,
  })
  scene.add(new THREE.Points(dustGeo, dustMat))

  updateHighlights()

  // 10. Main Quantum Render Loop
  let lastTime = performance.now()
  function loop(now: number) {
    animFrameId = requestAnimationFrame(loop)
    const delta = Math.min((now - lastTime) / 1000, 0.1)
    lastTime = now

    // Smooth Full 3D Constellation Rotation from Drag or Idle
    if (constellationGroup) {
      if (!isDragging) {
        targetRotY += delta * 0.04
      }
      constellationGroup.rotation.y = THREE.MathUtils.lerp(constellationGroup.rotation.y, targetRotY, 0.06)
      constellationGroup.rotation.x = THREE.MathUtils.lerp(constellationGroup.rotation.x, targetRotX, 0.06)
    }

    // A. Animate Active Orbiting 3D Electrons & Spark Trails
    activeElectrons.forEach(electron => {
      const track = ORBIT_TRACKS[electron.trackIndex]
      const angle = (now * 0.001 * track.speed + electron.phaseOffset) % (Math.PI * 2)
      const pos = getOrbitPoint(track.a, track.b, angle, track.rot)
      electron.mesh.position.copy(pos)

      // Update particle spark trail
      electron.trailHistory.unshift(pos.clone())
      if (electron.trailHistory.length > 8) electron.trailHistory.pop()

      const positions = electron.trailPositions
      electron.trailHistory.forEach((tp, idx) => {
        positions[idx * 3] = tp.x
        positions[idx * 3 + 1] = tp.y
        positions[idx * 3 + 2] = tp.z
      })
      electron.trailPoints.geometry.attributes.position.needsUpdate = true
    })

    // B. Animate Swirling Nucleus Protons/Neutrons
    if (nucleusParticles) {
      const posArray = nucleusParticles.geometry.attributes.position.array as Float32Array
      nucleusParticleOffsets.forEach((np, idx) => {
        np.phi += delta * np.speed
        np.theta += delta * (np.speed * 0.5)
        posArray[idx * 3] = np.radius * Math.sin(np.theta) * Math.cos(np.phi)
        posArray[idx * 3 + 1] = np.radius * Math.sin(np.theta) * Math.sin(np.phi)
        posArray[idx * 3 + 2] = np.radius * Math.cos(np.theta)
      })
      nucleusParticles.geometry.attributes.position.needsUpdate = true
    }

    // C. Central Nucleus Breathing Glow
    if (centralFlutterMesh) {
      const pulseScale = 1.0 + Math.sin(now * 0.003) * 0.03
      centralFlutterMesh.scale.set(pulseScale, pulseScale, pulseScale)
    }

    // D. Animate Satellite Nodes & Local Micro-Electrons
    nodeRuntimeMap.forEach((runtime, id) => {
      // Local micro-electron orbit around the node
      const microAngle = now * 0.0025 + runtime.node.pos.x
      const ringRadius = 0.22
      const localPos = new THREE.Vector3(
        ringRadius * Math.cos(microAngle),
        ringRadius * Math.sin(microAngle),
        0
      )
      localPos.applyEuler(runtime.electronRing.rotation)
      runtime.microElectron.position.copy(localPos)

      // Subtle float
      const nIndex = nodesData.findIndex(n => n.id === id)
      runtime.group.position.y = runtime.node.pos.y + Math.sin(now * 0.0012 + nIndex) * 0.03
    })

    // E. Animate Traveling Photons along Connection Beams
    connectionBeams.forEach(beam => {
      const progress = ((now * 0.001 * beam.speed + beam.offset) % 1)
      beam.photonMesh.position.lerpVectors(beam.fromNode.pos, beam.toNode.pos, progress)
    })

    // F. Smooth Camera Zoom
    if (camera) {
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, 0.08)
    }

    // G. Update Hover Projected Tooltip
    updateHoverPosition()

    if (renderer && scene && camera) {
      renderer.render(scene, camera)
    }
  }

  animFrameId = requestAnimationFrame(loop)
}

function updateHighlights() {
  const cur = selectedNode.value
  const activeIds = new Set([cur.id, ...cur.connections])

  // Move accent point light towards selected node
  if (accentPointLight) {
    accentPointLight.position.set(cur.pos.x, cur.pos.y, cur.pos.z + 1.2)
  }

  // Update Center Flutter Nucleus
  if (centralFlutterMesh) {
    const isSelected = cur.id === 'flutter'
    const isConnected = cur.connections.includes('flutter')
    const mat = centralFlutterMesh.material as THREE.MeshStandardMaterial
    if (isSelected) {
      mat.emissive.setHex(0x0284c7)
      mat.emissiveIntensity = 1.0
    } else if (isConnected) {
      mat.emissive.setHex(0x0369a1)
      mat.emissiveIntensity = 0.6
    } else {
      mat.emissive.setHex(0x082f49)
      mat.emissiveIntensity = 0.3
    }
  }

  // Update Satellite Nodes
  nodeRuntimeMap.forEach((runtime, id) => {
    const isSelected = id === cur.id
    const isConnected = cur.connections.includes(id)
    const mat = runtime.sphereMesh.material as THREE.MeshStandardMaterial
    const ringMat = runtime.electronRing.material as THREE.LineBasicMaterial
    const microMat = runtime.microElectron.material as THREE.MeshBasicMaterial

    if (isSelected) {
      mat.color.setHex(0x0284c7)
      mat.emissive.setHex(0x38bdf8)
      mat.emissiveIntensity = 0.85
      runtime.sphereMesh.scale.set(1.3, 1.3, 1.3)
      ringMat.opacity = 0.75
      ringMat.color.setHex(0x38bdf8)
      microMat.color.setHex(0x7dd3fc)
    } else if (isConnected) {
      mat.color.setHex(0x1e3a8a)
      mat.emissive.setHex(0x2563eb)
      mat.emissiveIntensity = 0.4
      runtime.sphereMesh.scale.set(1.1, 1.1, 1.1)
      ringMat.opacity = 0.4
      ringMat.color.setHex(0x60a5fa)
      microMat.color.setHex(0x93c5fd)
    } else {
      mat.color.setHex(0x0f172a)
      mat.emissive.setHex(0x020617)
      mat.emissiveIntensity = 0.1
      runtime.sphereMesh.scale.set(0.92, 0.92, 0.92)
      ringMat.opacity = 0.12
      ringMat.color.setHex(0x334155)
      microMat.color.setHex(0x64748b)
    }
  })

  // Update Connection Beams
  connectionBeams.forEach(beam => {
    const isDirect = (beam.fromNode.id === cur.id && cur.connections.includes(beam.toNode.id)) ||
                     (beam.toNode.id === cur.id && cur.connections.includes(beam.fromNode.id))
    const lMat = beam.line.material as THREE.LineBasicMaterial
    const pMat = beam.photonMesh.material as THREE.MeshBasicMaterial

    if (isDirect) {
      lMat.color.setHex(0x38bdf8)
      lMat.opacity = 0.8
      pMat.color.setHex(0x7dd3fc)
      beam.photonMesh.scale.set(1.4, 1.4, 1.4)
    } else {
      lMat.color.setHex(0x1e293b)
      lMat.opacity = 0.15
      pMat.color.setHex(0x38bdf8)
      beam.photonMesh.scale.set(0.7, 0.7, 0.7)
    }
  })
}

function updateHoverPosition() {
  if (!hoveredNode.value || !camera || !container.value) return
  const pos = hoveredNode.value.pos.clone()
  if (constellationGroup) {
    pos.applyMatrix4(constellationGroup.matrixWorld)
  }
  const projected = pos.project(camera)

  const w = container.value.clientWidth
  const h = container.value.clientHeight

  hoverScreenPos.value = {
    x: (projected.x * 0.5 + 0.5) * w,
    y: (-projected.y * 0.5 + 0.5) * h,
  }
}

// Interaction Handlers (Full 3D Pitch and Yaw Orbit)
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

  if (isDragging) {
    const dx = e.clientX - prevPointerX
    const dy = e.clientY - prevPointerY
    prevPointerX = e.clientX
    prevPointerY = e.clientY

    targetRotY += dx * 0.005
    targetRotX = THREE.MathUtils.clamp(targetRotX + dy * 0.005, -0.7, 0.7)
  } else {
    checkRaycast(e, false)
  }
}

function onPointerUp() {
  isDragging = false
}

function onWheel(e: WheelEvent) {
  e.preventDefault()
  targetCamZ = THREE.MathUtils.clamp(targetCamZ + e.deltaY * 0.003, 3.8, 7.5)
}

function checkRaycast(e: PointerEvent, isClick: boolean) {
  if (!camera || !container.value || !scene) return

  raycaster.setFromCamera(mouseNDC, camera)
  const hits = raycaster.intersectObjects(interactiveObjects, true)

  if (hits.length > 0) {
    let topObj: THREE.Object3D | null = hits[0].object
    while (topObj && !topObj.userData?.id && topObj.parent && topObj !== scene) {
      topObj = topObj.parent
    }

    if (topObj && topObj.userData?.id) {
      const id = topObj.userData.id
      if (isClick) {
        selectNodeById(id)
      } else {
        hoveredNodeId.value = id
        if (canvas.value) canvas.value.style.cursor = 'pointer'
      }
      return
    }
  }

  if (!isClick) {
    hoveredNodeId.value = null
    if (canvas.value) canvas.value.style.cursor = isDragging ? 'grabbing' : 'grab'
  }
}

function onBackgroundClick() {
  // Clear selection back to Flutter
  selectNodeById('flutter')
}

function onResize() {
  if (!container.value || !camera || !renderer || !constellationGroup) return
  const w = container.value.clientWidth || window.innerWidth
  const h = container.value.clientHeight || window.innerHeight
  const isMobile = w < 768

  constellationGroup.position.x = isMobile ? 0 : 0.6
  targetCamZ = isMobile ? 6.2 : 5.1

  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
}

onMounted(() => {
  initScene()
  window.addEventListener('resize', onResize)

  unregisterContentNav = registerContentNavigator((direction) => {
    const list = nodesData.map(n => n.id)
    const curr = list.indexOf(selectedNodeId.value)
    if (direction === 'prev') {
      const prevIdx = (curr - 1 + list.length) % list.length
      selectNodeById(list[prevIdx])
    } else {
      const nextIdx = (curr + 1) % list.length
      selectNodeById(list[nextIdx])
    }
  })
})

onBeforeUnmount(() => {
  unregisterContentNav?.()
  window.removeEventListener('resize', onResize)

  if (animFrameId) cancelAnimationFrame(animFrameId)

  if (scene) {
    scene.traverse(obj => {
      if (obj instanceof THREE.Mesh || obj instanceof THREE.Points || obj instanceof THREE.Line || obj instanceof THREE.LineLoop) {
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
/* Editorial subtle grid and radial vignette */
.subtle-grid-bg {
  background-size: 32px 32px;
  background-image:
    linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px);
}

.radial-vignette {
  background: radial-gradient(circle at 65% 50%, rgba(56, 189, 248, 0.06) 0%, rgba(6, 7, 9, 0.75) 60%, #060709 100%);
}

@media (prefers-reduced-motion: reduce) {
  .editorial-panel {
    transition: opacity 150ms ease !important;
  }
}
</style>
