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

    <!-- Extremely Subtle Ambient Grid & Vignette (Quiet Editorial Background) -->
    <div class="pointer-events-none absolute inset-0 subtle-grid-bg opacity-[0.03]" aria-hidden="true"></div>
    <div class="pointer-events-none absolute inset-0 radial-vignette" aria-hidden="true"></div>

    <!-- Editorial Introduction (Top-Left, Quiet Typography) -->
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
        A visual map of the technologies I use and how they connect to build real products.
      </p>
    </div>

    <!-- Floating 2D Projected Hover Tag (Above hovered 3D node) -->
    <div
      v-if="hoveredNode && (!selectedNode || selectedNode.id !== hoveredNode.id)"
      class="pointer-events-none absolute z-20 px-2 py-0.5 rounded-md bg-zinc-950/90 text-zinc-200 border border-white/15 shadow-xl font-mono text-[9px] uppercase tracking-wider -translate-x-1/2 -translate-y-8 transition-opacity duration-150"
      :style="{ left: `${hoverScreenPos.x}px`, top: `${hoverScreenPos.y}px` }"
    >
      {{ hoveredNode.name }}
    </div>

    <!-- Editorial Information Panel (Bottom-Left / Compact Bottom-Sheet on Mobile) -->
    <div
      v-if="selectedNode"
      class="editorial-panel absolute bottom-6 sm:bottom-10 left-6 sm:left-12 right-6 sm:right-auto z-20 max-w-sm sm:w-80 pointer-events-auto p-4 sm:p-5 rounded-xl border border-white/10 bg-zinc-950/85 backdrop-blur-xl shadow-2xl space-y-3 transition-all duration-300"
      @click.stop
    >
      <div class="space-y-0.5">
        <div class="flex items-center justify-between">
          <span class="font-mono text-[9px] uppercase tracking-[0.2em] text-blue-400 font-semibold">
            SELECTED
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

      <p class="text-xs text-zinc-300 leading-relaxed font-sans border-t border-white/5 pt-2">
        {{ selectedNode.desc }}
      </p>

      <!-- Connected technologies list -->
      <div class="pt-1 space-y-1.5">
        <p class="font-mono text-[9px] uppercase tracking-wider text-zinc-500">
          RELATED TECHNOLOGIES
        </p>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="relId in selectedNode.connections"
            :key="relId"
            type="button"
            @click.stop="selectNodeById(relId)"
            class="px-2 py-0.5 rounded text-[10px] font-mono text-zinc-300 bg-white/5 hover:bg-white/15 border border-white/10 transition-colors cursor-pointer"
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
          class="inline-flex items-center gap-1 text-[10.5px] font-mono text-blue-400 hover:text-blue-300 transition-colors cursor-pointer font-medium tracking-wider uppercase"
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

