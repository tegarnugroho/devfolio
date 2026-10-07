<template>
  <div
    ref="container"
    class="hero-digital-core-scene relative w-full h-full select-none overflow-hidden bg-[#03060b] flex flex-col justify-between md:block px-4 sm:px-5 pt-[max(4.25rem,calc(env(safe-area-inset-top)+3.5rem))] pb-[max(4.5rem,calc(env(safe-area-inset-bottom)+3.5rem))] md:p-0"
  >
    <!-- Deep Ambient Vignette (Seamless background blend) -->
    <div class="pointer-events-none absolute inset-0 gallery-ambient-vignette" aria-hidden="true"></div>

    <!-- 1. 3D Canvas Stage (Controlled 40-50dvh on Mobile, Fullscreen on Desktop) -->
    <div
      class="canvas-viewport relative md:absolute w-full h-[44dvh] sm:h-[48dvh] max-h-[460px] min-h-[260px] my-auto md:my-0 md:inset-0 md:h-full md:max-h-none z-10 md:z-0 rounded-2xl md:rounded-none overflow-hidden select-none flex items-center justify-center border border-white/5 md:border-0"
    >
      <canvas
        ref="canvas"
        class="w-full h-full block cursor-grab active:cursor-grabbing outline-none touch-none"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
      ></canvas>

      <!-- WebGL Fallback -->
      <div
        v-if="!isWebGLSupported"
        class="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-zinc-950/90 text-zinc-300"
      >
        <div class="w-16 h-16 rounded-full border border-sky-400/40 flex items-center justify-center text-sky-400 mb-2">
          ◉
        </div>
        <p class="font-mono text-xs font-semibold">DIGITAL ARCHITECTURE CORE</p>
        <p class="text-[11px] text-zinc-400 mt-1">Cross-platform Flutter & Systems Architecture</p>
      </div>

      <!-- Subtle Mobile Touch Hint (Auto-fades on first user touch) -->
      <Transition name="fade">
        <div
          v-if="!hasInteracted && isMobile"
          class="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full bg-zinc-950/85 border border-white/10 text-zinc-300 font-mono text-[9px] tracking-widest uppercase backdrop-blur-md whitespace-nowrap shadow-lg flex items-center gap-1.5"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
          <span>↔ DRAG TO EXPLORE</span>
        </div>
      </Transition>

      <!-- Reset View Control (Minimal ↻ button) -->
      <button
        type="button"
        class="pointer-events-auto absolute top-3 right-3 z-20 w-7 h-7 rounded-full bg-black/60 hover:bg-white/15 border border-white/15 text-zinc-300 hover:text-white flex items-center justify-center font-mono text-xs backdrop-blur-md transition active:scale-95 cursor-pointer shadow-md"
        @click="resetView"
        title="Reset View"
        aria-label="Reset 3D camera and rotation"
      >
        ↻
      </button>
    </div>

    <!-- 2. Mobile Editorial Layout Overlays (md:hidden) -->
    <div class="md:hidden absolute inset-0 z-20 pointer-events-none flex flex-col justify-between px-4 sm:px-5 pt-[max(4.25rem,calc(env(safe-area-inset-top)+3.5rem))] pb-[max(4.5rem,calc(env(safe-area-inset-bottom)+3.5rem))] overflow-y-auto no-scrollbar">
      <!-- Top Mobile Section Info -->
      <div class="space-y-2 pointer-events-auto shrink-0 select-none">
        <div class="flex items-center gap-2">
          <span class="font-mono text-[9.5px] text-zinc-400 tracking-widest font-semibold">01</span>
          <span class="w-3 h-[1px] bg-zinc-600"></span>
          <span class="font-mono text-[9.5px] text-sky-400 uppercase tracking-widest font-medium">DIGITAL CORE</span>
          <span class="text-zinc-600 font-mono text-[9.5px]">·</span>
          <span class="font-mono text-[9.5px] text-zinc-400 tracking-wider">FLUTTER DEV</span>
        </div>

        <div class="space-y-0.5">
          <p class="font-mono text-[9px] uppercase tracking-[0.25em] text-zinc-400 font-semibold">
            {{ hero.eyebrow }}
          </p>
          <h1 class="text-3xl font-extrabold tracking-tight text-white leading-tight">
            {{ portfolioContent.site.name }}<span class="text-sky-400">{{ portfolioContent.site.brandPeriod }}</span>
          </h1>
        </div>

        <p class="text-[11.5px] text-zinc-300 leading-relaxed font-sans max-w-sm line-clamp-3 font-normal">
          {{ hero.description }}
        </p>
      </div>

      <!-- Spacer matching middle 3D canvas viewport -->
      <div class="pointer-events-none h-[44dvh] sm:h-[48dvh] max-h-[460px] min-h-[260px] my-auto"></div>

      <!-- Bottom Mobile Controls & CTA -->
      <div class="space-y-3 pointer-events-auto shrink-0 select-none pb-1">
        <!-- Architecture Layer View Switcher -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="font-mono text-[9px] uppercase tracking-wider text-zinc-500 font-medium">VIEW:</span>
            <button
              type="button"
              class="px-2.5 py-1 rounded text-[9px] font-mono tracking-wider transition-colors cursor-pointer border"
              :class="
                inspectionMode === 'assembled'
                  ? 'bg-white/15 text-white border-white/40 font-semibold'
                  : 'bg-black/40 text-zinc-400 hover:text-white border-white/10'
              "
              @click="setInspectionMode('assembled')"
            >
              ASSEMBLED
            </button>
            <button
              type="button"
              class="px-2.5 py-1 rounded text-[9px] font-mono tracking-wider transition-colors cursor-pointer border"
              :class="
                inspectionMode === 'expanded'
                  ? 'bg-sky-500/20 text-sky-300 border-sky-400/50 font-semibold shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                  : 'bg-black/40 text-zinc-400 hover:text-white border-white/10'
              "
              @click="setInspectionMode('expanded')"
            >
              EXPLODED
            </button>
          </div>

          <div class="flex items-center gap-1.5 font-mono text-[9px] text-zinc-400">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>CORE ONLINE</span>
          </div>
        </div>

        <!-- Primary Call to Actions -->
        <div class="flex items-center gap-2.5">
          <button
            type="button"
            class="flex-1 py-2.5 px-4 rounded-xl bg-white text-zinc-950 font-mono text-[11px] uppercase tracking-wider font-bold transition hover:bg-zinc-200 active:scale-98 shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
            @click="navigateToProjects"
          >
            <span>VIEW PROJECTS</span>
            <span>→</span>
          </button>

          <button
            type="button"
            class="py-2.5 px-4 rounded-xl border border-white/20 bg-black/40 hover:bg-white/10 text-white font-mono text-[11px] uppercase tracking-wider font-medium transition active:scale-98 cursor-pointer backdrop-blur-md"
            @click="navigateToContact"
          >
            CONTACT
          </button>
        </div>
      </div>
    </div>

    <!-- 3. Desktop Left Content Column (hidden md:flex) -->
    <div
      class="hidden md:flex pointer-events-none absolute top-24 sm:top-28 md:top-32 left-6 sm:left-12 bottom-10 sm:bottom-12 z-20 max-w-sm sm:max-w-md w-full flex-col justify-between select-none"
    >
      <!-- Top Section Info & Identity -->
      <div class="space-y-4">
        <!-- Section Marker -->
        <div class="flex items-center gap-2">
          <span class="font-mono text-[10px] text-zinc-400 tracking-widest font-semibold">01</span>
          <span class="w-3.5 h-[1px] bg-zinc-600"></span>
          <span class="font-mono text-[10px] text-zinc-300 uppercase tracking-widest font-medium">DIGITAL CORE</span>
          <span class="text-zinc-600 font-mono text-[10px]">·</span>
          <span class="font-mono text-[10px] text-sky-400 tracking-wider">FLAGSHIP</span>
        </div>

        <!-- Eyebrow & Hero Title -->
        <div class="space-y-1">
          <p class="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-400 font-medium">
            {{ hero.eyebrow }}
          </p>
          <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-none">
            {{ portfolioContent.site.name }}<span class="text-sky-400">{{ portfolioContent.site.brandPeriod }}</span>
          </h1>
        </div>

        <!-- Description -->
        <p class="text-[12px] sm:text-[13px] text-zinc-300 leading-relaxed font-sans max-w-[340px] font-normal">
          {{ hero.description }}
        </p>

        <!-- Primary Call to Actions -->
        <div class="pt-2 pointer-events-auto flex items-center gap-3">
          <button
            type="button"
            class="group inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-zinc-950 font-mono text-[11px] uppercase tracking-wider font-bold transition hover:bg-zinc-200 active:scale-98 shadow-lg cursor-pointer"
            @click="navigateToProjects"
          >
            <span>VIEW PROJECTS</span>
            <span class="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
          </button>

          <button
            type="button"
            class="inline-flex items-center px-4 py-2 rounded-xl border border-white/20 bg-black/40 hover:bg-white/10 text-white font-mono text-[11px] uppercase tracking-wider font-medium transition active:scale-98 cursor-pointer backdrop-blur-md"
            @click="navigateToContact"
          >
            CONTACT
          </button>
        </div>

        <!-- Interactive Architecture Layer Switcher -->
        <div class="pt-3 pointer-events-auto flex items-center gap-2">
          <span class="font-mono text-[9px] uppercase tracking-widest text-zinc-400 font-medium">
            VIEW:
          </span>
          <button
            type="button"
            class="px-2.5 py-1 rounded text-[9.5px] font-mono tracking-wider transition-colors cursor-pointer border"
            :class="
              inspectionMode === 'assembled'
                ? 'bg-white/15 text-white border-white/40 font-semibold'
                : 'bg-black/40 text-zinc-400 hover:text-white border-white/10 hover:border-white/20'
            "
            @click="setInspectionMode('assembled')"
          >
            ASSEMBLED
          </button>
          <button
            type="button"
            class="px-2.5 py-1 rounded text-[9.5px] font-mono tracking-wider transition-colors cursor-pointer border"
            :class="
              inspectionMode === 'expanded'
                ? 'bg-sky-500/20 text-sky-300 border-sky-400/50 font-semibold shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                : 'bg-black/40 text-zinc-400 hover:text-white border-white/10 hover:border-white/20'
            "
            @click="setInspectionMode('expanded')"
          >
            EXPLODED LAYERS
          </button>
        </div>
      </div>

      <!-- Bottom Status & System Sequence Readout -->
      <div class="space-y-2 max-w-[320px]">
        <!-- System Initialization Sequence (Temporary intro HUD) -->
        <Transition name="fade">
          <div
            v-if="showInitSeq"
            class="p-2.5 rounded-lg border border-white/10 bg-zinc-950/90 backdrop-blur-md space-y-1 font-mono text-[9px] text-zinc-400"
          >
            <div class="flex items-center justify-between text-zinc-300 pb-1 border-b border-white/5 font-semibold">
              <span class="flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
                INITIALIZING DIGITAL CORE
              </span>
              <span class="text-sky-400">ONLINE</span>
            </div>
            <div class="grid grid-cols-2 gap-x-2 gap-y-0.5 pt-0.5 text-[8.5px]">
              <div>IDENTITY <span class="text-emerald-400">✓</span></div>
              <div>FLUTTER <span class="text-emerald-400">✓</span></div>
              <div>MOBILE <span class="text-emerald-400">✓</span></div>
              <div>ARCHITECTURE <span class="text-emerald-400">✓</span></div>
            </div>
          </div>
        </Transition>

        <!-- Steady State Beacon -->
        <div class="flex items-center gap-2 font-mono text-[9px] text-zinc-400 tracking-wider">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></span>
          <span>DIGITAL ARCHITECTURE CORE · DRAG TO INSPECT</span>
        </div>
      </div>
    </div>

    <!-- Active Hovered Project Tooltip / Action Card (Desktop) -->
    <Transition name="fade">
      <div
        v-if="hoveredProject && !isMobile"
        class="pointer-events-auto absolute z-30 bottom-8 right-8 max-w-xs p-3.5 rounded-xl border border-sky-400/30 bg-zinc-950/90 backdrop-blur-xl shadow-2xl space-y-1.5 select-none"
      >
        <div class="flex items-center justify-between text-[9px] font-mono text-zinc-400">
          <span class="text-sky-400 font-semibold flex items-center gap-1">
            <span class="w-1 h-1 rounded-full bg-sky-400"></span>
            PROJECT PREVIEW
          </span>
          <span>{{ hoveredProject.tech }}</span>
        </div>
        <h3 class="text-sm font-bold text-white tracking-tight">
          {{ hoveredProject.title }}
        </h3>
        <p class="text-[11px] text-zinc-400 line-clamp-2">
          {{ hoveredProject.subtitle }}
        </p>
        <button
          type="button"
          class="pt-1 text-[10.5px] font-mono text-sky-400 hover:text-white transition-colors flex items-center gap-1 font-semibold uppercase cursor-pointer"
          @click="openProjectLink(hoveredProject)"
        >
          <span>OPEN EXPERIENCE</span>
          <span>→</span>
        </button>
      </div>
    </Transition>

    <!-- Compact Mobile Project Detail Panel (Dismissible bottom card above safe area) -->
    <Transition name="fade">
      <div
        v-if="selectedProject && isMobile"
        class="pointer-events-auto absolute bottom-4 left-4 right-4 z-40 p-3.5 rounded-xl border border-sky-400/40 bg-zinc-950/95 backdrop-blur-xl shadow-2xl space-y-1.5 select-none"
      >
        <div class="flex items-center justify-between text-[9.5px] font-mono text-zinc-400">
          <span class="text-sky-400 font-semibold flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
            PROJECT PREVIEW
          </span>
          <button
            type="button"
            class="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 flex items-center justify-center text-xs cursor-pointer"
            @click="selectedProject = null"
            aria-label="Dismiss project preview"
          >
            ✕
          </button>
        </div>
        <div class="space-y-0.5">
          <h3 class="text-sm font-bold text-white tracking-tight">
            {{ selectedProject.title }}
          </h3>
          <p class="text-[10px] font-mono text-sky-300">
            {{ selectedProject.tech }}
          </p>
          <p class="text-[11px] text-zinc-300 line-clamp-2 leading-relaxed">
            {{ selectedProject.subtitle }}
          </p>
        </div>
        <div class="pt-1 flex items-center justify-between border-t border-white/10">
          <button
            type="button"
            class="text-[10.5px] font-mono text-sky-400 hover:text-white flex items-center gap-1 font-semibold uppercase cursor-pointer"
            @click="openProjectLink(selectedProject)"
          >
            <span>VIEW PROJECT</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { portfolioContent } from '@/content/portfolioContent'
