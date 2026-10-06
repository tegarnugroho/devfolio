<template>
  <div
    ref="container"
    class="writing-bookshelf-scene relative w-full h-full select-none overflow-hidden bg-[#03060b]"
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

    <!-- Deep Ambient Vignette -->
    <div class="pointer-events-none absolute inset-0 gallery-ambient-vignette" aria-hidden="true"></div>

    <!-- Editorial Section Typography (Left Side) -->
    <div
      class="pointer-events-none absolute top-16 sm:top-20 left-6 sm:left-12 z-10 max-w-xs space-y-3 transition-all duration-700 ease-out"
    >
      <div class="flex items-center gap-2">
        <span class="font-mono text-[10px] text-zinc-400 tracking-widest font-semibold">05</span>
        <span class="w-3.5 h-[1px] bg-zinc-600"></span>
        <span class="font-mono text-[10px] text-zinc-300 uppercase tracking-widest font-medium">WRITING</span>
      </div>

      <h1 class="text-2xl sm:text-3xl font-light tracking-tight text-zinc-100 font-sans leading-tight">
        Knowledge Shelf
      </h1>

      <p class="text-[11.5px] text-zinc-400 leading-relaxed font-sans max-w-[270px] font-normal">
        A collection of technical notes, experiments, and things I've learned while building real products. Click any book to inspect its pages.
      </p>

      <!-- Category Filter Pills -->
      <div class="pt-2 pointer-events-auto flex flex-wrap gap-1.5 max-w-[280px]">
        <button
          v-for="cat in availableCategories"
          :key="cat"
          type="button"
          class="px-2.5 py-1 rounded text-[9.5px] font-mono tracking-wider transition-colors cursor-pointer border"
          :class="selectedCategory === cat ? 'bg-sky-500/20 text-sky-300 border-sky-500/40' : 'bg-black/40 text-zinc-400 hover:text-white border-white/10 hover:border-white/20'"
          @click="setCategory(cat)"
        >
          {{ cat }}
        </button>
      </div>

      <!-- Live Counter / Interactive Hint -->
      <div class="pt-1 flex items-center gap-2 font-mono text-[9.5px] text-zinc-500">
        <span class="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
        <span>{{ filteredArticles.length }} ARTICLES · CLICK BOOK TO OPEN</span>
      </div>
    </div>

    <!-- Hover Tooltip -->
    <div
      v-if="hoveredArticle && hoveredArticle.id !== selectedArticle?.id"
      class="pointer-events-none absolute z-30 px-2.5 py-1 rounded bg-zinc-950/95 text-zinc-200 border border-white/15 shadow-2xl font-mono text-[9.5px] -translate-x-1/2 -translate-y-full tracking-wider transition-opacity duration-150 backdrop-blur-md"
      :style="{ left: `${hoverScreenPos.x}px`, top: `${hoverScreenPos.y - 12}px` }"
    >
      <span class="text-sky-400 font-medium">[{{ hoveredArticle.category }}]</span>
      <span class="ml-1 text-zinc-200">{{ hoveredArticle.shortTitle }}</span>
    </div>

    <!-- Selected Article Editorial Preview (Right Side / Beside Opened Book) -->
    <Transition name="editorial-fade">
      <div
        v-if="selectedArticle"
        class="editorial-card pointer-events-auto absolute bottom-6 sm:bottom-10 right-6 sm:right-12 z-20 max-w-sm sm:w-88 p-4 sm:p-5 rounded-xl border border-white/10 bg-zinc-950/85 backdrop-blur-xl shadow-2xl space-y-3.5"
        @click.stop
      >
        <!-- Card Header -->
        <div class="space-y-1">
          <div class="flex items-center justify-between">
            <span class="font-mono text-[9px] uppercase tracking-[0.2em] text-sky-400 font-semibold flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
              OPEN BOOK // DISPATCH
            </span>
            <span class="font-mono text-[9px] text-zinc-400 tracking-wider">
              {{ selectedArticle.date }}
            </span>
          </div>

          <h2 class="text-base sm:text-lg font-medium tracking-tight text-white leading-snug">
            {{ selectedArticle.title }}
          </h2>
        </div>

        <!-- Excerpt -->
        <p class="text-[11.5px] text-zinc-400 leading-relaxed font-sans line-clamp-3 font-normal">
          {{ selectedArticle.excerpt }}
        </p>

        <!-- Category & Progress -->
        <div class="flex items-center justify-between pt-1 text-[10px] font-mono border-t border-white/5">
          <span class="px-2 py-0.5 rounded text-[9px] uppercase bg-sky-500/10 border border-sky-500/20 text-sky-300">
            {{ selectedArticle.category }}
          </span>
          <span class="text-zinc-500">
            {{ selectedArticleIndex + 1 }} OF {{ filteredArticles.length }}
          </span>
        </div>

        <!-- Action Footer -->
        <div class="pt-2 border-t border-white/5 flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <button
              type="button"
              class="w-7 h-7 rounded border border-white/10 hover:border-white/25 hover:bg-white/5 flex items-center justify-center text-xs font-mono text-zinc-300 hover:text-white transition cursor-pointer"
              title="Previous article"
              @click="prevArticle"
            >
              ←
            </button>
            <button
              type="button"
              class="w-7 h-7 rounded border border-white/10 hover:border-white/25 hover:bg-white/5 flex items-center justify-center text-xs font-mono text-zinc-300 hover:text-white transition cursor-pointer"
              title="Next article"
              @click="nextArticle"
            >
              →
            </button>
          </div>

          <a
            :href="selectedArticle.url"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1 text-[10.5px] font-mono text-sky-400 hover:text-sky-300 transition-colors font-medium tracking-wider uppercase cursor-pointer"
          >
            <span>READ FULL ARTICLE</span>
            <span>→</span>
          </a>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { registerContentNavigator } from '@/composables/useShowcase'
