<template>
  <div
    ref="container"
    class="writing-editorial-archive-scene relative w-full h-full select-none overflow-hidden bg-[#02050a]"
  >
    <!-- Deep Space Cosmic Ambient Glow -->
    <div
      class="pointer-events-none absolute inset-0 transition-opacity duration-700"
      :class="globeMode === 'tech' ? 'showcase-glow-dark' : 'showcase-glow-light'"
      aria-hidden="true"
    ></div>

    <!-- Technical Coordinate Grid (Tech Blueprint Overlay) -->
    <div
      v-if="globeMode === 'tech'"
      class="pointer-events-none absolute inset-0 opacity-[0.035] showcase-grid-dark"
      aria-hidden="true"
    ></div>

    <!-- Cinematic 3D Earth Background Canvas -->
    <canvas
      ref="canvas"
      class="absolute inset-0 w-full h-full block cursor-grab active:cursor-grabbing outline-none touch-none z-0"
      @pointerdown="onCanvasPointerDown"
      @pointermove="onCanvasPointerMove"
      @pointerup="onCanvasPointerUp"
      @pointercancel="onCanvasPointerUp"
    ></canvas>

    <!-- Deep Ambient Vignette (Soft focus behind editorial deck) -->
    <div class="pointer-events-none absolute inset-0 gallery-ambient-vignette z-0" aria-hidden="true"></div>

    <!-- Loading State -->
    <Showcase3DLoader
      v-if="loading && articles.length === 0"
      title="EDITORIAL ARCHIVE DISPATCH"
      subtitle="SYNCHRONIZING TECHNICAL PUBLICATIONS & SYSTEM ESSAYS"
      badge-text="STREAMING DISPATCH API"
    />

    <!-- Header & Category Filters (Left HUD) -->
    <WritingFilters
      v-if="articles.length > 0"
      :categories="availableCategories"
      :selected-category="selectedCategory"
      :count="filteredArticles.length"
      @select-category="setCategory"
    />

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

    <!-- ------------------------------------------------------------- -->
    <!-- 3D EDITORIAL ARTICLE DECK (SPATIAL PERSPECTIVE CAROUSEL) -->
    <!-- ------------------------------------------------------------- -->
    <div
      class="editorial-stage-viewport absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
      @pointerdown="onDeckPointerDown"
      @pointermove="onDeckPointerMove"
      @pointerup="onDeckPointerUp"
      @pointercancel="onDeckPointerUp"
    >
      <div class="editorial-cards-container relative w-full h-full flex items-center justify-center">
        <article
          v-for="(article, index) in filteredArticles"
          :key="article.id"
          class="editorial-card-wrapper absolute transition-all duration-500 ease-out will-change-transform"
          :style="getCardSpatialStyle(index, selectedArticleIndex, filteredArticles.length, isMobile)"
          @click="onCardClick(article.id)"
        >
          <div
            class="editorial-document-card relative w-[310px] sm:w-[350px] min-h-[380px] sm:min-h-[420px] p-5 sm:p-6 rounded-2xl border bg-black/85 backdrop-blur-2xl shadow-2xl flex flex-col justify-between transition-all duration-300 group cursor-pointer"
            :style="{
              borderColor: selectedArticle?.id === article.id
                ? (article.accentColor || '#38bdf8')
                : 'rgba(255, 255, 255, 0.12)',
              boxShadow: selectedArticle?.id === article.id
                ? `0 20px 50px rgba(0, 0, 0, 0.8), 0 0 28px ${(article.accentColor || '#38bdf8')}28`
                : '0 12px 36px rgba(0, 0, 0, 0.65)'
            }"
          >
            <!-- Corner Precision Crosshair Markers -->
            <span class="pointer-events-none absolute -top-[1px] -left-[1px] w-2.5 h-2.5 border-t-2 border-l-2 rounded-tl" :style="{ borderColor: article.accentColor || '#38bdf8' }"></span>
            <span class="pointer-events-none absolute -top-[1px] -right-[1px] w-2.5 h-2.5 border-t-2 border-r-2 rounded-tr" :style="{ borderColor: article.accentColor || '#38bdf8' }"></span>
            <span class="pointer-events-none absolute -bottom-[1px] -left-[1px] w-2.5 h-2.5 border-b-2 border-l-2 rounded-bl" :style="{ borderColor: article.accentColor || '#38bdf8' }"></span>
            <span class="pointer-events-none absolute -bottom-[1px] -right-[1px] w-2.5 h-2.5 border-b-2 border-r-2 rounded-br" :style="{ borderColor: article.accentColor || '#38bdf8' }"></span>

            <!-- Top Header & Metadata Telemetry -->
            <div class="space-y-3">
              <div class="flex items-center justify-between font-mono text-[9px] uppercase tracking-wider text-zinc-400">
                <!-- Category Pill -->
                <div class="flex items-center gap-1.5 font-semibold">
                  <span
                    class="w-1.5 h-1.5 rounded-full"
                    :style="{
                      backgroundColor: article.accentColor || '#38bdf8',
                      boxShadow: `0 0 8px ${article.accentColor || '#38bdf8'}`
                    }"
                  ></span>
                  <span :style="{ color: article.accentColor || '#38bdf8' }">
                    {{ article.category }}
                  </span>
                </div>

                <!-- Date & Reading Time -->
                <div class="flex items-center gap-2">
                  <span v-if="article.readingTime" class="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-400 text-[8px]">
                    {{ article.readingTime }}
                  </span>
                  <span>{{ article.date || article.year }}</span>
                </div>
              </div>

              <!-- Dispatch Catalog Index -->
              <div class="font-mono text-[8px] uppercase tracking-[0.2em] text-zinc-500 font-medium">
                DISPATCH // ARCHIVE 0{{ index + 1 }}
              </div>

              <!-- Article Title -->
              <h2 class="text-lg sm:text-xl font-semibold tracking-tight text-white leading-snug group-hover:text-zinc-100 transition-colors">
                {{ article.title }}
              </h2>

              <!-- Divider -->
              <div
                class="w-full h-[1px] opacity-25"
                :style="{
                  background: `linear-gradient(90deg, ${article.accentColor || '#38bdf8'} 0%, transparent 100%)`
                }"
              ></div>

              <!-- Excerpt -->
              <p class="text-xs sm:text-[12.5px] text-zinc-300 leading-relaxed font-sans line-clamp-4 font-normal">
                {{ article.excerpt }}
              </p>
            </div>

            <!-- Footer: Tags & Direct External Read Action -->
            <div class="space-y-3 pt-4 border-t border-white/10">
              <!-- Topic Tags -->
              <div v-if="article.tags && article.tags.length" class="flex flex-wrap gap-1">
                <span
                  v-for="tag in article.tags.slice(0, 3)"
                  :key="tag"
                  class="px-1.5 py-0.5 rounded text-[8.5px] font-mono uppercase bg-white/5 border border-white/10 text-zinc-400"
                >
                  #{{ tag }}
                </span>
              </div>

              <!-- Card Action Bar -->
              <div class="flex items-center justify-between pt-1">
                <span class="font-mono text-[9px] uppercase tracking-wider text-zinc-500">
                  {{ selectedArticle?.id === article.id ? 'FEATURED' : 'TAP TO SELECT' }}
                </span>

                <!-- Explicit External Link Button -->
                <a
                  v-if="selectedArticle?.id === article.id && article.url"
                  :href="article.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-[10px] uppercase tracking-wider font-semibold transition-all duration-200 cursor-pointer shadow-sm group/btn hover:scale-[1.03] active:scale-95"
                  :style="{
                    backgroundColor: article.accentColor ? `${article.accentColor}20` : 'rgba(56, 189, 248, 0.15)',
                    borderColor: article.accentColor ? `${article.accentColor}55` : 'rgba(56, 189, 248, 0.4)',
                    color: article.accentColor || '#38bdf8'
                  }"
                  title="Read full publication on Codeary (opens in new tab)"
                  @click.stop
                >
                  <span>READ FULL ARTICLE</span>
                  <span class="transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5">↗</span>
                </a>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>

    <!-- Spatial Deck Navigation Stepper (Bottom-Center) -->
    <div
      v-if="filteredArticles.length > 1"
      class="pointer-events-auto absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-white/10 bg-black/80 backdrop-blur-xl shadow-2xl select-none"
    >
      <button
        type="button"
        class="w-7 h-7 rounded-full border border-white/10 hover:border-white/30 hover:bg-white/10 active:scale-90 flex items-center justify-center text-xs font-mono text-zinc-300 hover:text-white transition cursor-pointer"
        aria-label="Previous article"
        title="Previous article (Left Arrow)"
        @click="prevArticle"
      >
        ‹
      </button>
      <span class="font-mono text-[10px] text-zinc-400 tracking-widest px-1">
        <span class="text-white font-semibold">{{ selectedArticleIndex + 1 }}</span> / {{ filteredArticles.length }}
      </span>
      <button
        type="button"
        class="w-7 h-7 rounded-full border border-white/10 hover:border-white/30 hover:bg-white/10 active:scale-90 flex items-center justify-center text-xs font-mono text-zinc-300 hover:text-white transition cursor-pointer"
        aria-label="Next article"
        title="Next article (Right Arrow)"
        @click="nextArticle"
      >
        ›
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { registerContentNavigator } from '@/composables/useShowcase'
import { portfolioContent } from '@/content/portfolioContent'
import { useWritingPosts, type BlogPost } from '@/composables/useWritingPosts'
import type { KnowledgeArticle, CategoryFilter } from '../writing/knowledgeTypes'
import { fallbackArticles } from '../writing/fallbackArticles'
import { getCategoryAccentColor, calculateReadingTime, getCardSpatialStyle } from '../writing/articlePosition'
import WritingFilters from '../writing/WritingFilters.vue'
import Showcase3DLoader from '../Showcase3DLoader.vue'
import {
  createGridLines,
  createCoastlineGeometry,
  createLandPointsGeometry,
} from '@/components/globe/globeMath'

