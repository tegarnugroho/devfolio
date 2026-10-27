<template>
  <div
    ref="container"
    class="hero-digital-core-scene relative w-full h-full select-none overflow-hidden bg-[#03060b] flex flex-col justify-between md:block px-4 sm:px-5 pt-[max(4.25rem,calc(env(safe-area-inset-top)+3.5rem))] pb-[max(4.5rem,calc(env(safe-area-inset-bottom)+3.5rem))] md:p-0"
  >
    <!-- Deep Ambient Vignette (Seamless background blend) -->
    <div class="pointer-events-none absolute inset-0 gallery-ambient-vignette" aria-hidden="true"></div>

    <!-- Cosmic Ambient Glow & Blueprint Grid Overlay -->
    <div
      class="pointer-events-none absolute inset-0 transition-opacity duration-500"
      :class="globeMode === 'tech' ? 'showcase-glow-dark' : 'showcase-glow-light'"
      aria-hidden="true"
    ></div>
    <div
      v-if="globeMode === 'tech'"
      class="pointer-events-none absolute inset-0 opacity-[0.03] showcase-grid-dark"
      aria-hidden="true"
    ></div>

    <!-- 1. 3D Canvas Stage (Controlled 42-48dvh on Mobile, Fullscreen on Desktop) -->
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
        <p class="font-mono text-xs font-semibold">EARTH MISSION CONTROL</p>
        <p class="text-[11px] text-zinc-400 mt-1">Cross-platform Flutter & Systems Architecture</p>
      </div>

      <!-- Subtle Mobile Touch Hint (Auto-fades on first user touch) -->
      <Transition name="fade">
        <div
          v-if="!hasInteracted && isMobile"
          class="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full bg-black/85 border border-white/10 text-zinc-300 font-mono text-[9px] tracking-widest uppercase backdrop-blur-md whitespace-nowrap shadow-lg flex items-center gap-1.5"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
          <span>↔ DRAG GLOBE TO EXPLORE</span>
        </div>
      </Transition>

      <!-- Reset View Control (Minimal ↻ button in top right of canvas) -->
      <button
        type="button"
        class="pointer-events-auto absolute top-3 right-3 z-20 w-7 h-7 rounded-full bg-black/60 hover:bg-white/15 border border-white/15 text-zinc-300 hover:text-white flex items-center justify-center font-mono text-xs backdrop-blur-md transition active:scale-95 cursor-pointer shadow-md"
        @click="resetView"
        title="Reset Globe Orientation"
        aria-label="Reset 3D camera and rotation"
      >
        ↻
      </button>
    </div>

    <!-- Sub-controls: Globe Visual Mode Switcher (Top-Right) -->
    <div class="absolute top-[max(4.25rem,calc(env(safe-area-inset-top)+3.5rem))] sm:top-20 right-4 sm:right-12 z-20 flex items-center gap-2 pointer-events-auto">
      <div class="inline-flex items-center rounded-full border border-white/15 bg-black/70 p-0.5 backdrop-blur-md shadow-sm">
        <button
          type="button"
          class="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono tracking-wider transition-all duration-200 cursor-pointer"
          :class="
            globeMode === 'real'
              ? 'bg-blue-500/25 text-white font-bold border border-blue-400/40 shadow-[0_0_12px_rgba(59,130,246,0.4)]'
              : 'text-zinc-400 hover:text-white border border-transparent'
          "
          title="Switch to Real Earth photorealistic view"
          @click="setGlobeMode('real')"
        >
          <span class="w-1.5 h-1.5 rounded-full" :class="globeMode === 'real' ? 'bg-blue-400' : 'bg-zinc-500'"></span>
          <span>REAL EARTH</span>
        </button>
        <button
          type="button"
          class="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono tracking-wider transition-all duration-200 cursor-pointer"
          :class="
            globeMode === 'tech'
              ? 'bg-cyan-500/25 text-white font-bold border border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
              : 'text-zinc-400 hover:text-white border border-transparent'
          "
          title="Switch to Technical Dark Blueprint view"
          @click="setGlobeMode('tech')"
        >
          <span>TECH GLOBE</span>
        </button>
      </div>
    </div>

    <!-- 2. Mobile Editorial Layout Overlays (md:hidden) -->
    <div class="md:hidden absolute inset-0 z-20 pointer-events-none flex flex-col justify-between px-4 sm:px-5 pt-[max(4.25rem,calc(env(safe-area-inset-top)+3.5rem))] pb-[max(4.5rem,calc(env(safe-area-inset-bottom)+3.5rem))] overflow-y-auto no-scrollbar">
      <!-- Top Mobile Section Info -->
      <div class="space-y-2 pointer-events-auto shrink-0 select-none">
        <div class="flex items-center gap-2 font-mono text-[9px]">
          <span class="text-zinc-400 font-semibold">01</span>
          <span class="w-3 h-[1px] bg-zinc-600"></span>
          <span class="text-zinc-300 uppercase tracking-widest font-medium">MISSION CONTROL</span>
          <span class="text-zinc-600">·</span>
          <span class="text-sky-400 uppercase tracking-wider font-semibold">FLUTTER DEVELOPER</span>
        </div>

        <div class="space-y-0.5">
          <h1 class="text-4xl font-extrabold tracking-tight text-white leading-tight">
            {{ portfolioContent.site.name }}<span class="text-sky-400">{{ portfolioContent.site.brandPeriod }}</span>
          </h1>
        </div>

        <p class="text-[12px] text-zinc-300 leading-relaxed font-sans max-w-sm font-normal">
          I build reliable cross-platform experiences focused on performance, intuitive UI, and maintainable architecture.
        </p>
      </div>

      <!-- Spacer matching middle 3D canvas viewport -->
      <div class="pointer-events-none h-[44dvh] sm:h-[48dvh] max-h-[460px] min-h-[260px] my-auto"></div>

      <!-- Bottom Mobile Controls & CTA -->
      <div class="space-y-3 pointer-events-auto shrink-0 select-none pb-1">
        <!-- Architecture Layer View Switcher -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="font-mono text-[9px] uppercase tracking-wider text-zinc-500 font-medium">ORBIT:</span>
            <button
              type="button"
              class="px-2.5 py-1 rounded-md text-[9px] font-mono tracking-wider transition-all cursor-pointer border"
              :class="
                inspectionMode === 'assembled'
                  ? 'bg-blue-500/20 text-white border-blue-400/50 shadow-[0_0_12px_rgba(56,189,248,0.3)] font-semibold'
                  : 'bg-black/50 text-zinc-400 hover:text-white border-white/10'
              "
              @click="setInspectionMode('assembled')"
            >
              ASSEMBLED
            </button>
            <button
              type="button"
              class="px-2.5 py-1 rounded-md text-[9px] font-mono tracking-wider transition-all cursor-pointer border"
              :class="
                inspectionMode === 'expanded'
                  ? 'bg-blue-500/20 text-white border-blue-400/50 shadow-[0_0_12px_rgba(56,189,248,0.3)] font-semibold'
                  : 'bg-black/50 text-zinc-400 hover:text-white border-white/10'
              "
              @click="setInspectionMode('expanded')"
            >
              EXPLODED
            </button>
          </div>

          <div class="flex items-center gap-1.5 font-mono text-[9px] text-zinc-400">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"></span>
            <span>EARTH ONLINE</span>
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
      class="hidden md:flex pointer-events-none absolute top-24 sm:top-28 md:top-32 left-8 sm:left-14 bottom-10 sm:bottom-12 z-20 max-w-sm sm:max-w-md w-full flex-col justify-between select-none"
    >
      <!-- Top Section Info & Identity -->
      <div class="space-y-4">
        <!-- Section Identifier -->
        <div class="flex items-center gap-2 font-mono text-[10px]">
          <span class="text-zinc-400 font-semibold">01</span>
          <span class="w-3.5 h-[1px] bg-zinc-600"></span>
          <span class="text-zinc-300 uppercase tracking-widest font-medium">MISSION CONTROL</span>
          <span class="text-zinc-600">·</span>
          <span class="text-sky-400 uppercase tracking-wider font-semibold">FLUTTER DEVELOPER</span>
        </div>

        <!-- Personal Name Headline (Dominant, clean, bold with cyan period) -->
        <div class="space-y-1">
          <h1 class="text-6xl sm:text-7xl font-extrabold tracking-tight text-white leading-none">
            {{ portfolioContent.site.name }}<span class="text-sky-400">{{ portfolioContent.site.brandPeriod }}</span>
          </h1>
        </div>

        <!-- Introduction -->
        <p class="text-[13.5px] text-zinc-300 leading-relaxed font-sans max-w-[370px] font-normal">
          I build reliable cross-platform experiences focused on performance, intuitive UI, and maintainable architecture.
        </p>

        <!-- Primary Call to Actions -->
        <div class="pt-2 pointer-events-auto flex items-center gap-3">
          <button
            type="button"
            class="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-zinc-950 font-mono text-[11px] uppercase tracking-wider font-bold transition hover:bg-zinc-200 active:scale-98 shadow-xl cursor-pointer"
            @click="navigateToProjects"
          >
            <span>VIEW PROJECTS</span>
            <span class="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
          </button>

          <button
            type="button"
            class="inline-flex items-center px-5 py-2.5 rounded-xl border border-white/20 bg-black/40 hover:bg-white/10 text-white font-mono text-[11px] uppercase tracking-wider font-medium transition active:scale-98 cursor-pointer backdrop-blur-md"
            @click="navigateToContact"
          >
            CONTACT
          </button>
        </div>

        <!-- Interactive Architecture Layer Switcher (SpaceX HUD styling) -->
        <div class="pt-2 pointer-events-auto flex items-center gap-2">
          <span class="font-mono text-[9px] uppercase tracking-widest text-zinc-400 font-medium">
            ORBIT VIEW:
          </span>
          <button
            type="button"
            class="px-2.5 py-1 rounded-md text-[9.5px] font-mono tracking-wider transition-all cursor-pointer border"
            :class="
              inspectionMode === 'assembled'
                ? 'bg-blue-500/20 text-white border-blue-400/50 shadow-[0_0_12px_rgba(56,189,248,0.3)] font-semibold'
                : 'bg-black/50 text-zinc-400 hover:text-white border-white/10 hover:border-white/25'
            "
            @click="setInspectionMode('assembled')"
          >
            ASSEMBLED
          </button>
          <button
            type="button"
            class="px-2.5 py-1 rounded-md text-[9.5px] font-mono tracking-wider transition-all cursor-pointer border"
            :class="
              inspectionMode === 'expanded'
                ? 'bg-blue-500/20 text-white border-blue-400/50 shadow-[0_0_12px_rgba(56,189,248,0.3)] font-semibold'
                : 'bg-black/50 text-zinc-400 hover:text-white border-white/10 hover:border-white/25'
            "
            @click="setInspectionMode('expanded')"
          >
            EXPLODED LAYERS
          </button>
        </div>
      </div>

      <!-- Bottom Status & System Sequence Readout -->
      <div class="space-y-2 max-w-[360px] pointer-events-auto">
        <div class="p-3 rounded-xl border border-white/10 bg-black/80 backdrop-blur-xl space-y-1.5 font-mono text-[9px] text-zinc-400 shadow-xl">
          <div class="flex items-center justify-between text-zinc-300 pb-1 border-b border-white/5 font-semibold">
            <span class="flex items-center gap-1.5 text-zinc-200">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></span>
              EARTH MISSION CONTROL // ONLINE
            </span>
            <span class="text-sky-400 font-mono text-[8.5px]">TELEMETRY ACTIVE</span>
          </div>
          <div class="flex items-center justify-between text-[8.5px] text-zinc-400 pt-0.5">
            <span>CROSS-PLATFORM ARCHITECTURE</span>
            <span class="text-zinc-500">DRAG GLOBE TO INSPECT ↔</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Active Hovered Project Tooltip / Action Card (Desktop) -->
    <Transition name="fade">
      <div
        v-if="hoveredProject && !isMobile"
        class="pointer-events-auto absolute z-30 bottom-8 right-8 max-w-xs p-3.5 rounded-lg border border-white/10 bg-black/90 backdrop-blur-md shadow-2xl space-y-2 select-none"
      >
        <div class="flex items-center justify-between text-[8.5px] font-mono text-zinc-400">
          <span class="text-sky-400 font-semibold flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
            SYS // ORBITAL TELEMETRY
          </span>
          <span class="text-zinc-500 uppercase">ONLINE</span>
        </div>
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold text-white tracking-tight">
            {{ hoveredProject.title }}
          </h3>
          <span class="text-[9px] font-mono text-sky-400">SYS // OK</span>
        </div>
        <p class="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
          {{ hoveredProject.subtitle }}
        </p>
        <div class="pt-1 flex items-center justify-between font-mono text-[9px] border-t border-white/10">
          <span class="text-zinc-500">{{ hoveredProject.tech }}</span>
          <button
            type="button"
            class="text-sky-400 hover:text-white transition-colors flex items-center gap-1 font-semibold uppercase cursor-pointer"
            @click="openProjectLink(hoveredProject)"
          >
            <span>OPEN EXPERIENCE ↗</span>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Compact Mobile Project Detail Panel (Dismissible bottom card) -->
    <Transition name="fade">
      <div
        v-if="selectedProject && isMobile"
        class="pointer-events-auto absolute bottom-4 left-4 right-4 z-40 p-3.5 rounded-lg border border-white/10 bg-black/95 backdrop-blur-md shadow-2xl space-y-2 select-none"
      >
        <div class="flex items-center justify-between text-[9px] font-mono text-zinc-400">
          <span class="text-sky-400 font-semibold flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
            SYS // TARGET NODE
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
          <h3 class="text-sm font-semibold text-white tracking-tight">
            {{ selectedProject.title }}
          </h3>
          <p class="text-[10px] font-mono text-sky-300">
            {{ selectedProject.tech }}
          </p>
          <p class="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
            {{ selectedProject.subtitle }}
          </p>
        </div>
        <div class="pt-1 flex items-center justify-between border-t border-white/10">
          <button
            type="button"
            class="text-[10px] font-mono text-sky-400 hover:text-white flex items-center gap-1.5 font-semibold uppercase cursor-pointer"
            @click="openProjectLink(selectedProject)"
          >
            <span>VIEW PROJECT ↗</span>
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
import {
  createGridLines,
  createCoastlineGeometry,
  createLandPointsGeometry,
} from '@/components/globe/globeMath'

