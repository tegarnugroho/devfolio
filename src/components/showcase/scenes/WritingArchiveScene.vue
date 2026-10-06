<template>
  <div
    ref="container"
    class="writing-knowledge-field-scene relative w-full h-full select-none overflow-hidden bg-[#03060b]"
    @click="onBackgroundClick"
  >
    <!-- WebGL Canvas for 3D Knowledge Field -->
    <canvas
      ref="canvas"
      class="w-full h-full block cursor-grab active:cursor-grabbing outline-none"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @wheel="onWheel"
    ></canvas>

    <!-- Deep Ambient Vignette (Seamless background blend) -->
    <div class="pointer-events-none absolute inset-0 gallery-ambient-vignette" aria-hidden="true"></div>

    <!-- Loading State -->
    <div
      v-if="loading && articles.length === 0"
      class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 z-30 font-mono text-zinc-400 select-none"
    >
      <div class="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
      <span class="tracking-widest uppercase text-[10px] text-zinc-400">
        {{ portfolioContent.writing.loadingLabel || 'LOADING KNOWLEDGE FIELD...' }}
      </span>
    </div>

    <!-- Error State -->
    <div
      v-else-if="failed && articles.length === 0"
      class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 z-30 font-mono text-zinc-400 select-none"
    >
      <span class="text-zinc-500 text-lg">✕</span>
      <span class="tracking-wider uppercase text-[11px] text-zinc-400 max-w-xs text-center px-4">
        {{ portfolioContent.writing.errorLabel }}
      </span>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="articles.length === 0"
      class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 z-30 font-mono text-zinc-400 select-none"
    >
      <span class="tracking-wider uppercase text-[11px] text-zinc-500">
        {{ portfolioContent.writing.emptyLabel }}
      </span>
    </div>

    <!-- Section Header & Category Filters (Left Side) -->
    <WritingFilters
      v-if="articles.length > 0"
      :categories="availableCategories"
      :selected-category="selectedCategory"
      :count="filteredArticles.length"
      @select-category="setCategory"
    />

    <!-- Hover Tooltip -->
    <div
      v-if="hoveredArticle && hoveredArticle.id !== selectedArticle?.id"
      class="pointer-events-none absolute z-30 px-2.5 py-1 rounded bg-zinc-950/95 text-zinc-200 border border-white/15 shadow-2xl font-mono text-[9.5px] -translate-x-1/2 -translate-y-full tracking-wider transition-opacity duration-150 backdrop-blur-md"
      :style="{ left: `${hoverScreenPos.x}px`, top: `${hoverScreenPos.y - 12}px` }"
    >
      <span class="text-zinc-400 font-medium">[{{ hoveredArticle.category }}]</span>
      <span class="ml-1 text-zinc-100">{{ hoveredArticle.shortTitle }}</span>
    </div>

    <!-- Selected Article Editorial Preview Panel (Right / Bottom-Right) -->
    <WritingArticlePanel
      v-if="articles.length > 0"
      :article="selectedArticle"
      :current-index="selectedArticleIndex"
      :total-count="filteredArticles.length"
      @prev="prevArticle"
      @next="nextArticle"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { registerContentNavigator } from '@/composables/useShowcase'
import { portfolioContent } from '@/content/portfolioContent'
import { useWritingPosts, type BlogPost } from '@/composables/useWritingPosts'
import type { KnowledgeArticle, CategoryFilter } from '../writing/knowledgeTypes'
import { createCardTexture } from '../writing/cardTextureGenerator'
import { calculateNodeTransform, buildRelationshipPairs } from '../writing/articlePosition'
import WritingFilters from '../writing/WritingFilters.vue'
import WritingArticlePanel from '../writing/WritingArticlePanel.vue'

// Live API Data Hook (Identical data source as the 2D Writing section)
const { posts, loading, failed } = useWritingPosts()

// Map BlogPost from API to KnowledgeArticle
function mapPostToArticle(post: BlogPost): KnowledgeArticle {
  const category = post.tags && post.tags.length > 0 ? post.tags[0] : 'Engineering'
  const blogUrl = portfolioContent.writing.blogUrl || 'https://codeary.xyz'
  const url = new URL(`/${encodeURIComponent(post.slug)}`, blogUrl).href
  const year = post.date ? post.date.slice(0, 4) : ''

  return {
    id: post.id || post.slug,
    title: post.title,
    shortTitle: post.title.length > 28 ? `${post.title.slice(0, 25)}...` : post.title,
    category,
    date: post.dateLabel || post.date || year,
    year,
    excerpt: post.excerpt || '',
    tags: post.tags || [],
    url,
  }
}

