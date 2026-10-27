<template>
  <div
    ref="container"
    class="hero-constellation-scene relative w-full h-full select-none overflow-hidden bg-[#020307] flex flex-col justify-between md:block px-4 sm:px-5 pt-[max(4.25rem,calc(env(safe-area-inset-top)+3.5rem))] pb-[max(4.5rem,calc(env(safe-area-inset-bottom)+3.5rem))] md:p-0"
  >
    <!-- Deep Cosmic Ambient Glow & Vignette -->
    <div class="pointer-events-none absolute inset-0 cosmic-deep-glow" aria-hidden="true"></div>
    <div class="pointer-events-none absolute inset-0 opacity-[0.035] space-celestial-grid" aria-hidden="true"></div>
    <div class="pointer-events-none absolute inset-0 gallery-ambient-vignette" aria-hidden="true"></div>

    <!-- 1. 3D Canvas Stage (Responsive Viewport) -->
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
        @wheel="onWheel"
      ></canvas>

      <!-- WebGL Fallback -->
      <div
        v-if="!isWebGLSupported"
        class="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-zinc-950/90 text-zinc-300"
      >
        <div class="w-16 h-16 rounded-full border border-sky-400/40 flex items-center justify-center text-sky-400 mb-2">
          ◉
        </div>
        <p class="font-mono text-xs font-semibold">CONSTELLATION UNIVERSE</p>
        <p class="text-[11px] text-zinc-400 mt-1">Cross-platform Flutter & Systems Architecture</p>
      </div>

      <!-- Subtle Mobile Touch Hint (Auto-fades on first user touch) -->
      <Transition name="fade">
        <div
          v-if="!hasInteracted && isMobile"
          class="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full bg-black/85 border border-white/10 text-zinc-300 font-mono text-[9px] tracking-widest uppercase backdrop-blur-md whitespace-nowrap shadow-lg flex items-center gap-1.5"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
          <span>↔ DRAG SPACE TO EXPLORE CONSTELLATION</span>
        </div>
      </Transition>

      <!-- Reset View Control (Top right of canvas) -->
      <button
        type="button"
        class="pointer-events-auto absolute top-3 right-3 z-20 w-7 h-7 rounded-full bg-black/60 hover:bg-white/15 border border-white/15 text-zinc-300 hover:text-white flex items-center justify-center font-mono text-xs backdrop-blur-md transition active:scale-95 cursor-pointer shadow-md"
        @click="resetView"
        title="Reset Constellation Orientation"
        aria-label="Reset 3D camera and rotation"
      >
        ↻
      </button>
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
                  ? 'bg-sky-500/20 text-white border-sky-400/50 shadow-[0_0_12px_rgba(56,189,248,0.3)] font-semibold'
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
                  ? 'bg-sky-500/20 text-white border-sky-400/50 shadow-[0_0_12px_rgba(56,189,248,0.3)] font-semibold'
                  : 'bg-black/50 text-zinc-400 hover:text-white border-white/10'
              "
              @click="setInspectionMode('expanded')"
            >
              EXPLODED
            </button>
          </div>

          <div class="flex items-center gap-1.5 font-mono text-[9px] text-zinc-400">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"></span>
            <span>STELLAR ONLINE</span>
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

        <!-- Interactive Constellation Layer Switcher -->
        <div class="pt-2 pointer-events-auto flex items-center gap-2">
          <span class="font-mono text-[9px] uppercase tracking-widest text-zinc-400 font-medium">
            STELLAR ORBIT:
          </span>
          <button
            type="button"
            class="px-2.5 py-1 rounded-md text-[9.5px] font-mono tracking-wider transition-all cursor-pointer border"
            :class="
              inspectionMode === 'assembled'
                ? 'bg-sky-500/20 text-white border-sky-400/50 shadow-[0_0_12px_rgba(56,189,248,0.3)] font-semibold'
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
                ? 'bg-sky-500/20 text-white border-sky-400/50 shadow-[0_0_12px_rgba(56,189,248,0.3)] font-semibold'
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
              CONSTELLATION SYSTEM // ONLINE
            </span>
            <span class="text-sky-400 font-mono text-[8.5px]">STELLAR TELEMETRY</span>
          </div>
          <div class="flex items-center justify-between text-[8.5px] text-zinc-400 pt-0.5">
            <span>CROSS-PLATFORM ENGINEERING UNIVERSE</span>
            <span class="text-zinc-500">DRAG SPACE TO EXPLORE ↔</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 4. Active Hovered Star Tooltip / Action Card (Desktop & Mobile) -->
    <Transition name="fade">
      <div
        v-if="hoveredStar && !isMobile"
        class="pointer-events-auto absolute z-30 bottom-8 right-8 max-w-xs p-4 rounded-xl border bg-black/90 backdrop-blur-md shadow-2xl space-y-2.5 select-none"
        :style="{
          borderColor: hoveredStar.color,
          boxShadow: `0 12px 32px rgba(0, 0, 0, 0.8), 0 0 20px ${hoveredStar.color}25`
        }"
      >
        <div class="flex items-center justify-between text-[8.5px] font-mono text-zinc-400">
          <span class="font-semibold flex items-center gap-1.5" :style="{ color: hoveredStar.color }">
            <span class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: hoveredStar.color }"></span>
            {{ hoveredStar.category === 'nexus' ? 'NEXUS ANCHOR' : hoveredStar.category === 'project' ? 'FEATURED PROJECT' : 'ENGINEERING PILLAR' }}
          </span>
          <span class="text-zinc-500 font-mono">SYS // ACTIVE</span>
        </div>

        <div class="space-y-0.5">
          <h3 class="text-base font-bold text-white tracking-tight">
            {{ hoveredStar.name }}
          </h3>
          <p class="text-[10px] font-mono" :style="{ color: hoveredStar.color }">
            {{ hoveredStar.role }}
          </p>
        </div>

        <p class="text-[11.5px] text-zinc-300 leading-relaxed font-sans line-clamp-3">
          {{ hoveredStar.desc }}
        </p>

        <div class="pt-2 flex items-center justify-between font-mono text-[9px] border-t border-white/10">
          <span class="text-zinc-500">STELLAR TARGET</span>
          <button
            v-if="hoveredStar.link"
            type="button"
            class="transition-colors flex items-center gap-1 font-semibold uppercase cursor-pointer hover:text-white"
            :style="{ color: hoveredStar.color }"
            @click="openStarLink(hoveredStar)"
          >
            <span>EXPLORE PROJECT ↗</span>
          </button>
          <button
            v-else-if="hoveredStar.category === 'project'"
            type="button"
            class="text-sky-400 hover:text-white transition-colors flex items-center gap-1 font-semibold uppercase cursor-pointer"
            @click="navigateToProjects"
          >
            <span>VIEW IN PROJECTS →</span>
          </button>
          <button
            v-else
            type="button"
            class="text-sky-400 hover:text-white transition-colors flex items-center gap-1 font-semibold uppercase cursor-pointer"
            @click="navigateToSkills"
          >
            <span>EXPLORE SKILLS →</span>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Compact Mobile Star Detail Panel -->
    <Transition name="fade">
      <div
        v-if="selectedStar && isMobile"
        class="pointer-events-auto absolute bottom-4 left-4 right-4 z-40 p-3.5 rounded-xl border bg-black/95 backdrop-blur-md shadow-2xl space-y-2 select-none"
        :style="{
          borderColor: selectedStar.color,
          boxShadow: `0 10px 28px rgba(0, 0, 0, 0.9), 0 0 16px ${selectedStar.color}30`
        }"
      >
        <div class="flex items-center justify-between text-[9px] font-mono text-zinc-400">
          <span class="font-semibold flex items-center gap-1.5" :style="{ color: selectedStar.color }">
            <span class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: selectedStar.color }"></span>
            {{ selectedStar.category === 'nexus' ? 'NEXUS ANCHOR' : selectedStar.category === 'project' ? 'FEATURED PROJECT' : 'ENGINEERING PILLAR' }}
          </span>
          <button
            type="button"
            class="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 flex items-center justify-center text-xs cursor-pointer"
            @click="selectedStar = null"
            aria-label="Dismiss star preview"
          >
            ✕
          </button>
        </div>
        <div class="space-y-0.5">
          <h3 class="text-sm font-semibold text-white tracking-tight">
            {{ selectedStar.name }}
          </h3>
          <p class="text-[10px] font-mono" :style="{ color: selectedStar.color }">
            {{ selectedStar.role }}
          </p>
          <p class="text-[11px] text-zinc-300 line-clamp-2 leading-relaxed">
            {{ selectedStar.desc }}
          </p>
        </div>
        <div class="pt-1.5 flex items-center justify-between border-t border-white/10">
          <span class="text-[9px] font-mono text-zinc-500">NODE DISPATCH</span>
          <button
            v-if="selectedStar.link"
            type="button"
            class="text-[10px] font-mono flex items-center gap-1 font-semibold uppercase cursor-pointer"
            :style="{ color: selectedStar.color }"
            @click="openStarLink(selectedStar)"
          >
            <span>OPEN PROJECT ↗</span>
          </button>
          <button
            v-else
            type="button"
            class="text-[10px] font-mono text-sky-400 hover:text-white flex items-center gap-1 font-semibold uppercase cursor-pointer"
            @click="navigateToProjects"
          >
            <span>VIEW PROJECTS →</span>
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
import { setSection, markSectionReady } from '@/composables/useShowcase'
import { useResponsive3D } from '@/composables/useResponsive3D'
import {
  createStarSpriteTexture,
  createGasGiantTexture,
} from '../skills/constellationData'

