<template>
  <div
    ref="container"
    class="contact-communication-scene relative w-full h-full select-none overflow-hidden bg-[#03060b]"
  >
    <!-- WebGL Canvas for 3D Communication Field -->
    <canvas
      ref="canvas"
      class="w-full h-full block cursor-grab active:cursor-grabbing outline-none touch-none"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    ></canvas>

    <!-- Deep Ambient Vignette (Seamless background blend) -->
    <div class="pointer-events-none absolute inset-0 gallery-ambient-vignette" aria-hidden="true"></div>

    <!-- Editorial Contact Information Panel (Left Side on Desktop ~30-35% width) -->
    <div
      class="pointer-events-auto absolute top-[max(4.25rem,calc(env(safe-area-inset-top)+3.5rem))] sm:top-20 left-4 sm:left-12 right-4 sm:right-auto z-20 max-w-xs sm:max-w-sm space-y-2.5 sm:space-y-4 select-none"
    >
      <!-- Section Header -->
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <span class="font-mono text-[10px] text-zinc-400 tracking-widest font-semibold">06</span>
          <span class="w-3.5 h-[1px] bg-zinc-600"></span>
          <span class="font-mono text-[10px] text-zinc-300 uppercase tracking-widest font-medium">CONTACT</span>
        </div>

        <h1 class="text-2xl sm:text-3xl font-light tracking-tight text-white font-sans leading-tight pt-1">
          Let's Connect
        </h1>

        <p class="text-[11.5px] text-zinc-400 leading-relaxed font-sans max-w-[310px] font-normal pt-1">
          {{ contact.description }}
        </p>
      </div>

      <!-- Communication Channels (Direct Links) -->
      <div class="space-y-1.5 pt-2">
        <a
          v-for="item in contactNodesData"
          :key="item.type"
          :href="item.href"
          target="_blank"
          rel="noopener noreferrer"
          class="group flex items-center justify-between p-2.5 rounded-xl border transition-all duration-200 cursor-pointer"
          :class="
            activeNodeType === item.type
              ? 'bg-white/10 border-white/30 text-white shadow-lg'
              : 'bg-black/40 hover:bg-white/5 border-white/10 text-zinc-300 hover:text-white'
          "
          @mouseenter="setActiveNode(item.type)"
          @mouseleave="setActiveNode(null)"
        >
          <div class="flex items-center gap-2">
            <!-- Signal Beacon -->
            <span
              class="w-1.5 h-1.5 rounded-full transition-colors duration-200"
              :class="activeNodeType === item.type ? 'bg-sky-400 shadow-[0_0_8px_#38bdf8]' : 'bg-zinc-500'"
            ></span>
            <span class="font-mono text-[9.5px] uppercase tracking-wider text-zinc-400 group-hover:text-zinc-200">
              {{ item.label }}
            </span>
          </div>

          <span class="font-mono text-[11px] font-medium flex items-center gap-1.5 text-zinc-200 group-hover:text-white">
            <span class="truncate max-w-[170px] sm:max-w-[190px]">{{ item.value }}</span>
            <span class="text-zinc-400 group-hover:text-sky-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-[10px]">
              ↗
            </span>
          </span>
        </a>
      </div>

      <!-- Primary Action Button: Transmit Message -->
      <div class="pt-2">
        <a
          :href="`mailto:${emailContact?.value || 'tegar@wolkk.com'}?subject=Hello%20Tegar%20-%20Project%20Inquiry`"
          class="group w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 active:scale-98 text-white font-mono text-[11px] uppercase tracking-widest font-semibold transition-all shadow-lg backdrop-blur-md cursor-pointer"
          @mouseenter="setActiveNode('email')"
          @mouseleave="setActiveNode(null)"
        >
          <span>TRANSMIT MESSAGE</span>
          <span class="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
        </a>
      </div>

      <!-- Status Beacon / Interactive Hint -->
      <div class="pt-1 flex items-center gap-2 font-mono text-[9px] text-zinc-500 tracking-wider">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)] animate-pulse"></span>
        <span>CHANNEL ACTIVE · DIRECT TRANSMISSION READY</span>
      </div>
    </div>

    <!-- Floating 3D Node Billboards (Screen-projected labels next to 3D nodes) -->
    <div
      v-for="node in contactNodesData"
      :key="node.type"
      v-show="nodeScreenPositions[node.type]?.visible"
      class="pointer-events-auto absolute z-20 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200 select-none cursor-pointer"
      :style="{
        left: `${nodeScreenPositions[node.type]?.x || -999}px`,
        top: `${nodeScreenPositions[node.type]?.y || -999}px`,
        opacity: activeNodeType === node.type ? 1 : 0.85,
      }"
      @mouseenter="setActiveNode(node.type)"
      @mouseleave="setActiveNode(null)"
      @click="openNodeLink(node)"
    >
      <div
        class="flex items-center gap-1.5 px-2.5 py-1 rounded-full border backdrop-blur-xl transition-all duration-200 shadow-xl"
        :class="
          activeNodeType === node.type
            ? 'bg-zinc-950/95 border-sky-400/50 text-white scale-105 shadow-[0_0_16px_rgba(56,189,248,0.3)]'
            : 'bg-zinc-950/80 border-white/15 text-zinc-300 hover:border-white/30 hover:text-white'
        "
      >
        <span
          class="w-1.5 h-1.5 rounded-full transition-colors"
          :class="activeNodeType === node.type ? 'bg-sky-400 shadow-[0_0_6px_#38bdf8]' : 'bg-zinc-400'"
        ></span>
        <span class="font-mono text-[9.5px] uppercase tracking-wider font-semibold">
          {{ node.label }}
        </span>
        <span class="text-zinc-400 text-[10px]">↗</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { portfolioContent } from '@/content/portfolioContent'