import { setSection } from '@/composables/useShowcase'
import { useResponsive3D } from '@/composables/useResponsive3D'
import type { HeroProjectItem, EngineeringDomain, InspectionMode } from '../hero/heroTypes'
import { createProjectCardTexture, createDomainBadgeTexture } from '../hero/projectCardTexture'

const hero = portfolioContent.hero
const { isMobile, isSmallMobile, pixelRatio, prefersReducedMotion, checkWebGLSupport } = useResponsive3D()

const container = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const isWebGLSupported = ref(checkWebGLSupport())
const hasInteracted = ref(false)
const selectedProject = ref<HeroProjectItem | null>(null)

// Inspection mode: assembled (compact) vs expanded (exploded CAD view)
const inspectionMode = ref<InspectionMode>('assembled')
const showInitSeq = ref(true)

function setInspectionMode(mode: InspectionMode) {
  inspectionMode.value = mode
}

function navigateToProjects() {
  setSection('projects')
}

function navigateToContact() {
  setSection('contact')
}

// Actual project previews from existing project data
const projectPreviews: HeroProjectItem[] = [
  {
    id: 'valthub',
    title: 'ValtHub',
    subtitle: 'Secrets & Environment Variable Management Platform',
    tech: 'Next.js · TypeScript · Cloudflare',
    link: 'https://valthub.pages.dev/',
    offset: [2.25, 0.05, 0.6],
    rotation: [-0.04, -0.22, 0.02],
  },
  {
    id: 'iziloh',
    title: 'IZILOH',
    subtitle: 'Innovative On-Demand Laundry Ecosystem & Real-time Tracking',
    tech: 'Flutter · Clean Architecture',
    link: 'https://iziloh.com/',
    offset: [-2.05, -0.65, 0.55],
    rotation: [0.04, 0.22, -0.01],
  },
  {
    id: 'waroong-retjeh',
    title: 'Waroong Retjeh',
    subtitle: 'High-throughput Dining & Table Reservation Mobile App',
    tech: 'Flutter · Realtime Sync',
    link: 'http://waroongretjeh.dev.ittron.co.id/',
    offset: [1.75, 1.15, -0.45],
    rotation: [0.06, -0.18, -0.02],
  },
]