const { isMobile, pixelRatio, prefersReducedMotion, checkWebGLSupport } = useResponsive3D()

const container = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const isWebGLSupported = ref(checkWebGLSupport())
const hasInteracted = ref(false)

// Inspection mode: assembled (compact core) vs expanded (spread out stellar field)
type InspectionMode = 'assembled' | 'expanded'
const inspectionMode = ref<InspectionMode>('assembled')

function setInspectionMode(mode: InspectionMode) {
  inspectionMode.value = mode
  targetConstellationScale = mode === 'expanded' ? 1.30 : 0.88
}

function navigateToProjects() {
  setSection('projects')
}

function navigateToContact() {
  setSection('contact')
}

function navigateToSkills() {
  setSection('skills')
}

function resetView() {
  targetRotX = 0
  targetRotY = 0
  targetCameraZ = 5.6
}

// -------------------------------------------------------------
// HERO CONSTELLATION DATA DEFINITION
// -------------------------------------------------------------
export interface HeroStarNode {
  id: string
  name: string
  category: 'nexus' | 'pillar' | 'project'
  role: string
  desc: string
  basePos: [number, number, number]
  magnitude: number
  color: string
  link?: string
}

const HERO_STARS: HeroStarNode[] = [
  // Central Luminous Anchor Star
  {
    id: 'flutter-core',
    name: 'Flutter Core',
    category: 'nexus',
    role: 'Primary Architecture Anchor',
    desc: 'High-performance cross-platform reactive UI engine powering 60+ FPS native mobile, web, and desktop experiences with sound null-safety.',
    basePos: [0.0, 0.0, 0.0],
    magnitude: 1.6,
    color: '#38bdf8',
  },

  // 4 Core Engineering Capability Pillars
  {
    id: 'clean-arch',
    name: 'Clean Architecture',
    category: 'pillar',
    role: 'State Isolation & Domain Layers',
    desc: 'Decoupled domain use cases, reactive BLoC & Riverpod state machines, and dependency injection trees for test-driven modularity.',
    basePos: [-2.2, 1.35, 0.35],
    magnitude: 1.25,
    color: '#38bdf8',
  },
  {
    id: 'ui-craft',
    name: 'UI / UX Craft',
    category: 'pillar',
    role: 'Motion & Fluid Design Systems',
    desc: 'Bespoke micro-interactions, custom Canvas shaders, responsive spatial typography, and sub-frame layout orchestration.',
    basePos: [2.15, 1.25, -0.3],
    magnitude: 1.22,
    color: '#06b6d4',
  },
  {
    id: 'cross-platform',
    name: 'Cross-Platform',
    category: 'pillar',
    role: 'Unified Multi-Target Systems',
    desc: 'Native compilation pipelines sharing 90%+ code logic across iOS, Android, macOS desktop, and responsive Web clients.',
    basePos: [-1.85, -1.5, 0.45],
    magnitude: 1.2,
    color: '#6366f1',
  },
  {
    id: 'perf-apis',
    name: 'APIs & Performance',
    category: 'pillar',
    role: 'Isolates & Network Pipelines',
    desc: 'Low-latency isolate compute threads, zero-copy buffer streaming, offline-first local cache synchronization, and FFI interop.',
    basePos: [1.95, -1.45, -0.35],
    magnitude: 1.2,
    color: '#818cf8',
  },

  // 3 Featured Project Stars
  {
    id: 'valthub',
    name: 'ValtHub',
    category: 'project',
    role: 'Secrets & Environment Platform',
    desc: 'Developer-first platform for cryptographic secret orchestration, ephemeral tokens, and synchronized cloud environment variables.',
    basePos: [3.5, 0.25, 0.6],
    magnitude: 1.15,
    color: '#38bdf8',
    link: 'https://valthub.pages.dev/',
  },
  {
    id: 'iziloh',
    name: 'IZILOH',
    category: 'project',
    role: 'On-Demand Laundry SuperApp',
    desc: 'Nationwide marketplace connecting customers with local laundromats, featuring real-time courier telemetry and secure payments.',
    basePos: [-3.4, -0.2, -0.65],
    magnitude: 1.15,
    color: '#22d3ee',
    link: 'https://iziloh.com/',
  },
  {
    id: 'waroong',
    name: 'Waroong Retjeh',
    category: 'project',
    role: 'POS & Dining Ecosystem',
    desc: 'High-throughput offline-first restaurant point-of-sale and table reservation mobile application with real-time cloud reconciliation.',
    basePos: [0.2, 2.7, -0.55],
    magnitude: 1.15,
    color: '#a855f7',
    link: 'http://waroongretjeh.dev.ittron.co.id/',
  },
]