const { isMobile, isSmallMobile, pixelRatio, prefersReducedMotion, checkWebGLSupport } = useResponsive3D()

const container = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const isWebGLSupported = ref(checkWebGLSupport())
const hasInteracted = ref(false)
const selectedProject = ref<HeroProjectItem | null>(null)

// Visual mode: real (Photorealistic Earth) vs tech (Technical Dark Blueprint)
const globeMode = ref<'real' | 'tech'>('real')
function setGlobeMode(mode: 'real' | 'tech') {
  globeMode.value = mode
  applyThemeMaterials(mode === 'tech')
}

// Inspection mode: assembled (compact orbit) vs expanded (exploded outer schematic)
const inspectionMode = ref<InspectionMode>('assembled')

function setInspectionMode(mode: InspectionMode) {
  inspectionMode.value = mode
}

function navigateToProjects() {
  setSection('projects')
}

function navigateToContact() {
  setSection('contact')
}

function resetView() {
  targetRotX = 0
  targetRotY = 0
}

// Actual project previews from existing project data, calibrated to frame the Earth globe
const projectPreviews: HeroProjectItem[] = [
  {
    id: 'valthub',
    title: 'ValtHub',
    subtitle: 'Secrets & Environment Variable Management Platform',
    tech: 'Next.js · TypeScript · Cloudflare',
    link: 'https://valthub.pages.dev/',
    offset: [2.15, 0.25, 0.40],
    rotation: [-0.02, -0.12, 0],
  },
  {
    id: 'iziloh',
    title: 'IZILOH',
    subtitle: 'Innovative On-Demand Laundry Ecosystem & Real-time Tracking',
    tech: 'Flutter · Clean Architecture',
    link: 'https://iziloh.com/',
    offset: [-1.45, -1.25, 0.35],
    rotation: [0.02, 0.10, 0],
  },
  {
    id: 'waroong-retjeh',
    title: 'Waroong Retjeh',
    subtitle: 'High-throughput Dining & Table Reservation Mobile App',
    tech: 'Flutter · Realtime Sync',
    link: 'http://waroongretjeh.dev.ittron.co.id/',
    offset: [1.75, 1.35, -0.30],
    rotation: [0.02, -0.08, 0],
  },
]