// Articles strictly driven by API response
const articles = computed<KnowledgeArticle[]>(() => {
  return posts.value.map(mapPostToArticle)
})

// Dynamic Categories derived directly from API tags
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

const filteredArticles = computed<KnowledgeArticle[]>(() => {
  if (selectedCategory.value === 'ALL') return articles.value
  return articles.value.filter(
    a => a.category === selectedCategory.value || a.tags.includes(selectedCategory.value)
  )
})

const selectedArticleId = ref<string>('')

// Keep selectedArticle reactive and synchronized
const selectedArticle = computed<KnowledgeArticle | null>(() => {
  if (!articles.value.length) return null
  return (
    articles.value.find(a => a.id === selectedArticleId.value) ||
    filteredArticles.value[0] ||
    articles.value[0] ||
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
  if (!list.length) return
  const currentIdx = selectedArticleIndex.value
  const newIdx = (currentIdx - 1 + list.length) % list.length
  selectedArticleId.value = list[newIdx].id
}

function nextArticle() {
  const list = filteredArticles.value
  if (!list.length) return
  const currentIdx = selectedArticleIndex.value
  const newIdx = (currentIdx + 1) % list.length
  selectedArticleId.value = list[newIdx].id
}

function setCategory(cat: CategoryFilter) {
  selectedCategory.value = cat
  const list = filteredArticles.value
  if (list.length && !list.some(a => a.id === selectedArticleId.value)) {
    selectedArticleId.value = list[0].id
  }
}

// -------------------------------------------------------------
// THREE.JS SPATIAL KNOWLEDGE FIELD
// -------------------------------------------------------------
const container = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let animFrameId = 0
let isVisible = true
let observer: IntersectionObserver | null = null

// Groups & Objects
let fieldGroup: THREE.Group | null = null
let linesMesh: THREE.LineSegments | null = null
let linesGeometry: THREE.BufferGeometry | null = null

interface Card3DNode {
  article: KnowledgeArticle
  index: number
  group: THREE.Group
  mesh: THREE.Mesh
  materials: THREE.Material[]
  activeTexture: THREE.CanvasTexture
  inactiveTexture: THREE.CanvasTexture
  targetPos: THREE.Vector3
  targetRot: THREE.Euler
  targetScale: number
  targetOpacity: number
  currentOpacity: number
}

const cardNodes: Card3DNode[] = []
let sharedBoxGeometry: THREE.BoxGeometry | null = null
let sharedShadowGeometry: THREE.PlaneGeometry | null = null
let sharedShadowMaterial: THREE.MeshBasicMaterial | null = null

// Interaction State
const isMobile = ref(false)
const prefersReducedMotion = ref(false)

const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2(-999, -999)
const hoveredArticle = ref<KnowledgeArticle | null>(null)
const hoverScreenPos = ref({ x: 0, y: 0 })

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

// Create soft radial shadow texture for card elevation
function createShadowTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 128
  c.height = 128
  const ctx = c.getContext('2d')
  if (ctx) {
    const g = ctx.createRadialGradient(64, 64, 10, 64, 64, 60)
    g.addColorStop(0, 'rgba(0, 0, 0, 0.75)')
    g.addColorStop(0.5, 'rgba(0, 0, 0, 0.35)')
    g.addColorStop(1, 'rgba(0, 0, 0, 0.0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 128, 128)
  }
  const t = new THREE.CanvasTexture(c)
  t.generateMipmaps = false
  return t
}

function clear3DNodes() {
  cardNodes.forEach(node => {
    node.activeTexture.dispose()
    node.inactiveTexture.dispose()
    node.materials.forEach(m => m.dispose())
    if (fieldGroup) {
      fieldGroup.remove(node.group)
    }
  })
  cardNodes.length = 0

  if (linesMesh && fieldGroup) {
    fieldGroup.remove(linesMesh)
    if (linesGeometry) linesGeometry.dispose()
    if (Array.isArray(linesMesh.material)) linesMesh.material.forEach(m => m.dispose())
    else linesMesh.material.dispose()
    linesMesh = null
    linesGeometry = null
  }
}

function build3DNodes() {
  if (!fieldGroup || !articles.value.length) return

  clear3DNodes()

  if (!selectedArticleId.value && articles.value.length > 0) {
    selectedArticleId.value = articles.value[0].id
  }

  articles.value.forEach((article, index) => {
    const nodeGroup = new THREE.Group()

    const activeTexture = createCardTexture(article, index, true)
    const inactiveTexture = createCardTexture(article, index, false)

    const isSelected = article.id === selectedArticleId.value

    const sideMaterial = new THREE.MeshStandardMaterial({
      color: 0x0c0f14,
      roughness: 0.8,
      metalness: 0.2,
      transparent: true,
      opacity: 0.4,
    })
    const backMaterial = new THREE.MeshStandardMaterial({
      color: 0x07090c,
      roughness: 0.9,
      metalness: 0.1,
      transparent: true,
      opacity: 0.4,
    })
    const frontMaterial = new THREE.MeshStandardMaterial({
      map: isSelected ? activeTexture : inactiveTexture,
      roughness: 0.3,
      metalness: 0.1,
      transparent: true,
      opacity: isSelected ? 1.0 : 0.38,
    })

    const materials = [
      sideMaterial,
      sideMaterial,
      sideMaterial,
      sideMaterial,
      frontMaterial,
      backMaterial,
    ]

    const mesh = new THREE.Mesh(sharedBoxGeometry!, materials)
    mesh.userData = { articleId: article.id }
    nodeGroup.add(mesh)

    const shadowMesh = new THREE.Mesh(sharedShadowGeometry!, sharedShadowMaterial!)
    shadowMesh.position.z = -0.025
    nodeGroup.add(shadowMesh)

    const transform = calculateNodeTransform(
      article,
      articles.value,
      selectedArticleId.value,
      selectedCategory.value,
      isMobile.value
    )

    nodeGroup.position.set(...transform.position)
    nodeGroup.rotation.set(...transform.rotation)
    nodeGroup.scale.setScalar(transform.scale)

    fieldGroup!.add(nodeGroup)

    cardNodes.push({
      article,
      index,
      group: nodeGroup,
      mesh,
      materials,
      activeTexture,
      inactiveTexture,
      targetPos: new THREE.Vector3(...transform.position),
      targetRot: new THREE.Euler(...transform.rotation),
      targetScale: transform.scale,
      targetOpacity: transform.opacity,
      currentOpacity: transform.opacity,
    })
  })

  setupRelationshipLines()
  updateNodeTargets()
}

function initThree() {
  if (!container.value || !canvas.value) return

  const width = container.value.clientWidth || window.innerWidth
  const height = container.value.clientHeight || window.innerHeight

  isMobile.value = width < 768
  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 100)
  camera.position.set(0, 0.15, isMobile.value ? 8.6 : 7.8)

  renderer = new THREE.WebGLRenderer({
    canvas: canvas.value,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.65)
  scene.add(ambientLight)

  const keyLight = new THREE.DirectionalLight(0xffffff, 0.75)
  keyLight.position.set(2, 4, 5)
  scene.add(keyLight)

  const rimLight = new THREE.DirectionalLight(0x94a3b8, 0.35)
  rimLight.position.set(-3, -2, -2)
  scene.add(rimLight)

  fieldGroup = new THREE.Group()
  scene.add(fieldGroup)

  sharedBoxGeometry = new THREE.BoxGeometry(1.85, 2.4, 0.035)
  sharedShadowGeometry = new THREE.PlaneGeometry(2.1, 2.65)

  const shadowTexture = createShadowTexture()
  sharedShadowMaterial = new THREE.MeshBasicMaterial({
    map: shadowTexture,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
  })

  // Build nodes if articles are already available
  if (articles.value.length > 0) {
    build3DNodes()
  }

  // Animation Loop
  let lastTime = performance.now()
  function loop(now: number) {
    animFrameId = requestAnimationFrame(loop)
    if (!isVisible) return

    const delta = Math.min((now - lastTime) / 1000, 0.1)
    lastTime = now
    const time = now * 0.001

    currentFieldRotY = THREE.MathUtils.lerp(currentFieldRotY, targetFieldRotY, delta * 4.5)
    currentFieldRotX = THREE.MathUtils.lerp(currentFieldRotX, targetFieldRotX, delta * 4.5)
    if (fieldGroup) {
      fieldGroup.rotation.y = currentFieldRotY
      fieldGroup.rotation.x = currentFieldRotX
    }

    currentCamX = THREE.MathUtils.lerp(currentCamX, targetCamX, delta * 3.5)
    currentCamY = THREE.MathUtils.lerp(currentCamY, targetCamY, delta * 3.5)
    if (camera) {
      camera.position.x = currentCamX
      camera.position.y = 0.15 + currentCamY
      camera.lookAt(0, 0, 0)
    }

    cardNodes.forEach((node, i) => {
      let floatY = 0
      let floatRotZ = 0
      if (!prefersReducedMotion.value) {
        floatY = Math.sin(time * 0.85 + i * 1.35) * 0.05
        floatRotZ = Math.cos(time * 0.65 + i * 1.1) * 0.012
      }

      const tempPos = node.targetPos.clone()
      tempPos.y += floatY

      const tempRot = node.targetRot.clone()
      tempRot.z += floatRotZ

      let scaleMult = 1.0
      if (hoveredArticle.value?.id === node.article.id && node.article.id !== selectedArticleId.value) {
        tempPos.z += 0.18
        scaleMult = 1.05
      }

      node.group.position.lerp(tempPos, delta * 4.8)

      const targetQuat = new THREE.Quaternion().setFromEuler(tempRot)
      node.group.quaternion.slerp(targetQuat, delta * 4.8)

      const finalScale = node.targetScale * scaleMult
      node.group.scale.lerp(new THREE.Vector3(finalScale, finalScale, finalScale), delta * 4.8)

      node.currentOpacity = THREE.MathUtils.lerp(node.currentOpacity, node.targetOpacity, delta * 4.8)
      node.materials.forEach(mat => {
        mat.opacity = node.currentOpacity
      })
    })

    updateLinesPositions()

    if (renderer && scene && camera) {
      renderer.render(scene, camera)
    }
  }

  animFrameId = requestAnimationFrame(loop)
}

function setupRelationshipLines() {
  if (!fieldGroup || !articles.value.length) return

  linesGeometry = new THREE.BufferGeometry()
  const pairs = buildRelationshipPairs(articles.value, selectedCategory.value)
  const positions = new Float32Array(pairs.length * 6)
  linesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  const linesMaterial = new THREE.LineBasicMaterial({
    color: 0x64748b,
    transparent: true,
    opacity: 0.16,
    depthWrite: false,
  })

  linesMesh = new THREE.LineSegments(linesGeometry, linesMaterial)
  fieldGroup.add(linesMesh)
}

function updateLinesPositions() {
  if (!linesGeometry || !linesMesh) return

  const pairs = buildRelationshipPairs(articles.value, selectedCategory.value)
  const posAttr = linesGeometry.getAttribute('position') as THREE.BufferAttribute
  if (!posAttr || posAttr.count !== pairs.length * 2) {
    linesGeometry.dispose()
    const positions = new Float32Array(pairs.length * 6)
    linesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  }

  const currentPosAttr = linesGeometry.getAttribute('position') as THREE.BufferAttribute
  const array = currentPosAttr.array as Float32Array

  let idx = 0
  for (const [i1, i2] of pairs) {
    const node1 = cardNodes[i1]
    const node2 = cardNodes[i2]
    if (node1 && node2) {
      array[idx++] = node1.group.position.x
      array[idx++] = node1.group.position.y
      array[idx++] = node1.group.position.z

      array[idx++] = node2.group.position.x
      array[idx++] = node2.group.position.y
      array[idx++] = node2.group.position.z
    }
  }

  currentPosAttr.needsUpdate = true
}

function updateNodeTargets() {
  cardNodes.forEach(node => {
    const isSelected = node.article.id === selectedArticleId.value
    const transform = calculateNodeTransform(
      node.article,
      articles.value,
      selectedArticleId.value,
      selectedCategory.value,
      isMobile.value.valueOf()
    )

    node.targetPos.set(...transform.position)
    node.targetRot.set(...transform.rotation)
    node.targetScale = transform.scale
    node.targetOpacity = transform.opacity

    const frontMat = node.materials[4] as THREE.MeshStandardMaterial
    frontMat.map = isSelected ? node.activeTexture : node.inactiveTexture
    frontMat.needsUpdate = true
  })
}

// Rebuild or update targets when articles arrive from API or selection changes
watch(
  articles,
  newArticles => {
    if (newArticles.length > 0) {
      if (!selectedArticleId.value || !newArticles.some(a => a.id === selectedArticleId.value)) {
        selectedArticleId.value = newArticles[0].id
      }
      build3DNodes()
    } else {
      clear3DNodes()
    }
  },
  { deep: true }
)

watch([selectedArticleId, selectedCategory], () => {
  updateNodeTargets()
})

// Pointer & Interaction Handlers
function onPointerDown(e: PointerEvent) {
  isDragging = true
  prevPointerX = e.clientX
  prevPointerY = e.clientY
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

    targetFieldRotY = THREE.MathUtils.clamp(targetFieldRotY + dx * 0.0035, -0.42, 0.42)
    targetFieldRotX = THREE.MathUtils.clamp(targetFieldRotX + dy * 0.0025, -0.22, 0.22)
  } else {
    raycaster.setFromCamera(mouse, camera)
    const meshes = cardNodes.map(n => n.mesh)
    const intersects = raycaster.intersectObjects(meshes)

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object
      const articleId = hitMesh.userData.articleId
      const found = articles.value.find(a => a.id === articleId)
      if (
        found &&
        (selectedCategory.value === 'ALL' ||
          found.category === selectedCategory.value ||
          found.tags.includes(selectedCategory.value))
      ) {
        hoveredArticle.value = found
        hoverScreenPos.value = { x: e.clientX, y: e.clientY }
        if (canvas.value) canvas.value.style.cursor = 'pointer'
        return
      }
    }

    hoveredArticle.value = null
    if (canvas.value) canvas.value.style.cursor = isDragging ? 'grabbing' : 'grab'
  }
}

