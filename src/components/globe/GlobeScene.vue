<template>
  <div ref="container" class="globe-viewport relative w-full h-full select-none touch-pan-y overflow-hidden">
    <!-- WebGL Canvas -->
    <canvas
      v-if="webglSupported"
      ref="canvas"
      class="w-full h-full block cursor-grab active:cursor-grabbing outline-none"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @pointerleave="onPointerLeave"
    ></canvas>

    <!-- WebGL Fallback -->
    <div v-else class="globe-fallback flex flex-col items-center justify-center p-6 text-center h-full">
      <div class="fallback-sphere mb-6">
        <svg viewBox="0 0 100 100" class="w-36 h-36 opacity-35 text-zinc-400">
          <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" stroke-width="1" />
          <ellipse cx="50" cy="50" rx="46" ry="16" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3" />
          <line x1="50" y1="4" x2="50" y2="96" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3" />
          <line x1="4" y1="50" x2="96" y2="50" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3" />
        </svg>
      </div>
      <p class="font-mono text-xs uppercase tracking-widest text-zinc-400 mb-2">Global Platform Visualization</p>
      <p class="text-xs text-zinc-500 max-w-sm">{{ fallbackText }}</p>
    </div>

    <!-- Projected 2D HTML Labels Layer -->
    <div v-if="webglSupported" class="globe-labels-layer absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div
        v-for="marker in markers"
        :key="marker.id"
        :ref="el => setLabelRef(marker.id, el as HTMLElement)"
        class="globe-marker-label absolute left-0 top-0 transition-opacity duration-200"
        :class="{ 'label-active': activeId === marker.id }"
      >
        <button
          type="button"
          class="label-anchor pointer-events-auto flex items-center gap-2 -translate-y-1/2 cursor-pointer transition-transform duration-200 hover:scale-105 group"
          :aria-label="`Select ${marker.title}`"
          @click.stop="onMarkerClick(marker.id)"
        >
          <!-- Pulse Dot -->
          <span
            class="marker-dot-halo w-2.5 h-2.5 rounded-full shrink-0 flex items-center justify-center transition-transform duration-200"
            :style="{ backgroundColor: marker.accentColor, boxShadow: `0 0 12px ${marker.accentColor}` }"
          ></span>

          <!-- Label Card -->
          <div
            class="marker-card py-1 px-2.5 rounded border border-white/10 bg-black/75 backdrop-blur-md shadow-xl text-left transition-all duration-200 group-hover:border-white/30"
            :class="{ '!border-white/40 !bg-black/90 ring-1 ring-white/20': activeId === marker.id }"
          >
            <p class="text-[11px] font-semibold tracking-tight text-white leading-tight flex items-center gap-1.5 whitespace-nowrap">
              {{ marker.title }}
              <span v-if="activeId === marker.id" class="text-[9px] opacity-70">↗</span>
            </p>
            <p class="text-[8.5px] font-mono tracking-wider uppercase text-zinc-400 leading-tight whitespace-nowrap">
              {{ marker.subtitle }}
            </p>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as THREE from 'three'
import {
  latLngToVector3,
  createGridLines,
  createCoastlineGeometry,
  createLandPointsGeometry,
  createArcPoints,
  isWebGLAvailable,
} from './globeMath'
import { globeMarkers, globeArcs, type GlobeMarker } from './globeData'

const props = defineProps<{
  activeId: string
  fallbackText?: string
}>()

const emit = defineEmits<{
  (e: 'select', markerId: string): void
}>()

const container = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const webglSupported = ref(true)

const markers = globeMarkers
const labelRefs = new Map<string, HTMLElement>()

function setLabelRef(id: string, el: HTMLElement | null) {
  if (el) labelRefs.set(id, el)
  else labelRefs.delete(id)
}

function onMarkerClick(id: string) {
  emit('select', id)
}

// Three.js Scene Variables
let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let globeGroup: THREE.Group | null = null
let markerMeshes: {
  id: string
  dotMesh: THREE.Mesh
  ringMesh: THREE.Mesh
  hitMesh: THREE.Mesh
  normalVec: THREE.Vector3
  localPos: THREE.Vector3
}[] = []
let arcMeshList: {
  line: THREE.Line
  pulseMesh: THREE.Mesh
  fromId: string
  toId: string
  curvePoints: THREE.Vector3[]
  speed: number
  offset: number
}[] = []