// Engineering domain layers gracefully framing the Earth globe
const engineeringDomains: EngineeringDomain[] = [
  {
    id: 'ui',
    label: 'UI / UX CRAFT',
    code: 'UI',
    description: 'Intuitive layouts, micro-interactions, responsive design',
    offset: [-1.50, 1.05, -0.35],
    normal: [0.03, 0.10, 0],
  },
  {
    id: 'arch',
    label: 'CLEAN ARCHITECTURE',
    code: 'ARCH',
    description: 'Decoupled domain use-cases, reactive state isolation',
    offset: [0.15, 1.65, -0.50],
    normal: [0.04, -0.03, 0],
  },
  {
    id: 'mobile',
    label: 'CROSS-PLATFORM',
    code: 'MOBILE',
    description: 'Multi-target compilation for iOS, Android, macOS & Web',
    offset: [-1.45, -0.15, -0.25],
    normal: [0.02, 0.10, 0],
  },
  {
    id: 'perf',
    label: 'APIs & PERFORMANCE',
    code: 'PERF',
    description: 'Low-latency isolate streams, zero-copy memory buffers',
    offset: [2.05, -1.10, -0.40],
    normal: [-0.03, -0.10, 0],
  },
]

const hoveredProject = ref<HeroProjectItem | null>(null)
const hoveredDomainId = ref<string | null>(null)