const contact = portfolioContent.contact
const emailContact = computed(() => contact.items.find(i => i.type === 'email'))

export interface ContactNodeMeta {
  type: 'email' | 'linkedin' | 'github'
  label: string
  value: string
  href: string
  baseOffset: [number, number, number]
}

const contactNodesData = computed<ContactNodeMeta[]>(() => {
  const getHref = (type: string, fallback: string) =>
    contact.items.find(i => i.type === type)?.href || fallback
  const getValue = (type: string, fallback: string) =>
    contact.items.find(i => i.type === type)?.value || fallback

  return [
    {
      type: 'email',
      label: 'EMAIL',
      value: getValue('email', 'tegar@wolkk.com'),
      href: getHref('email', 'mailto:tegar@wolkk.com'),
      baseOffset: [-0.65, 1.85, 0.25], // Upper-left
    },
    {
      type: 'linkedin',
      label: 'LINKEDIN',
      value: getValue('linkedin', 'linkedin.com/in/tegaranugroho'),
      href: getHref('linkedin', 'https://linkedin.com/in/tegaranugroho'),
      baseOffset: [-2.15, -1.15, 0.35], // Lower-left
    },
    {
      type: 'github',
      label: 'GITHUB',
      value: getValue('github', 'github.com/tegarnugroho'),
      href: getHref('github', 'https://github.com/tegarnugroho'),
      baseOffset: [2.25, -0.85, -0.2], // Lower-right
    },
  ]
})

const activeNodeType = ref<'email' | 'linkedin' | 'github' | null>(null)

function setActiveNode(type: 'email' | 'linkedin' | 'github' | null) {
  activeNodeType.value = type
  if (type) {
    triggerSignalPulse(type)
  }
}

function openNodeLink(node: ContactNodeMeta) {
  if (node.href.startsWith('mailto:')) {
    window.location.href = node.href
  } else {
    window.open(node.href, '_blank', 'noopener,noreferrer')
  }
}

// -------------------------------------------------------------
// THREE.JS SPATIAL COMMUNICATION FIELD
// -------------------------------------------------------------
const container = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let animFrameId = 0
let isVisible = true
let observer: IntersectionObserver | null = null

