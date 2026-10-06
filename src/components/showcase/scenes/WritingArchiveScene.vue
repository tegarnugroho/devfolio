<template>
  <div ref="container" class="writing-archive-scene relative w-full h-full select-none overflow-hidden bg-[#010206]">
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
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        DIGITAL ARCHIVE // CODEARY DISPATCHES
      </p>
      <p class="text-zinc-500 uppercase mt-0.5">
        CLICK ARTICLE SLAB TO INSPECT · REAL DESTINATIONS ON CODEARY
      </p>
    </div>

    <!-- Active Article Details Card (Bottom Overlay) -->
    <div
      v-if="selectedArticle"
      class="absolute bottom-6 sm:bottom-8 left-6 sm:left-8 right-6 sm:right-auto z-10 max-w-sm sm:max-w-md w-full pointer-events-auto"
    >
      <div class="p-4 sm:p-5 rounded-2xl border border-white/15 bg-black/85 backdrop-blur-xl shadow-2xl space-y-3">
        <div class="flex items-center justify-between gap-2">
          <span class="font-mono text-[9px] uppercase tracking-widest text-emerald-400 font-bold">
            {{ selectedArticle.date || 'ARTICLE' }}
          </span>
          <span class="font-mono text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-400/20">
            DISPATCH {{ selectedIndex + 1 }}
          </span>
        </div>

        <h3 class="text-sm sm:text-base font-bold text-white tracking-tight leading-snug">
          {{ selectedArticle.title }}
        </h3>

        <p class="text-xs text-zinc-300 leading-relaxed font-sans line-clamp-2">
          {{ selectedArticle.excerpt || 'Technical article exploring software architecture, Flutter development, and modern engineering patterns.' }}
        </p>

        <!-- Actions -->
        <div class="flex items-center justify-between pt-2 border-t border-white/10">
          <div class="flex items-center gap-1.5">
            <button
              type="button"
              class="px-2.5 py-1 rounded-full border border-white/15 text-[10px] font-mono text-zinc-300 hover:text-white hover:bg-white/10 active:scale-95 transition cursor-pointer"
              @click="prevArticle"
            >
              ‹
            </button>
            <button
              type="button"
              class="px-2.5 py-1 rounded-full border border-white/15 text-[10px] font-mono text-zinc-300 hover:text-white hover:bg-white/10 active:scale-95 transition cursor-pointer"
              @click="nextArticle"
            >
              ›
            </button>
          </div>

          <a
            :href="selectedArticle.url"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-mono text-[10px] uppercase tracking-wider font-bold transition cursor-pointer shadow-sm"
          >
            <span>READ ON CODEARY</span>
            <span>↗</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { portfolioContent } from '@/content/portfolioContent'
import { useWritingPosts, type BlogPost } from '@/composables/useWritingPosts'

interface ArchiveItem {
  id: string
  title: string
  date: string
  excerpt: string
  url: string
}

const { posts } = useWritingPosts()

const fallbackArticles: ArchiveItem[] = [
  {
    id: 'flutter-arch',
    title: 'Clean Architecture in Flutter: Scalable Domain Layer Patterns',
    date: 'MAR 2024',
    excerpt: 'Structuring state management, repository patterns, and use-cases for enterprise Flutter applications.',
    url: 'https://codeary.xyz',
  },
  {
    id: 'riverpod-guide',
    title: 'Reactive State Mastery with Riverpod 2.0',
    date: 'FEB 2024',
    excerpt: 'How code generation and auto-dispose providers eliminate memory leaks and boilerplates.',
    url: 'https://codeary.xyz',
  },
  {
    id: 'cross-platform-ui',
    title: 'Building Universal Desktop and Web UIs with Flutter',
    date: 'JAN 2024',
    excerpt: 'Adapting cursor events, shortcuts, and responsive layouts across platforms.',
    url: 'https://codeary.xyz',
  },
  {
    id: 'pos-offline-first',
    title: 'Engineering Offline-First Sync for Retail POS Systems',
    date: 'NOV 2023',
    excerpt: 'Managing local databases with SQLite and resilient WebSocket backpressure handling.',
    url: 'https://codeary.xyz',
  },
]

const articles = computed<ArchiveItem[]>(() => {
  if (posts.value && posts.value.length > 0) {
    return posts.value.map(p => ({
      id: p.id,
      title: p.title,
      date: p.dateLabel || 'RECENT',
      excerpt: p.excerpt,
      url: `${portfolioContent.writing.blogUrl}/posts/${p.slug}`,
    }))
  }
  return fallbackArticles
})

const selectedIndex = ref(0)
const selectedArticle = computed(() => articles.value[selectedIndex.value] || fallbackArticles[0])