function openProjectLink(proj: HeroProjectItem) {
  if (proj.link && proj.link !== '#') {
    window.open(proj.link, '_blank', 'noopener,noreferrer')
  } else {
    navigateToProjects()
  }
}

// -------------------------------------------------------------
// THREE.JS REALISTIC 3D EARTH GLOBE INSTALLATION
// -------------------------------------------------------------
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let animFrameId = 0
let isVisible = true
let observer: IntersectionObserver | null = null

// Hierarchical Three.js Groups
let installationMasterGroup: THREE.Group | null = null
let earthMasterGroup: THREE.Group | null = null

// Earth Meshes (Matching Projects & Writing Globe Systems)
let baseSphere: THREE.Mesh | null = null
let baseSphereMat: THREE.MeshBasicMaterial | null = null
let gridLineMesh: THREE.LineSegments | null = null
let gridLineMat: THREE.LineBasicMaterial | null = null
let landPointsMesh: THREE.Points | null = null
let landPointsMat: THREE.PointsMaterial | null = null
let coastMesh: THREE.LineSegments | null = null
let coastMat: THREE.LineBasicMaterial | null = null

let realEarthMesh: THREE.Mesh | null = null
let realEarthMat: THREE.MeshStandardMaterial | null = null
let cloudsMesh: THREE.Mesh | null = null
let cloudsMat: THREE.MeshStandardMaterial | null = null
let atmosphereMesh: THREE.Mesh | null = null
let atmosphereMat: THREE.ShaderMaterial | null = null

let datumRings: THREE.Mesh[] = []

// Dynamic Conduit Connector Lines (Telemetric Tethers to Earth)
let connectorLinesMesh: THREE.LineSegments | null = null
let connectorPositions: Float32Array | null = null

// Project preview 3D nodes
interface Project3DNode {
  project: HeroProjectItem
  group: THREE.Group
  mesh: THREE.Mesh
  defaultTexture: THREE.CanvasTexture
  hoverTexture: THREE.CanvasTexture
  activeTexture: THREE.CanvasTexture
  baseOffset: THREE.Vector3
  baseRotation: THREE.Euler
  anchorMesh: THREE.Mesh
}
const projectNodes: Project3DNode[] = []

// Domain 3D nodes
interface Domain3DNode {
  domain: EngineeringDomain
  group: THREE.Group
  mesh: THREE.Mesh
  defaultTexture: THREE.CanvasTexture
  hoverTexture: THREE.CanvasTexture
  baseOffset: THREE.Vector3
}
const domainNodes: Domain3DNode[] = []

let isDragging = false
let prevPointerX = 0
let prevPointerY = 0
let touchStartX = 0
let touchStartY = 0
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

