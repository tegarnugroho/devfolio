<template>
  <div ref="container" class="globe-viewport relative w-full h-[360px] sm:h-[440px] md:h-[500px] lg:h-[560px] select-none touch-pan-y">
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

    <!-- Fallback if WebGL unavailable -->
    <div v-else class="globe-fallback flex flex-col items-center justify-center p-6 text-center h-full">
      <div class="fallback-sphere mb-4">
        <svg viewBox="0 0 100 100" class="w-28 h-28 opacity-40 text-current">
          <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" stroke-width="1" />
          <ellipse cx="50" cy="50" rx="46" ry="16" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3" />
          <line x1="50" y1="4" x2="50" y2="96" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3" />
          <line x1="4" y1="50" x2="96" y2="50" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3" />
        </svg>
      </div>
      <p class="text-xs uppercase tracking-widest text-[var(--secondary)] mb-2">Global Platform Visualization</p>
      <p class="text-xs text-[var(--muted)]">Interactive 3D acceleration unavailable on this device.</p>
    </div>

    <!-- Projected 2D HTML Labels Layer -->
    <div v-if="webglSupported" class="globe-labels-layer absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div
        v-for="marker in markers"
        :key="marker.id"
        :ref="el => setLabelRef(marker.id, el as HTMLElement)"
        class="globe-marker-label absolute left-0 top-0 pointer-events-auto transition-opacity duration-200"
        :class="{ 'label-active': activeMarkerId === marker.id }"
        @click="emitSelect(marker)"
        @pointerenter="onLabelEnter(marker.id)"
        @pointerleave="onLabelLeave"
      >
        <div class="label-anchor flex items-center gap-2 -translate-y-1/2">
          <!-- Pulse Dot -->
          <span
            class="marker-dot-halo w-2.5 h-2.5 rounded-full shrink-0 flex items-center justify-center transition-transform duration-200"
            :style="{ backgroundColor: marker.accentColor, boxShadow: `0 0 12px ${marker.accentColor}` }"
          ></span>

          <!-- Text Card -->
          <div class="marker-card py-1 px-2.5 rounded border border-black/10 dark:border-white/10 bg-black/60 dark:bg-black/75 backdrop-blur-md shadow-lg pointer-events-auto cursor-pointer transition-all duration-200 hover:scale-105">
            <p class="text-[11px] font-semibold tracking-tight text-white leading-tight flex items-center gap-1.5">
              {{ marker.title }}
              <span v-if="activeMarkerId === marker.id" class="text-[9px] opacity-70">↗</span>
            </p>
            <p class="text-[9px] font-mono tracking-wider uppercase text-slate-300 dark:text-slate-400 leading-tight">
              {{ marker.subtitle }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
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

const emit = defineEmits<{
  (e: 'select', marker: GlobeMarker): void
  (e: 'hover', markerId: string | null): void
}>()

const container = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const webglSupported = ref(true)

const markers = globeMarkers
const activeMarkerId = ref<string | null>(null)
const labelRefs = new Map<string, HTMLElement>()

function setLabelRef(id: string, el: HTMLElement | null) {
  if (el) labelRefs.set(id, el)
  else labelRefs.delete(id)
}

function emitSelect(marker: GlobeMarker) {
  emit('select', marker)
}

function onLabelEnter(id: string) {
  activeMarkerId.value = id
  emit('hover', id)
}

function onLabelLeave() {
  activeMarkerId.value = null
  emit('hover', null)
}

// Three.js State
let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let globeGroup: THREE.Group | null = null
let markerMeshes: { id: string; mesh: THREE.Mesh; hitMesh: THREE.Mesh; normalVec: THREE.Vector3 }[] = []
let arcMeshes: { line: THREE.Line; pulseMesh: THREE.Mesh; curvePoints: THREE.Vector3[]; speed: number; offset: number }[] = []
let animFrameId = 0
let resizeObserver: ResizeObserver | null = null
let intersectionObserver: IntersectionObserver | null = null
let isInViewport = true

// Interaction State
let isDragging = false
let pointerDownPos = { x: 0, y: 0 }
let lastPointerPos = { x: 0, y: 0 }
let dragVelocity = { x: 0, y: 0 }
let mousePosNDC = new THREE.Vector2(-10, -10)
let raycaster = new THREE.Raycaster()
let targetCamTilt = { x: 0, y: 0 }
let currentCamTilt = { x: 0, y: 0 }
const GLOBE_RADIUS = 1.5

function initThree() {
  if (!canvas.value || !container.value) return

  const width = container.value.clientWidth || 400
  const height = container.value.clientHeight || 400

  // 1. Scene & Camera
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100)
  camera.position.set(0, 0, 4.35)

  // 2. Renderer
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
  // Initial aesthetic tilt: slight 15-deg tilt along Z and slight initial Y rotation towards Asia/Europe
  globeGroup.rotation.z = 0.18
  globeGroup.rotation.y = -1.45
  scene.add(globeGroup)

  // 4. Base Dark Sphere
  const sphereGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64)
  const sphereMat = new THREE.MeshBasicMaterial({
    color: 0x05070a,
    transparent: true,
    opacity: 0.96,
  })
  const baseSphere = new THREE.Mesh(sphereGeo, sphereMat)
  globeGroup.add(baseSphere)

  // 5. Subtle Atmospheric Inner Rim
  const rimGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.018, 48, 48)
  const rimMat = new THREE.MeshBasicMaterial({
    color: 0x1e293b,
    transparent: true,
    opacity: 0.18,
    wireframe: true,
  })
  const rimSphere = new THREE.Mesh(rimGeo, rimMat)
  globeGroup.add(rimSphere)

  // 6. Lat/Long Grid Lines
  const gridGeo = createGridLines(GLOBE_RADIUS * 1.002)
  const gridMat = new THREE.LineBasicMaterial({
    color: 0x334155,
    transparent: true,
    opacity: 0.14,
  })
  const gridLineMesh = new THREE.LineSegments(gridGeo, gridMat)
  globeGroup.add(gridLineMesh)

  // 7. Land Point Cloud
  const landPointsGeo = createLandPointsGeometry(GLOBE_RADIUS * 1.006)
  const landPointsMat = new THREE.PointsMaterial({
    color: 0x94a3b8,
    size: 0.024,
    transparent: true,
    opacity: 0.75,
  })
  const landPointsMesh = new THREE.Points(landPointsGeo, landPointsMat)
  globeGroup.add(landPointsMesh)

  // 8. Coastlines Line Geometry
  const coastGeo = createCoastlineGeometry(GLOBE_RADIUS * 1.008)
  const coastMat = new THREE.LineBasicMaterial({
    color: 0x475569,
    transparent: true,
    opacity: 0.32,
  })
  const coastMesh = new THREE.LineSegments(coastGeo, coastMat)
  globeGroup.add(coastMesh)

  // 9. Connection Arcs
  buildArcs()

  // 10. Project Markers
  buildMarkers()
}