// Groups & Meshes
let fieldMasterGroup: THREE.Group | null = null
let orbGroup: THREE.Group | null = null
let outerGlassMesh: THREE.Mesh | null = null
let innerCoreMesh: THREE.Mesh | null = null
let signalRings: Array<{ mesh: THREE.LineLoop; speed: number; axis: THREE.Vector3 }> = []

interface ThreeNodeEntity {
  type: 'email' | 'linkedin' | 'github'
  group: THREE.Group
  basePos: THREE.Vector3
  targetPos: THREE.Vector3
  sphereMesh: THREE.Mesh
  haloMesh: THREE.Mesh
  lineGeometry: THREE.BufferGeometry
  lineMaterial: THREE.LineBasicMaterial
  pulseMesh: THREE.Mesh
  pulseProgress: number
  pulseActive: boolean
}

const nodeEntities: ThreeNodeEntity[] = []

const nodeScreenPositions = reactive<
  Record<string, { x: number; y: number; visible: boolean }>
>({
  email: { x: -999, y: -999, visible: false },
  linkedin: { x: -999, y: -999, visible: false },
  github: { x: -999, y: -999, visible: false },
})

// Interaction & Parallax State
const isMobile = ref(false)
const prefersReducedMotion = ref(false)

let isDragging = false
let prevPointerX = 0
let prevPointerY = 0
let targetFieldRotY = 0
let targetFieldRotX = 0
let currentFieldRotY = 0
let currentFieldRotX = 0

let targetCamX = 0
let targetCamY = 0
let currentCamX = 0
let currentCamY = 0

const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2(-999, -999)

function triggerSignalPulse(type: 'email' | 'linkedin' | 'github') {
  const entity = nodeEntities.find(n => n.type === type)
  if (entity) {
    entity.pulseProgress = 0
    entity.pulseActive = true
  }
}