import { portfolioContent } from '@/content/portfolioContent'
import { useWritingPosts } from '@/composables/useWritingPosts'

export interface ShelfArticle {
  id: string
  title: string
  shortTitle: string
  category: 'Flutter' | 'Dart' | 'Architecture' | 'Tools' | 'Productivity'
  date: string
  year: string
  excerpt: string
  keyInsights: string[]
  url: string
  slotIndex: number // Position along the single shelf ledge
  dimensions: { thickness: number; height: number; depth: number }
  tiltZ?: number
}

const { posts } = useWritingPosts()

// Curated Technical Article Collection (Large prominent books on a single shelf)
const baseArticles: ShelfArticle[] = [
  {
    id: 'flutter-csv-parser',
    title: 'Working with CSV, Excel, and ODS in Flutter Without Multiple Packages',
    shortTitle: 'CSV, EXCEL & ODS PARSER',
    category: 'Flutter',
    date: '31 JAN 2026',
    year: '2026',
    excerpt: 'Real-world spreadsheet and tabular files often break Dart parsers in subtle ways. Handling multi-format tabular ingestion with zero external dependencies.',
    keyInsights: [
      'Zero-dependency binary & stream decoding in pure Dart isolates',
      'Unified schema mapping for CSV, XLS, XLSX, and ODS formats',
      'Zero-copy memory buffering to handle 100k+ row datasets',
    ],
    url: 'https://codeary.xyz',
    slotIndex: 0,
    dimensions: { thickness: 0.13, height: 1.25, depth: 0.82 },
  },
  {
    id: 'flutter-clean-arch',
    title: 'Clean Architecture in Flutter: Scalable Domain Layer Patterns',
    shortTitle: 'CLEAN ARCHITECTURE',
    category: 'Architecture',
    date: '15 MAR 2024',
    year: '2024',
    excerpt: 'Structuring state management, repository contracts, and pure use-cases for enterprise Flutter applications.',
    keyInsights: [
      'Strict separation between UI widgets and domain business logic',
      'Repository interface abstractions for seamless API/local swaps',
      'Pure deterministic unit testing with zero Flutter bindings',
    ],
    url: 'https://codeary.xyz',
    slotIndex: 1,
    dimensions: { thickness: 0.14, height: 1.22, depth: 0.80 },
  },
  {
    id: 'riverpod-2-mastery',
    title: 'Reactive State Mastery with Riverpod 2.0',
    shortTitle: 'RIVERPOD 2.0 MASTERY',
    category: 'Flutter',
    date: '20 FEB 2024',
    year: '2024',
    excerpt: 'How code generation and auto-dispose providers eliminate memory leaks, circular dependencies, and repetitive boilerplate.',
    keyInsights: [
      'Modern @riverpod annotation generators for type-safe providers',
      'Scoping state lifecycles to avoid zombie listeners & leaks',
      'Granular rebuild control using select() and family parameters',
    ],
    url: 'https://codeary.xyz',
    slotIndex: 2,
    dimensions: { thickness: 0.12, height: 1.18, depth: 0.78 },
  },
  {
    id: 'cross-platform-flutter',
    title: 'Building Universal Desktop and Web UIs with Flutter',
    shortTitle: 'CROSS-PLATFORM DESKTOP',
    category: 'Flutter',
    date: '12 JAN 2024',
    year: '2024',
    excerpt: 'Adapting cursor events, hardware shortcuts, and responsive layouts across macOS, Windows, and modern web viewports.',
    keyInsights: [
      'Platform-adaptive layout builders and split-view navigation',
      'Keyboard shortcuts, hover effects, and contextual right-click menus',
      'Desktop window frame controls and multi-window orchestration',
    ],
    url: 'https://codeary.xyz',
    slotIndex: 3,
    dimensions: { thickness: 0.13, height: 1.20, depth: 0.80 },
  },
  {
    id: 'pos-offline-first',
    title: 'Engineering Offline-First Sync for Retail POS Systems',
    shortTitle: 'OFFLINE-FIRST POS SYNC',
    category: 'Architecture',
    date: '18 NOV 2023',
    year: '2023',
    excerpt: 'Managing local high-throughput SQLite storage with resilient WebSocket backpressure and conflict-free journal replay.',
    keyInsights: [
      'WAL-mode SQLite embedded storage for sub-millisecond writes',
      'Conflict-free transaction queuing with idempotent replay',
      'WebSocket backpressure management during network degradation',
    ],
    url: 'https://codeary.xyz',
    slotIndex: 4,
    dimensions: { thickness: 0.14, height: 1.24, depth: 0.84 },
  },
  {
    id: 'dart-high-performance-parsing',
    title: 'High-Performance Data Parsing in Dart',
    shortTitle: 'HIGH-PERF DART PARSING',
    category: 'Dart',
    date: '05 OCT 2023',
    year: '2023',
    excerpt: 'Benchmarking string chunking, regex compilation, and memory allocations in background isolates for high-throughput pipelines.',
    keyInsights: [
      'Isolate pool architectures for non-blocking UI threads',
      'TypedData buffers vs standard list allocations',
      'Pre-compiled regular expression state machines',
    ],
    url: 'https://codeary.xyz',
    slotIndex: 5,
    dimensions: { thickness: 0.12, height: 1.19, depth: 0.79 },
    tiltZ: 0.05, // subtle natural lean
  },
  {
    id: 'secrets-remote-config',
    title: 'Secrets & Remote Config Management in Distributed Systems',
    shortTitle: 'SECRETS & REMOTE CONFIG',
    category: 'Tools',
    date: '14 JUN 2023',
    year: '2023',
    excerpt: 'Architecting scoped API tokens, zero-trust credential distribution, and atomic configuration rollouts via Cloudflare Workers.',
    keyInsights: [
      'Edge KV stores for global low-latency configuration delivery',
      'Rotatable public/private key pairs with signature verification',
      'Zero-downtime remote feature flag rollouts',
    ],
    url: 'https://codeary.xyz',
    slotIndex: 6,
    dimensions: { thickness: 0.13, height: 1.21, depth: 0.80 },
  },
]