// Engineering domain layers around the core
const engineeringDomains: EngineeringDomain[] = [
  {
    id: 'ui',
    label: 'UI / UX CRAFT',
    code: 'UI',
    description: 'Intuitive layouts, micro-interactions, responsive design',
    offset: [-2.15, 0.75, -0.5],
    normal: [0.06, 0.18, 0.02],
  },
  {
    id: 'arch',
    label: 'CLEAN ARCHITECTURE',
    code: 'ARCH',
    description: 'Decoupled domain use-cases, reactive state isolation',
    offset: [-0.15, 1.35, -0.8],
    normal: [0.08, -0.05, -0.01],
  },
  {
    id: 'mobile',
    label: 'CROSS-PLATFORM',
    code: 'MOBILE',
    description: 'Multi-target compilation for iOS, Android, macOS & Web',
    offset: [-2.15, -1.55, -0.45],
    normal: [0.05, 0.2, 0.03],
  },
  {
    id: 'perf',
    label: 'APIs & PERFORMANCE',
    code: 'PERF',
    description: 'Low-latency isolate streams, zero-copy memory buffers',
    offset: [2.05, -1.25, -0.55],
    normal: [-0.05, -0.18, -0.02],
  },
]

const hoveredProject = ref<HeroProjectItem | null>(null)