function initThree() {
  if (!container.value || !canvas.value) return

  const width = container.value.clientWidth || window.innerWidth
  const height = container.value.clientHeight || window.innerHeight

  isMobile.value = width < 768
  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  scene = new THREE.Scene()

  // Perspective camera
  camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 100)
  camera.position.set(0, 0.1, width < 390 ? 8.4 : (isMobile.value ? 7.6 : 6.2))

  // WebGL Renderer
  renderer = new THREE.WebGLRenderer({
    canvas: canvas.value,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))
  renderer.outputColorSpace = THREE.SRGBColorSpace

  // Subtle studio lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.65)
  scene.add(ambientLight)

  const keyLight = new THREE.DirectionalLight(0xffffff, 0.9)
  keyLight.position.set(3, 4, 5)
  scene.add(keyLight)

  const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.5)
  rimLight.position.set(-3, -2, -2)
  scene.add(rimLight)

  // Master Field Group
  fieldMasterGroup = new THREE.Group()
  // Offset to the right on desktop to leave 35% on left for editorial panel
  const fieldCenterX = isMobile.value ? 0.0 : 1.25
  const fieldCenterY = isMobile.value ? -0.35 : 0.05
  fieldMasterGroup.position.set(fieldCenterX, fieldCenterY, 0)
  scene.add(fieldMasterGroup)

  // 1. Central Communication Orb
  orbGroup = new THREE.Group()
  fieldMasterGroup.add(orbGroup)

  // Outer Translucent Glass-like Sphere
  const orbRadius = isMobile.value ? 0.88 : 1.05
  const outerSphereGeo = new THREE.SphereGeometry(orbRadius, 48, 48)
  const outerGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x0a1017,
    roughness: 0.12,
    metalness: 0.15,
    transmission: 0.68,
    ior: 1.45,
    transparent: true,
    opacity: 0.85,
  })
  outerGlassMesh = new THREE.Mesh(outerSphereGeo, outerGlassMat)
  orbGroup.add(outerGlassMesh)

  // Inner Core Sphere (Glowing Endpoint)
  const innerCoreGeo = new THREE.SphereGeometry(orbRadius * 0.52, 32, 32)
  const innerCoreMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.45,
    roughness: 0.35,
    metalness: 0.2,
  })
  innerCoreMesh = new THREE.Mesh(innerCoreGeo, innerCoreMat)
  orbGroup.add(innerCoreMesh)

  // White Incandescent Center Nexus
  const nexusGeo = new THREE.SphereGeometry(orbRadius * 0.18, 16, 16)
  const nexusMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
  const nexusMesh = new THREE.Mesh(nexusGeo, nexusMat)
  orbGroup.add(nexusMesh)

  // Equatorial Titanium Datum Ring
  const datumRingGeo = new THREE.TorusGeometry(orbRadius * 1.01, 0.007, 16, 64)
  const datumRingMat = new THREE.MeshBasicMaterial({
    color: 0x94a3b8,
    transparent: true,
    opacity: 0.35,
  })
  const datumRing = new THREE.Mesh(datumRingGeo, datumRingMat)
  datumRing.rotation.x = Math.PI / 2
  orbGroup.add(datumRing)

  // 2. Three Thin Elliptical Signal Rings
  createSignalRings(orbRadius)

  // 3. Three Communication Nodes (Email, LinkedIn, GitHub)
  createCommunicationNodes(orbRadius)

  // Start Animation Loop
  let lastTime = performance.now()
  let cycleTimer = 0
  let cycleIndex = 0
  const cycleOrder: Array<'email' | 'linkedin' | 'github'> = ['email', 'linkedin', 'github']

  function loop(now: number) {
    animFrameId = requestAnimationFrame(loop)
    if (!isVisible) return

    const delta = Math.min((now - lastTime) / 1000, 0.1)
    lastTime = now
    const time = now * 0.001

    // 1. Smooth Field Rotation Damping
    currentFieldRotY = THREE.MathUtils.lerp(currentFieldRotY, targetFieldRotY, delta * 4.5)
    currentFieldRotX = THREE.MathUtils.lerp(currentFieldRotX, targetFieldRotX, delta * 4.5)
    if (fieldMasterGroup) {
      fieldMasterGroup.rotation.y = currentFieldRotY
      fieldMasterGroup.rotation.x = currentFieldRotX
    }

    // 2. Smooth Camera Parallax Damping
    currentCamX = THREE.MathUtils.lerp(currentCamX, targetCamX, delta * 3.5)
    currentCamY = THREE.MathUtils.lerp(currentCamY, targetCamY, delta * 3.5)
    if (camera) {
      camera.position.x = currentCamX
      camera.position.y = 0.1 + currentCamY
      camera.lookAt(fieldCenterX * 0.4, fieldCenterY, 0)
    }

    // 3. Orb Micro Floating Movement
    if (orbGroup && !prefersReducedMotion.value) {
      orbGroup.position.y = Math.sin(time * 0.75) * 0.05
      orbGroup.rotation.y = time * 0.08
    }

    // 4. Signal Rings Slow Independent Rotation
    if (!prefersReducedMotion.value) {
      signalRings.forEach(sr => {
        sr.mesh.rotateOnAxis(sr.axis, sr.speed * delta)
      })
    }

    // 5. Automatic Staggered Signal Pulses (~every 4.5s)
    cycleTimer += delta
    if (cycleTimer >= 4.5 && !activeNodeType.value) {
      cycleTimer = 0
      triggerSignalPulse(cycleOrder[cycleIndex % cycleOrder.length])
      cycleIndex++
    }

    // 6. Update Nodes, Connection Lines, Pulses & Projected Screen Coordinates
    updateNodesAndSignals(delta, time)

    if (renderer && scene && camera) {
      renderer.render(scene, camera)
    }
  }

  animFrameId = requestAnimationFrame(loop)
}