// Constellation edges linking stars together
const HERO_EDGES: [string, string][] = [
  // Anchor to 4 Pillars
  ['flutter-core', 'clean-arch'],
  ['flutter-core', 'ui-craft'],
  ['flutter-core', 'cross-platform'],
  ['flutter-core', 'perf-apis'],

  // Ring linking pillars together
  ['clean-arch', 'ui-craft'],
  ['ui-craft', 'perf-apis'],
  ['perf-apis', 'cross-platform'],
  ['cross-platform', 'clean-arch'],

  // Projects linked to relevant technical nodes
  ['valthub', 'ui-craft'],
  ['valthub', 'perf-apis'],
  ['iziloh', 'clean-arch'],
  ['iziloh', 'cross-platform'],
  ['waroong', 'clean-arch'],
  ['waroong', 'ui-craft'],
]

const hoveredStar = ref<HeroStarNode | null>(null)
const selectedStar = ref<HeroStarNode | null>(null)

function openStarLink(star: HeroStarNode) {
  if (star.link) {
    window.open(star.link, '_blank', 'noopener,noreferrer')
  } else if (star.category === 'project') {
    navigateToProjects()
  } else {
    navigateToSkills()
  }
}

// -------------------------------------------------------------
// THREE.JS 3D CONSTELLATION & DEEP SPACE UNIVERSE
// -------------------------------------------------------------
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let animFrameId = 0
let isVisible = true
let observer: IntersectionObserver | null = null