function openProjectLink(proj: HeroProjectItem) {
  if (proj.link && proj.link !== '#') {
    window.open(proj.link, '_blank', 'noopener,noreferrer')
  } else {
    navigateToProjects()
  }
}

// -------------------------------------------------------------
// THREE.JS DIGITAL ARCHITECTURE INSTALLATION
// -------------------------------------------------------------
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let animFrameId = 0
let isVisible = true
let observer: IntersectionObserver | null = null

// Hierarchical Three.js Groups
let installationMasterGroup: THREE.Group | null = null
let coreMasterGroup: THREE.Group | null = null
let outerFrameMesh: THREE.LineSegments | null = null
let crystalShellMesh: THREE.Mesh | null = null
let wireframeGridMesh: THREE.LineSegments | null = null
let innerQuantumCoreMesh: THREE.Mesh | null = null
let centerLightNexus: THREE.Mesh | null = null
let datumRings: THREE.Mesh[] = []

// Project preview 3D nodes
interface Project3DNode {
  project: HeroProjectItem
  group: THREE.Group
  mesh: THREE.Mesh
  activeTexture: THREE.CanvasTexture
  inactiveTexture: THREE.CanvasTexture
  baseOffset: THREE.Vector3
  baseRotation: THREE.Euler
}
const projectNodes: Project3DNode[] = []

// Domain 3D nodes
interface Domain3DNode {
  domain: EngineeringDomain
  group: THREE.Group
  mesh: THREE.Mesh
  baseOffset: THREE.Vector3
}
const domainNodes: Domain3DNode[] = []

let isDragging = false
let prevPointerX = 0
let prevPointerY = 0
let touchStartX = 0
let touchStartY = 0
let pointerDownTime = 0
let gestureIntent: 'undecided' | 'rotate' | 'scroll' = 'undecided'

let targetRotY = 0
let targetRotX = 0
let currentRotY = 0
let currentRotX = 0

let targetCamX = 0
let targetCamY = 0
let currentCamX = 0
let currentCamY = 0

const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2(-999, -999)

// Intro animation progress
let introProgress = 0
const introDuration = 1.2 // 1200ms