// -------------------------------------------------------------
// DATA INGESTION & EXTERNAL CODERY ROUTING
// -------------------------------------------------------------
const { posts, loading } = useWritingPosts()

function mapPostToArticle(post: BlogPost): KnowledgeArticle {
  const category = post.tags && post.tags.length > 0 ? post.tags[0] : 'Engineering'
  const blogUrl = portfolioContent.writing.blogUrl || 'https://codeary.xyz'
  // Codeary's genuine article URL structure
  const url = new URL(`/${encodeURIComponent(post.slug)}`, blogUrl).href
  const year = post.date ? post.date.slice(0, 4) : ''

  return {
    id: post.id || post.slug,
    title: post.title,
    shortTitle: post.title.length > 32 ? `${post.title.slice(0, 29)}...` : post.title,
    category,
    date: post.dateLabel || post.date || year,
    year,
    excerpt: post.excerpt || '',
    tags: post.tags || [],
    url,
  }
}

// Articles: driven by live API if available, populated with curated fallback articles otherwise
const articles = computed<KnowledgeArticle[]>(() => {
  if (posts.value && posts.value.length > 0) {
    return posts.value.map(mapPostToArticle)
  }
  return fallbackArticles
})

// Dynamic Categories derived directly from article tags/categories
const availableCategories = computed<CategoryFilter[]>(() => {
  const tagSet = new Set<string>()
  articles.value.forEach(a => {
    if (a.tags && a.tags.length > 0) {
      a.tags.forEach(t => tagSet.add(t))
    } else if (a.category) {
      tagSet.add(a.category)
    }
  })
  const list = Array.from(tagSet)
  return list.length > 0 ? ['ALL', ...list] : ['ALL']
})