let spaceMasterGroup: THREE.Group | null = null
let constellationGroup: THREE.Group | null = null
let celestialPlanetMesh: THREE.Mesh | null = null
let planetaryRingMesh: THREE.Mesh | null = null

// Runtime representations
interface StarMeshRuntime {
  star: HeroStarNode
  group: THREE.Group
  spriteMesh: THREE.Sprite
  glowRing: THREE.Mesh
  hitMesh: THREE.Mesh
  baseScale: number
}
const starRuntimes: StarMeshRuntime[] = []
const pickableObjects: THREE.Mesh[] = []

interface LineMeshRuntime {
  u: HeroStarNode
  v: HeroStarNode
  lineMesh: THREE.Line
  baseColor: number
}
const lineRuntimes: LineMeshRuntime[] = []

// Interactive Orbit & Rotation State
let isDragging = false
let previousPointerPos = { x: 0, y: 0 }
let rotX = 0
let rotY = 0
let targetRotX = 0
let targetRotY = 0

let currentConstellationScale = 0.88
let targetConstellationScale = 0.88

let currentCameraZ = 5.6
let targetCameraZ = 5.6

// Raycasting
const raycaster = new THREE.Raycaster()
const pointerNormalized = new THREE.Vector2(-999, -999)

function initThreeScene() {
  if (!canvas.value || !container.value) return

  const rect = container.value.getBoundingClientRect()
  const width = Math.max(rect.width, 320)
  const height = Math.max(rect.height, 240)

  // 1. Scene
  scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x020307, 0.038)

  // 2. Camera
  camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 80)
  camera.position.set(0, 0, currentCameraZ)
  camera.lookAt(0, 0, 0)

  // 3. Renderer
  renderer = new THREE.WebGLRenderer({
    canvas: canvas.value,
    antialias: !isMobile.value,
    alpha: true,
    powerPreference: 'high-performance',
  })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(pixelRatio.value, 2))
  renderer.setClearColor(0x020307, 0)

  // 4. Master Groups
  spaceMasterGroup = new THREE.Group()
  scene.add(spaceMasterGroup)

  constellationGroup = new THREE.Group()
  spaceMasterGroup.add(constellationGroup)

  // 5. Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)

  const keySunLight = new THREE.DirectionalLight(0xe0f2fe, 1.8)
  keySunLight.position.set(6, 4, 8)
  scene.add(keySunLight)

  const cyanRimLight = new THREE.DirectionalLight(0x38bdf8, 1.2)
  cyanRimLight.position.set(-6, -3, -4)
  scene.add(cyanRimLight)

  // 6. Build Deep Space Cosmos
  buildDeepSpaceCosmos()

  // 7. Build Single Distant Celestial Planet (matching Skills showcase)
  buildEnvironmentalPlanet()

  // 8. Build Constellation Stars & Edges
  buildConstellationStars()
  buildConstellationLines()

  // 9. Start Rendering Loop
  startRenderLoop()
}