function createSignalRings(orbRadius: number) {
  signalRings = []
  const ringConfigs = [
    {
      rx: orbRadius * 1.55,
      ry: orbRadius * 1.38,
      tiltX: 0.42,
      tiltZ: 0.22,
      color: 0x94a3b8,
      opacity: 0.35,
      speed: 0.04,
      axis: new THREE.Vector3(0, 1, 0.2).normalize(),
    },
    {
      rx: orbRadius * 1.95,
      ry: orbRadius * 1.68,
      tiltX: -0.58,
      tiltY: 0.32,
      color: 0x38bdf8,
      opacity: 0.26,
      speed: -0.03,
      axis: new THREE.Vector3(0.3, 1, 0).normalize(),
    },
    {
      rx: orbRadius * 2.38,
      ry: orbRadius * 2.05,
      tiltX: 0.28,
      tiltY: -0.65,
      color: 0x64748b,
      opacity: 0.2,
      speed: 0.02,
      axis: new THREE.Vector3(-0.2, 1, 0.3).normalize(),
    },
  ]

  ringConfigs.forEach(cfg => {
    // Generate elliptical curve points
    const points: THREE.Vector3[] = []
    const segments = 64
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2
      points.push(new THREE.Vector3(Math.cos(theta) * cfg.rx, 0, Math.sin(theta) * cfg.ry))
    }
    const ringGeo = new THREE.BufferGeometry().setFromPoints(points)
    const ringMat = new THREE.LineBasicMaterial({
      color: cfg.color,
      transparent: true,
      opacity: cfg.opacity,
    })
    const ringMesh = new THREE.LineLoop(ringGeo, ringMat)
    ringMesh.rotation.x = cfg.tiltX
    if (cfg.tiltY) ringMesh.rotation.y = cfg.tiltY
    if (cfg.tiltZ) ringMesh.rotation.z = cfg.tiltZ

    orbGroup!.add(ringMesh)
    signalRings.push({ mesh: ringMesh, speed: cfg.speed, axis: cfg.axis })
  })
}

function createCommunicationNodes(orbRadius: number) {
  nodeEntities.length = 0

  contactNodesData.value.forEach(meta => {
    const nodeGroup = new THREE.Group()

    // Base position scaled for mobile/desktop
    const scaleFactor = isMobile.value ? 0.8 : 1.0
    const basePos = new THREE.Vector3(
      meta.baseOffset[0] * scaleFactor,
      meta.baseOffset[1] * scaleFactor,
      meta.baseOffset[2] * scaleFactor
    )
    nodeGroup.position.copy(basePos)
    fieldMasterGroup!.add(nodeGroup)

    // Outer Sphere
    const sphereGeo = new THREE.SphereGeometry(0.14, 24, 24)
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.25,
      roughness: 0.2,
      metalness: 0.8,
    })
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat)
    sphereMesh.userData = { nodeType: meta.type }
    nodeGroup.add(sphereMesh)

    // Inner White Beacon Point
    const beaconGeo = new THREE.SphereGeometry(0.055, 16, 16)
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
    const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat)
    nodeGroup.add(beaconMesh)

    // Subtle Outer Halo Ring
    const haloGeo = new THREE.RingGeometry(0.18, 0.22, 28)
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    })
    const haloMesh = new THREE.Mesh(haloGeo, haloMat)
    nodeGroup.add(haloMesh)

    // Connection Line between Orb Center (0, 0, 0) and Node Position
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      basePos.clone(),
    ])
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x64748b,
      transparent: true,
      opacity: 0.3,
    })
    const lineMesh = new THREE.Line(lineGeo, lineMat)
    fieldMasterGroup!.add(lineMesh)

    // Signal Pulse Packet Mesh
    const pulseGeo = new THREE.SphereGeometry(0.045, 12, 12)
    const pulseMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.0,
    })
    const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat)
    pulseMesh.position.copy(new THREE.Vector3(0, 0, 0))
    fieldMasterGroup!.add(pulseMesh)

    nodeEntities.push({
      type: meta.type,
      group: nodeGroup,
      basePos: basePos.clone(),
      targetPos: basePos.clone(),
      sphereMesh,
      haloMesh,
      lineGeometry: lineGeo,
      lineMaterial: lineMat,
      pulseMesh,
      pulseProgress: 1.0,
      pulseActive: false,
    })
  })
}