function applyThemeMaterials(isTech: boolean) {
  if (baseSphere) baseSphere.visible = isTech
  if (gridLineMesh) gridLineMesh.visible = isTech
  if (landPointsMesh) landPointsMesh.visible = isTech
  if (coastMesh) coastMesh.visible = isTech

  if (realEarthMesh) realEarthMesh.visible = !isTech
  if (cloudsMesh) cloudsMesh.visible = !isTech
  if (atmosphereMesh) atmosphereMesh.visible = !isTech
}

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
  camera.position.set(0, 0.05, mob ? (isSmallMobile.value ? 7.6 : 7.0) : 6.3)

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

  // Volumetric Cinematic Lighting (Matching Projects & Writing Showcases)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.55)
  scene.add(ambientLight)

  const sunLight = new THREE.DirectionalLight(0xffffff, 2.5)
  sunLight.position.set(6, 4, 5)
  scene.add(sunLight)

  const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.8)
  rimLight.position.set(-4, -3, -3)
  scene.add(rimLight)

  // Master Installation Group (Centered on Right 55% on desktop)
  installationMasterGroup = new THREE.Group()
  const groupCenterX = mob ? 0.0 : 1.45
  const groupCenterY = mob ? 0.0 : -0.1
  installationMasterGroup.position.set(groupCenterX, groupCenterY, 0)
  installationMasterGroup.scale.setScalar(mob ? (isSmallMobile.value ? 0.85 : 0.95) : 1.0)
  scene.add(installationMasterGroup)

  // 1. Central 3D Earth Globe
  buildEarthGlobe()

  // 2. Project Preview Miniature Slabs
  buildProjectPreviews()

  // 3. Engineering Domain Layers
  buildDomainLayers()

  // 4. Telemetric Conduit Connector Lines
  buildConnectorConduits()

  // 5. Starfield Background
  buildStarfield()

  applyThemeMaterials(globeMode.value === 'tech')

  // Start Animation Loop
  let lastTime = performance.now()

  function loop(now: number) {
    animFrameId = requestAnimationFrame(loop)
    if (!isVisible) return

    const delta = Math.min((now - lastTime) / 1000, 0.1)
    lastTime = now

    // Smooth Drag Rotation with return damping
    currentRotY = THREE.MathUtils.lerp(currentRotY, targetRotY, delta * 4.5)
    currentRotX = THREE.MathUtils.lerp(currentRotX, targetRotX, delta * 4.5)
    if (!isDragging) {
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
      camera.position.y = 0.05 + currentCamY
      camera.lookAt(groupCenterX * 0.35, groupCenterY, 0)
    }

    // Majestic Earth Idle Motion (Slow planetary rotation)
    if (earthMasterGroup && !prefersReducedMotion.value) {
      if (!isDragging) {
        earthMasterGroup.rotation.y += delta * 0.02
      }
      if (cloudsMesh && cloudsMesh.visible) {
        cloudsMesh.rotation.y += delta * 0.012
      }
    }

    // Update Project Previews
    updateProjectNodes(delta, now * 0.001)

    // Update Domain Layers
    updateDomainNodes(delta, now * 0.001)

    // Update Inspection Mode expansion
    updateInspectionLayout(delta)

    // Update Telemetric Conduit Connector Lines
    updateConnectorConduits()

    if (renderer && scene && camera) {
      renderer.render(scene, camera)
    }
  }

  animFrameId = requestAnimationFrame(loop)
}