// Category Filter State
const availableCategories = ['ALL', 'Flutter', 'Dart', 'Architecture', 'Tools'] as const
type CategoryFilter = typeof availableCategories[number]
const selectedCategory = ref<CategoryFilter>('ALL')

// Dynamic Articles merged with live posts if available
const articles = computed<ShelfArticle[]>(() => {
  if (posts.value && posts.value.length > 0) {
    const liveFirst = posts.value[0]
    const updated = [...baseArticles]
    updated[0] = {
      ...updated[0],
      title: liveFirst.title,
      excerpt: liveFirst.excerpt || updated[0].excerpt,
      date: liveFirst.dateLabel || updated[0].date,
      url: `${portfolioContent.writing.blogUrl}/posts/${liveFirst.slug}`,
    }
    return updated
  }
  return baseArticles
})

const filteredArticles = computed<ShelfArticle[]>(() => {
  if (selectedCategory.value === 'ALL') return articles.value
  return articles.value.filter(a => a.category === selectedCategory.value)
})

const selectedArticleId = ref<string>('flutter-csv-parser')
const selectedArticle = computed<ShelfArticle | undefined>(() => {
  const match = filteredArticles.value.find(a => a.id === selectedArticleId.value)
  return match || filteredArticles.value[0]
})

const selectedArticleIndex = computed(() => {
  if (!selectedArticle.value) return 0
  return filteredArticles.value.findIndex(a => a.id === selectedArticle.value?.id)
})

function setCategory(cat: CategoryFilter) {
  selectedCategory.value = cat
  const matches = articles.value.filter(a => cat === 'ALL' || a.category === cat)
  if (matches.length > 0 && !matches.some(a => a.id === selectedArticleId.value)) {
    selectedArticleId.value = matches[0].id
  }
}

function prevArticle() {
  const list = filteredArticles.value
  if (list.length === 0) return
  const curr = selectedArticleIndex.value
  const prevIdx = (curr - 1 + list.length) % list.length
  selectedArticleId.value = list[prevIdx].id
}

function nextArticle() {
  const list = filteredArticles.value
  if (list.length === 0) return
  const curr = selectedArticleIndex.value
  const nextIdx = (curr + 1) % list.length
  selectedArticleId.value = list[nextIdx].id
}

// Hover State
const hoveredArticle = ref<ShelfArticle | null>(null)
const hoverScreenPos = ref({ x: 0, y: 0 })

// Three.js State
const container = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let animFrameId = 0

let shelfGroup: THREE.Group | null = null
let accentSpotLight: THREE.PointLight | null = null

interface BookRuntimeMesh {
  article: ShelfArticle
  rootGroup: THREE.Group
  coverHingeGroup: THREE.Group
  coverMesh: THREE.Mesh
  blockMesh: THREE.Mesh
  basePosition: THREE.Vector3
  baseRotationY: number
  targetPosition: THREE.Vector3
  targetRotationY: number
  targetHingeAngle: number
  currentHingeAngle: number
}

let bookMeshes: BookRuntimeMesh[] = []
const interactiveMeshes: THREE.Object3D[] = []

