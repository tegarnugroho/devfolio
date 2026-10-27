<template>
  <div
    ref="container"
    class="contact-communication-scene relative w-full h-full select-none overflow-hidden bg-[#03060b]"
  >
    <!-- WebGL Canvas for 3D Earth Deep Space Communication Field -->
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

    <!-- Editorial Contact Information Panel (Left Side on Desktop ~35% width) -->
    <div
      class="pointer-events-auto absolute top-[max(4.25rem,calc(env(safe-area-inset-top)+3.5rem))] sm:top-20 left-4 sm:left-12 right-4 sm:right-auto z-20 max-w-xs sm:max-w-sm space-y-3 sm:space-y-4 select-none"
    >
      <!-- Section Header -->
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <span class="font-mono text-[10px] text-zinc-500 tracking-widest font-semibold">06</span>
          <span class="w-3.5 h-[1px] bg-zinc-700"></span>
          <span class="font-mono text-[10px] text-zinc-400 uppercase tracking-widest font-medium">UPLINK // CONTACT</span>
        </div>

        <h1 class="text-2xl sm:text-3xl font-light tracking-tight text-white font-sans leading-tight pt-1">
          Let's <span class="font-semibold text-white">Connect<span class="text-sky-400">.</span></span>
        </h1>

        <p class="text-[11.5px] text-zinc-400 leading-relaxed font-sans max-w-[310px] font-normal pt-0.5">
          {{ contact.description }}
        </p>
      </div>

      <!-- Communication Channels (Direct Interactive Links) -->
      <div class="space-y-2 pt-1">
        <a
          v-for="item in contactNodesData"
          :key="item.type"
          :href="item.href"
          target="_blank"
          rel="noopener noreferrer"
          class="group flex items-center justify-between p-2.5 sm:p-3 rounded-lg border transition-all duration-200 cursor-pointer"
          :class="
            activeNodeType === item.type
              ? 'bg-sky-500/10 border-sky-400/40 text-white shadow-[0_0_15px_rgba(56,189,248,0.15)] translate-x-1'
              : 'bg-black/60 hover:bg-white/5 border-white/10 text-zinc-300 hover:text-white'
          "
          @mouseenter="setActiveNode(item.type)"
          @mouseleave="setActiveNode(null)"
        >
          <div class="flex items-center gap-2.5">
            <!-- Signal Beacon Indicator -->
            <span
              class="w-1.5 h-1.5 rounded-full transition-colors duration-200"
              :class="activeNodeType === item.type ? 'bg-sky-400 shadow-[0_0_8px_#38bdf8] animate-pulse' : 'bg-zinc-500'"
            ></span>
            <div class="flex flex-col">
              <span class="font-mono text-[8.5px] uppercase tracking-wider text-zinc-500 group-hover:text-zinc-300">
                {{ item.metaLabel }}
              </span>
              <span class="font-mono text-[10.5px] font-semibold text-white tracking-wide">
                {{ item.label }}
              </span>
            </div>
          </div>

          <span class="font-mono text-[11px] font-medium flex items-center gap-1.5 text-zinc-300 group-hover:text-white">
            <span class="truncate max-w-[150px] sm:max-w-[175px]">{{ item.value }}</span>
            <span class="text-zinc-500 group-hover:text-sky-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-[10px]">
              ↗
            </span>
          </span>
        </a>
      </div>

      <!-- Primary Action Button: Transmit Message -->
      <div class="pt-1.5">
        <a
          :href="`mailto:${emailContact?.value || 'tegar@wolkk.com'}?subject=Hello%20Tegar%20-%20Project%20Inquiry`"
          class="group w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-sky-400/40 bg-sky-500/15 hover:bg-sky-500/25 active:scale-98 text-white font-mono text-[11px] uppercase tracking-widest font-semibold transition-all shadow-lg backdrop-blur-md cursor-pointer"
          @mouseenter="setActiveNode('email')"
          @mouseleave="setActiveNode(null)"
        >
          <span>TRANSMIT MESSAGE</span>
          <span class="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
        </a>
      </div>

      <!-- Status Beacon / Telemetry Hint -->
      <div class="pt-1 flex items-center gap-2 font-mono text-[9px] text-zinc-400 tracking-wider">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)] animate-pulse"></span>
        <span>CHANNEL ACTIVE · DIRECT ORBITAL TRANSMISSION READY</span>
      </div>
    </div>

    <!-- Floating 3D Satellite Node Projected Badges -->
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
        class="flex items-center gap-1.5 px-2.5 py-1 rounded-md border backdrop-blur-xl transition-all duration-200 shadow-xl"
        :class="
          activeNodeType === node.type
            ? 'bg-black/95 border-sky-400/60 text-white scale-105 shadow-[0_0_16px_rgba(56,189,248,0.3)]'
            : 'bg-black/80 border-white/15 text-zinc-300 hover:border-white/30 hover:text-white'
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
import { markSectionReady } from '@/composables/useShowcase'

