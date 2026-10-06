<template>
  <div ref="container" class="skills-tech-tree-scene relative w-full h-full select-none overflow-hidden bg-[#010206]">
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
        <span class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
        TECHNOLOGY MATRIX // 3D CONSTELLATION
      </p>
      <p class="text-zinc-500 uppercase mt-0.5">
        CLICK TECH NODE TO ILLUMINATE ARCHITECTURAL CONNECTIONS
      </p>
    </div>

    <!-- Active Technology Details Card (Bottom Overlay) -->
    <div
      v-if="selectedNode"
      class="absolute bottom-6 sm:bottom-8 left-6 sm:left-8 right-6 sm:right-auto z-10 max-w-sm sm:max-w-md w-full pointer-events-auto"
    >
      <div class="p-4 sm:p-5 rounded-2xl border border-white/15 bg-black/85 backdrop-blur-xl shadow-2xl space-y-3">
        <div class="flex items-center justify-between gap-2">
          <span class="font-mono text-[9px] uppercase tracking-widest text-blue-400 font-bold">
            {{ selectedNode.group }}
          </span>
          <span class="font-mono text-[9px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
            {{ selectedNode.connections.length }} CONNECTIONS
          </span>
        </div>

        <h3 class="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
          {{ selectedNode.name }}
        </h3>

        <p class="text-xs text-zinc-300 leading-relaxed font-sans">
          {{ selectedNode.desc }}
        </p>

        <!-- Connected Tech Chips -->
        <div class="space-y-1.5 pt-1 border-t border-white/10">
          <p class="font-mono text-[9px] uppercase tracking-wider text-zinc-500">
            RELATED / INTEGRATED WITH:
          </p>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="relId in selectedNode.connections"
              :key="relId"
              type="button"
              @click="selectNodeById(relId)"
              class="px-2 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-[9px] font-mono text-zinc-200 border border-white/15 transition cursor-pointer"
            >
              {{ getNodeName(relId) }}
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

interface TechNode {
  id: string
  name: string
  group: string
  desc: string
  pos: THREE.Vector3
  connections: string[]
  isCore?: boolean
}

const skills = portfolioContent.skills

const nodesData: TechNode[] = [
  // Core Foundation
  {
    id: 'flutter',
    name: 'Flutter',
    group: 'Languages & Platforms',
    desc: 'Core framework for building high-performance cross-platform applications across mobile, web, and desktop.',
    pos: new THREE.Vector3(0, 0, 0),
    connections: ['dart', 'clean-arch', 'riverpod', 'bloc', 'android', 'ios', 'flutter-web', 'dio'],
    isCore: true,
  },
  {
    id: 'dart',
    name: 'Dart',
    group: 'Languages & Platforms',
    desc: 'Core type-safe, high-efficiency client-optimized language for fast apps on any platform.',
    pos: new THREE.Vector3(-0.9, 0.6, 0.3),
    connections: ['flutter', 'clean-arch'],
    isCore: true,
  },
  // Architecture & State
  {
    id: 'clean-arch',
    name: 'Clean Architecture',
    group: 'Frameworks & Architecture',
    desc: 'Separation of concerns (Domain, Data, Presentation layers) ensuring testable, sustainable codebase.',
    pos: new THREE.Vector3(1.1, 0.7, -0.3),
    connections: ['flutter', 'dart', 'bloc', 'riverpod', 'sqlite'],
  },
  {
    id: 'riverpod',
    name: 'Riverpod',
    group: 'State Management',
    desc: 'Compile-safe, reactive state caching and dependency injection library for Flutter.',
    pos: new THREE.Vector3(1.6, -0.4, 0.2),
    connections: ['flutter', 'clean-arch'],
  },
  {
    id: 'bloc',
    name: 'BLoC / Cubit',
    group: 'State Management',
    desc: 'Predictable state management pattern separating presentation from business logic via event streams.',
    pos: new THREE.Vector3(0.7, -1.1, 0.4),
    connections: ['flutter', 'clean-arch'],
  },
  // Platforms
  {
    id: 'android',
    name: 'Android & Native SDK',
    group: 'Languages & Platforms',
    desc: 'Deep platform-native Android deployment, Gradle configuration, and SDK integrations.',
    pos: new THREE.Vector3(-1.4, -0.6, 0.5),
    connections: ['flutter', 'ios', 'cicd'],
  },
  {
    id: 'ios',
    name: 'iOS Platform',
    group: 'Languages & Platforms',
    desc: 'Apple ecosystem builds, CocoaPods, Xcode configurations, and App Store packaging.',
    pos: new THREE.Vector3(-1.6, 0.1, -0.6),
    connections: ['flutter', 'android', 'cicd'],
  },
  {
    id: 'flutter-web',
    name: 'Flutter Web & Desktop',
    group: 'Languages & Platforms',
    desc: 'Multi-screen responsive layouts and platform-adaptive keyboard & mouse controls.',
    pos: new THREE.Vector3(-0.4, 1.4, -0.4),
    connections: ['flutter'],
  },
  // Networking & Data
  {
    id: 'dio',
    name: 'Dio & HTTP',
    group: 'Networking',
    desc: 'Powerful HTTP networking with interceptors, token refresh flows, and global error handling.',
    pos: new THREE.Vector3(0.2, 1.3, 0.6),
    connections: ['flutter', 'websocket'],
  },
  {
    id: 'websocket',
    name: 'WebSocket Realtime',
    group: 'Networking',
    desc: 'Bi-directional real-time communication for live updates, POS syncing, and socket streaming.',
    pos: new THREE.Vector3(1.2, 1.6, 0.5),
    connections: ['dio'],
  },
  {
    id: 'sqlite',
    name: 'SQLite (sqflite) & Hive',
    group: 'Data & Storage',
    desc: 'Robust relational and fast key-value local offline storage and caching strategies.',
    pos: new THREE.Vector3(1.5, -1.2, -0.4),
    connections: ['flutter', 'clean-arch'],
  },
  {
    id: 'cicd',
    name: 'CI/CD & Git',
    group: 'Tooling',
    desc: 'Automated build, test, and release pipelines ensuring high software quality.',
    pos: new THREE.Vector3(-2.1, -1.1, -0.2),
    connections: ['android', 'ios'],
  },
]