function buildArcs() {
  if (!globeGroup) return
  arcMeshes = []

  const arcMat = new THREE.LineBasicMaterial({
    color: 0x64748b,
    transparent: true,
    opacity: 0.26,
  })

  const pulseMat = new THREE.MeshBasicMaterial({
    color: 0xf8fafc,
    transparent: true,
    opacity: 0.85,
  })

  for (let i = 0; i < globeArcs.length; i++) {
    const arc = globeArcs[i]
    const p1 = latLngToVector3(arc.fromLatLng[0], arc.fromLatLng[1], GLOBE_RADIUS * 1.01)
    const p2 = latLngToVector3(arc.toLatLng[0], arc.toLatLng[1], GLOBE_RADIUS * 1.01)

    const points = createArcPoints(p1, p2, GLOBE_RADIUS, 40)
    const curveGeo = new THREE.BufferGeometry().setFromPoints(points)
    const line = new THREE.Line(curveGeo, arcMat)
    globeGroup.add(line)

    // Pulse bead traveling along curve
    const pulseGeo = new THREE.SphereGeometry(0.016, 8, 8)
    const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat)
    pulseMesh.position.copy(points[0])
    globeGroup.add(pulseMesh)

    arcMeshes.push({
      line,
      pulseMesh,
      curvePoints: points,
      speed: 0.25 + (i % 3) * 0.08,
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

    // Core glowing dot
    const dotGeo = new THREE.SphereGeometry(0.032, 16, 16)
    const dotMat = new THREE.MeshBasicMaterial({ color: m.accentColor })
    const dotMesh = new THREE.Mesh(dotGeo, dotMat)
    dotMesh.position.copy(pos)

    // Outer ring
    const ringGeo = new THREE.RingGeometry(0.045, 0.065, 32)
    const ringMat = new THREE.MeshBasicMaterial({
      color: m.accentColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    })
    const ringMesh = new THREE.Mesh(ringGeo, ringMat)
    ringMesh.position.copy(pos.clone().add(normal.clone().multiplyScalar(0.004)))
    ringMesh.lookAt(pos.clone().add(normal))
    dotMesh.add(ringMesh)

    // Invisible hit sphere for raycasting
    const hitGeo = new THREE.SphereGeometry(0.14, 8, 8)
    const hitMat = new THREE.MeshBasicMaterial({ visible: false })
    const hitMesh = new THREE.Mesh(hitGeo, hitMat)
    hitMesh.position.copy(pos)
    hitMesh.userData = { markerId: m.id }

    globeGroup.add(dotMesh)
    globeGroup.add(hitMesh)

    markerMeshes.push({
      id: m.id,
      mesh: dotMesh,
      hitMesh,
      normalVec: normal,
    })
  }
}

// Main Render Loop
let clock = new THREE.Clock()

function animate() {
  if (!isInViewport) {
    animFrameId = requestAnimationFrame(animate)
    return
  }

  const delta = Math.min(clock.getDelta(), 0.1)
  const elapsedTime = clock.getElapsedTime()
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches

  if (globeGroup && !reduced) {
    // Idle rotation when not dragging
    if (!isDragging) {
      globeGroup.rotation.y += delta * 0.045

      // Apply drag momentum inertia
      globeGroup.rotation.y += dragVelocity.x
      globeGroup.rotation.x = Math.max(-0.55, Math.min(0.55, globeGroup.rotation.x + dragVelocity.y))

      dragVelocity.x *= 0.92
      dragVelocity.y *= 0.92
    }

    // Camera parallax smoothing
    currentCamTilt.x += (targetCamTilt.x - currentCamTilt.x) * 0.05
    currentCamTilt.y += (targetCamTilt.y - currentCamTilt.y) * 0.05
    if (camera) {
      camera.position.x = currentCamTilt.x
      camera.position.y = currentCamTilt.y
      camera.lookAt(0, 0, 0)
    }

    // Animate traveling pulse along arcs
    for (const arc of arcMeshes) {
      const progress = (elapsedTime * arc.speed + arc.offset) % 1
      const index = Math.floor(progress * (arc.curvePoints.length - 1))
      const nextIndex = Math.min(index + 1, arc.curvePoints.length - 1)
      const subT = progress * (arc.curvePoints.length - 1) - index

      const pt = arc.curvePoints[index].clone().lerp(arc.curvePoints[nextIndex], subT)
      arc.pulseMesh.position.copy(pt)
    }
  }

  // Raycasting for marker hover
  if (camera && scene) {
    raycaster.setFromCamera(mousePosNDC, camera)
    const hitTargets = markerMeshes.map(m => m.hitMesh)
    const intersects = raycaster.intersectObjects(hitTargets, false)

    if (intersects.length > 0) {
      const hitId = intersects[0].object.userData.markerId as string
      if (activeMarkerId.value !== hitId) {
        activeMarkerId.value = hitId
        emit('hover', hitId)
      }
    }
  }

  // Update marker visual scales & 2D projected screen positions
  updateProjectedLabels()

  if (renderer && scene && camera) {
    renderer.render(scene, camera)
  }

  animFrameId = requestAnimationFrame(animate)
}

function updateProjectedLabels() {
  if (!camera || !container.value || !globeGroup) return

  const width = container.value.clientWidth
  const height = container.value.clientHeight

  const camWorldPos = new THREE.Vector3()
  camera.getWorldPosition(camWorldPos)

  for (const m of markerMeshes) {
    const worldPos = new THREE.Vector3()
    m.mesh.getWorldPosition(worldPos)

    // Facing calculation: dot product of surface normal with direction to camera
    const dirToCam = camWorldPos.clone().sub(worldPos).normalize()
    const worldNormal = m.normalVec.clone().applyQuaternion(globeGroup.quaternion).normalize()
    const dot = worldNormal.dot(dirToCam)

    // Scale active marker slightly
    const isActive = activeMarkerId.value === m.id
    const targetScale = isActive ? 1.35 : 1.0
    m.mesh.scale.setScalar(THREE.MathUtils.lerp(m.mesh.scale.x, targetScale, 0.15))

    const labelEl = labelRefs.get(m.id)
    if (!labelEl) continue

    // Only show label if on the front hemisphere facing the camera
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
      // Fade out smoothly towards the horizon
      const horizonFade = Math.min(1, Math.max(0, (dot - 0.15) / 0.25))
      labelEl.style.opacity = `${horizonFade}`
      labelEl.style.pointerEvents = horizonFade > 0.5 ? 'auto' : 'none'
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
}

function onPointerMove(e: PointerEvent) {
  if (!container.value) return

  // Update NDC for raycaster
  const rect = container.value.getBoundingClientRect()
  mousePosNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
  mousePosNDC.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1)

  // Camera parallax
  targetCamTilt.x = mousePosNDC.x * 0.18
  targetCamTilt.y = mousePosNDC.y * 0.14

  if (isDragging && globeGroup) {
    const dx = e.clientX - lastPointerPos.x
    const dy = e.clientY - lastPointerPos.y

    globeGroup.rotation.y += dx * 0.006
    globeGroup.rotation.x = Math.max(-0.55, Math.min(0.55, globeGroup.rotation.x + dy * 0.006))

    dragVelocity = { x: dx * 0.004, y: dy * 0.004 }
    lastPointerPos = { x: e.clientX, y: e.clientY }
  }
}

function onPointerUp(e: PointerEvent) {
  if (!isDragging) return
  isDragging = false

  // Click detection: if barely moved, trigger click on intersected marker
  const moveDist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y)
  if (moveDist < 5 && activeMarkerId.value) {
    const marker = globeMarkers.find(m => m.id === activeMarkerId.value)
    if (marker) emitSelect(marker)
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

    intersectionObserver = new IntersectionObserver(([entry]) => {
      isInViewport = entry.isIntersecting
    }, { threshold: 0.1 })
    intersectionObserver.observe(container.value)
  }
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animFrameId)
  resizeObserver?.disconnect()
  intersectionObserver?.disconnect()

  // Dispose Three.js objects
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
  border-color: rgba(255, 255, 255, 0.4);
  background: rgba(0, 0, 0, 0.9);
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