// Mouse Interaction
let isDragging = false
let prevPointerX = 0
let dragRotationY = 0
let targetDragRotationY = 0
const raycaster = new THREE.Raycaster()
const mouseNDC = new THREE.Vector2(-999, -999)

let wheelThrottleTimeout = 0
let unregisterContentNav: (() => void) | null = null

// Texture Generation Helpers
function generateSpineTexture(shortTitle: string, category: string, year: string): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 1024
  const ctx = c.getContext('2d')!

  // Deep matte background with subtle fine gradient
  const grad = ctx.createLinearGradient(0, 0, 256, 0)
  grad.addColorStop(0, '#0e121a')
  grad.addColorStop(0.5, '#171c26')
  grad.addColorStop(1, '#0b0e14')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 256, 1024)

  // Top / bottom technical notches
  ctx.fillStyle = '#38bdf8'
  ctx.fillRect(0, 0, 256, 16)
  ctx.fillRect(0, 1008, 256, 16)

  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
  ctx.fillRect(24, 32, 208, 3)
  ctx.fillRect(24, 988, 208, 3)

  // Vertical spine typography (rotated 90 degrees)
  ctx.save()
  ctx.translate(128, 512)
  ctx.rotate(-Math.PI / 2)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Category Tag
  ctx.fillStyle = '#38bdf8'
  ctx.font = '600 28px monospace'
  ctx.fillText(`[ ${category.toUpperCase()} ]`, -280, 0)

  // Book Title (Large, bold, crisp)
  ctx.fillStyle = '#f8fafc'
  ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  ctx.fillText(shortTitle.toUpperCase(), 30, 0)

  // Year
  ctx.fillStyle = '#64748b'
  ctx.font = '500 24px monospace'
  ctx.fillText(year, 350, 0)

  ctx.restore()

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function generateFrontCoverTexture(title: string, category: string, date: string): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 768
  const ctx = c.getContext('2d')!

  // Architectural Dark Cover
  ctx.fillStyle = '#0b0e14'
  ctx.fillRect(0, 0, 512, 768)

  // Subtle border rule
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
  ctx.lineWidth = 2
  ctx.strokeRect(24, 24, 464, 720)

  // Category & Date Header
  ctx.fillStyle = '#38bdf8'
  ctx.font = '600 18px monospace'
  ctx.fillText(`TECHNICAL BOOK // ${category.toUpperCase()}`, 44, 68)

  ctx.fillStyle = '#64748b'
  ctx.font = '500 16px monospace'
  ctx.fillText(date, 44, 96)

  // Divider line
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(44, 120)
  ctx.lineTo(200, 120)
  ctx.stroke()

  // Large Bold Title
  ctx.fillStyle = '#f8fafc'
  ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  
  const words = title.split(' ')
  let line = ''
  let y = 185
  const maxWidth = 424
  const lineHeight = 46

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' '
    const metrics = ctx.measureText(testLine)
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, 44, y)
      line = words[n] + ' '
      y += lineHeight
    } else {
      line = testLine
    }
  }
  ctx.fillText(line, 44, y)

  // Architectural Grid graphic in bottom
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
  ctx.lineWidth = 1
  for (let gy = 440; gy <= 640; gy += 30) {
    ctx.beginPath()
    ctx.moveTo(44, gy)
    ctx.lineTo(468, gy)
    ctx.stroke()
  }

  // Publisher Seal
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)'
  ctx.font = '600 14px monospace'
  ctx.fillText('CODEARY LIBRARY EDITION // VOL. 1', 44, 704)

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// Inside Left Page (Facing viewer when cover swings open)
function generateInsideLeftPageTexture(article: ShelfArticle): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 768
  const ctx = c.getContext('2d')!

  // Warm off-white editorial paper
  ctx.fillStyle = '#0f141f'
  ctx.fillRect(0, 0, 512, 768)

  // Inner margin border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)'
  ctx.lineWidth = 1.5
  ctx.strokeRect(28, 28, 456, 712)

  // Left Page Chapter Heading
  ctx.fillStyle = '#38bdf8'
  ctx.font = '600 16px monospace'
  ctx.fillText(`CHAPTER 01 // ${article.category.toUpperCase()}`, 48, 70)

  ctx.fillStyle = '#64748b'
  ctx.font = '500 14px monospace'
  ctx.fillText(`PUBLISHED: ${article.date}`, 48, 96)

  // Divider
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(48, 116)
  ctx.lineTo(464, 116)
  ctx.stroke()

  // Article Title
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  const words = article.title.split(' ')
  let line = ''
  let y = 160
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' '
    const metrics = ctx.measureText(testLine)
    if (metrics.width > 416 && n > 0) {
      ctx.fillText(line, 48, y)
      line = words[n] + ' '
      y += 36
    } else {
      line = testLine
    }
  }
  ctx.fillText(line, 48, y)

  // Abstract / Excerpt Intro
  ctx.fillStyle = '#94a3b8'
  ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  const exWords = article.excerpt.split(' ')
  let exLine = ''
  let exY = y + 40
  for (let n = 0; n < exWords.length; n++) {
    const testLine = exLine + exWords[n] + ' '
    const metrics = ctx.measureText(testLine)
    if (metrics.width > 416 && n > 0) {
      ctx.fillText(exLine, 48, exY)
      exLine = exWords[n] + ' '
      exY += 24
    } else {
      exLine = testLine
    }
  }
  ctx.fillText(exLine, 48, exY)

  // Author signature line
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
  ctx.font = '500 14px monospace'
  ctx.fillText('AUTHOR: TEGAR NUGROHO (WOLKK)', 48, 700)

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// Inside Right Page (Top page of the block)
function generateInsideRightPageTexture(article: ShelfArticle): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 768
  const ctx = c.getContext('2d')!

  ctx.fillStyle = '#0f141f'
  ctx.fillRect(0, 0, 512, 768)

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)'
  ctx.lineWidth = 1.5
  ctx.strokeRect(28, 28, 456, 712)

  // Header
  ctx.fillStyle = '#38bdf8'
  ctx.font = '600 16px monospace'
  ctx.fillText('KEY ARCHITECTURAL INSIGHTS', 48, 70)

  ctx.fillStyle = '#64748b'
  ctx.font = '500 14px monospace'
  ctx.fillText('CORE HIGHLIGHTS & PATTERNS', 48, 96)

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(48, 116)
  ctx.lineTo(464, 116)
  ctx.stroke()

  // Bullet points
  let by = 160
  article.keyInsights.forEach((insight, idx) => {
    ctx.fillStyle = '#38bdf8'
    ctx.font = 'bold 16px monospace'
    ctx.fillText(`0${idx + 1}.`, 48, by)

    ctx.fillStyle = '#e2e8f0'
    ctx.font = '15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    
    const words = insight.split(' ')
    let bLine = ''
    let subY = by
    for (let n = 0; n < words.length; n++) {
      const testLine = bLine + words[n] + ' '
      const metrics = ctx.measureText(testLine)
      if (metrics.width > 380 && n > 0) {
        ctx.fillText(bLine, 84, subY)
        bLine = words[n] + ' '
        subY += 22
      } else {
        bLine = testLine
      }
    }
    ctx.fillText(bLine, 84, subY)
    by = subY + 38
  })

  // Bottom Dispatch Stamp
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)'
  ctx.lineWidth = 1.5
  ctx.strokeRect(48, 620, 416, 68)

  ctx.fillStyle = '#38bdf8'
  ctx.font = '600 13px monospace'
  ctx.fillText('DISPATCH STATUS: VERIFIED PRODUCTION', 64, 646)

  ctx.fillStyle = '#94a3b8'
  ctx.font = '12px monospace'
  ctx.fillText('READ COMPLETE ESSAY ON CODEARY.XYZ →', 64, 668)

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function initScene() {
  if (!container.value || !canvas.value) return

  const width = container.value.clientWidth || window.innerWidth
  const height = container.value.clientHeight || window.innerHeight
  const isMobile = width < 768

  // 1. Scene & Perspective Camera
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100)
  
  // Architectural Composition:
  // Left: Typography & Category Filters
  // Center-Right: Single-tier Bookshelf with large prominent books
  camera.position.set(isMobile ? 0 : -0.15, isMobile ? 0.1 : 0.05, isMobile ? 5.8 : 4.8)
  camera.lookAt(isMobile ? 0 : 0.35, isMobile ? 0.05 : -0.05, 0)

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
  renderer.toneMappingExposure = 1.3

  // 3. Studio-Style Architectural Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.1)
  scene.add(ambientLight)

  // Main soft key light from upper-left
  const keyLight = new THREE.DirectionalLight(0xfffaed, 2.4)
  keyLight.position.set(-3, 6, 4.5)
  scene.add(keyLight)

  // Subtle cool fill light from right
  const fillLight = new THREE.DirectionalLight(0x94a3b8, 0.8)
  fillLight.position.set(5, 2, 3)
  scene.add(fillLight)

  // Dedicated subtle blue accent light around selected book
  accentSpotLight = new THREE.PointLight(0x38bdf8, 1.4, 4.5, 1.4)
  accentSpotLight.position.set(0.4, 0.3, 1.5)
  scene.add(accentSpotLight)

  // 4. Single-Tier Bookshelf Root Group
  shelfGroup = new THREE.Group()
  shelfGroup.position.set(isMobile ? 0 : 0.35, isMobile ? 0.05 : 0.0, 0)
  scene.add(shelfGroup)

  // 5. Build Single Architectural Shelf Ledge (1 Susun)
  buildSingleShelfStructure()

  // 6. Build and Position Prominent Opening Books
  buildBooks()

  // 7. Subtle Floor Grid
  const gridHelper = new THREE.GridHelper(8, 20, 0x1e293b, 0x0f172a)
  gridHelper.position.y = -1.18
  ;(gridHelper.material as THREE.Material).transparent = true
  ;(gridHelper.material as THREE.Material).opacity = 0.18
  scene.add(gridHelper)

  // 8. Main Render Loop
  let lastTime = performance.now()
  function loop(now: number) {
    animFrameId = requestAnimationFrame(loop)
    const delta = Math.min((now - lastTime) / 1000, 0.1)
    lastTime = now

    // Smooth horizontal bookshelf rotation from drag or gentle breathing
    if (shelfGroup) {
      if (!isDragging) {
        const idleRot = Math.sin(now * 0.0003) * 0.012
        targetDragRotationY = THREE.MathUtils.lerp(targetDragRotationY, idleRot, 0.02)
      }
      dragRotationY = THREE.MathUtils.lerp(dragRotationY, targetDragRotationY, 0.08)
      shelfGroup.rotation.y = dragRotationY
    }

    // Update Books (Glide Forward, Rotate, and Open Cover on Click)
    const activeCat = selectedCategory.value
    bookMeshes.forEach(item => {
      const isSelected = item.article.id === selectedArticleId.value
      const isHovered = item.article.id === hoveredArticle.value?.id
      const matchesCategory = activeCat === 'ALL' || item.article.category === activeCat

      // Determine Target Position & Angles
      item.targetPosition.copy(item.basePosition)
      item.targetRotationY = item.baseRotationY

      if (isSelected) {
        // SELECTED: Glides forward to reading position, turns to face camera, and swings open!
        item.targetPosition.z = 1.35
        item.targetPosition.y = 0.05
        item.targetPosition.x = 0.30 // centered in reading zone
        item.targetRotationY = 0.0    // face camera directly
        item.targetHingeAngle = -Math.PI * 0.75 // Cover swings open ~135 degrees!
      } else if (isHovered) {
        // HOVERED: Lifts slightly and steps forward
        item.targetPosition.z = item.basePosition.z + 0.12
        item.targetPosition.y = item.basePosition.y + 0.04
        item.targetHingeAngle = 0.0 // stays closed
      } else {
        item.targetHingeAngle = 0.0 // closed flat on shelf
      }

      // Smooth Position & Rotation Lerp
      item.rootGroup.position.lerp(item.targetPosition, 0.09)
      item.rootGroup.rotation.y = THREE.MathUtils.lerp(item.rootGroup.rotation.y, item.targetRotationY, 0.09)

      // Smooth Cover Hinge Swing ("Buka Bukunya")
      item.currentHingeAngle = THREE.MathUtils.lerp(item.currentHingeAngle, item.targetHingeAngle, 0.08)
      item.coverHingeGroup.rotation.y = item.currentHingeAngle

      // Category Filter Damping
      const targetOpacity = matchesCategory ? 1.0 : 0.18
      const coverMat = (item.coverMesh.material as THREE.Material[])[4] as THREE.MeshStandardMaterial
      if (coverMat) {
        coverMat.opacity = THREE.MathUtils.lerp(coverMat.opacity, targetOpacity, 0.1)
        coverMat.transparent = targetOpacity < 0.99
      }
    })

    // Accent Spotlight follows opened book
    if (accentSpotLight && shelfGroup) {
      const selectedBook = bookMeshes.find(b => b.article.id === selectedArticleId.value)
      if (selectedBook) {
        const wp = new THREE.Vector3()
        selectedBook.rootGroup.getWorldPosition(wp)
        accentSpotLight.position.set(wp.x + 0.2, wp.y + 0.3, wp.z + 1.2)
      }
    }

    if (renderer && scene && camera) {
      renderer.render(scene, camera)
    }
  }

  animFrameId = requestAnimationFrame(loop)
}