function buildEnvironmentalPlanet() {
  if (!spaceMasterGroup) return

  // Single Majestic Ringed Celestial Body in the distant background (z = -8.5)
  const planetGeo = new THREE.SphereGeometry(1.35, 48, 48)
  const planetMat = new THREE.MeshStandardMaterial({
    map: createGasGiantTexture(),
    roughness: 0.65,
    metalness: 0.15,
  })
  celestialPlanetMesh = new THREE.Mesh(planetGeo, planetMat)
  celestialPlanetMesh.position.set(6.8, 3.4, -8.5)
  spaceMasterGroup.add(celestialPlanetMesh)

  // Subtle Atmospheric Fresnel Rim Glow
  const atmosGeo = new THREE.SphereGeometry(1.41, 32, 32)
  const atmosMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.15,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
  })
  const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat)
  celestialPlanetMesh.add(atmosMesh)

  // Delicate Planetary Ring
  const ringGeo = new THREE.RingGeometry(1.7, 2.55, 64)
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.2,
    side: THREE.DoubleSide,
  })
  planetaryRingMesh = new THREE.Mesh(ringGeo, ringMat)
  planetaryRingMesh.rotation.x = Math.PI / 2.3
  planetaryRingMesh.rotation.y = 0.25
  celestialPlanetMesh.add(planetaryRingMesh)
}