function initThree() {
  if (!canvas.value) return
  if (!isWebGLSupported.value) return

  const parent = canvas.value.parentElement || container.value
  const width = parent?.clientWidth || window.innerWidth
  const height = parent?.clientHeight || window.innerHeight

  const mob = isMobile.value

  scene = new THREE.Scene()

  // Perspective camera
  camera = new THREE.PerspectiveCamera(mob ? 48 : 46, width / height, 0.1, 100)
  camera.position.set(0, 0.1, mob ? (isSmallMobile.value ? 7.8 : 7.2) : 6.4)

  // WebGL Renderer
  renderer = new THREE.WebGLRenderer({
    canvas: canvas.value,
    antialias: !isSmallMobile.value,
    alpha: true,
    powerPreference: 'high-performance',
  })
  renderer.setSize(width, height)
  renderer.setPixelRatio(pixelRatio.value)
  renderer.outputColorSpace = THREE.SRGBColorSpace

  // Studio Lighting (Subtle, architectural, directional key + rim)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)

  const keyLight = new THREE.DirectionalLight(0xffffff, 0.95)
  keyLight.position.set(4, 5, 5)
  scene.add(keyLight)

  const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.6)
  rimLight.position.set(-4, -3, -3)
  scene.add(rimLight)

  // Subtle localized PointLight in the core
  const corePointLight = new THREE.PointLight(0x38bdf8, 1.2, 5.0)
  scene.add(corePointLight)

  // Master Installation Group
  installationMasterGroup = new THREE.Group()
  const groupCenterX = mob ? 0.0 : 1.35
  const groupCenterY = mob ? 0.0 : -0.25
  installationMasterGroup.position.set(groupCenterX, groupCenterY, 0)
  installationMasterGroup.scale.setScalar(mob ? (isSmallMobile.value ? 0.85 : 0.95) : 1.0)
  scene.add(installationMasterGroup)

  // 1. Central 3D Digital Core
  buildDigitalCore()

  // 2. Project Preview Miniature Slabs
  buildProjectPreviews()

  // 3. Engineering Domain Layers
  buildDomainLayers()

  // Start Animation Loop
  let lastTime = performance.now()
  let introElapsed = 0

  function loop(now: number) {
    animFrameId = requestAnimationFrame(loop)
    if (!isVisible) return

    const delta = Math.min((now - lastTime) / 1000, 0.1)
    lastTime = now
    const time = now * 0.001

    // Intro assembly sequence (~1200ms)
    if (introProgress < 1.0) {
      introElapsed += delta
      introProgress = Math.min(1.0, introElapsed / introDuration)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - introProgress, 3)
      if (coreMasterGroup) {
        coreMasterGroup.scale.setScalar(eased)
      }
      if (introProgress >= 1.0) {
        setTimeout(() => {
          showInitSeq.value = false
        }, 1400)
      }
    }

    // Smooth Drag Rotation with return damping
    currentRotY = THREE.MathUtils.lerp(currentRotY, targetRotY, delta * 4.5)
    currentRotX = THREE.MathUtils.lerp(currentRotX, targetRotX, delta * 4.5)
    if (!isDragging) {
      // Gently drift back toward center orientation
      targetRotY = THREE.MathUtils.lerp(targetRotY, 0, delta * 0.5)
      targetRotX = THREE.MathUtils.lerp(targetRotX, 0, delta * 0.5)
    }
    if (installationMasterGroup) {
      installationMasterGroup.rotation.y = currentRotY
      installationMasterGroup.rotation.x = currentRotX
    }

    // Camera Parallax
    currentCamX = THREE.MathUtils.lerp(currentCamX, targetCamX, delta * 3.5)
    currentCamY = THREE.MathUtils.lerp(currentCamY, targetCamY, delta * 3.5)
    if (camera) {
      camera.position.x = currentCamX
      camera.position.y = 0.1 + currentCamY
      camera.lookAt(groupCenterX * 0.35, groupCenterY, 0)
    }

    // Core Idle Motion (Slow, physical, sophisticated)
    if (coreMasterGroup && !prefersReducedMotion.value) {
      // Floating motion
      coreMasterGroup.position.y = Math.sin(time * 0.7) * 0.05

      // Layered rotational differentials
      if (outerFrameMesh) outerFrameMesh.rotation.y = time * 0.06
      if (crystalShellMesh) {
        crystalShellMesh.rotation.y = -time * 0.04
        crystalShellMesh.rotation.x = time * 0.03
      }
      if (wireframeGridMesh) {
        wireframeGridMesh.rotation.y = time * 0.08
        wireframeGridMesh.rotation.z = -time * 0.04
      }
      if (innerQuantumCoreMesh) {
        innerQuantumCoreMesh.rotation.y = -time * 0.1
        innerQuantumCoreMesh.rotation.x = Math.sin(time * 0.5) * 0.2
      }
    }

    // Update Project Previews (Floating & Hover state)
    updateProjectNodes(delta, time)

    // Update Domain Layers
    updateDomainNodes(delta, time)

    // Update Inspection Mode expansion
    updateInspectionLayout(delta)

    if (renderer && scene && camera) {
      renderer.render(scene, camera)
    }
  }

  animFrameId = requestAnimationFrame(loop)
}