// 1. Curated 10 Connected Technologies (Flutter at the Center)
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
    pos: new THREE.Vector3(-1.0, 0.7, 0.45),
    connections: ['flutter', 'architecture'],
  },
  {
    id: 'architecture',
    name: 'Architecture',
    category: 'System Design',
    tagline: 'Clean Architecture & reactive state',
    desc: 'Robust separation of domain, data, and presentation layers using BLoC, Cubit, and Riverpod for scalable, testable codebases.',
    pos: new THREE.Vector3(1.15, 0.65, -0.4),
    connections: ['flutter', 'dart', 'ui-ux'],
  },
  {
    id: 'android',
    name: 'Android',
    category: 'Mobile Platform',
    tagline: 'Platform channels & Gradle pipelines',
    desc: 'Deep platform-native Android configuration, Gradle orchestration, hardware channels, and Google Play packaging.',
    pos: new THREE.Vector3(-1.45, -0.45, 0.35),
    connections: ['flutter', 'ios', 'cicd'],
  },
  {
    id: 'ios',
    name: 'iOS',
    category: 'Apple Platform',
    tagline: 'Apple ecosystem & Cupertino fidelity',
    desc: 'Xcode workspace configuration, CocoaPods integration, iOS certificate management, and Apple App Store compliance.',
    pos: new THREE.Vector3(-1.25, -1.05, -0.45),
    connections: ['flutter', 'android', 'cicd'],
  },
  {
    id: 'web',
    name: 'Web',
    category: 'Web Platform',
    tagline: 'Responsive layouts & modern web runtimes',
    desc: 'Multi-screen responsive layouts, WebAssembly and CanvasKit rendering, cross-browser performance, and desktop parity.',
    pos: new THREE.Vector3(0.35, 1.35, -0.55),
    connections: ['flutter', 'ui-ux'],
  },
  {
    id: 'firebase',
    name: 'Firebase',
    category: 'Cloud Services',
    tagline: 'Realtime data & serverless infrastructure',
    desc: 'Cloud Firestore, Firebase Authentication, Cloud Messaging, Crashlytics analytics, and real-time synchronization.',
    pos: new THREE.Vector3(1.65, -0.35, 0.35),
    connections: ['flutter', 'nodejs'],
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    category: 'Backend & Cloud',
    tagline: 'REST APIs & serverless microservices',
    desc: 'Lightweight backend endpoints, Cloudflare Workers, WebSocket real-time connections, and developer tooling automation.',
    pos: new THREE.Vector3(2.1, -1.0, 0.2),
    connections: ['firebase'],
  },
  {
    id: 'ui-ux',
    name: 'UI/UX',
    category: 'Design Systems',
    tagline: 'Design systems & interaction ergonomics',
    desc: 'Fluid micro-interactions, responsive grid structures, typography hierarchy, accessibility, and human-centered design.',
    pos: new THREE.Vector3(0.55, -1.25, -0.35),
    connections: ['flutter', 'architecture', 'web'],
  },
  {
    id: 'cicd',
    name: 'CI/CD',
    category: 'DevOps & Tooling',
    tagline: 'Continuous integration & deployment',
    desc: 'Automated GitHub Actions pipelines, multi-platform artifact builds, automated linting, and zero-downtime releases.',
    pos: new THREE.Vector3(-1.85, 0.35, -0.3),
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

function clearSelection() {
  selectedNodeId.value = 'flutter'
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
let centralFlutterEmblem: THREE.Mesh | null = null
let accentPointLight: THREE.PointLight | null = null

let nodeMeshMap = new Map<string, { mesh: THREE.Mesh; ring: THREE.Mesh }>()
let edgeLines: { line: THREE.Line; from: string; to: string }[] = []

// Raycasting & Interaction
const raycaster = new THREE.Raycaster()
const mouseNDC = new THREE.Vector2(-999, -999)
let isDragging = false
let prevPointerX = 0
let prevPointerY = 0
let targetRotX = 0
let targetRotY = 0
let targetCamZ = 5.2

// Unregister handler for showcase content navigation
let unregisterContentNav: (() => void) | null = null

// Generate crisp Flutter Emblem Canvas Texture
function createFlutterEmblemTexture(): THREE.CanvasTexture {
  const size = 512
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  const ctx = c.getContext('2d')!

  ctx.clearRect(0, 0, size, size)

  // Draw clean, minimalist Flutter Mark
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

  // Bottom-Left Inner Chevron
  ctx.beginPath()
  ctx.moveTo(s * 0.25, 0)
  ctx.lineTo(-s * 0.2, 0)
  ctx.lineTo(s * 0.25, s * 0.45)
  ctx.lineTo(s * 0.7, s * 0.45)
  ctx.closePath()
  ctx.fillStyle = '#01579b'
  ctx.fill()

  // Bottom-Right Outer Chevron
  ctx.beginPath()
  ctx.moveTo(s * 0.25, s * 0.45)
  ctx.lineTo(s * 0.02, s * 0.68)
  ctx.lineTo(s * 0.48, s * 0.68)
  ctx.lineTo(s * 0.85, s * 0.32)
  ctx.lineTo(s * 0.48, s * 0.32)
  ctx.closePath()
  ctx.fillStyle = '#0288d1'
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

  // 1. Scene & Camera (Perspective with subtle negative space framing)
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100)

  targetCamZ = isMobile ? 6.4 : 5.0
  camera.position.set(0, 0, targetCamZ)

  // 2. High-Performance WebGL Renderer
  renderer = new THREE.WebGLRenderer({
    canvas: canvas.value,
    antialias: !isMobile,
    alpha: true,
    powerPreference: 'high-performance',
  })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))

  // 3. Very Soft, Sophisticated Lighting Setup
  // Weak Ambient
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
  scene.add(ambientLight)

  // Large Soft Key Light
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.3)
  keyLight.position.set(5, 6, 6)
  scene.add(keyLight)

  // Subtle Rim Light
  const rimLight = new THREE.DirectionalLight(0x94a3b8, 0.7)
  rimLight.position.set(-6, -4, -4)
  scene.add(rimLight)

  // Dynamic Accent Point Light (Soft blue near selected object)
  accentPointLight = new THREE.PointLight(0x3b82f6, 1.2, 5, 1.5)
  accentPointLight.position.set(0, 0, 1.2)
  scene.add(accentPointLight)

  // 4. Main Constellation Group (Offset slightly right on desktop to leave room for editorial copy)
  constellationGroup = new THREE.Group()
  constellationGroup.position.x = isMobile ? 0 : 0.65
  scene.add(constellationGroup)

  // 5. 2–3 Subtle Elliptical Orbital Paths
  const orbitConfigs = [
    { a: 1.5, b: 1.35, rotX: 0.28, rotZ: 0.15 },
    { a: 1.9, b: 1.6, rotX: -0.32, rotZ: 0.4 },
    { a: 2.2, b: 1.85, rotX: 0.48, rotZ: -0.25 },
  ]
  for (const cfg of orbitConfigs) {
    const curve = new THREE.EllipseCurve(0, 0, cfg.a, cfg.b, 0, 2 * Math.PI, false, 0)
    const points = curve.getPoints(96)
    const geo = new THREE.BufferGeometry().setFromPoints(points)
    const mat = new THREE.LineBasicMaterial({
      color: 0x475569,
      transparent: true,
      opacity: 0.12,
    })
    const orbitLine = new THREE.LineLoop(geo, mat)
    orbitLine.rotation.x = cfg.rotX
    orbitLine.rotation.z = cfg.rotZ
    constellationGroup.add(orbitLine)
  }

  // 6. Sparse 3D Connection Lines
  edgeLines = []
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
        color: 0x1f2937,
        transparent: true,
        opacity: 0.2,
      })
      const line = new THREE.Line(geo, mat)
      constellationGroup!.add(line)
      edgeLines.push({ line, from: node.id, to: targetId })
    })
  })

  // 7. Central Translucent 3D Sphere for Flutter
  const flutterNode = nodesData[0]
  const glassGeo = new THREE.SphereGeometry(0.36, 32, 32)
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x0c1322,
    emissive: 0x08162e,
    emissiveIntensity: 0.2,
    roughness: 0.15,
    metalness: 0.1,
    transmission: 0.65,
    ior: 1.45,
    thickness: 0.8,
    transparent: true,
    opacity: 0.92,
    reflectivity: 0.5,
  })
  centralFlutterMesh = new THREE.Mesh(glassGeo, glassMat)
  centralFlutterMesh.position.copy(flutterNode.pos)
  centralFlutterMesh.userData = { id: flutterNode.id }
  constellationGroup.add(centralFlutterMesh)

  // Inner Flutter Emblem Plane
  const emblemTex = createFlutterEmblemTexture()
  const emblemGeo = new THREE.PlaneGeometry(0.32, 0.32)
  const emblemMat = new THREE.MeshBasicMaterial({
    map: emblemTex,
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide,
    depthWrite: false,
  })
  centralFlutterEmblem = new THREE.Mesh(emblemGeo, emblemMat)
  centralFlutterMesh.add(centralFlutterEmblem)

  // Outer subtle rim ring
  const flutterRingGeo = new THREE.RingGeometry(0.42, 0.44, 48)
  const flutterRingMat = new THREE.MeshBasicMaterial({
    color: 0x60a5fa,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.6,
  })
  const flutterRing = new THREE.Mesh(flutterRingGeo, flutterRingMat)
  flutterRing.position.copy(flutterNode.pos)
  constellationGroup.add(flutterRing)
  nodeMeshMap.set(flutterNode.id, { mesh: centralFlutterMesh, ring: flutterRing })

  // 8. Surrounding Smaller Technology Spheres
  for (let i = 1; i < nodesData.length; i++) {
    const node = nodesData[i]
    const sGeo = new THREE.SphereGeometry(0.095, 20, 20)
    const sMat = new THREE.MeshStandardMaterial({
      color: 0x181c24,
      roughness: 0.32,
      metalness: 0.75,
      emissive: 0x0a0d14,
      emissiveIntensity: 0.1,
    })
    const sMesh = new THREE.Mesh(sGeo, sMat)
    sMesh.position.copy(node.pos)
    sMesh.userData = { id: node.id }
    constellationGroup.add(sMesh)

    // Thin halo ring (invisible until selected)
    const rGeo = new THREE.RingGeometry(0.13, 0.145, 32)
    const rMat = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    })
    const ring = new THREE.Mesh(rGeo, rMat)
    ring.position.copy(node.pos)
    constellationGroup.add(ring)

    nodeMeshMap.set(node.id, { mesh: sMesh, ring })
  }

  // 9. Very Sparse Depth Particles (Faint cosmic micro-dust, NO starfield)
  const dustCount = isMobile ? 120 : 350
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
    size: 0.015,
    transparent: true,
    opacity: 0.25,
  })
  scene.add(new THREE.Points(dustGeo, dustMat))

  updateHighlights()

  // 10. Animation Loop (Slow, calm, 10–30s per major rotation)
  let lastTime = performance.now()
  function loop(now: number) {
    animFrameId = requestAnimationFrame(loop)
    const delta = Math.min((now - lastTime) / 1000, 0.1)
    lastTime = now

    if (constellationGroup) {
      if (!isDragging) {
        // Slow calm idle rotation
        targetRotY += delta * 0.035
      }
      constellationGroup.rotation.y = THREE.MathUtils.lerp(constellationGroup.rotation.y, targetRotY, 0.06)
      constellationGroup.rotation.x = THREE.MathUtils.lerp(constellationGroup.rotation.x, targetRotX, 0.06)
    }

    // Keep rings facing camera & subtle idle node float
    nodeMeshMap.forEach((item, id) => {
      item.ring.lookAt(camera!.position)

      if (id !== 'flutter') {
        const nIndex = nodesData.findIndex(n => n.id === id)
        const floatOffset = Math.sin(now * 0.001 + nIndex) * 0.0006
        item.mesh.position.y += floatOffset
        item.ring.position.y += floatOffset
      }
    })

    // Slow rotation of central Flutter emblem
    if (centralFlutterEmblem) {
      centralFlutterEmblem.lookAt(camera!.position)
    }

    // Smooth Camera Zoom
    if (camera) {
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, 0.08)
    }

    // Update 2D Screen Position for Hovered Tag
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
    accentPointLight.position.set(cur.pos.x, cur.pos.y, cur.pos.z + 0.8)
  }

  // Update spheres & rings
  nodeMeshMap.forEach((item, id) => {
    const isSelected = id === cur.id
    const isConnected = cur.connections.includes(id)
    const rMat = item.ring.material as THREE.MeshBasicMaterial

    if (id === 'flutter') {
      const gMat = item.mesh.material as THREE.MeshPhysicalMaterial
      if (isSelected) {
        gMat.emissive.setHex(0x1d4ed8)
        gMat.emissiveIntensity = 0.4
        rMat.opacity = 0.85
      } else if (isConnected) {
        gMat.emissive.setHex(0x0f2952)
        gMat.emissiveIntensity = 0.25
        rMat.opacity = 0.4
      } else {
        gMat.emissive.setHex(0x060f1e)
        gMat.emissiveIntensity = 0.1
        rMat.opacity = 0.15
      }
    } else {
      const sMat = item.mesh.material as THREE.MeshStandardMaterial
      if (isSelected) {
        sMat.color.setHex(0x1e3a8a)
        sMat.emissive.setHex(0x3b82f6)
        sMat.emissiveIntensity = 0.75
        item.mesh.scale.set(1.25, 1.25, 1.25)
        rMat.opacity = 0.85
      } else if (isConnected) {
        sMat.color.setHex(0x27303f)
        sMat.emissive.setHex(0x2563eb)
        sMat.emissiveIntensity = 0.25
        item.mesh.scale.set(1.05, 1.05, 1.05)
        rMat.opacity = 0
      } else {
        sMat.color.setHex(0x11141a)
        sMat.emissive.setHex(0x05070a)
        sMat.emissiveIntensity = 0.05
        item.mesh.scale.set(0.9, 0.9, 0.9)
        rMat.opacity = 0
      }
    }
  })

  // Update connection lines
  edgeLines.forEach(edge => {
    const isDirect = (edge.from === cur.id && cur.connections.includes(edge.to)) ||
                     (edge.to === cur.id && cur.connections.includes(edge.from))
    const lMat = edge.line.material as THREE.LineBasicMaterial

    if (isDirect) {
      lMat.color.setHex(0x3b82f6)
      lMat.opacity = 0.75
    } else {
      lMat.color.setHex(0x1e2430)
      lMat.opacity = 0.08
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

// Interaction Handlers
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

  if (isDragging && constellationGroup) {
    const dx = e.clientX - prevPointerX
    const dy = e.clientY - prevPointerY
    prevPointerX = e.clientX
    prevPointerY = e.clientY

    targetRotY += dx * 0.005
    targetRotX += dy * 0.005
  } else {
    // Check hover state
    checkRaycast(e, false)
  }
}

function onPointerUp() {
  isDragging = false
}

function onWheel(e: WheelEvent) {
  e.preventDefault()
  targetCamZ = THREE.MathUtils.clamp(targetCamZ + e.deltaY * 0.003, 4.2, 6.8)
}

function checkRaycast(e: PointerEvent, isClick: boolean) {
  if (!camera || !container.value) return
  const rect = container.value.getBoundingClientRect()
  mouseNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
  mouseNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

  raycaster.setFromCamera(mouseNDC, camera)
  const targets = Array.from(nodeMeshMap.values()).map(n => n.mesh)
  const hits = raycaster.intersectObjects(targets, false)

  if (hits.length > 0) {
    const id = hits[0].object.userData.id
    if (typeof id === 'string') {
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

function onBackgroundClick(e: MouseEvent) {
  // If clicked directly on canvas background without hitting a node, reset view to flutter
  if (e.target === canvas.value && !hoveredNodeId.value) {
    clearSelection()
  }
}

// Arrow Key Navigation (Left / Right cycles through nodes)
function prevNode() {
  const currentIdx = nodesData.findIndex(n => n.id === selectedNodeId.value)
  const prevIdx = (currentIdx - 1 + nodesData.length) % nodesData.length
  selectNodeById(nodesData[prevIdx].id)
}

function nextNode() {
  const currentIdx = nodesData.findIndex(n => n.id === selectedNodeId.value)
  const nextIdx = (currentIdx + 1) % nodesData.length
  selectNodeById(nodesData[nextIdx].id)
}

function onResize() {
  if (!container.value || !camera || !renderer) return
  const w = container.value.clientWidth || window.innerWidth
  const h = container.value.clientHeight || window.innerHeight
  const isMobile = w < 768

  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)

  if (constellationGroup) {
    constellationGroup.position.x = isMobile ? 0 : 0.65
  }
  targetCamZ = isMobile ? 6.4 : 5.0
}

onMounted(() => {
  initScene()
  window.addEventListener('resize', onResize)

  // Register left/right content navigation
  unregisterContentNav = registerContentNavigator((dir) => {
    if (dir === 'next') nextNode()
    else prevNode()
  })
})

onBeforeUnmount(() => {
  unregisterContentNav?.()
  window.removeEventListener('resize', onResize)

  if (animFrameId) cancelAnimationFrame(animFrameId)

  if (scene) {
    scene.traverse(obj => {
      if (obj instanceof THREE.Mesh || obj instanceof THREE.Points || obj instanceof THREE.LineLoop || obj instanceof THREE.Line) {
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

@media (prefers-reduced-motion: reduce) {
  .editorial-panel {
    transition: opacity 150ms ease !important;
  }
}
</style>