const selectedCategory = ref<CategoryFilter>('ALL')

function isArticleInCategory(article: KnowledgeArticle, category: CategoryFilter): boolean {
  if (category === 'ALL') return true
  return article.category === category || article.tags.includes(category)
}

const filteredArticles = computed<KnowledgeArticle[]>(() => {
  const list = selectedCategory.value === 'ALL'
    ? articles.value
    : articles.value.filter(a => isArticleInCategory(a, selectedCategory.value))

  return list.map(a => {
    const accentColor = getCategoryAccentColor(a.category, a.tags)
    const readingTime = calculateReadingTime(a.excerpt)
    return {
      ...a,
      accentColor,
      readingTime,
    }
  })
})

const selectedArticleId = ref<string>('')

// Keep selectedArticle reactive and synchronized
const selectedArticle = computed<KnowledgeArticle | null>(() => {
  if (!filteredArticles.value.length) return null
  return (
    filteredArticles.value.find(a => a.id === selectedArticleId.value) ||
    filteredArticles.value[0] ||
    null
  )
})

const selectedArticleIndex = computed<number>(() => {
  if (!selectedArticle.value) return 0
  const idx = filteredArticles.value.findIndex(a => a.id === selectedArticle.value?.id)
  return idx >= 0 ? idx : 0
})