const selectedNodeId = ref<string>('flutter')
const selectedNode = computed(() => nodesData.find(n => n.id === selectedNodeId.value) || nodesData[0])

function getNodeName(id: string): string {
  return nodesData.find(n => n.id === id)?.name || id
}

function selectNodeById(id: string) {
  selectedNodeId.value = id
  updateHighlights()
}

const container = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let animFrameId = 0
let constellationGroup: THREE.Group | null = null

let nodeMeshMap = new Map<string, { mesh: THREE.Mesh; ring: THREE.Mesh }>()
let edgeLines: { line: THREE.Line; from: string; to: string }[] = []

const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2(-999, -999)

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
  camera.position.set(0, 0, isMobile ? 6.5 : 5.0)

  renderer = new THREE.WebGLRenderer({
    canvas: canvas.value,
    antialias: !isMobile,
    alpha: true,
    powerPreference: 'high-performance',
  })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))

  const ambient = new THREE.AmbientLight(0xffffff, 0.7)
  scene.add(ambient)
  const dir = new THREE.DirectionalLight(0x60a5fa, 2.0)
  dir.position.set(4, 5, 4)
  scene.add(dir)

  constellationGroup = new THREE.Group()
  scene.add(constellationGroup)

  // 1. Build Connecting Lines (Edges)
  edgeLines = []
  const createdPairs = new Set<string>()

  nodesData.forEach(node => {
    node.connections.forEach(targetId => {
      const pairKey = [node.id, targetId].sort().join('--')
      if (createdPairs.has(pairKey)) return
      createdPairs.add(pairKey)

      const target = nodesData.find(n => n.id === targetId)
      if (!target) return

      const points = [node.pos, target.pos]
      const geo = new THREE.BufferGeometry().setFromPoints(points)
      const mat = new THREE.LineBasicMaterial({
        color: 0x334155,
        transparent: true,
        opacity: 0.35,
      })
      const line = new THREE.Line(geo, mat)
      constellationGroup!.add(line)
      edgeLines.push({ line, from: node.id, to: targetId })
    })
  })

  // 2. Build 3D Nodes
  nodeMeshMap.clear()
  nodesData.forEach(node => {
    const isCore = node.isCore
    const geo = new THREE.SphereGeometry(isCore ? 0.16 : 0.11, 16, 16)
    const mat = new THREE.MeshStandardMaterial({
      color: isCore ? 0x3b82f6 : 0x0284c7,
      emissive: isCore ? 0x2563eb : 0x0369a1,
      emissiveIntensity: isCore ? 0.9 : 0.5,
      metalness: 0.8,
      roughness: 0.2,
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.copy(node.pos)
    mesh.userData = { id: node.id }
    constellationGroup!.add(mesh)

    // Halo ring
    const ringGeo = new THREE.RingGeometry(isCore ? 0.22 : 0.15, isCore ? 0.28 : 0.19, 20)
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
    })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.position.copy(node.pos)
    constellationGroup!.add(ring)

    nodeMeshMap.set(node.id, { mesh, ring })
  })

  // 3. Background Starfield
  const dustCount = isMobile ? 500 : 1200
  const dustPos = new Float32Array(dustCount * 3)
  for (let i = 0; i < dustCount; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 18
    dustPos[i * 3 + 1] = (Math.random() - 0.5) * 14
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 3
  }
  const dustGeo = new THREE.BufferGeometry()
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3))
  const dustMat = new THREE.PointsMaterial({
    color: 0x475569,
    size: 0.02,
    transparent: true,
    opacity: 0.6,
  })
  scene.add(new THREE.Points(dustGeo, dustMat))

  updateHighlights()

  // 4. Animation Loop
  let lastTime = performance.now()
  function loop(now: number) {
    animFrameId = requestAnimationFrame(loop)
    const delta = Math.min((now - lastTime) / 1000, 0.1)
    lastTime = now

    // Keep rings facing camera
    nodeMeshMap.forEach(item => {
      item.ring.lookAt(camera!.position)
    })

    if (!isDragging && constellationGroup) {
      constellationGroup.rotation.y += delta * 0.05
    }

    if (renderer && scene && camera) {
      renderer.render(scene, camera)
    }
  }
  animFrameId = requestAnimationFrame(loop)
}