// 1 Susun (Single Architectural Floating Shelf Ledge)
function buildSingleShelfStructure() {
  if (!shelfGroup) return

  const shelfWidth = 4.8
  const shelfDepth = 0.85
  const plankThickness = 0.045
  const shelfY = -0.68

  // Dark graphite brushed metal material
  const ledgeMat = new THREE.MeshStandardMaterial({
    color: 0x141722,
    roughness: 0.78,
    metalness: 0.35,
  })

  // 1. Single Main Shelf Plank (Ledge)
  const plankGeo = new THREE.BoxGeometry(shelfWidth, plankThickness, shelfDepth)
  const plankMesh = new THREE.Mesh(plankGeo, ledgeMat)
  plankMesh.position.set(0, shelfY, 0)
  shelfGroup.add(plankMesh)

  // 2. Subtle Edge Highlight Line along front edge
  const edgeGeo = new THREE.BoxGeometry(shelfWidth, 0.006, 0.015)
  const edgeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45 })
  const edgeMesh = new THREE.Mesh(edgeGeo, edgeMat)
  edgeMesh.position.set(0, shelfY + plankThickness / 2, shelfDepth / 2)
  shelfGroup.add(edgeMesh)

  // 3. Architectural Floating Wall Brackets underneath
  const bracketMat = new THREE.MeshStandardMaterial({
    color: 0x1a1e2a,
    roughness: 0.7,
    metalness: 0.5,
  })

  ;[-1.6, 0, 1.6].forEach(bx => {
    const bracketGeo = new THREE.BoxGeometry(0.04, 0.25, shelfDepth * 0.9)
    const bracketMesh = new THREE.Mesh(bracketGeo, bracketMat)
    bracketMesh.position.set(bx, shelfY - 0.14, -0.04)
    shelfGroup!.add(bracketMesh)
  })
}