let animFrameId = 0
let resizeObserver: ResizeObserver | null = null

// Interaction State
let isDragging = false
let pointerDownPos = { x: 0, y: 0 }
let lastPointerPos = { x: 0, y: 0 }
let dragVelocity = { x: 0, y: 0 }
let mousePosNDC = new THREE.Vector2(-10, -10)
let raycaster = new THREE.Raycaster()
let targetCamTilt = { x: 0, y: 0 }
let currentCamTilt = { x: 0, y: 0 }

// Target Rotation towards active marker
let isTargetingMarker = false
let targetRotationY = -1.45
let targetRotationX = 0.1
let lastUserInteractionTime = 0

const GLOBE_RADIUS = 1.5

function calculateTargetRotation(markerId: string) {
  const m = globeMarkers.find(item => item.id === markerId)
  if (!m) return

  const pos = latLngToVector3(m.lat, m.lng, GLOBE_RADIUS)
  // Bring marker to front (+Z)
  targetRotationY = -Math.atan2(pos.x, pos.z)
  // Tilt pitch slightly so marker is visually centered (lat converted to radians with soft damp)
  targetRotationX = Math.max(-0.45, Math.min(0.45, (m.lat * Math.PI / 180) * 0.35))
  isTargetingMarker = true
}

function shortestAngleDiff(target: number, current: number): number {
  const diff = (target - current) % (Math.PI * 2)
  return ((diff + Math.PI * 3) % (Math.PI * 2)) - Math.PI
}

watch(() => props.activeId, newId => {
  if (newId) {
    calculateTargetRotation(newId)
  }
})

function initThree() {
  if (!canvas.value || !container.value) return

  const width = container.value.clientWidth || window.innerWidth
  const height = container.value.clientHeight || window.innerHeight

  // 1. Scene & Camera
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100)
  const initialDist = width < 640 ? 4.8 : (width < 1024 ? 4.3 : 3.8)
  camera.position.set(0, 0, initialDist)

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
  globeGroup.rotation.z = 0.12 // Gentle axial tilt
  scene.add(globeGroup)

  // 4. Base Sphere (Dark Technical Foundation)
  const sphereGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64)
  const sphereMat = new THREE.MeshBasicMaterial({
    color: 0x07090e,
    transparent: true,
    opacity: 0.98,
  })
  const baseSphere = new THREE.Mesh(sphereGeo, sphereMat)
  globeGroup.add(baseSphere)

  // 5. Subtle Atmospheric Inner Rim
  const rimGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.018, 48, 48)
  const rimMat = new THREE.MeshBasicMaterial({
    color: 0x1e293b,
    transparent: true,
    opacity: 0.22,
    wireframe: true,
  })
  const rimSphere = new THREE.Mesh(rimGeo, rimMat)
  globeGroup.add(rimSphere)

  // 6. Lat/Long Grid Lines
  const gridGeo = createGridLines(GLOBE_RADIUS * 1.002)
  const gridMat = new THREE.LineBasicMaterial({
    color: 0x334155,
    transparent: true,
    opacity: 0.16,
  })
  const gridLineMesh = new THREE.LineSegments(gridGeo, gridMat)
  globeGroup.add(gridLineMesh)

  // 7. Land Point Cloud
  const landPointsGeo = createLandPointsGeometry(GLOBE_RADIUS * 1.006)
  const landPointsMat = new THREE.PointsMaterial({
    color: 0x94a3b8,
    size: 0.024,
    transparent: true,
    opacity: 0.8,
  })
  const landPointsMesh = new THREE.Points(landPointsGeo, landPointsMat)
  globeGroup.add(landPointsMesh)

  // 8. Coastlines
  const coastGeo = createCoastlineGeometry(GLOBE_RADIUS * 1.008)
  const coastMat = new THREE.LineBasicMaterial({
    color: 0x475569,
    transparent: true,
    opacity: 0.35,
  })
  const coastMesh = new THREE.LineSegments(coastGeo, coastMat)
  globeGroup.add(coastMesh)

  // 9. Arcs & Markers
  buildArcs()
  buildMarkers()

  // Initial target alignment
  if (props.activeId) {
    calculateTargetRotation(props.activeId)
    if (globeGroup) {
      globeGroup.rotation.y = targetRotationY
      globeGroup.rotation.x = targetRotationX
    }
  }
}

