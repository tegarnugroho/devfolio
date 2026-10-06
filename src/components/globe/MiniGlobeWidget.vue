<template>
  <div ref="container" class="mini-globe-widget relative inline-flex items-center justify-center overflow-hidden pointer-events-none select-none">
    <canvas ref="canvas" class="w-full h-full block"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const container = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

let animFrameId = 0
let isVisible = true
let intersectionObserver: IntersectionObserver | null = null

const dots = [
  { lat: 0.1, lng: 1.8, color: '#3b82f6' }, // Indonesia / SE Asia
  { lat: 0.6, lng: 2.4, color: '#06b6d4' }, // Tokyo
  { lat: 0.65, lng: -2.1, color: '#ec4899' }, // San Francisco
  { lat: 0.9, lng: 0.2, color: '#10b981' }, // London / Europe
  { lat: -0.6, lng: 2.6, color: '#38bdf8' }, // Sydney
]

function render() {
  if (!canvas.value || !container.value) return
  const ctx = canvas.value.getContext('2d')
  if (!ctx) return

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const size = 30
  if (canvas.value.width !== size * dpr) {
    canvas.value.width = size * dpr
    canvas.value.height = size * dpr
  }

  let angle = 0
  const tilt = 0.28 // Subtle 16 degree tilt
  const cx = (size * dpr) / 2
  const cy = (size * dpr) / 2
  const radius = (size * dpr) * 0.42

  function loop() {
    animFrameId = requestAnimationFrame(loop)
    if (!isVisible) return

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!reduced) {
      angle += 0.024
    }

    ctx!.clearRect(0, 0, size * dpr, size * dpr)

    // 1. Dark Base Sphere
    ctx!.beginPath()
    ctx!.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx!.fillStyle = '#07090e'
    ctx!.fill()

    // Atmosphere Ring
    ctx!.lineWidth = 1 * dpr
    ctx!.strokeStyle = 'rgba(56, 189, 248, 0.35)'
    ctx!.stroke()

    // 2. Latitude Lines
    const lats = [-0.65, 0, 0.65]
    for (const lat of lats) {
      const rLat = radius * Math.cos(lat)
      const yLat = cy - radius * Math.sin(lat) * Math.cos(tilt)
      const ry = rLat * Math.sin(tilt)

      ctx!.beginPath()
      ctx!.ellipse(cx, yLat, rLat, Math.max(0.5, Math.abs(ry)), 0, 0, Math.PI * 2)
      ctx!.lineWidth = 0.8 * dpr
      ctx!.strokeStyle = lat === 0 ? 'rgba(56, 189, 248, 0.45)' : 'rgba(100, 116, 139, 0.25)'
      ctx!.stroke()
    }

    // 3. Rotating Longitude Meridians
    const meridians = 4
    for (let i = 0; i < meridians; i++) {
      const curAngle = angle + (i * Math.PI) / meridians
      const cosA = Math.cos(curAngle)
      const sinA = Math.sin(curAngle)
      const rx = radius * Math.abs(cosA)

      ctx!.beginPath()
      ctx!.ellipse(cx, cy, Math.max(0.5, rx), radius, 0, 0, Math.PI * 2)
      ctx!.lineWidth = 0.8 * dpr
      ctx!.strokeStyle = cosA > 0 ? 'rgba(56, 189, 248, 0.3)' : 'rgba(100, 116, 139, 0.18)'
      ctx!.stroke()
    }

    // 4. Rotating Glowing Dots
    for (const d of dots) {
      const curLng = d.lng + angle
      const cosLat = Math.cos(d.lat)
      const sinLat = Math.sin(d.lat)
      const cosLng = Math.cos(curLng)
      const sinLng = Math.sin(curLng)

      // 3D coordinates on sphere
      const x = radius * cosLat * sinLng
      const y = -radius * sinLat
      const z = radius * cosLat * cosLng

      // Rotate by pitch tilt around X axis
      const rotY = y * Math.cos(tilt) - z * Math.sin(tilt)
      const rotZ = y * Math.sin(tilt) + z * Math.cos(tilt)

      // Only draw if facing front (+Z)
      if (rotZ > 0) {
        const px = cx + x
        const py = cy + rotY
        const dotRadius = (1.1 + (rotZ / radius) * 0.7) * dpr

        ctx!.beginPath()
        ctx!.arc(px, py, dotRadius, 0, Math.PI * 2)
        ctx!.fillStyle = d.color
        ctx!.shadowColor = d.color
        ctx!.shadowBlur = 4 * dpr
        ctx!.fill()
        ctx!.shadowBlur = 0
      }
    }
  }

  loop()
}

onMounted(() => {
  render()
  if (container.value) {
    intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting
    }, { threshold: 0.05 })
    intersectionObserver.observe(container.value)
  }
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animFrameId)
  intersectionObserver?.disconnect()
})
</script>

<style scoped>
.mini-globe-widget {
  contain: layout size;
  width: 26px;
  height: 26px;
}
</style>