// Prominent Opening Books
function buildBooks() {
  if (!shelfGroup) return
  bookMeshes = []
  interactiveMeshes.length = 0

  const shelfY = -0.68
  const plankThickness = 0.045
  const shelfTopY = shelfY + plankThickness / 2

  // Spacing positions along the single shelf ledge
  const slotXPositions = [-1.55, -1.05, -0.55, -0.05, 0.50, 1.05, 1.60]

  articles.value.forEach((article, idx) => {
    const dims = article.dimensions
    const slotX = slotXPositions[idx % slotXPositions.length]

    // Base Y: resting on the single shelf ledge
    const baseY = shelfTopY + dims.height / 2
    // Base Z: aligned so spine is at the front of the shelf
    const baseZ = -0.05
    const basePosition = new THREE.Vector3(slotX, baseY, baseZ)
    // Resting rotation Y: Math.PI / 2 brings the spine facing directly towards the camera!
    const baseRotationY = Math.PI / 2 + (article.tiltZ || 0)

    // Generate High-Res Textures
    const spineTexture = generateSpineTexture(article.shortTitle, article.category, article.year)
    const frontCoverTexture = generateFrontCoverTexture(article.title, article.category, article.date)
    const insideLeftPageTexture = generateInsideLeftPageTexture(article)
    const insideRightPageTexture = generateInsideRightPageTexture(article)

    // Root Group for the Book
    const bookRoot = new THREE.Group()
    bookRoot.position.copy(basePosition)
    bookRoot.rotation.y = baseRotationY
    shelfGroup!.add(bookRoot)

    // A. Core Pages Block:
    // Box dimensions: depth D, height H, thickness T
    // Centered at x = D / 2, y = 0, z = 0 (origin x = 0 is the spine crease)
    const blockGeo = new THREE.BoxGeometry(dims.depth, dims.height, dims.thickness)
    const blockMaterials: THREE.Material[] = [
      // 0: +X (Fore-edge paper)
      new THREE.MeshStandardMaterial({ color: 0xcfd4dc, roughness: 0.9 }),
      // 1: -X (Spine inner joint)
      new THREE.MeshStandardMaterial({ color: 0x11141c, roughness: 0.8 }),
      // 2: +Y (Top pages)
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.9 }),
      // 3: -Y (Bottom pages)
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.9 }),
      // 4: +Z (Right Open Page: displayed when cover swings open!)
      new THREE.MeshStandardMaterial({ map: insideRightPageTexture, roughness: 0.7 }),
      // 5: -Z (Back Cover outside)
      new THREE.MeshStandardMaterial({ color: 0x11141c, roughness: 0.8 }),
    ]
    const blockMesh = new THREE.Mesh(blockGeo, blockMaterials)
    blockMesh.position.set(dims.depth / 2, 0, 0)
    blockMesh.userData = { articleId: article.id }
    bookRoot.add(blockMesh)

    // B. Spine Strip (visible when closed on the shelf):
    // Positioned at x = 0, spanning Y and Z
    const spineGeo = new THREE.BoxGeometry(0.015, dims.height, dims.thickness)
    const spineMat = new THREE.MeshStandardMaterial({
      map: spineTexture,
      roughness: 0.6,
      metalness: 0.1,
    })
    const spineMesh = new THREE.Mesh(spineGeo, [
      new THREE.MeshBasicMaterial({ color: 0x11141c }),
      spineMat, // -X face: faces viewer when book is rotated Math.PI/2 on shelf!
      new THREE.MeshBasicMaterial({ color: 0x11141c }),
      new THREE.MeshBasicMaterial({ color: 0x11141c }),
      new THREE.MeshBasicMaterial({ color: 0x11141c }),
      new THREE.MeshBasicMaterial({ color: 0x11141c }),
    ])
    spineMesh.position.set(0, 0, 0)
    spineMesh.userData = { articleId: article.id }
    bookRoot.add(spineMesh)

    // C. Hinged Front Cover Group ("Buka Bukunya"):
    // Origin at the spine crease: x = 0, y = 0, z = dims.thickness / 2
    const coverHinge = new THREE.Group()
    coverHinge.position.set(0, 0, dims.thickness / 2)
    bookRoot.add(coverHinge)

    // Cover Mesh inside Hinge Group:
    // Extends from x = 0 to x = dims.depth
    const coverThickness = 0.016
    const coverGeo = new THREE.BoxGeometry(dims.depth, dims.height + 0.02, coverThickness)
    const coverMaterials: THREE.Material[] = [
      new THREE.MeshStandardMaterial({ color: 0x11141c, roughness: 0.8 }), // +X tip
      new THREE.MeshStandardMaterial({ color: 0x11141c, roughness: 0.8 }), // -X hinge
      new THREE.MeshStandardMaterial({ color: 0x11141c, roughness: 0.8 }), // +Y
      new THREE.MeshStandardMaterial({ color: 0x11141c, roughness: 0.8 }), // -Y
      // 4: +Z (Front Cover Outside)
      new THREE.MeshStandardMaterial({ map: frontCoverTexture, roughness: 0.65 }),
      // 5: -Z (Inside Left Page: turns to face viewer when cover swings open!)
      new THREE.MeshStandardMaterial({ map: insideLeftPageTexture, roughness: 0.7 }),
    ]
    const coverMesh = new THREE.Mesh(coverGeo, coverMaterials)
    coverMesh.position.set(dims.depth / 2, 0, coverThickness / 2)
    coverMesh.userData = { articleId: article.id }
    coverHinge.add(coverMesh)

    interactiveMeshes.push(blockMesh, spineMesh, coverMesh)

    bookMeshes.push({
      article,
      rootGroup: bookRoot,
      coverHingeGroup: coverHinge,
      coverMesh,
      blockMesh,
      basePosition,
      baseRotationY,
      targetPosition: basePosition.clone(),
      targetRotationY: baseRotationY,
      targetHingeAngle: 0.0,
      currentHingeAngle: 0.0,
    })
  })
}