const container = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let animFrameId = 0
let archiveGroup: THREE.Group | null = null
let slabMeshes: THREE.Mesh[] = []

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
  camera.position.set(0, 0, isMobile ? 6.2 : 5.0)

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
  const dir = new THREE.DirectionalLight(0x34d399, 1.8)
  dir.position.set(3, 4, 4)
  scene.add(dir)

  archiveGroup = new THREE.Group()
  scene.add(archiveGroup)

  // Build floating slabs in an arc
  buildSlabs()

  // Background Data Fragment Particles
  const particleCount = isMobile ? 400 : 1000
  const pPositions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    pPositions[i * 3] = (Math.random() - 0.5) * 16
    pPositions[i * 3 + 1] = (Math.random() - 0.5) * 12
    pPositions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2
  }
  const pGeo = new THREE.BufferGeometry()
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3))
  const pMat = new THREE.PointsMaterial({
    color: 0x34d399,
    size: 0.025,
    transparent: true,
    opacity: 0.45,
  })
  const pPoints = new THREE.Points(pGeo, pMat)
  scene.add(pPoints)

  let lastTime = performance.now()
  function loop(now: number) {
    animFrameId = requestAnimationFrame(loop)
    const delta = Math.min((now - lastTime) / 1000, 0.1)
    lastTime = now

    // Subtle floating bobbing motion
    slabMeshes.forEach((slab, i) => {
      const isSel = selectedIndex.value === i
      slab.position.y += Math.sin(now * 0.0015 + i * 0.8) * 0.0008
      const mat = slab.material as THREE.MeshStandardMaterial
      const targetEmissive = isSel ? 0x10b981 : 0x064e3b
      mat.emissive.setHex(targetEmissive)
      mat.emissiveIntensity = isSel ? 0.9 : 0.3
      const targetScale = isSel ? 1.08 : 0.95
      slab.scale.lerp(new THREE.Vector3(targetScale, targetScale, 1), 0.1)
    })

    if (!isDragging && archiveGroup) {
      archiveGroup.rotation.y = Math.sin(now * 0.0003) * 0.1
    }

    if (renderer && scene && camera) {
      renderer.render(scene, camera)
    }
  }
  animFrameId = requestAnimationFrame(loop)
}

function buildSlabs() {
  if (!archiveGroup) return
  slabMeshes = []
  const count = articles.value.length
  const radius = 2.6

  for (let i = 0; i < count; i++) {
    const angle = ((i - (count - 1) / 2) * 0.42)
    const x = Math.sin(angle) * radius
    const z = -Math.cos(angle) * radius + radius - 0.5
    const y = (i % 2 === 0 ? 0.15 : -0.15)

    const geo = new THREE.BoxGeometry(1.0, 0.65, 0.03)
    const mat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      emissive: 0x064e3b,
      emissiveIntensity: 0.3,
      metalness: 0.8,
      roughness: 0.3,
    })
    const slab = new THREE.Mesh(geo, mat)
    slab.position.set(x, y, z)
    slab.rotation.y = -angle * 0.6
    slab.userData = { index: i }
    archiveGroup.add(slab)

    // Glowing border edges
    const edges = new THREE.EdgesGeometry(geo)
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.6,
    })
    const wireframe = new THREE.LineSegments(edges, lineMat)
    slab.add(wireframe)

    slabMeshes.push(slab)
  }
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

  if (isDragging && archiveGroup) {
    const dx = e.clientX - prevX
    prevX = e.clientX
    archiveGroup.rotation.y += dx * 0.005
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
  const hits = raycaster.intersectObjects(slabMeshes, false)
  if (hits.length > 0) {
    const idx = hits[0].object.userData.index
    if (typeof idx === 'number') {
      selectedIndex.value = idx
    }
  }
}

function prevArticle() {
  selectedIndex.value = (selectedIndex.value - 1 + articles.value.length) % articles.value.length
}

function nextArticle() {
  selectedIndex.value = (selectedIndex.value + 1) % articles.value.length
}

function onResize() {
  if (!container.value || !camera || !renderer) return
  const w = container.value.clientWidth || window.innerWidth
  const h = container.value.clientHeight || window.innerHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
}

import { registerContentNavigator } from '@/composables/useShowcase'

let unregisterNav: (() => void) | null = null

onMounted(() => {
  initScene()
  window.addEventListener('resize', onResize)
  unregisterNav = registerContentNavigator((dir) => {
    if (dir === 'next') nextArticle()
    else prevArticle()
  })
})

onBeforeUnmount(() => {
  unregisterNav?.()
  window.removeEventListener('resize', onResize)
  if (animFrameId) cancelAnimationFrame(animFrameId)
  if (scene) {
    scene.traverse(obj => {
      if (obj instanceof THREE.Mesh || obj instanceof THREE.Points || obj instanceof THREE.LineSegments) {
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