function buildDeepSpaceCosmos() {
  if (!scene) return

  // 1. Distant Starfield (1,200 pinprick stars)
  const count = 1200
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {
    const r = 12 + Math.random() * 24
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1) - Math.PI / 2

    positions[i * 3] = r * Math.cos(phi) * Math.cos(theta)
    positions[i * 3 + 1] = r * Math.sin(phi)
    positions[i * 3 + 2] = r * Math.cos(phi) * Math.sin(theta)

    const cChoice = Math.random()
    if (cChoice > 0.75) {
      colors[i * 3] = 0.35; colors[i * 3 + 1] = 0.75; colors[i * 3 + 2] = 0.98
    } else if (cChoice > 0.5) {
      colors[i * 3] = 0.65; colors[i * 3 + 1] = 0.55; colors[i * 3 + 2] = 0.95
    } else {
      colors[i * 3] = 0.82; colors[i * 3 + 1] = 0.88; colors[i * 3 + 2] = 0.96
    }
  }

  const starGeo = new THREE.BufferGeometry()
  starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const starMat = new THREE.PointsMaterial({
    size: 0.045,
    vertexColors: true,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending,
  })

  const deepStars = new THREE.Points(starGeo, starMat)
  scene.add(deepStars)

  // 2. Subtle Cosmic Dust / Nebula Particles
  const dustCount = 180
  const dustPos = new Float32Array(dustCount * 3)
  for (let i = 0; i < dustCount; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 22
    dustPos[i * 3 + 1] = (Math.random() - 0.5) * 16
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * 16 - 2
  }
  const dustGeo = new THREE.BufferGeometry()
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3))
  const dustMat = new THREE.PointsMaterial({
    color: 0x38bdf8,
    size: 0.07,
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending,
  })
  scene.add(new THREE.Points(dustGeo, dustMat))
}

function buildConstellationStars() {
  if (!constellationGroup) return

  starRuntimes.length = 0
  pickableObjects.length = 0

  const ringGeo = new THREE.RingGeometry(0.14, 0.17, 32)

  HERO_STARS.forEach((star) => {
    const nodeGroup = new THREE.Group()
    nodeGroup.position.set(...star.basePos)
    constellationGroup!.add(nodeGroup)

    // Luminous Star Sprite
    const texture = createStarSpriteTexture(star.color)
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      color: 0xffffff,
      transparent: true,
      opacity: 0.94,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const spriteMesh = new THREE.Sprite(spriteMat)
    const baseScale = 0.44 * star.magnitude
    spriteMesh.scale.set(baseScale, baseScale, 1)
    spriteMesh.userData = { id: star.id }
    nodeGroup.add(spriteMesh)

    // Ring target reticle for hover/active state
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(star.color),
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    })
    const glowRing = new THREE.Mesh(ringGeo, ringMat)
    glowRing.visible = false
    nodeGroup.add(glowRing)

    // Invisible larger hit sphere for effortless touch/click targeting
    const hitGeo = new THREE.SphereGeometry(0.3, 8, 8)
    const hitMat = new THREE.MeshBasicMaterial({ visible: false })
    const hitMesh = new THREE.Mesh(hitGeo, hitMat)
    hitMesh.userData = { id: star.id }
    nodeGroup.add(hitMesh)
    pickableObjects.push(hitMesh)

    starRuntimes.push({
      star,
      group: nodeGroup,
      spriteMesh,
      glowRing,
      hitMesh,
      baseScale,
    })
  })
}

function buildConstellationLines() {
  if (!constellationGroup) return

  lineRuntimes.length = 0

  HERO_EDGES.forEach(([uId, vId]) => {
    const u = HERO_STARS.find((s) => s.id === uId)
    const v = HERO_STARS.find((s) => s.id === vId)
    if (!u || !v) return

    const points = [
      new THREE.Vector3(...u.basePos),
      new THREE.Vector3(...v.basePos),
    ]
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points)

    const isNexusLine = u.category === 'nexus' || v.category === 'nexus'
    const lineColor = isNexusLine ? 0x38bdf8 : 0x0284c7

    const lineMat = new THREE.LineBasicMaterial({
      color: lineColor,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    })
    const lineMesh = new THREE.Line(lineGeo, lineMat)
    constellationGroup!.add(lineMesh)

    lineRuntimes.push({
      u,
      v,
      lineMesh,
      baseColor: lineColor,
    })
  })
}