function buildDigitalCore() {
  coreMasterGroup = new THREE.Group()
  installationMasterGroup!.add(coreMasterGroup)

  const radius = isMobile.value ? 0.95 : 1.15

  // Layer 1: Outer Architectural Frame (Thin beveled cage)
  const cageGeo = new THREE.BoxGeometry(radius * 1.75, radius * 1.75, radius * 1.75)
  const cageEdges = new THREE.EdgesGeometry(cageGeo)
  const cageMat = new THREE.LineBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.35,
  })
  outerFrameMesh = new THREE.LineSegments(cageEdges, cageMat)
  coreMasterGroup.add(outerFrameMesh)

  // Layer 2: Translucent Crystalline Shell (Glass-like geometric surface)
  const shellGeo = new THREE.IcosahedronGeometry(radius * 1.05, 1)
  const shellMat = new THREE.MeshPhysicalMaterial({
    color: 0x08101a,
    roughness: 0.12,
    metalness: 0.2,
    transmission: 0.72,
    ior: 1.45,
    thickness: 0.6,
    transparent: true,
    opacity: 0.82,
  })
  crystalShellMesh = new THREE.Mesh(shellGeo, shellMat)
  coreMasterGroup.add(crystalShellMesh)

  // Layer 3: Technical Wireframe Grid (Internal structural layer)
  const wireGeo = new THREE.OctahedronGeometry(radius * 0.92, 1)
  const wireEdges = new THREE.EdgesGeometry(wireGeo)
  const wireMat = new THREE.LineBasicMaterial({
    color: 0x94a3b8,
    transparent: true,
    opacity: 0.3,
  })
  wireframeGridMesh = new THREE.LineSegments(wireEdges, wireMat)
  coreMasterGroup.add(wireframeGridMesh)

  // Layer 4: Inner Quantum Core (Emissive crystalline node)
  const innerGeo = new THREE.DodecahedronGeometry(radius * 0.58, 0)
  const innerMat = new THREE.MeshStandardMaterial({
    color: 0x0369a1,
    emissive: 0x0284c7,
    emissiveIntensity: 0.55,
    roughness: 0.25,
    metalness: 0.8,
  })
  innerQuantumCoreMesh = new THREE.Mesh(innerGeo, innerMat)
  coreMasterGroup.add(innerQuantumCoreMesh)

  // Layer 5: Central Light Point (Incandescent pure white nexus)
  const nexusGeo = new THREE.SphereGeometry(radius * 0.18, 16, 16)
  const nexusMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
  centerLightNexus = new THREE.Mesh(nexusGeo, nexusMat)
  coreMasterGroup.add(centerLightNexus)

  // Datum Latitude & Longitude Rings
  datumRings = []
  const ring1Geo = new THREE.TorusGeometry(radius * 1.18, 0.007, 16, 64)
  const ring1Mat = new THREE.MeshBasicMaterial({
    color: 0x94a3b8,
    transparent: true,
    opacity: 0.35,
  })
  const ring1 = new THREE.Mesh(ring1Geo, ring1Mat)
  ring1.rotation.x = Math.PI / 2
  coreMasterGroup.add(ring1)
  datumRings.push(ring1)

  const ring2Geo = new THREE.TorusGeometry(radius * 1.25, 0.007, 16, 64)
  const ring2Mat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.25,
  })
  const ring2 = new THREE.Mesh(ring2Geo, ring2Mat)
  ring2.rotation.y = Math.PI / 3
  coreMasterGroup.add(ring2)
  datumRings.push(ring2)
}

function buildProjectPreviews() {
  projectNodes.length = 0

  const isMob = isMobile.value
  const cardWidth = isMob ? 1.32 : 1.45
  const cardHeight = isMob ? 0.94 : 1.02
  const cardDepth = 0.025
  const cardGeo = new THREE.BoxGeometry(cardWidth, cardHeight, cardDepth)

  // Mobile: prioritize 2 key project previews positioned closer to the core
  const list = isMob
    ? [
        {
          ...projectPreviews[0],
          offset: [-1.45, -0.32, 0.45] as [number, number, number],
          rotation: [0.03, 0.2, -0.01] as [number, number, number],
        },
        {
          ...projectPreviews[1],
          offset: [1.45, 0.32, 0.45] as [number, number, number],
          rotation: [-0.03, -0.2, 0.01] as [number, number, number],
        },
      ]
    : projectPreviews

  list.forEach(proj => {
    const nodeGroup = new THREE.Group()

    const activeTexture = createProjectCardTexture(proj, true)
    const inactiveTexture = createProjectCardTexture(proj, false)

    const sideMat = new THREE.MeshStandardMaterial({
      color: 0x0c1017,
      roughness: 0.8,
      metalness: 0.2,
      transparent: true,
      opacity: 0.5,
    })
    const backMat = new THREE.MeshStandardMaterial({
      color: 0x06080d,
      roughness: 0.9,
      metalness: 0.1,
      transparent: true,
      opacity: 0.5,
    })
    const frontMat = new THREE.MeshStandardMaterial({
      map: inactiveTexture,
      roughness: 0.25,
      metalness: 0.1,
      transparent: true,
      opacity: 0.92,
    })

    const materials = [sideMat, sideMat, sideMat, sideMat, frontMat, backMat]
    const mesh = new THREE.Mesh(cardGeo, materials)
    mesh.userData = { projectId: proj.id }
    nodeGroup.add(mesh)

    const baseOffset = new THREE.Vector3(...proj.offset)
    const baseRotation = new THREE.Euler(...proj.rotation)
    nodeGroup.position.copy(baseOffset)
    nodeGroup.rotation.copy(baseRotation)

    installationMasterGroup!.add(nodeGroup)

    projectNodes.push({
      project: proj,
      group: nodeGroup,
      mesh,
      activeTexture,
      inactiveTexture,
      baseOffset,
      baseRotation,
    })
  })
}