function buildArcs() {
  if (!globeGroup) return
  arcMeshList = []

  for (let i = 0; i < globeArcs.length; i++) {
    const arc = globeArcs[i]
    const p1 = latLngToVector3(arc.fromLatLng[0], arc.fromLatLng[1], GLOBE_RADIUS * 1.01)
    const p2 = latLngToVector3(arc.toLatLng[0], arc.toLatLng[1], GLOBE_RADIUS * 1.01)

    const points = createArcPoints(p1, p2, GLOBE_RADIUS, 42)
    const curveGeo = new THREE.BufferGeometry().setFromPoints(points)
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x64748b,
      transparent: true,
      opacity: 0.28,
    })
    const line = new THREE.Line(curveGeo, lineMat)
    globeGroup.add(line)

    const pulseGeo = new THREE.SphereGeometry(0.016, 8, 8)
    const pulseMat = new THREE.MeshBasicMaterial({
      color: 0xf8fafc,
      transparent: true,
      opacity: 0.85,
    })
    const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat)
    pulseMesh.position.copy(points[0])
    globeGroup.add(pulseMesh)

    arcMeshList.push({
      line,
      pulseMesh,
      fromId: arc.fromId,
      toId: arc.toId,
      curvePoints: points,
      speed: 0.24 + (i % 3) * 0.08,
      offset: i * 0.22,
    })
  }
}

function buildMarkers() {
  if (!globeGroup) return
  markerMeshes = []

  for (const m of globeMarkers) {
    const pos = latLngToVector3(m.lat, m.lng, GLOBE_RADIUS * 1.012)
    const normal = pos.clone().normalize()

    // Core 3D Dot
    const dotGeo = new THREE.SphereGeometry(0.034, 16, 16)
    const dotMat = new THREE.MeshBasicMaterial({ color: m.accentColor })
    const dotMesh = new THREE.Mesh(dotGeo, dotMat)
    dotMesh.position.copy(pos)

    // Outer Ring
    const ringGeo = new THREE.RingGeometry(0.046, 0.068, 32)
    const ringMat = new THREE.MeshBasicMaterial({
      color: m.accentColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65,
    })
    const ringMesh = new THREE.Mesh(ringGeo, ringMat)
    ringMesh.position.copy(pos.clone().add(normal.clone().multiplyScalar(0.004)))
    ringMesh.lookAt(pos.clone().add(normal))
    dotMesh.add(ringMesh)

    // Invisible Hit Sphere for Raycasting
    const hitGeo = new THREE.SphereGeometry(0.16, 8, 8)
    const hitMat = new THREE.MeshBasicMaterial({ visible: false })
    const hitMesh = new THREE.Mesh(hitGeo, hitMat)
    hitMesh.position.copy(pos)
    hitMesh.userData = { markerId: m.id }

    globeGroup.add(dotMesh)
    globeGroup.add(hitMesh)

    markerMeshes.push({
      id: m.id,
      dotMesh,
      ringMesh,
      hitMesh,
      normalVec: normal,
      localPos: pos,
    })
  }
}

let lastTime = performance.now()