// Raycasting & Pointer Handlers
function onPointerDown(e: PointerEvent) {
  isDragging = true
  prevPointerX = e.clientX
  checkRaycast(e, true)
}

function onPointerMove(e: PointerEvent) {
  if (!container.value) return
  const rect = container.value.getBoundingClientRect()
  mouseNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
  mouseNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

  if (isDragging) {
    const dx = e.clientX - prevPointerX
    prevPointerX = e.clientX
    targetDragRotationY = THREE.MathUtils.clamp(targetDragRotationY + dx * 0.003, -0.22, 0.22)
  } else {
    checkRaycast(e, false)
  }
}

function onPointerUp() {
  isDragging = false
}

function onWheel(e: WheelEvent) {
  e.preventDefault()
  const now = performance.now()
  if (now - wheelThrottleTimeout > 250) {
    wheelThrottleTimeout = now
    if (e.deltaY > 0) nextArticle()
    else prevArticle()
  }
}

function checkRaycast(e: PointerEvent, isClick: boolean) {
  if (!camera || !container.value || !scene) return

  raycaster.setFromCamera(mouseNDC, camera)
  const hits = raycaster.intersectObjects(interactiveMeshes, true)

  if (hits.length > 0) {
    const hitObj = hits[0].object
    const articleId = hitObj.userData?.articleId
    const found = articles.value.find(a => a.id === articleId)

    if (found) {
      if (isClick) {
        selectedArticleId.value = found.id
        if (selectedCategory.value !== 'ALL' && found.category !== selectedCategory.value) {
          selectedCategory.value = 'ALL'
        }
      } else {
        hoveredArticle.value = found
        hoverScreenPos.value = { x: e.clientX, y: e.clientY }
        if (canvas.value) canvas.value.style.cursor = 'pointer'
      }
      return
    }
  }

  if (!isClick) {
    hoveredArticle.value = null
    if (canvas.value) canvas.value.style.cursor = isDragging ? 'grabbing' : 'grab'
  }
}