// -------------------------------------------------------------
// ANIMATION & INTERACTION FRAME LOOP
// -------------------------------------------------------------
function startRenderLoop() {
  const clock = new THREE.Clock()

  function animate(timestamp: number) {
    if (!isVisible) {
      animFrameId = requestAnimationFrame(animate)
      return
    }

    const delta = Math.min(clock.getDelta(), 0.1)

    // 1. Idle Gentle Stellar Rotation (when not dragging)
    if (!isDragging && !prefersReducedMotion.value) {
      targetRotY += delta * 0.08
    }

    // Smooth Damped Rotation
    rotX += (targetRotX - rotX) * (delta * 4.5)
    rotY += (targetRotY - rotY) * (delta * 4.5)

    if (constellationGroup) {
      constellationGroup.rotation.x = rotX
      constellationGroup.rotation.y = rotY
    }

    // 2. Smooth Constellation Scale Transition (Assembled vs Exploded)
    currentConstellationScale += (targetConstellationScale - currentConstellationScale) * (delta * 3.5)

    // Update node positions and line vertices
    starRuntimes.forEach((sr) => {
      sr.group.position.set(
        sr.star.basePos[0] * currentConstellationScale,
        sr.star.basePos[1] * currentConstellationScale,
        sr.star.basePos[2] * currentConstellationScale
      )

      // Animate active glow ring reticle
      if (sr.glowRing.visible) {
        sr.glowRing.rotation.z += delta * 1.5
        const pulse = 1.0 + Math.sin(timestamp * 0.005) * 0.08
        sr.glowRing.scale.set(pulse, pulse, pulse)
      }
    })

    lineRuntimes.forEach((lr) => {
      const posAttr = lr.lineMesh.geometry.getAttribute('position') as THREE.BufferAttribute
      if (posAttr) {
        posAttr.setXYZ(
          0,
          lr.u.basePos[0] * currentConstellationScale,
          lr.u.basePos[1] * currentConstellationScale,
          lr.u.basePos[2] * currentConstellationScale
        )
        posAttr.setXYZ(
          1,
          lr.v.basePos[0] * currentConstellationScale,
          lr.v.basePos[1] * currentConstellationScale,
          lr.v.basePos[2] * currentConstellationScale
        )
        posAttr.needsUpdate = true
      }
    })

    // 3. Smooth Camera Zoom (Mouse wheel)
    if (camera) {
      currentCameraZ += (targetCameraZ - currentCameraZ) * (delta * 4.0)
      camera.position.z = currentCameraZ
    }

    // 4. Distant Celestial Planet slow axial rotation
    if (celestialPlanetMesh) {
      celestialPlanetMesh.rotation.y += delta * 0.035
    }

    // 5. Render
    if (renderer && scene && camera) {
      renderer.render(scene, camera)
    }

    animFrameId = requestAnimationFrame(animate)
  }

  animFrameId = requestAnimationFrame(animate)
}

// -------------------------------------------------------------
// POINTER & DRAG CONTROLS
// -------------------------------------------------------------
function onPointerDown(e: PointerEvent) {
  isDragging = true
  hasInteracted.value = true
  previousPointerPos = { x: e.clientX, y: e.clientY }

  const rect = canvas.value?.getBoundingClientRect()
  if (!rect) return
  pointerNormalized.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
  pointerNormalized.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
}

function onPointerMove(e: PointerEvent) {
  const rect = canvas.value?.getBoundingClientRect()
  if (!rect || !camera) return

  pointerNormalized.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
  pointerNormalized.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

  if (isDragging) {
    const dx = e.clientX - previousPointerPos.x
    const dy = e.clientY - previousPointerPos.y
    previousPointerPos = { x: e.clientX, y: e.clientY }

    targetRotY += dx * 0.006
    targetRotX += dy * 0.005
    targetRotX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, targetRotX))
    return
  }

  // Hover Raycasting
  raycaster.setFromCamera(pointerNormalized, camera)
  const intersects = raycaster.intersectObjects(pickableObjects)

  if (intersects.length > 0) {
    const starId = intersects[0].object.userData.id
    const target = HERO_STARS.find((s) => s.id === starId) || null
    if (hoveredStar.value?.id !== target?.id) {
      hoveredStar.value = target
      updateHighlightState(target?.id || null)
    }
  } else if (hoveredStar.value) {
    hoveredStar.value = null
    updateHighlightState(null)
  }
}