function animate(currentTime: number) {
  animFrameId = requestAnimationFrame(animate)

  const delta = Math.min(0.05, (currentTime - lastTime) / 1000)
  lastTime = currentTime

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches

  if (globeGroup) {
    if (isDragging) {
      // Manual dragging in progress
      isTargetingMarker = false
      lastUserInteractionTime = currentTime
    } else if (isTargetingMarker) {
      // Smooth interpolation to active marker target angles
      const diffY = shortestAngleDiff(targetRotationY, globeGroup.rotation.y)
      const diffX = targetRotationX - globeGroup.rotation.x

      globeGroup.rotation.y += diffY * 0.065
      globeGroup.rotation.x += diffX * 0.065

      if (Math.abs(diffY) < 0.003 && Math.abs(diffX) < 0.003) {
        isTargetingMarker = false
      }
    } else {
      // Apply drag inertia decay
      if (Math.abs(dragVelocity.x) > 0.0001 || Math.abs(dragVelocity.y) > 0.0001) {
        globeGroup.rotation.y += dragVelocity.x
        globeGroup.rotation.x = Math.max(-0.55, Math.min(0.55, globeGroup.rotation.x + dragVelocity.y))
        dragVelocity.x *= 0.92
        dragVelocity.y *= 0.92
      } else if (!reducedMotion && (currentTime - lastUserInteractionTime > 2500)) {
        // Subtle idle rotation when user is inactive
        globeGroup.rotation.y += delta * 0.02
      }
    }
  }

  // Camera Parallax Smoothing
  if (camera && !reducedMotion) {
    currentCamTilt.x += (targetCamTilt.x - currentCamTilt.x) * 0.06
    currentCamTilt.y += (targetCamTilt.y - currentCamTilt.y) * 0.06
    camera.position.x = currentCamTilt.x
    camera.position.y = currentCamTilt.y
    camera.lookAt(0, 0, 0)
  }

  // Animate Arcs & Pulses
  if (!reducedMotion) {
    for (const a of arcMeshList) {
      const isArcActive = a.toId === props.activeId || a.fromId === props.activeId
      const targetOpacity = isArcActive ? 0.75 : 0.18
      const lineMat = a.line.material as THREE.LineBasicMaterial
      lineMat.opacity = THREE.MathUtils.lerp(lineMat.opacity, targetOpacity, 0.1)

      const t = ((currentTime * 0.001 * a.speed + a.offset) % 1)
      const index = Math.floor(t * (a.curvePoints.length - 1))
      const nextIndex = Math.min(a.curvePoints.length - 1, index + 1)
      const alpha = (t * (a.curvePoints.length - 1)) - index

      const pt = a.curvePoints[index].clone().lerp(a.curvePoints[nextIndex], alpha)
      a.pulseMesh.position.copy(pt)

      const pulseMat = a.pulseMesh.material as THREE.MeshBasicMaterial
      pulseMat.opacity = isArcActive ? 0.95 : 0.4
    }
  }

  // Raycasting for interactive hover / cursor
  if (camera && globeGroup && canvas.value) {
    raycaster.setFromCamera(mousePosNDC, camera)
    const hitMeshes = markerMeshes.map(m => m.hitMesh)
    const intersects = raycaster.intersectObjects(hitMeshes, false)
    if (intersects.length > 0) {
      canvas.value.style.cursor = 'pointer'
    } else {
      canvas.value.style.cursor = isDragging ? 'grabbing' : 'grab'
    }
  }

  // Update 2D Projected HTML Labels
  updateMarkerLabels()

  // Render Scene
  if (renderer && scene && camera) {
    renderer.render(scene, camera)
  }
}

function updateMarkerLabels() {
  if (!camera || !container.value || !globeGroup) return

  const width = container.value.clientWidth
  const height = container.value.clientHeight

  const camWorldPos = new THREE.Vector3()
  camera.getWorldPosition(camWorldPos)

  for (const m of markerMeshes) {
    const worldPos = new THREE.Vector3()
    m.dotMesh.getWorldPosition(worldPos)

    // Facing calculation
    const dirToCam = camWorldPos.clone().sub(worldPos).normalize()
    const worldNormal = m.normalVec.clone().applyQuaternion(globeGroup.quaternion).normalize()
    const dot = worldNormal.dot(dirToCam)

    // Active marker scale & glow
    const isActive = props.activeId === m.id
    const targetScale = isActive ? 1.35 : 0.95
    m.dotMesh.scale.setScalar(THREE.MathUtils.lerp(m.dotMesh.scale.x, targetScale, 0.15))

    const ringMat = m.ringMesh.material as THREE.MeshBasicMaterial
    ringMat.opacity = THREE.MathUtils.lerp(ringMat.opacity, isActive ? 0.9 : 0.4, 0.15)

    const labelEl = labelRefs.get(m.id)
    if (!labelEl) continue

    // Show label only on the front hemisphere
    if (dot > 0.15) {
      const projected = worldPos.clone().project(camera)
      const screenX = (projected.x * 0.5 + 0.5) * width
      const screenY = (-projected.y * 0.5 + 0.5) * height

      labelEl.style.transform = `translate3d(${screenX}px, ${screenY}px, 0)`

      if (screenX > width * 0.65) {
        labelEl.classList.add('label-flipped')
      } else {
        labelEl.classList.remove('label-flipped')
      }

      // Smooth horizon fading
      const horizonFade = Math.min(1, Math.max(0, (dot - 0.15) / 0.25))
      const targetOpacity = isActive ? 1 : (horizonFade * 0.85)
      labelEl.style.opacity = `${targetOpacity}`
      labelEl.style.pointerEvents = horizonFade > 0.4 ? 'auto' : 'none'
    } else {
      labelEl.style.opacity = '0'
      labelEl.style.pointerEvents = 'none'
    }
  }
}