function updateNodesAndSignals(delta: number, time: number) {
  if (!camera || !container.value) return

  const rect = container.value.getBoundingClientRect()

  nodeEntities.forEach((entity, idx) => {
    const isActive = activeNodeType.value === entity.type

    // 1. Target Position with Micro Floating & Forward Elevation on Hover
    const target = entity.basePos.clone()
    if (!prefersReducedMotion.value) {
      target.y += Math.sin(time * 0.9 + idx * 1.8) * 0.04
      target.x += Math.cos(time * 0.7 + idx * 1.5) * 0.02
    }
    if (isActive) {
      target.z += 0.3
    }
    entity.group.position.lerp(target, delta * 5.0)

    // 2. Halo Orientation (Always face camera)
    entity.haloMesh.quaternion.copy(camera!.quaternion)

    // 3. Highlight Scaling & Materials
    const targetScale = isActive ? 1.2 : 1.0
    entity.group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 5.0)

    const sphereMat = entity.sphereMesh.material as THREE.MeshStandardMaterial
    sphereMat.emissiveIntensity = THREE.MathUtils.lerp(
      sphereMat.emissiveIntensity,
      isActive ? 0.9 : 0.25,
      delta * 5.0
    )

    // Line Highlight
    const targetLineOpacity = isActive ? 0.95 : 0.25
    entity.lineMaterial.opacity = THREE.MathUtils.lerp(
      entity.lineMaterial.opacity,
      targetLineOpacity,
      delta * 5.0
    )
    entity.lineMaterial.color.setHex(isActive ? 0x38bdf8 : 0x64748b)

    // Update line endpoint
    const posAttr = entity.lineGeometry.getAttribute('position') as THREE.BufferAttribute
    const array = posAttr.array as Float32Array
    // Index 0, 1, 2 = Orb center (0, 0, 0)
    // Index 3, 4, 5 = Node position
    array[3] = entity.group.position.x
    array[4] = entity.group.position.y
    array[5] = entity.group.position.z
    posAttr.needsUpdate = true

    // 4. Animate Signal Pulse along Connection Line
    if (entity.pulseActive) {
      entity.pulseProgress += delta * 0.85 // ~1.2s travel time
      if (entity.pulseProgress >= 1.0) {
        entity.pulseProgress = 1.0
        entity.pulseActive = false
      }

      // Position along line from (0,0,0) to node
      entity.pulseMesh.position.lerpVectors(
        new THREE.Vector3(0, 0, 0),
        entity.group.position,
        entity.pulseProgress
      )

      const pulseMat = entity.pulseMesh.material as THREE.MeshBasicMaterial
      pulseMat.opacity = Math.sin(entity.pulseProgress * Math.PI) * 0.95
    } else {
      const pulseMat = entity.pulseMesh.material as THREE.MeshBasicMaterial
      pulseMat.opacity = THREE.MathUtils.lerp(pulseMat.opacity, 0.0, delta * 5.0)
    }

    // 5. Project 3D Node Position to 2D Screen Coordinates for HTML Badges
    const worldPos = new THREE.Vector3()
    entity.group.getWorldPosition(worldPos)
    // Offset label slightly next to node
    worldPos.x += 0.38
    worldPos.y += 0.12

    const screenPos = worldPos.clone().project(camera!)
    const isBehind = screenPos.z > 1.0

    nodeScreenPositions[entity.type] = {
      x: ((screenPos.x + 1) * rect.width) / 2,
      y: ((-screenPos.y + 1) * rect.height) / 2,
      visible: !isBehind,
    }
  })
}

// Pointer & Interaction Handlers
let pointerStartX = 0
let pointerStartY = 0

function onPointerDown(e: PointerEvent) {
  isDragging = true
  prevPointerX = e.clientX
  prevPointerY = e.clientY
  pointerStartX = e.clientX
  pointerStartY = e.clientY
}