function buildEarthGlobe() {
  earthMasterGroup = new THREE.Group()
  earthMasterGroup.rotation.z = 0
  // Initial angle showing continents with deep perspective
  earthMasterGroup.rotation.y = -1.45
  installationMasterGroup!.add(earthMasterGroup)

  const radius = isMobile.value ? 1.05 : 1.35

  // 1. Base Sphere (Technical Dark Globe)
  const sphereGeo = new THREE.SphereGeometry(radius, 64, 64)
  baseSphereMat = new THREE.MeshBasicMaterial({
    color: 0x06080e,
    transparent: true,
    opacity: 0.98,
  })
  baseSphere = new THREE.Mesh(sphereGeo, baseSphereMat)
  baseSphere.visible = globeMode.value === 'tech'
  earthMasterGroup.add(baseSphere)

  // 2. Procedural Lat/Long Grid Lines
  const gridGeo = createGridLines(radius * 1.002)
  gridLineMat = new THREE.LineBasicMaterial({
    color: 0x334155,
    transparent: true,
    opacity: 0.18,
  })
  gridLineMesh = new THREE.LineSegments(gridGeo, gridLineMat)
  gridLineMesh.visible = globeMode.value === 'tech'
  earthMasterGroup.add(gridLineMesh)

  // 3. Procedural Land Points Cloud
  const landPointsGeo = createLandPointsGeometry(radius * 1.006)
  landPointsMat = new THREE.PointsMaterial({
    color: 0x94a3b8,
    size: 0.024,
    transparent: true,
    opacity: 0.8,
  })
  landPointsMesh = new THREE.Points(landPointsGeo, landPointsMat)
  landPointsMesh.visible = globeMode.value === 'tech'
  earthMasterGroup.add(landPointsMesh)

  // 4. Procedural Coastlines
  const coastGeo = createCoastlineGeometry(radius * 1.008)
  coastMat = new THREE.LineBasicMaterial({
    color: 0x475569,
    transparent: true,
    opacity: 0.35,
  })
  coastMesh = new THREE.LineSegments(coastGeo, coastMat)
  coastMesh.visible = globeMode.value === 'tech'
  earthMasterGroup.add(coastMesh)

  // 5. Photorealistic Real Earth Textures & Atmospheric Fresnel
  const textureLoader = new THREE.TextureLoader()
  const dayTexture = textureLoader.load('/textures/earth/earth_day.jpg')
  dayTexture.colorSpace = THREE.SRGBColorSpace
  const specularTexture = textureLoader.load('/textures/earth/earth_specular.jpg')
  const cloudsTexture = textureLoader.load('/textures/earth/earth_clouds.png')

  const realEarthGeo = new THREE.SphereGeometry(radius, 64, 64)
  realEarthMat = new THREE.MeshStandardMaterial({
    map: dayTexture,
    roughnessMap: specularTexture,
    roughness: 0.65,
    metalness: 0.08,
  })
  realEarthMesh = new THREE.Mesh(realEarthGeo, realEarthMat)
  realEarthMesh.visible = globeMode.value === 'real'
  earthMasterGroup.add(realEarthMesh)

  // Dynamic Cloud Layer
  const cloudsGeo = new THREE.SphereGeometry(radius * 1.01, 64, 64)
  cloudsMat = new THREE.MeshStandardMaterial({
    map: cloudsTexture,
    transparent: true,
    opacity: 0.8,
    blending: THREE.NormalBlending,
    depthWrite: false,
    roughness: 0.9,
  })
  cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat)
  cloudsMesh.visible = globeMode.value === 'real'
  earthMasterGroup.add(cloudsMesh)

  // Outer Atmospheric Fresnel Glow
  const atmosphereGeo = new THREE.SphereGeometry(radius * 1.034, 64, 64)
  atmosphereMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    uniforms: {
      uAtmosphereColor: { value: new THREE.Color(0x38bdf8) },
      uSunDirection: { value: new THREE.Vector3(6, 4, 5).normalize() },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vWorldNormal;
      varying vec3 vViewPosition;
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        vNormal = normalize(normalMatrix * normal);
        vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      varying vec3 vWorldNormal;
      varying vec3 vViewPosition;
      uniform vec3 uAtmosphereColor;
      uniform vec3 uSunDirection;
      void main() {
        vec3 viewDir = normalize(vViewPosition);
        float edgeAlpha = clamp(dot(vNormal, viewDir) / 0.28, 0.0, 1.0);
        float intensity = pow(edgeAlpha, 1.8);
        vec3 outwardNormal = -vWorldNormal;
        float sunDot = dot(outwardNormal, uSunDirection);
        float dayFactor = clamp(sunDot * 0.7 + 0.35, 0.18, 1.0);
        vec3 daySky = uAtmosphereColor;
        vec3 sunset = vec3(0.98, 0.46, 0.22);
        float twilightBand = smoothstep(0.28, -0.15, sunDot) * smoothstep(-0.45, 0.1, sunDot);
        vec3 col = mix(daySky, sunset, twilightBand * 0.65);
        gl_FragColor = vec4(col, intensity * dayFactor * 1.25);
      }
    `,
  })
  atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat)
  atmosphereMesh.visible = globeMode.value === 'real'
  earthMasterGroup.add(atmosphereMesh)

  // Datum Orbital Reticle Rings
  datumRings = []
  const ring1Geo = new THREE.TorusGeometry(radius * 1.18, 0.005, 16, 64)
  const ring1Mat = new THREE.MeshBasicMaterial({
    color: 0x94a3b8,
    transparent: true,
    opacity: 0.3,
  })
  const ring1 = new THREE.Mesh(ring1Geo, ring1Mat)
  ring1.rotation.x = Math.PI / 2
  earthMasterGroup.add(ring1)
  datumRings.push(ring1)

  const ring2Geo = new THREE.TorusGeometry(radius * 1.24, 0.005, 16, 64)
  const ring2Mat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.25,
  })
  const ring2 = new THREE.Mesh(ring2Geo, ring2Mat)
  ring2.rotation.y = Math.PI / 3
  earthMasterGroup.add(ring2)
  datumRings.push(ring2)
}

function buildProjectPreviews() {
  projectNodes.length = 0

  const isMob = isMobile.value
  const cardWidth = isMob ? 1.25 : 1.40
  const cardHeight = isMob ? 0.73 : 0.82
  const cardDepth = 0.010
  const cardGeo = new THREE.BoxGeometry(cardWidth, cardHeight, cardDepth)

  const list = isMob
    ? [
        {
          ...projectPreviews[0],
          offset: [-1.25, -1.15, 0.35] as [number, number, number],
          rotation: [0.02, 0.08, 0] as [number, number, number],
        },
        {
          ...projectPreviews[1],
          offset: [1.25, 1.15, 0.35] as [number, number, number],
          rotation: [-0.02, -0.08, 0] as [number, number, number],
        },
      ]
    : projectPreviews

  list.forEach((proj, idx) => {
    const nodeGroup = new THREE.Group()

    const defaultTexture = createProjectCardTexture(proj, 'default', idx)
    const hoverTexture = createProjectCardTexture(proj, 'hover', idx)
    const activeTexture = createProjectCardTexture(proj, 'active', idx)

    const edgeMat = new THREE.MeshBasicMaterial({
      color: 0x070b12,
      transparent: true,
      opacity: 0.85,
    })
    const backMat = new THREE.MeshBasicMaterial({
      color: 0x030508,
      transparent: true,
      opacity: 0.75,
    })
    const frontMat = new THREE.MeshStandardMaterial({
      map: defaultTexture,
      roughness: 0.5,
      metalness: 0.15,
      transparent: true,
      opacity: 0.94,
    })

    const materials = [edgeMat, edgeMat, edgeMat, edgeMat, frontMat, backMat]
    const mesh = new THREE.Mesh(cardGeo, materials)
    mesh.userData = { projectId: proj.id }
    nodeGroup.add(mesh)

    const baseOffset = new THREE.Vector3(...proj.offset)
    const baseRotation = new THREE.Euler(...proj.rotation)
    nodeGroup.position.copy(baseOffset)
    nodeGroup.rotation.copy(baseRotation)

    // Orbital surface anchor ring on the globe
    const earthRadius = isMob ? 1.05 : 1.35
    const dir = baseOffset.clone().normalize()
    const anchorPos = dir.clone().multiplyScalar(earthRadius * 1.004)
    const anchorGeo = new THREE.RingGeometry(0.02, 0.038, 24)
    const anchorMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
    })
    const anchorMesh = new THREE.Mesh(anchorGeo, anchorMat)
    anchorMesh.position.copy(anchorPos)
    anchorMesh.lookAt(anchorPos.clone().add(dir))
    installationMasterGroup!.add(anchorMesh)

    installationMasterGroup!.add(nodeGroup)

    projectNodes.push({
      project: proj,
      group: nodeGroup,
      mesh,
      defaultTexture,
      hoverTexture,
      activeTexture,
      baseOffset,
      baseRotation,
      anchorMesh,
    })
  })
}

function buildDomainLayers() {
  domainNodes.length = 0

  const isMob = isMobile.value
  if (isMob) return // On small screens, hide background domain badges to maintain clean focus

  const badgeWidth = 1.15
  const badgeHeight = 0.36
  const badgeDepth = 0.006
  const badgeGeo = new THREE.BoxGeometry(badgeWidth, badgeHeight, badgeDepth)

  engineeringDomains.forEach((domain, idx) => {
    const nodeGroup = new THREE.Group()

    const defaultTexture = createDomainBadgeTexture(domain.label, domain.code, domain.description, 'default', idx)
    const hoverTexture = createDomainBadgeTexture(domain.label, domain.code, domain.description, 'hover', idx)

    const sideMat = new THREE.MeshBasicMaterial({ color: 0x04070c, transparent: true, opacity: 0.65 })
    const frontMat = new THREE.MeshStandardMaterial({
      map: defaultTexture,
      roughness: 0.55,
      metalness: 0.1,
      transparent: true,
      opacity: 0.78, // Subtle background layer
    })
    const materials = [sideMat, sideMat, sideMat, sideMat, frontMat, sideMat]

    const mesh = new THREE.Mesh(badgeGeo, materials)
    mesh.userData = { domainId: domain.id }
    nodeGroup.add(mesh)

    const baseOffset = new THREE.Vector3(...domain.offset)
    nodeGroup.position.copy(baseOffset)
    nodeGroup.rotation.set(...domain.normal)

    installationMasterGroup!.add(nodeGroup)

    domainNodes.push({
      domain,
      group: nodeGroup,
      mesh,
      defaultTexture,
      hoverTexture,
      baseOffset,
    })
  })
}

function buildConnectorConduits() {
  const totalConduits = projectNodes.length
  if (totalConduits === 0) return

  connectorPositions = new Float32Array(totalConduits * 6)

  const lineGeo = new THREE.BufferGeometry()
  lineGeo.setAttribute('position', new THREE.BufferAttribute(connectorPositions, 3))

  const lineMat = new THREE.LineBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.14,
  })

  connectorLinesMesh = new THREE.LineSegments(lineGeo, lineMat)
  installationMasterGroup!.add(connectorLinesMesh)
}

function updateConnectorConduits() {
  if (!connectorPositions || !connectorLinesMesh) return

  let offset = 0
  const earthRadius = isMobile.value ? 1.05 : 1.35
  let hasHoveredNode = false

  for (const node of projectNodes) {
    const isHovered = (hoveredProject.value?.id === node.project.id) || (selectedProject.value?.id === node.project.id)
    if (isHovered) hasHoveredNode = true

    const target = node.group.position
    const dir = target.clone().normalize()
    const start = dir.clone().multiplyScalar(earthRadius * 1.006)

    connectorPositions[offset] = start.x
    connectorPositions[offset + 1] = start.y
    connectorPositions[offset + 2] = start.z

    // Connect neatly to inner boundary of card
    const end = target.clone().sub(dir.clone().multiplyScalar(0.08))
    connectorPositions[offset + 3] = end.x
    connectorPositions[offset + 4] = end.y
    connectorPositions[offset + 5] = end.z

    offset += 6

    if (node.anchorMesh) {
      const anchorMat = node.anchorMesh.material as THREE.MeshBasicMaterial
      anchorMat.opacity = isHovered ? 0.85 : 0.28
      const s = isHovered ? 1.25 : 1.0
      node.anchorMesh.scale.set(s, s, s)
    }
  }

  const attr = connectorLinesMesh.geometry.getAttribute('position') as THREE.BufferAttribute
  attr.needsUpdate = true

  const lineMat = connectorLinesMesh.material as THREE.LineBasicMaterial
  lineMat.opacity = hasHoveredNode ? 0.38 : 0.14
}

function buildStarfield() {
  const count = 1600
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {
    const r = 12 + Math.random() * 18
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1) - Math.PI / 2

    positions[i * 3] = r * Math.cos(phi) * Math.cos(theta)
    positions[i * 3 + 1] = r * Math.sin(phi)
    positions[i * 3 + 2] = r * Math.cos(phi) * Math.sin(theta)

    const cChoice = Math.random()
    if (cChoice < 0.65) {
      colors[i * 3] = 0.85; colors[i * 3 + 1] = 0.92; colors[i * 3 + 2] = 1.0
    } else if (cChoice < 0.85) {
      colors[i * 3] = 0.45; colors[i * 3 + 1] = 0.75; colors[i * 3 + 2] = 1.0
    } else {
      colors[i * 3] = 0.98; colors[i * 3 + 1] = 0.72; colors[i * 3 + 2] = 0.45
    }
  }

  const starGeo = new THREE.BufferGeometry()
  starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const starMat = new THREE.PointsMaterial({
    size: 0.042,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
  })

  const stars = new THREE.Points(starGeo, starMat)
  scene!.add(stars)
}

function updateProjectNodes(delta: number, time: number) {
  projectNodes.forEach((node, idx) => {
    const isHovered = (hoveredProject.value?.id === node.project.id)
    const isSelected = (selectedProject.value?.id === node.project.id)
    const targetPos = node.baseOffset.clone()

    if (!prefersReducedMotion.value) {
      targetPos.y += Math.sin(time * 0.70 + idx * 1.4) * 0.02
      targetPos.x += Math.cos(time * 0.55 + idx * 1.1) * 0.012
    }

    if (isHovered || isSelected) {
      targetPos.z += 0.18
    }

    node.group.position.lerp(targetPos, delta * 5.0)

    const targetScale = (isHovered || isSelected) ? 1.03 : 1.0
    node.group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 5.0)

    const frontMat = (node.mesh.material as THREE.Material[])[4] as THREE.MeshStandardMaterial
    frontMat.map = isSelected
      ? node.activeTexture
      : (isHovered ? node.hoverTexture : node.defaultTexture)
    frontMat.needsUpdate = true
  })
}

function updateDomainNodes(delta: number, time: number) {
  domainNodes.forEach((node, idx) => {
    const isHovered = hoveredDomainId.value === node.domain.id
    const targetPos = node.baseOffset.clone()
    if (!prefersReducedMotion.value) {
      targetPos.y += Math.sin(time * 0.60 + idx * 1.3) * 0.015
    }
    if (isHovered) {
      targetPos.z += 0.12
    }
    node.group.position.lerp(targetPos, delta * 4.5)

    const frontMat = (node.mesh.material as THREE.Material[])[4] as THREE.MeshStandardMaterial
    frontMat.map = isHovered ? node.hoverTexture : node.defaultTexture
    frontMat.needsUpdate = true
  })
}

function updateInspectionLayout(delta: number) {
  const isExpanded = inspectionMode.value === 'expanded'
  const expandFactor = isExpanded ? 1.35 : 1.0

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
    targetCamX = mouse.x * 0.22
    targetCamY = mouse.y * 0.16
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
    raycaster.setFromCamera(mouse, camera)
    const projectMeshes = projectNodes.map(n => n.mesh)
    const domainMeshes = domainNodes.map(n => n.mesh)
    const allMeshes = [...projectMeshes, ...domainMeshes]
    const intersects = raycaster.intersectObjects(allMeshes)

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object
      const projId = hitMesh.userData.projectId
      const domainId = hitMesh.userData.domainId

      if (projId) {
        const found = projectPreviews.find(p => p.id === projId)
        if (found) {
          hoveredProject.value = found
          hoveredDomainId.value = null
          if (canvas.value) canvas.value.style.cursor = 'pointer'
          return
        }
      } else if (domainId) {
        hoveredDomainId.value = domainId
        hoveredProject.value = null
        if (canvas.value) canvas.value.style.cursor = 'default'
        return
      }
    }

    hoveredProject.value = null
    hoveredDomainId.value = null
    if (canvas.value) canvas.value.style.cursor = isDragging ? 'grabbing' : 'grab'
  }
}

function onPointerUp(e: PointerEvent) {
  if (isDragging) {
    const dist = Math.hypot(e.clientX - touchStartX, e.clientY - touchStartY)
    if (dist < 8 && camera) {
      raycaster.setFromCamera(mouse, camera)
      const meshes = projectNodes.map(n => n.mesh)
      const intersects = raycaster.intersectObjects(meshes)
      if (intersects.length > 0) {
        const hitMesh = intersects[0].object
        const projId = hitMesh.userData.projectId
        const found = projectPreviews.find(p => p.id === projId)
        if (found) {
          if (isMobile.value) {
            selectedProject.value = found
          } else {
            openProjectLink(found)
          }
        }
      }
    }
  }
  isDragging = false
  gestureIntent = 'undecided'
}

function handleResize() {
  if (!canvas.value || !camera || !renderer) return
  const parent = canvas.value.parentElement || container.value
  const width = parent?.clientWidth || window.innerWidth
  const height = parent?.clientHeight || window.innerHeight

  const mob = width < 640

  camera.aspect = width / height
  camera.updateProjectionMatrix()
  const targetDist = mob ? (isSmallMobile.value ? 7.6 : 7.0) : 6.3
  camera.position.z = targetDist
  renderer.setSize(width, height)

  const groupCenterX = mob ? 0.0 : 1.45
  const groupCenterY = mob ? 0.0 : -0.1
  if (installationMasterGroup) {
    installationMasterGroup.position.set(groupCenterX, groupCenterY, 0)
    installationMasterGroup.scale.setScalar(mob ? (isSmallMobile.value ? 0.85 : 0.95) : 1.0)
  }
}

onMounted(() => {
  initThree()

  if (container.value) {
    observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting
    }, { threshold: 0.1 })
    observer.observe(container.value)

    window.addEventListener('resize', handleResize, { passive: true })
  }
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animFrameId)
  observer?.disconnect()
  window.removeEventListener('resize', handleResize)

  if (scene) {
    scene.traverse(obj => {
      if (obj instanceof THREE.Mesh || obj instanceof THREE.Line || obj instanceof THREE.Points) {
        obj.geometry?.dispose()
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose())
        } else if (obj.material) {
          obj.material.dispose()
        }
      }
    })
  }

  renderer?.dispose()
})
</script>

<style scoped>
.hero-digital-core-scene {
  background: radial-gradient(circle at 60% 50%, #060b14 0%, #03060b 75%, #010204 100%);
}

.gallery-ambient-vignette {
  background: radial-gradient(circle at 60% 50%, transparent 35%, rgba(3, 6, 11, 0.45) 75%, rgba(3, 6, 11, 0.85) 100%);
}

.showcase-glow-dark {
  background: radial-gradient(circle at 60% 50%, rgba(56, 189, 248, 0.06) 0%, transparent 65%);
}

.showcase-glow-light {
  background: radial-gradient(circle at 60% 50%, rgba(59, 130, 246, 0.08) 0%, transparent 70%);
}

.showcase-grid-dark {
  background-size: 36px 36px;
  background-image:
    linear-gradient(to right, rgba(255, 255, 255, 0.18) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.18) 1px, transparent 1px);
}
</style>