const contact = portfolioContent.contact
const emailContact = computed(() => contact.items.find(i => i.type === 'email'))

export interface ContactNodeMeta {
  type: 'email' | 'linkedin' | 'github'
  label: string
  metaLabel: string
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
      metaLabel: 'DIRECT CHANNEL',
      value: getValue('email', 'tegar@wolkk.com'),
      href: getHref('email', 'mailto:tegar@wolkk.com'),
      baseOffset: [0.65, 1.85, 0.35], // Upper-right orbit
    },
    {
      type: 'linkedin',
      label: 'LINKEDIN',
      metaLabel: 'PROFESSIONAL NETWORK',
      value: getValue('linkedin', 'linkedin.com/in/tegaranugroho'),
      href: getHref('linkedin', 'https://linkedin.com/in/tegaranugroho'),
      baseOffset: [-2.05, -0.95, 0.40], // Lower-left orbit
    },
    {
      type: 'github',
      label: 'GITHUB',
      metaLabel: 'SOURCE ARCHIVE',
      value: getValue('github', 'github.com/tegarnugroho'),
      href: getHref('github', 'https://github.com/tegarnugroho'),
      baseOffset: [2.15, -0.75, 0.35], // Lower-right orbit
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
// THREE.JS REALISTIC EARTH & SATELLITE COMMUNICATION ENGINE
// -------------------------------------------------------------
const container = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let animFrameId = 0
let isVisible = true
let observer: IntersectionObserver | null = null

// Hierarchical Groups
let fieldMasterGroup: THREE.Group | null = null
let earthMasterGroup: THREE.Group | null = null

// Realistic Earth Meshes
let realEarthMesh: THREE.Mesh | null = null
let cloudsMesh: THREE.Mesh | null = null
let atmosphereMesh: THREE.Mesh | null = null
let datumRings: THREE.Mesh[] = []

interface ThreeNodeEntity {
  type: 'email' | 'linkedin' | 'github'
  group: THREE.Group
  basePos: THREE.Vector3
  anchorPos: THREE.Vector3
  sphereMesh: THREE.Mesh
  haloMesh: THREE.Mesh
  anchorRingMesh: THREE.Mesh
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
  camera.position.set(0, 0.1, width < 390 ? 8.2 : (isMobile.value ? 7.4 : 6.2))

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

  // Realistic Studio Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.45)
  scene.add(ambientLight)

  const sunLight = new THREE.DirectionalLight(0xe0f2fe, 2.2)
  sunLight.position.set(6, 4, 6)
  scene.add(sunLight)

  const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.0)
  rimLight.position.set(-6, -3, -4)
  scene.add(rimLight)

  // Master Field Group
  fieldMasterGroup = new THREE.Group()
  const fieldCenterX = isMobile.value ? 0.0 : 1.35
  const fieldCenterY = isMobile.value ? -0.35 : 0.0
  fieldMasterGroup.position.set(fieldCenterX, fieldCenterY, 0)
  scene.add(fieldMasterGroup)

  // 1. Build Deep Space Starfield Background
  buildStarfield()

  // 2. Build Realistic 3D Earth Globe
  const earthRadius = isMobile.value ? 0.95 : 1.25
  buildRealisticEarth(earthRadius)

  // 3. Build Communication Satellite Nodes around Earth
  buildCommunicationNodes(earthRadius)

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
    currentFieldRotX = THREE.MathUtils.clamp(
      THREE.MathUtils.lerp(currentFieldRotX, targetFieldRotX, delta * 4.5),
      -0.45,
      0.45
    )
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
      camera.lookAt(fieldCenterX * 0.35, fieldCenterY, 0)
    }

    // 3. Earth Rotation & Clouds Atmospheric Drift
    if (realEarthMesh && !prefersReducedMotion.value) {
      realEarthMesh.rotation.y = time * 0.04
    }
    if (cloudsMesh && !prefersReducedMotion.value) {
      cloudsMesh.rotation.y = time * 0.055
    }

    // 4. Automatic Staggered Signal Pulses (~every 4s)
    cycleTimer += delta
    if (cycleTimer >= 4.0 && !activeNodeType.value) {
      cycleTimer = 0
      triggerSignalPulse(cycleOrder[cycleIndex % cycleOrder.length])
      cycleIndex++
    }

    // 5. Update Nodes, Connection Lines, Pulses & Projected Screen Coordinates
    updateNodesAndSignals(delta, time)

    if (renderer && scene && camera) {
      renderer.render(scene, camera)
    }
  }

  animFrameId = requestAnimationFrame(loop)
}