function onBackgroundClick() {
  // Clear hover state
}

function onResize() {
  if (!container.value || !camera || !renderer || !shelfGroup) return
  const w = container.value.clientWidth || window.innerWidth
  const h = container.value.clientHeight || window.innerHeight
  const isMobile = w < 768

  shelfGroup.position.set(isMobile ? 0 : 0.35, isMobile ? 0.05 : 0.0, 0)

  camera.aspect = w / h
  camera.position.set(isMobile ? 0 : -0.15, isMobile ? 0.1 : 0.05, isMobile ? 5.8 : 4.8)
  camera.lookAt(isMobile ? 0 : 0.35, isMobile ? 0.05 : -0.05, 0)
  camera.updateProjectionMatrix()

  renderer.setSize(w, h)
}

onMounted(() => {
  initScene()
  window.addEventListener('resize', onResize)

  unregisterContentNav = registerContentNavigator((direction) => {
    if (direction === 'prev') prevArticle()
    else nextArticle()
  })
})

onBeforeUnmount(() => {
  unregisterContentNav?.()
  window.removeEventListener('resize', onResize)

  if (animFrameId) cancelAnimationFrame(animFrameId)

  if (scene) {
    scene.traverse(obj => {
      if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments) {
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
/* Quiet Dark Gallery Atmosphere Vignette */
.gallery-ambient-vignette {
  background: radial-gradient(circle at 60% 45%, rgba(14, 23, 42, 0.18) 0%, rgba(3, 6, 11, 0.8) 65%, #03060b 100%);
}

.editorial-fade-enter-active,
.editorial-fade-leave-active {
  transition: opacity 300ms ease, transform 300ms ease;
}

.editorial-fade-enter-from,
.editorial-fade-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

@media (prefers-reduced-motion: reduce) {
  .editorial-card {
    transition: opacity 150ms ease !important;
  }
}
</style>