function onPointerUp(e: PointerEvent) {
  if (!isDragging) return
  isDragging = false

  // Click detection if movement was minimal
  const dx = Math.abs(e.clientX - previousPointerPos.x)
  const dy = Math.abs(e.clientY - previousPointerPos.y)

  if (dx < 5 && dy < 5 && camera) {
    const rect = canvas.value?.getBoundingClientRect()
    if (!rect) return
    pointerNormalized.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    pointerNormalized.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

    raycaster.setFromCamera(pointerNormalized, camera)
    const intersects = raycaster.intersectObjects(pickableObjects)

    if (intersects.length > 0) {
      const starId = intersects[0].object.userData.id
      const target = HERO_STARS.find((s) => s.id === starId) || null
      selectedStar.value = target
      if (target) {
        updateHighlightState(target.id)
      }
    }
  }
}

function onWheel(e: WheelEvent) {
  e.preventDefault()
  targetCameraZ += e.deltaY * 0.003
  targetCameraZ = Math.max(4.0, Math.min(8.0, targetCameraZ))
}

function updateHighlightState(activeStarId: string | null) {
  starRuntimes.forEach((sr) => {
    const isTarget = sr.star.id === activeStarId
    sr.glowRing.visible = isTarget
    const mat = sr.spriteMesh.material as THREE.SpriteMaterial
    if (activeStarId) {
      mat.opacity = isTarget ? 1.0 : 0.65
    } else {
      mat.opacity = 0.94
    }
  })

  lineRuntimes.forEach((lr) => {
    const mat = lr.lineMesh.material as THREE.LineBasicMaterial
    if (!activeStarId) {
      mat.opacity = 0.35
      mat.color.setHex(lr.baseColor)
    } else if (lr.u.id === activeStarId || lr.v.id === activeStarId) {
      mat.opacity = 0.9
      mat.color.setHex(0x38bdf8)
    } else {
      mat.opacity = 0.12
      mat.color.setHex(lr.baseColor)
    }
  })
}

// -------------------------------------------------------------
// RESIZE & LIFECYCLE
// -------------------------------------------------------------
function handleResize() {
  if (!container.value || !renderer || !camera) return
  const rect = container.value.getBoundingClientRect()
  const width = Math.max(rect.width, 320)
  const height = Math.max(rect.height, 240)

  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

onMounted(() => {
  initThreeScene()
  markSectionReady('hero')
  window.addEventListener('resize', handleResize, { passive: true })

  // Visibility observer for performance
  if (container.value) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting
        })
      },
      { threshold: 0.05 }
    )
    observer.observe(container.value)
  }
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animFrameId)
  window.removeEventListener('resize', handleResize)
  if (observer) {
    observer.disconnect()
    observer = null
  }

  // Cleanup Three.js resources
  if (renderer) {
    renderer.dispose()
    renderer.forceContextLoss()
    renderer = null
  }
  scene = null
  camera = null
})
</script>

<style scoped>
.hero-constellation-scene {
  touch-action: pan-y;
}

.cosmic-deep-glow {
  background: radial-gradient(
    circle at 50% 50%,
    rgba(6, 182, 212, 0.08) 0%,
    rgba(14, 165, 233, 0.04) 35%,
    rgba(2, 3, 7, 0) 70%
  );
}

.space-celestial-grid {
  background-image:
    linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px);
  background-size: 80px 80px;
}

.gallery-ambient-vignette {
  background: radial-gradient(
    ellipse at center,
    rgba(2, 3, 7, 0) 50%,
    rgba(2, 3, 7, 0.85) 100%
  );
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