function buildStarfield() {
  const count = 900
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {
    const r = 10 + Math.random() * 20
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1) - Math.PI / 2

    positions[i * 3] = r * Math.cos(phi) * Math.cos(theta)
    positions[i * 3 + 1] = r * Math.sin(phi)
    positions[i * 3 + 2] = r * Math.cos(phi) * Math.sin(theta)

    const cChoice = Math.random()
    if (cChoice > 0.8) {
      colors[i * 3] = 0.35; colors[i * 3 + 1] = 0.75; colors[i * 3 + 2] = 0.98
    } else {
      colors[i * 3] = 0.85; colors[i * 3 + 1] = 0.88; colors[i * 3 + 2] = 0.95
    }
  }

  const starGeo = new THREE.BufferGeometry()
  starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const starMat = new THREE.PointsMaterial({
    size: 0.04,
    vertexColors: true,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending,
  })

  scene!.add(new THREE.Points(starGeo, starMat))
}

function buildRealisticEarth(radius: number) {
  earthMasterGroup = new THREE.Group()
  fieldMasterGroup!.add(earthMasterGroup)

  const textureLoader = new THREE.TextureLoader()
  const dayTex = textureLoader.load('/textures/earth/earth_day.jpg')
  const cloudsTex = textureLoader.load('/textures/earth/earth_clouds.png')
  const specularTex = textureLoader.load('/textures/earth/earth_specular.jpg')

  // 1. Realistic Photorealistic Earth Surface
  const earthGeo = new THREE.SphereGeometry(radius, 64, 64)
  const earthMat = new THREE.MeshStandardMaterial({
    map: dayTex,
    roughnessMap: specularTex,
    roughness: 0.65,
    metalness: 0.1,
  })
  realEarthMesh = new THREE.Mesh(earthGeo, earthMat)
  earthMasterGroup.add(realEarthMesh)

  // 2. Realistic Clouds Layer
  const cloudsGeo = new THREE.SphereGeometry(radius * 1.01, 64, 64)
  const cloudsMat = new THREE.MeshStandardMaterial({
    map: cloudsTex,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat)
  earthMasterGroup.add(cloudsMesh)

  // 3. Atmospheric Fresnel Halo
  const atmosphereGeo = new THREE.SphereGeometry(radius * 1.034, 64, 64)
  const atmosphereMat = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vec3 viewDir = normalize(-vPosition);
        float intensity = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 2.2);
        gl_FragColor = vec4(0.22, 0.74, 0.97, intensity * 0.75);
      }
    `,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
  })
  atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat)
  earthMasterGroup.add(atmosphereMesh)

  // 4. Subtle Titanium Datum Orbit Ring
  datumRings = []
  const ring1Geo = new THREE.TorusGeometry(radius * 1.35, 0.005, 16, 96)
  const ring1Mat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.22,
  })
  const ring1 = new THREE.Mesh(ring1Geo, ring1Mat)
  ring1.rotation.x = Math.PI / 2.2
  earthMasterGroup.add(ring1)
  datumRings.push(ring1)

  const ring2Geo = new THREE.TorusGeometry(radius * 1.62, 0.004, 16, 96)
  const ring2Mat = new THREE.MeshBasicMaterial({
    color: 0x64748b,
    transparent: true,
    opacity: 0.16,
  })
  const ring2 = new THREE.Mesh(ring2Geo, ring2Mat)
  ring2.rotation.x = -Math.PI / 3.5
  ring2.rotation.y = 0.35
  earthMasterGroup.add(ring2)
  datumRings.push(ring2)
}

function buildCommunicationNodes(earthRadius: number) {
  nodeEntities.length = 0

  contactNodesData.value.forEach(meta => {
    const nodeGroup = new THREE.Group()

    const scaleFactor = isMobile.value ? 0.85 : 1.0
    const basePos = new THREE.Vector3(
      meta.baseOffset[0] * scaleFactor,
      meta.baseOffset[1] * scaleFactor,
      meta.baseOffset[2] * scaleFactor
    )
    nodeGroup.position.copy(basePos)
    fieldMasterGroup!.add(nodeGroup)

    // Satellite Probe Main Bus (Aerospace metallic cube)
    const busGeo = new THREE.BoxGeometry(0.10, 0.10, 0.10)
    const busMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.25,
    })
    const busMesh = new THREE.Mesh(busGeo, busMat)
    busMesh.userData = { nodeType: meta.type }
    nodeGroup.add(busMesh)

    // Solar Wing Arrays
    const wingGeo = new THREE.PlaneGeometry(0.24, 0.07)
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.5,
      roughness: 0.2,
      side: THREE.DoubleSide,
    })
    const wingMesh = new THREE.Mesh(wingGeo, wingMat)
    wingMesh.rotation.y = Math.PI / 2
    busMesh.add(wingMesh)

    // Central Luminous Transceiver Beacon
    const beaconGeo = new THREE.SphereGeometry(0.045, 16, 16)
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
    const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat)
    nodeGroup.add(beaconMesh)

    // Orbital Beacon Halo Ring
    const haloGeo = new THREE.RingGeometry(0.14, 0.17, 28)
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    })
    const haloMesh = new THREE.Mesh(haloGeo, haloMat)
    nodeGroup.add(haloMesh)

    // Generous Invisible Hit Sphere for reliable clicking/touch
    const hitGeo = new THREE.SphereGeometry(0.26, 8, 8)
    const hitMat = new THREE.MeshBasicMaterial({ visible: false })
    const hitMesh = new THREE.Mesh(hitGeo, hitMat)
    hitMesh.userData = { nodeType: meta.type }
    nodeGroup.add(hitMesh)

    // Surface Anchor Ring on Earth's surface
    const dir = basePos.clone().normalize()
    const anchorPos = dir.clone().multiplyScalar(earthRadius * 1.006)
    const anchorRingGeo = new THREE.RingGeometry(0.02, 0.04, 24)
    const anchorRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    })
    const anchorRingMesh = new THREE.Mesh(anchorRingGeo, anchorRingMat)
    anchorRingMesh.position.copy(anchorPos)
    anchorRingMesh.lookAt(anchorPos.clone().add(dir))
    fieldMasterGroup!.add(anchorRingMesh)

    // Telemetric Connection Conduit from Earth surface anchor to Satellite node
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      anchorPos.clone(),
      basePos.clone(),
    ])
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.22,
    })
    const lineMesh = new THREE.Line(lineGeo, lineMat)
    fieldMasterGroup!.add(lineMesh)

    // Signal Pulse Packet Mesh
    const pulseGeo = new THREE.SphereGeometry(0.038, 12, 12)
    const pulseMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.0,
    })
    const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat)
    pulseMesh.position.copy(anchorPos)
    fieldMasterGroup!.add(pulseMesh)

    nodeEntities.push({
      type: meta.type,
      group: nodeGroup,
      basePos: basePos.clone(),
      anchorPos: anchorPos.clone(),
      sphereMesh: busMesh,
      haloMesh,
      anchorRingMesh,
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
      target.y += Math.sin(time * 0.9 + idx * 1.8) * 0.03
      target.x += Math.cos(time * 0.7 + idx * 1.5) * 0.015
    }
    if (isActive) {
      target.z += 0.25
    }
    entity.group.position.lerp(target, delta * 5.0)

    // 2. Halo Orientation (Face Camera)
    entity.haloMesh.quaternion.copy(camera!.quaternion)

    // 3. Highlight Scaling & Materials
    const targetScale = isActive ? 1.25 : 1.0
    entity.group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 5.0)

    // Line Highlight & Telemetry Color
    const targetLineOpacity = isActive ? 0.85 : 0.22
    entity.lineMaterial.opacity = THREE.MathUtils.lerp(
      entity.lineMaterial.opacity,
      targetLineOpacity,
      delta * 5.0
    )
    entity.lineMaterial.color.setHex(isActive ? 0x38bdf8 : 0x0284c7)

    // Surface Anchor Ring Highlight
    const anchorMat = entity.anchorRingMesh.material as THREE.MeshBasicMaterial
    anchorMat.opacity = isActive ? 0.85 : 0.35
    const anchorScale = isActive ? 1.3 : 1.0
    entity.anchorRingMesh.scale.set(anchorScale, anchorScale, anchorScale)

    // Update connection line endpoints
    const posAttr = entity.lineGeometry.getAttribute('position') as THREE.BufferAttribute
    const array = posAttr.array as Float32Array
    // Index 0, 1, 2 = Earth Anchor Pos
    array[0] = entity.anchorPos.x
    array[1] = entity.anchorPos.y
    array[2] = entity.anchorPos.z
    // Index 3, 4, 5 = Satellite Node Pos
    array[3] = entity.group.position.x
    array[4] = entity.group.position.y
    array[5] = entity.group.position.z
    posAttr.needsUpdate = true

    // 4. Animate Signal Pulse along Conduit (from Earth anchor to satellite)
    if (entity.pulseActive) {
      entity.pulseProgress += delta * 1.0 // ~1.0s travel time
      if (entity.pulseProgress >= 1.0) {
        entity.pulseProgress = 1.0
        entity.pulseActive = false
      }

      // Position along line from anchorPos to satellite
      entity.pulseMesh.position.lerpVectors(
        entity.anchorPos,
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
    worldPos.x += 0.35
    worldPos.y += 0.10

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

    targetFieldRotY = THREE.MathUtils.clamp(targetFieldRotY + dx * 0.0035, -0.45, 0.45)
    targetFieldRotX = THREE.MathUtils.clamp(targetFieldRotX + dy * 0.0025, -0.25, 0.25)
  } else {
    // Raycasting against node satellite meshes
    raycaster.setFromCamera(mouse, camera)
    const meshes = nodeEntities.map(n => n.sphereMesh)
    const intersects = raycaster.intersectObjects(meshes, true)

    if (intersects.length > 0) {
      let topObj: THREE.Object3D | null = intersects[0].object
      while (topObj && !topObj.userData?.nodeType && topObj.parent) {
        topObj = topObj.parent
      }

      if (topObj && topObj.userData?.nodeType) {
        setActiveNode(topObj.userData.nodeType)
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
      const intersects = raycaster.intersectObjects(meshes, true)
      if (intersects.length > 0) {
        let topObj: THREE.Object3D | null = intersects[0].object
        while (topObj && !topObj.userData?.nodeType && topObj.parent) {
          topObj = topObj.parent
        }
        if (topObj && topObj.userData?.nodeType) {
          const meta = contactNodesData.value.find(n => n.type === topObj!.userData.nodeType)
          if (meta) {
            openNodeLink(meta)
          }
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
  camera.position.z = width < 390 ? 8.2 : (isMobile.value ? 7.4 : 6.2)
  camera.updateProjectionMatrix()

  renderer.setSize(width, height)

  const fieldCenterX = isMobile.value ? 0.0 : 1.35
  const fieldCenterY = isMobile.value ? -0.35 : 0.0
  fieldMasterGroup.position.set(fieldCenterX, fieldCenterY, 0)
}

onMounted(() => {
  initThree()
  markSectionReady('contact')

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

  // Dispose Realistic Earth Meshes
  if (realEarthMesh) {
    realEarthMesh.geometry.dispose()
    ;(realEarthMesh.material as THREE.Material).dispose()
  }
  if (cloudsMesh) {
    cloudsMesh.geometry.dispose()
    ;(cloudsMesh.material as THREE.Material).dispose()
  }
  if (atmosphereMesh) {
    atmosphereMesh.geometry.dispose()
    ;(atmosphereMesh.material as THREE.Material).dispose()
  }
  datumRings.forEach(r => {
    r.geometry.dispose()
    ;(r.material as THREE.Material).dispose()
  })

  nodeEntities.forEach(n => {
    n.sphereMesh.geometry?.dispose()
    if (Array.isArray(n.sphereMesh.material)) {
      n.sphereMesh.material.forEach(m => m.dispose())
    } else {
      n.sphereMesh.material?.dispose()
    }
    n.haloMesh.geometry.dispose()
    ;(n.haloMesh.material as THREE.Material).dispose()
    n.anchorRingMesh.geometry.dispose()
    ;(n.anchorRingMesh.material as THREE.Material).dispose()
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