function onPointerUp(e: PointerEvent) {
  if (isDragging) {
    const dist = Math.hypot(e.clientX - prevPointerX, e.clientY - prevPointerY)
    if (dist < 4 && camera) {
      raycaster.setFromCamera(mouse, camera)
      const meshes = cardNodes.map(n => n.mesh)
      const intersects = raycaster.intersectObjects(meshes)
      if (intersects.length > 0) {
        const articleId = intersects[0].object.userData.articleId
        if (articleId) {
          selectArticle(articleId)
        }
      }
    }
  }
  isDragging = false
  if (canvas.value) canvas.value.style.cursor = 'grab'
}

function onWheel(e: WheelEvent) {
  if (!camera) return
  camera.position.z = THREE.MathUtils.clamp(
    camera.position.z + e.deltaY * 0.003,
    isMobile.value ? 7.2 : 6.5,
    isMobile.value ? 9.8 : 9.2
  )
}

function onBackgroundClick() {
  // Keep active article in focus
}

function onResize() {
  if (!container.value || !camera || !renderer) return
  const width = container.value.clientWidth || window.innerWidth
  const height = container.value.clientHeight || window.innerHeight

  isMobile.value = width < 768

  camera.aspect = width / height
  camera.position.z = isMobile.value ? 8.6 : 7.8
  camera.updateProjectionMatrix()

  renderer.setSize(width, height)
  updateNodeTargets()
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'ArrowLeft') {
    prevArticle()
  } else if (e.key === 'ArrowRight') {
    nextArticle()
  } else if (e.key === 'Enter') {
    if (selectedArticle.value?.url) {
      window.open(selectedArticle.value.url, '_blank', 'noopener,noreferrer')
    }
  }
}

let unregisterNavigator: (() => void) | null = null

onMounted(() => {
  initThree()

  window.addEventListener('resize', onResize)
  window.addEventListener('keydown', onKeyDown)

  unregisterNavigator = registerContentNavigator((direction: 'prev' | 'next') => {
    if (direction === 'prev') prevArticle()
    else nextArticle()
  })

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
  window.removeEventListener('keydown', onKeyDown)

  if (unregisterNavigator) unregisterNavigator()

  clear3DNodes()

  if (sharedBoxGeometry) sharedBoxGeometry.dispose()
  if (sharedShadowGeometry) sharedShadowGeometry.dispose()
  if (sharedShadowMaterial) {
    if (sharedShadowMaterial.map) sharedShadowMaterial.map.dispose()
    sharedShadowMaterial.dispose()
  }

  if (renderer) {
    renderer.dispose()
    renderer.forceContextLoss()
    renderer = null
  }
})
</script>

<style scoped>
.writing-knowledge-field-scene {
  background: radial-gradient(circle at 65% 40%, #080b10 0%, #03060b 80%);
}

.gallery-ambient-vignette {
  background: radial-gradient(circle at 50% 50%, transparent 40%, rgba(3, 6, 11, 0.75) 100%);
}
</style>