function updateHighlights() {
  const cur = selectedNode.value
  const activeIds = new Set([cur.id, ...cur.connections])

  // Update nodes
  nodeMeshMap.forEach((item, id) => {
    const isMain = id === cur.id
    const isConn = cur.connections.includes(id)
    const mat = item.mesh.material as THREE.MeshStandardMaterial
    const rMat = item.ring.material as THREE.MeshBasicMaterial

    if (isMain) {
      mat.emissive.setHex(0x38bdf8)
      mat.emissiveIntensity = 1.4
      item.mesh.scale.set(1.3, 1.3, 1.3)
      rMat.opacity = 0.9
      item.ring.scale.set(1.4, 1.4, 1)
    } else if (isConn) {
      mat.emissive.setHex(0x60a5fa)
      mat.emissiveIntensity = 0.8
      item.mesh.scale.set(1.1, 1.1, 1.1)
      rMat.opacity = 0.6
      item.ring.scale.set(1.1, 1.1, 1)
    } else {
      mat.emissive.setHex(0x1e293b)
      mat.emissiveIntensity = 0.2
      item.mesh.scale.set(0.9, 0.9, 0.9)
      rMat.opacity = 0.15
      item.ring.scale.set(0.9, 0.9, 1)
    }
  })

  // Update edges
  edgeLines.forEach(edge => {
    const isConnectedToSelected = (edge.from === cur.id && cur.connections.includes(edge.to)) ||
                                  (edge.to === cur.id && cur.connections.includes(edge.from))
    const lMat = edge.line.material as THREE.LineBasicMaterial
    if (isConnectedToSelected) {
      lMat.color.setHex(0x38bdf8)
      lMat.opacity = 0.85
    } else {
      lMat.color.setHex(0x1e293b)
      lMat.opacity = 0.15
    }
  })
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

  if (isDragging && constellationGroup) {
    const dx = e.clientX - prevX
    const dy = e.clientY - prevY
    prevX = e.clientX
    prevY = e.clientY
    constellationGroup.rotation.y += dx * 0.005
    constellationGroup.rotation.x += dy * 0.005
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
  const targets = Array.from(nodeMeshMap.values()).map(n => n.mesh)
  const hits = raycaster.intersectObjects(targets, false)
  if (hits.length > 0) {
    const id = hits[0].object.userData.id
    if (typeof id === 'string') {
      selectNodeById(id)
    }
  }
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