// Navigation methods
function selectArticle(id: string) {
  selectedArticleId.value = id
}

function prevArticle() {
  const list = filteredArticles.value
  if (list.length <= 1) return
  const currentIdx = selectedArticleIndex.value
  const newIdx = (currentIdx - 1 + list.length) % list.length
  selectArticle(list[newIdx].id)
}

function nextArticle() {
  const list = filteredArticles.value
  if (list.length <= 1) return
  const currentIdx = selectedArticleIndex.value
  const newIdx = (currentIdx + 1) % list.length
  selectArticle(list[newIdx].id)
}

function setCategory(cat: CategoryFilter) {
  selectedCategory.value = cat
  const list = filteredArticles.value
  if (list.length && !list.some(a => a.id === selectedArticle.value?.id)) {
    selectArticle(list[0].id)
  }
}

function onCardClick(articleId: string) {
  selectArticle(articleId)
}

// -------------------------------------------------------------
// TOUCH & DECK DRAG GESTURES
// -------------------------------------------------------------
let deckPointerStartX = 0
let deckPointerStartY = 0
let isDeckDragging = false

function onDeckPointerDown(e: PointerEvent) {
  deckPointerStartX = e.clientX
  deckPointerStartY = e.clientY
  isDeckDragging = true
}

function onDeckPointerMove(e: PointerEvent) {
  if (!isDeckDragging) return
}

function onDeckPointerUp(e: PointerEvent) {
  if (!isDeckDragging) return
  isDeckDragging = false
  const diffX = e.clientX - deckPointerStartX
  const diffY = e.clientY - deckPointerStartY
  // Horizontal swipe threshold
  if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY)) {
    if (diffX < 0) {
      nextArticle()
    } else {
      prevArticle()
    }
  }
}

// -------------------------------------------------------------
// THREE.JS CINEMATIC EARTH BACKGROUND ENGINE
// -------------------------------------------------------------
const container = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const isMobile = ref(false)

const globeMode = ref<'real' | 'tech'>('real')
function setGlobeMode(mode: 'real' | 'tech') {
  globeMode.value = mode
  applyThemeMaterials(mode === 'tech')
}

const GLOBE_RADIUS = 1.45

let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let animFrameId = 0
let resizeObserver: ResizeObserver | null = null

let globeGroup: THREE.Group | null = null
let starfieldGroup: THREE.Group | null = null

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

let ambientLight: THREE.AmbientLight | null = null
let sunLight: THREE.DirectionalLight | null = null

let isCanvasDragging = false
let canvasPointerDownPos = { x: 0, y: 0 }
let lastCanvasPointerPos = { x: 0, y: 0 }
let canvasDragVelocity = { x: 0, y: 0 }
let lastCanvasInteractionTime = 0
let reducedMotion = false

function applyThemeMaterials(isTech: boolean) {
  if (baseSphere) baseSphere.visible = isTech
  if (gridLineMesh) gridLineMesh.visible = isTech
  if (landPointsMesh) landPointsMesh.visible = isTech
  if (coastMesh) coastMesh.visible = isTech

  if (realEarthMesh) realEarthMesh.visible = !isTech
  if (cloudsMesh) cloudsMesh.visible = !isTech
  if (atmosphereMesh) atmosphereMesh.visible = !isTech

  if (sunLight) {
    sunLight.intensity = isTech ? 2.0 : 2.4
  }
}