function buildDomainLayers() {
  domainNodes.length = 0

  const badgeWidth = 1.15
  const badgeHeight = 0.38
  const badgeDepth = 0.015
  const badgeGeo = new THREE.BoxGeometry(badgeWidth, badgeHeight, badgeDepth)

  engineeringDomains.forEach(domain => {
    const nodeGroup = new THREE.Group()

    const badgeTexture = createDomainBadgeTexture(domain.label, domain.code, false)

    const sideMat = new THREE.MeshBasicMaterial({ color: 0x0a0f16, transparent: true, opacity: 0.4 })
    const frontMat = new THREE.MeshStandardMaterial({
      map: badgeTexture,
      roughness: 0.3,
      metalness: 0.1,
      transparent: true,
      opacity: 0.78,
    })
    const materials = [sideMat, sideMat, sideMat, sideMat, frontMat, sideMat]

    const mesh = new THREE.Mesh(badgeGeo, materials)
    nodeGroup.add(mesh)

    const baseOffset = new THREE.Vector3(...domain.offset)
    nodeGroup.position.copy(baseOffset)
    nodeGroup.rotation.set(...domain.normal)

    installationMasterGroup!.add(nodeGroup)

    domainNodes.push({
      domain,
      group: nodeGroup,
      mesh,
      baseOffset,
    })
  })
}

function updateProjectNodes(delta: number, time: number) {
  projectNodes.forEach((node, idx) => {
    const isHovered = (hoveredProject.value?.id === node.project.id) || (selectedProject.value?.id === node.project.id)
    const targetPos = node.baseOffset.clone()

    // Subtle floating depth motion
    if (!prefersReducedMotion.value) {
      targetPos.y += Math.sin(time * 0.8 + idx * 1.5) * 0.04
      targetPos.x += Math.cos(time * 0.65 + idx * 1.2) * 0.02
    }

    if (isHovered) {
      targetPos.z += 0.35
    }

    node.group.position.lerp(targetPos, delta * 5.0)

    const targetScale = isHovered ? 1.06 : 1.0
    node.group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 5.0)

    // Swap active/inactive texture on hover
    const frontMat = (node.mesh.material as THREE.Material[])[4] as THREE.MeshStandardMaterial
    frontMat.map = isHovered ? node.activeTexture : node.inactiveTexture
    frontMat.needsUpdate = true
  })
}

function updateDomainNodes(delta: number, time: number) {
  domainNodes.forEach((node, idx) => {
    const targetPos = node.baseOffset.clone()
    if (!prefersReducedMotion.value) {
      targetPos.y += Math.sin(time * 0.75 + idx * 1.4) * 0.03
    }
    node.group.position.lerp(targetPos, delta * 4.5)
  })
}

function updateInspectionLayout(delta: number) {
  const isExpanded = inspectionMode.value === 'expanded'

  // If expanded, separate layers outward along radial axes (Exploded CAD view)
  const expandFactor = isExpanded ? 1.35 : 1.0

  if (outerFrameMesh) {
    const frameScale = isExpanded ? 1.4 : 1.0
    outerFrameMesh.scale.lerp(new THREE.Vector3(frameScale, frameScale, frameScale), delta * 4.5)
  }
  if (crystalShellMesh) {
    const shellScale = isExpanded ? 1.22 : 1.0
    crystalShellMesh.scale.lerp(new THREE.Vector3(shellScale, shellScale, shellScale), delta * 4.5)
  }

  // Drift domain layers and project previews
  domainNodes.forEach(node => {
    const target = node.baseOffset.clone().multiplyScalar(expandFactor)
    node.baseOffset.lerp(target, delta * 4.0)
  })
}

// Pointer & Interaction Handlers
function onPointerDown(e: PointerEvent) {
  isDragging = true
  touchStartX = e.clientX
  touchStartY = e.clientY
  prevPointerX = e.clientX
  prevPointerY = e.clientY
  pointerDownTime = performance.now()
  gestureIntent = 'undecided'
}