function onPointerMove(e: PointerEvent) {
  if (!container.value || !camera) return

  const rect = container.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  mouse.x = (x / rect.width) * 2 - 1
  mouse.y = -(y / rect.height) * 2 + 1

  targetCamX = mouse.x * 0.22
  targetCamY = mouse.y * 0.16

  if (isDragging) {
    const dx = e.clientX - prevPointerX
    const dy = e.clientY - prevPointerY
    prevPointerX = e.clientX
    prevPointerY = e.clientY

    targetFieldRotY = THREE.MathUtils.clamp(targetFieldRotY + dx * 0.0035, -0.35, 0.35)
    targetFieldRotX = THREE.MathUtils.clamp(targetFieldRotX + dy * 0.0025, -0.2, 0.2)
  } else {
    // Raycasting against node spheres
    raycaster.setFromCamera(mouse, camera)
    const meshes = nodeEntities.map(n => n.sphereMesh)
    const intersects = raycaster.intersectObjects(meshes)

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object
      const nodeType = hitMesh.userData.nodeType
      if (nodeType) {
        setActiveNode(nodeType)
        if (canvas.value) canvas.value.style.cursor = 'pointer'
        return
      }
    }

    if (canvas.value) canvas.value.style.cursor = isDragging ? 'grabbing' : 'grab'
  }
}

function onPointerUp(e: PointerEvent) {
  if (isDragging) {
    const dist = Math.hypot(e.clientX - pointerStartX, e.clientY - pointerStartY)
    if (dist < 6 && camera) {
      raycaster.setFromCamera(mouse, camera)
      const meshes = nodeEntities.map(n => n.sphereMesh)
      const intersects = raycaster.intersectObjects(meshes)
      if (intersects.length > 0) {
        const nodeType = intersects[0].object.userData.nodeType
        const meta = contactNodesData.value.find(n => n.type === nodeType)
        if (meta) {
          openNodeLink(meta)
        }
      }
    }
  }
  isDragging = false
  if (canvas.value) canvas.value.style.cursor = 'grab'
}

function onResize() {
  if (!container.value || !camera || !renderer || !fieldMasterGroup) return

  const width = container.value.clientWidth || window.innerWidth
  const height = container.value.clientHeight || window.innerHeight

  isMobile.value = width < 768

  camera.aspect = width / height
  camera.position.z = width < 390 ? 8.4 : (isMobile.value ? 7.6 : 6.2)
  camera.updateProjectionMatrix()

  renderer.setSize(width, height)

  const fieldCenterX = isMobile.value ? 0.0 : 1.25
  const fieldCenterY = isMobile.value ? -0.35 : 0.05
  fieldMasterGroup.position.set(fieldCenterX, fieldCenterY, 0)
}

onMounted(() => {
  initThree()

  window.addEventListener('resize', onResize)

  if (container.value) {
    observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting
    })
    observer.observe(container.value)
  }
})

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
  if (animFrameId) cancelAnimationFrame(animFrameId)

  window.removeEventListener('resize', onResize)

  // Dispose Geometries and Materials
  if (outerGlassMesh) {
    outerGlassMesh.geometry.dispose()
    ;(outerGlassMesh.material as THREE.Material).dispose()
  }
  if (innerCoreMesh) {
    innerCoreMesh.geometry.dispose()
    ;(innerCoreMesh.material as THREE.Material).dispose()
  }

  signalRings.forEach(sr => {
    sr.mesh.geometry.dispose()
    ;(sr.mesh.material as THREE.Material).dispose()
  })

  nodeEntities.forEach(n => {
    n.sphereMesh.geometry.dispose()
    ;(n.sphereMesh.material as THREE.Material).dispose()
    n.haloMesh.geometry.dispose()
    ;(n.haloMesh.material as THREE.Material).dispose()
    n.lineGeometry.dispose()
    n.lineMaterial.dispose()
    n.pulseMesh.geometry.dispose()
    ;(n.pulseMesh.material as THREE.Material).dispose()
  })

  if (renderer) {
    renderer.dispose()
    renderer.forceContextLoss()
    renderer = null
  }
})
</script>

<style scoped>
.contact-communication-scene {
  background: radial-gradient(circle at 65% 45%, #080b12 0%, #03060b 80%);
}

.gallery-ambient-vignette {
  background: radial-gradient(circle at 50% 50%, transparent 45%, rgba(3, 6, 11, 0.75) 100%);
}
</style>