function initThree() {
  if (!canvas.value || !container.value) return

  const width = container.value.clientWidth || window.innerWidth
  const height = container.value.clientHeight || window.innerHeight
  isMobile.value = width < 640

  // 1. Scene & Camera
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100)
  const initialDist = width < 640 ? 4.6 : (width < 1024 ? 4.2 : 3.85)
  camera.position.set(0, 0, initialDist)

  // Subtle Ambient & Sun Lights for Cinematic Depth Behind Cards
  ambientLight = new THREE.AmbientLight(0xffffff, 0.45)
  scene.add(ambientLight)

  sunLight = new THREE.DirectionalLight(0xffffff, 2.3)
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
  globeGroup.rotation.z = 0
  scene.add(globeGroup)

  // 4. Base Sphere (Technical Dark Globe)
  const sphereGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64)
  baseSphereMat = new THREE.MeshBasicMaterial({
    color: 0x06080e,
    transparent: true,
    opacity: 0.98,
  })
  baseSphere = new THREE.Mesh(sphereGeo, baseSphereMat)
  baseSphere.visible = globeMode.value === 'tech'
  globeGroup.add(baseSphere)

  // 5. Procedural Lat/Long Grid Lines
  const gridGeo = createGridLines(GLOBE_RADIUS * 1.002)
  gridLineMat = new THREE.LineBasicMaterial({
    color: 0x334155,
    transparent: true,
    opacity: 0.16,
  })
  gridLineMesh = new THREE.LineSegments(gridGeo, gridLineMat)
  gridLineMesh.visible = globeMode.value === 'tech'
  globeGroup.add(gridLineMesh)

  // 6. Procedural Land Points Cloud
  const landPointsGeo = createLandPointsGeometry(GLOBE_RADIUS * 1.006)
  landPointsMat = new THREE.PointsMaterial({
    color: 0x94a3b8,
    size: 0.024,
    transparent: true,
    opacity: 0.75,
  })
  landPointsMesh = new THREE.Points(landPointsGeo, landPointsMat)
  landPointsMesh.visible = globeMode.value === 'tech'
  globeGroup.add(landPointsMesh)

  // 7. Procedural Coastlines
  const coastGeo = createCoastlineGeometry(GLOBE_RADIUS * 1.008)
  coastMat = new THREE.LineBasicMaterial({
    color: 0x475569,
    transparent: true,
    opacity: 0.32,
  })
  coastMesh = new THREE.LineSegments(coastGeo, coastMat)
  coastMesh.visible = globeMode.value === 'tech'
  globeGroup.add(coastMesh)

  // 8. Photorealistic Real Earth Textures & Atmospheric Fresnel
  const textureLoader = new THREE.TextureLoader()
  const dayTexture = textureLoader.load('/textures/earth/earth_day.jpg')
  dayTexture.colorSpace = THREE.SRGBColorSpace
  const specularTexture = textureLoader.load('/textures/earth/earth_specular.jpg')
  const cloudsTexture = textureLoader.load('/textures/earth/earth_clouds.png')

  const realEarthGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64)
  realEarthMat = new THREE.MeshStandardMaterial({
    map: dayTexture,
    roughnessMap: specularTexture,
    roughness: 0.68,
    metalness: 0.06,
  })
  realEarthMesh = new THREE.Mesh(realEarthGeo, realEarthMat)
  realEarthMesh.visible = globeMode.value === 'real'
  globeGroup.add(realEarthMesh)

  // Dynamic Cloud Layer
  const cloudsGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.01, 64, 64)
  cloudsMat = new THREE.MeshStandardMaterial({
    map: cloudsTexture,
    transparent: true,
    opacity: 0.75,
    blending: THREE.NormalBlending,
    depthWrite: false,
    roughness: 0.9,
  })
  cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat)
  cloudsMesh.visible = globeMode.value === 'real'
  globeGroup.add(cloudsMesh)

  // Outer Atmospheric Fresnel Glow
  const atmosphereGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.034, 64, 64)
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
        gl_FragColor = vec4(col, intensity * dayFactor * 1.15);
      }
    `,
  })
  atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat)
  atmosphereMesh.visible = globeMode.value === 'real'
  globeGroup.add(atmosphereMesh)

  // 9. Starfield Celestial Background
  starfieldGroup = new THREE.Group()
  scene.add(starfieldGroup)
  buildStarfield()

  applyThemeMaterials(globeMode.value === 'tech')

  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  lastTime = performance.now()
  renderLoop()
}

function buildStarfield() {
  if (!starfieldGroup) return
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
  starfieldGroup.add(stars)
}

// -------------------------------------------------------------
// RENDER LOOP & PARALLAX BACKGROUND ROTATION
// -------------------------------------------------------------
let lastTime = 0

function renderLoop() {
  animFrameId = requestAnimationFrame(renderLoop)

  const currentTime = performance.now()
  const delta = Math.min((currentTime - lastTime) * 0.001, 0.1)
  lastTime = currentTime

  if (globeGroup) {
    if (isCanvasDragging) {
      lastCanvasInteractionTime = currentTime
    } else {
      if (Math.abs(canvasDragVelocity.x) > 0.0001 || Math.abs(canvasDragVelocity.y) > 0.0001) {
        globeGroup.rotation.y += canvasDragVelocity.x
        globeGroup.rotation.x = Math.max(-1.15, Math.min(1.15, globeGroup.rotation.x + canvasDragVelocity.y))
        canvasDragVelocity.x *= 0.92
        canvasDragVelocity.y *= 0.92
      } else {
        // Parallax background alignment with active article index
        const targetParallaxY = selectedArticleIndex.value * -0.22
        const diffY = (targetParallaxY - globeGroup.rotation.y) % (Math.PI * 2)
        const shortestDiffY = ((diffY + Math.PI * 3) % (Math.PI * 2)) - Math.PI
        globeGroup.rotation.y += shortestDiffY * 0.04

        // Gentle idle drift
        if (!reducedMotion && (currentTime - lastCanvasInteractionTime > 2500)) {
          globeGroup.rotation.y += delta * 0.012
        }
      }
    }

    if (cloudsMesh && cloudsMesh.visible && !reducedMotion) {
      cloudsMesh.rotation.y += delta * 0.01
    }
  }

  if (renderer && scene && camera) {
    renderer.render(scene, camera)
  }
}

// Canvas drag for background planet
function onCanvasPointerDown(e: PointerEvent) {
  if (e.button !== 0) return
  isCanvasDragging = true
  canvasPointerDownPos = { x: e.clientX, y: e.clientY }
  lastCanvasPointerPos = { x: e.clientX, y: e.clientY }
  canvasDragVelocity = { x: 0, y: 0 }
  lastCanvasInteractionTime = performance.now()
}

function onCanvasPointerMove(e: PointerEvent) {
  if (isCanvasDragging && globeGroup) {
    const dx = e.clientX - lastCanvasPointerPos.x
    const dy = e.clientY - lastCanvasPointerPos.y

    globeGroup.rotation.y += dx * 0.0055
    globeGroup.rotation.x = Math.max(-1.15, Math.min(1.15, globeGroup.rotation.x + dy * 0.0055))

    canvasDragVelocity = { x: dx * 0.0025, y: dy * 0.0025 }
    lastCanvasPointerPos = { x: e.clientX, y: e.clientY }
    lastCanvasInteractionTime = performance.now()
  }
}

function onCanvasPointerUp() {
  isCanvasDragging = false
}

function handleResize() {
  if (!container.value || !camera || !renderer) return
  const w = container.value.clientWidth
  const h = container.value.clientHeight
  isMobile.value = w < 640

  camera.aspect = w / h
  camera.updateProjectionMatrix()
  const targetDist = w < 640 ? 4.6 : (w < 1024 ? 4.2 : 3.85)
  camera.position.z = targetDist
  renderer.setSize(w, h)
}

// Lifecycle
let unregisterNavigator: (() => void) | null = null

onMounted(() => {
  initThree()

  if (container.value) {
    resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(container.value)
  }

  // Register Keyboard Navigator (Left / Right Arrows in 3D Showcase)
  unregisterNavigator = registerContentNavigator((direction) => {
    if (direction === 'next') {
      nextArticle()
    } else {
      prevArticle()
    }
  })
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animFrameId)
  resizeObserver?.disconnect()
  unregisterNavigator?.()

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
.writing-editorial-archive-scene {
  background: radial-gradient(circle at 50% 50%, #060b14 0%, #02050a 80%, #010204 100%);
}

.gallery-ambient-vignette {
  background: radial-gradient(circle at 50% 50%, rgba(2, 5, 10, 0.25) 30%, rgba(2, 5, 10, 0.65) 75%, rgba(2, 5, 10, 0.95) 100%);
}

/* Cosmic Ambient Glow */
.showcase-glow-dark {
  background: radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.05) 0%, transparent 65%);
}

.showcase-glow-light {
  background: radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.08) 0%, transparent 70%);
}

.showcase-grid-dark {
  background-size: 36px 36px;
  background-image:
    linear-gradient(to right, rgba(255, 255, 255, 0.18) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.18) 1px, transparent 1px);
}

/* 3D Perspective Editorial Deck Viewport */
.editorial-stage-viewport {
  perspective: 1200px;
  perspective-origin: 50% 50%;
}

.editorial-card-wrapper {
  transform-style: preserve-3d;
}

@media (max-width: 640px) {
  .editorial-stage-viewport {
    perspective: 800px;
  }
}
</style>