function onPointerMove(e: PointerEvent) {
  if (!canvas.value || !camera) return

  const rect = canvas.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  mouse.x = (x / rect.width) * 2 - 1
  mouse.y = -(y / rect.height) * 2 + 1

  if (!isMobile.value) {
    targetCamX = mouse.x * 0.25
    targetCamY = mouse.y * 0.18
  }

  if (isDragging) {
    const dx = e.clientX - prevPointerX
    const dy = e.clientY - prevPointerY
    prevPointerX = e.clientX
    prevPointerY = e.clientY

    const totalDx = Math.abs(e.clientX - touchStartX)
    const totalDy = Math.abs(e.clientY - touchStartY)

    if (gestureIntent === 'undecided') {
      if (Math.hypot(totalDx, totalDy) > 6) {
        if (totalDx > totalDy * 1.1) {
          gestureIntent = 'rotate'
          hasInteracted.value = true
        } else {
          gestureIntent = 'scroll'
        }
      }
    }

    if (gestureIntent === 'rotate' || !isMobile.value) {
      if (e.cancelable && isMobile.value) e.preventDefault()
      targetRotY += dx * (isMobile.value ? 0.0075 : 0.0035)
      targetRotX = THREE.MathUtils.clamp(targetRotX + dy * (isMobile.value ? 0.005 : 0.0025), -0.45, 0.45)
      hasInteracted.value = true
    }
  } else if (!isMobile.value) {
    // Desktop raycasting for hover
    raycaster.setFromCamera(mouse, camera)
    const meshes = projectNodes.map(n => n.mesh)
    const intersects = raycaster.intersectObjects(meshes)

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object
      const projId = hitMesh.userData.projectId
      const found = projectPreviews.find(p => p.id === projId)
      if (found) {
        hoveredProject.value = found
        if (canvas.value) canvas.value.style.cursor = 'pointer'
        return
      }
    }

    hoveredProject.value = null
    if (canvas.value) canvas.value.style.cursor = isDragging ? 'grabbing' : 'grab'
  }
}

function onPointerUp(e: PointerEvent) {
  if (isDragging) {
    const dist = Math.hypot(e.clientX - touchStartX, e.clientY - touchStartY)
    const duration = performance.now() - pointerDownTime

    if (dist < 8 && duration < 320 && camera) {
      hasInteracted.value = true
      raycaster.setFromCamera(mouse, camera)
      const meshes = projectNodes.map(n => n.mesh)
      const intersects = raycaster.intersectObjects(meshes)
      if (intersects.length > 0) {
        const projId = intersects[0].object.userData.projectId
        const found = projectPreviews.find(p => p.id === projId)
        if (found) {
          if (isMobile.value) {
            selectedProject.value = found
          } else {
            openProjectLink(found)
          }
        }
      } else {
        selectedProject.value = null
      }
    }
  }
  isDragging = false
  if (canvas.value) canvas.value.style.cursor = 'grab'
}

function resetView() {
  targetRotY = 0
  targetRotX = 0
  targetCamX = 0
  targetCamY = 0
  selectedProject.value = null
  hoveredProject.value = null
}

function onResize() {
  if (!canvas.value || !camera || !renderer || !installationMasterGroup) return

  const parent = canvas.value.parentElement || container.value
  const width = parent?.clientWidth || window.innerWidth
  const height = parent?.clientHeight || window.innerHeight

  const mob = width < 768 || window.innerWidth < 768

  camera.aspect = width / height
  camera.fov = mob ? (window.innerWidth < 390 ? 52 : 48) : 46
  camera.position.z = mob ? (window.innerWidth < 390 ? 8.2 : 7.4) : 6.4
  camera.updateProjectionMatrix()

  renderer.setSize(width, height)
  renderer.setPixelRatio(pixelRatio.value)

  const groupCenterX = mob ? 0.0 : 1.35
  const groupCenterY = mob ? 0.0 : -0.25
  installationMasterGroup.position.set(groupCenterX, groupCenterY, 0)
  installationMasterGroup.scale.setScalar(mob ? (window.innerWidth < 390 ? 0.85 : 0.95) : 1.0)
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

  // Dispose Three.js objects
  if (outerFrameMesh) {
    outerFrameMesh.geometry.dispose()
    ;(outerFrameMesh.material as THREE.Material).dispose()
  }
  if (crystalShellMesh) {
    crystalShellMesh.geometry.dispose()
    ;(crystalShellMesh.material as THREE.Material).dispose()
  }
  if (wireframeGridMesh) {
    wireframeGridMesh.geometry.dispose()
    ;(wireframeGridMesh.material as THREE.Material).dispose()
  }
  if (innerQuantumCoreMesh) {
    innerQuantumCoreMesh.geometry.dispose()
    ;(innerQuantumCoreMesh.material as THREE.Material).dispose()
  }
  if (centerLightNexus) {
    centerLightNexus.geometry.dispose()
    ;(centerLightNexus.material as THREE.Material).dispose()
  }
  datumRings.forEach(r => {
    r.geometry.dispose()
    ;(r.material as THREE.Material).dispose()
  })

  projectNodes.forEach(node => {
    node.mesh.geometry.dispose()
    node.activeTexture.dispose()
    node.inactiveTexture.dispose()
    ;(node.mesh.material as THREE.Material[]).forEach(m => m.dispose())
  })

  domainNodes.forEach(node => {
    node.mesh.geometry.dispose()
    ;(node.mesh.material as THREE.Material[]).forEach(m => m.dispose())
  })

  if (renderer) {
    renderer.dispose()
    renderer.forceContextLoss()
    renderer = null
  }
})
</script>

<style scoped>
.hero-digital-core-scene {
  background: radial-gradient(circle at 65% 45%, #080d16 0%, #03060b 80%);
}

.gallery-ambient-vignette {
  background: radial-gradient(circle at 50% 50%, transparent 45%, rgba(3, 6, 11, 0.75) 100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 300ms ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