// Pointer Events
function onPointerDown(e: PointerEvent) {
  if (e.button !== 0) return
  isDragging = true
  pointerDownPos = { x: e.clientX, y: e.clientY }
  lastPointerPos = { x: e.clientX, y: e.clientY }
  dragVelocity = { x: 0, y: 0 }
  isTargetingMarker = false
  lastUserInteractionTime = performance.now()
}

function onPointerMove(e: PointerEvent) {
  if (!container.value) return

  const rect = container.value.getBoundingClientRect()
  mousePosNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
  mousePosNDC.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1)

  targetCamTilt.x = mousePosNDC.x * 0.22
  targetCamTilt.y = mousePosNDC.y * 0.18

  if (isDragging && globeGroup) {
    const dx = e.clientX - lastPointerPos.x
    const dy = e.clientY - lastPointerPos.y

    globeGroup.rotation.y += dx * 0.0055
    globeGroup.rotation.x = Math.max(-0.55, Math.min(0.55, globeGroup.rotation.x + dy * 0.0055))

    dragVelocity = { x: dx * 0.0035, y: dy * 0.0035 }
    lastPointerPos = { x: e.clientX, y: e.clientY }
    lastUserInteractionTime = performance.now()
  }
}

function onPointerUp(e: PointerEvent) {
  if (!isDragging) return
  isDragging = false

  const moveDist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y)
  if (moveDist < 6 && camera && globeGroup) {
    // Detect raycast hit on markers
    raycaster.setFromCamera(mousePosNDC, camera)
    const hitMeshes = markerMeshes.map(m => m.hitMesh)
    const intersects = raycaster.intersectObjects(hitMeshes, false)
    if (intersects.length > 0) {
      const hitId = intersects[0].object.userData.markerId as string
      if (hitId) emit('select', hitId)
    }
  }
}

function onPointerLeave() {
  isDragging = false
  mousePosNDC.set(-10, -10)
  targetCamTilt.x = 0
  targetCamTilt.y = 0
}

function handleResize() {
  if (!container.value || !renderer || !camera) return
  const w = container.value.clientWidth
  const h = container.value.clientHeight
  if (w <= 0 || h <= 0) return

  camera.aspect = w / h
  camera.updateProjectionMatrix()
  const targetDist = w < 640 ? 4.8 : (w < 1024 ? 4.3 : 3.8)
  camera.position.z = targetDist
  renderer.setSize(w, h)
}

onMounted(() => {
  webglSupported.value = isWebGLAvailable()
  if (!webglSupported.value) return

  initThree()
  animFrameId = requestAnimationFrame(animate)

  if (container.value) {
    resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(container.value)
  }
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animFrameId)
  resizeObserver?.disconnect()

  // Clean disposal of Three.js objects
  if (scene) {
    scene.traverse(obj => {
      if (obj instanceof THREE.Mesh || obj instanceof THREE.Line || obj instanceof THREE.Points) {
        obj.geometry?.dispose()
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose())
        else obj.material?.dispose()
      }
    })
  }
  renderer?.dispose()
  renderer = null
  scene = null
  camera = null
  globeGroup = null
})
</script>

<style scoped>
.globe-viewport {
  contain: layout size;
}

.marker-dot-halo {
  animation: pulse-ring 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse-ring {
  0%, 100% { transform: scale(1); opacity: 0.95; }
  50% { transform: scale(1.35); opacity: 0.65; }
}

.label-active .marker-card {
  transform: scale(1.06);
}

.label-flipped .label-anchor {
  flex-direction: row-reverse;
  transform: translate(-100%, -50%);
}

@media (prefers-reduced-motion: reduce) {
  .marker-dot-halo { animation: none !important; }
}
</style>
