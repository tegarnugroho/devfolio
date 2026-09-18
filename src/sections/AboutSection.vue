<template>
  <section id="about" class="mt-10 sm:mt-12 md:mt-14 scroll-mt-12 sm:scroll-mt-16 md:scroll-mt-16 pt-24 md:pt-28 pb-20 border-t border-black/10 dark:border-white/10">
    <h2 v-reveal class="text-2xl font-semibold tracking-tight">{{ content.title }}</h2>
    <p v-reveal class="about-eyebrow">{{ content.eyebrow }}</p>

    <div class="about-layout mt-8 grid sm:grid-cols-[220px_1fr]">
      <div class="flex flex-col items-center sm:items-start">
        <div v-reveal="{ delay: 80 }" class="portrait-wrapper">
          <div data-blueprint="PROFILE_MEDIA" ref="comparison" class="portrait-comparison" :class="{ 'effect-hovered': overEffect }" role="slider" tabindex="0" :aria-label="content.sliderLabel" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="Math.round(position)" :aria-valuetext="content.sliderValue(Math.round(position))" @pointerenter="onPortraitEnter" @pointerleave="pointerPosition = null" @pointerdown="startDrag" @pointermove="drag" @pointerup="endDrag" @pointercancel="endDrag" @lostpointercapture="dragging = false" @keydown="onKey" @contextmenu.prevent>
            <img class="portrait-normal" :src="content.image" :alt="content.imageAlt" loading="lazy" decoding="async" draggable="false" @dragstart.prevent />
            <img class="portrait-effect" :style="{ clipPath }" :src="content.alternateImage" :alt="content.alternateImageAlt" loading="eager" decoding="async" draggable="false" @dragstart.prevent />
            <svg v-show="position > 0 && position < 100" class="portrait-divider" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><line :x1="topEdge" y1="0" :x2="bottomEdge" y2="100" vector-effect="non-scaling-stroke" /></svg>
            <span class="portrait-handle" :style="handleStyle" aria-hidden="true">‹ ›</span>
            <span class="portrait-edge portrait-edge-left" :style="{ opacity: 1 - Math.min(1, position / 18) }" aria-hidden="true">›</span>
            <span class="portrait-edge portrait-edge-right" :style="{ opacity: 1 - Math.min(1, (100 - position) / 18) }" aria-hidden="true">‹</span>
          </div>
        </div>
        <div class="badge mt-3 relative inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.06] px-3 py-1.5 text-xs hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" class="opacity-80">
            <path d="M3 8h18M7 8V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2m-7 5h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <rect x="3" y="8" width="18" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/>
          </svg>
          <span class="normal-text font-medium">{{ content.role }}</span>
          <span class="normal-text opacity-60">•</span>
          <span class="normal-text">{{ content.company }}</span>
          <span class="hover-text absolute inset-0 flex items-center justify-center font-medium">{{ content.startedLabel }}</span>
        </div>
      </div>

      <div v-reveal="{ delay: 120 }" data-blueprint="ABOUT_CONTENT" class="about-copy">
        <h3 class="text-lg font-semibold tracking-tight">{{ content.greeting }}</h3>

        <p v-for="(paragraph, index) in content.paragraphs" :key="index" :class="index === 0 ? 'mt-4 leading-relaxed opacity-85' : 'mt-3 leading-relaxed opacity-85'">
          {{ paragraph }}
        </p>
      </div>
    </div>
    <FlamingKunaiCursor :target="comparison" :active="true" />
  </section>
  
</template>

<script setup lang="ts">
import { portfolioContent } from '@/content/portfolioContent'
import { computed, onBeforeUnmount, ref } from 'vue'
import FlamingKunaiCursor from '@/components/FlamingKunaiCursor.vue'

const content = portfolioContent.about

const comparison = ref<HTMLElement | null>(null)
const position = ref(100)
const dragging = ref(false)
const pointerPosition = ref<{ x: number; y: number } | null>(null)
const handleVisibility = computed(() => Math.min(1, Math.min(position.value, 100 - position.value) / 18))
const handleStyle = computed(() => ({
  left: `clamp(31px, ${position.value}%, calc(100% - 31px))`,
  opacity: handleVisibility.value,
  transform: `translate(-50%, -50%) scale(${0.72 + 0.28 * handleVisibility.value})`,
}))
const topEdge = computed(() => position.value === 0 ? 0 : Math.min(100, position.value + 8))
const bottomEdge = computed(() => position.value === 100 ? 100 : Math.max(0, position.value - 8))
const clipPath = computed(() => `polygon(${topEdge.value}% 0,100% 0,100% 100%,${bottomEdge.value}% 100%)`)
const overEffect = computed(() => {
  const pointer = pointerPosition.value
  if (!pointer || position.value === 100) return false
  const boundary = topEdge.value + (bottomEdge.value - topEdge.value) * pointer.y
  return pointer.x >= boundary
})
function trackPointer(event: PointerEvent) {
  if (event.pointerType !== 'mouse' || !comparison.value) return
  const bounds = comparison.value.getBoundingClientRect()
  const x = (event.clientX - bounds.left) / bounds.width
  const y = (event.clientY - bounds.top) / bounds.height
  pointerPosition.value = x >= 0 && x <= 1 && y >= 0 && y <= 1 ? { x: x * 100, y } : null
}
function onPortraitEnter(event: PointerEvent) {
  trackPointer(event)
  startIntro(event)
}
let frame = 0
let introStarted = false
let interacted = false
let disposed = false
function stopIntro() { interacted = true; cancelAnimationFrame(frame) }
function moveToPointer(event: PointerEvent) {
  const bounds = comparison.value!.getBoundingClientRect()
  position.value = Math.max(0, Math.min(100, (event.clientX - bounds.left) / bounds.width * 100))
}
function startDrag(event: PointerEvent) {
  if (!event.isPrimary || event.button !== 0) return
  stopIntro()
  dragging.value = true
  comparison.value?.focus({ preventScroll: true })
  comparison.value?.setPointerCapture(event.pointerId)
  moveToPointer(event)
  trackPointer(event)
}
function drag(event: PointerEvent) {
  if (dragging.value) moveToPointer(event)
  trackPointer(event)
}
function endDrag(event: PointerEvent) {
  dragging.value = false
  if (comparison.value?.hasPointerCapture(event.pointerId)) comparison.value.releasePointerCapture(event.pointerId)
}
function onKey(event: KeyboardEvent) {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
  event.preventDefault()
  stopIntro()
  position.value = event.key === 'Home' ? 0 : event.key === 'End' ? 100 : Math.max(0, Math.min(100, position.value + (event.key === 'ArrowLeft' ? -5 : 5)))
}
function startIntro(event: PointerEvent) {
  if (event.pointerType !== 'mouse' || introStarted || interacted || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
  introStarted = true
  void playIntro()
}
async function playIntro() {
  await Promise.all(Array.from(comparison.value?.querySelectorAll('img') ?? []).map(image => image.decode().catch(() => {})))
  if (disposed || interacted) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { position.value = 50; return }
  const start = performance.now()
  const ease = (value: number) => 1 - Math.pow(1 - value, 3)
  function animate(now: number) {
    const elapsed = now - start
    if (elapsed < 300) position.value = 100
    else if (elapsed < 1200) position.value = 100 * (1 - ease((elapsed - 300) / 900))
    else if (elapsed < 1550) position.value = 0
    else position.value = 50 * ease(Math.min(1, (elapsed - 1550) / 700))
    if (elapsed < 2250) frame = requestAnimationFrame(animate)
  }
  frame = requestAnimationFrame(animate)
}
onBeforeUnmount(() => { disposed = true; cancelAnimationFrame(frame) })
</script>

<style scoped>
.about-eyebrow { font-family: ui-monospace, monospace; font-size: 10px; letter-spacing: .16em; color: var(--secondary); }
.about-eyebrow { text-transform: uppercase; color: var(--label); margin-top: 10px; font-size: 9px; }
.about-layout { gap: 38px; align-items: center; margin-top: 36px; }
.portrait-wrapper { width: 202px; max-width: 100%; position: relative; z-index: 1; }
.portrait-wrapper::before, .portrait-wrapper::after { content: ""; position: absolute; inset: -1px; border-radius: 6px; padding: 2px; background: conic-gradient(from var(--beam-angle, 0deg), transparent 75%, #00e5ff 90%, #0077ff 100%); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; opacity: 0; transition: opacity 0.3s ease; z-index: 2; }
.portrait-wrapper::after { filter: blur(4px); z-index: 1; }
.portrait-wrapper:hover::before, .portrait-wrapper:hover::after { opacity: 1; animation: spin-beam 2.5s linear infinite; }
@property --beam-angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
@keyframes spin-beam { to { --beam-angle: 360deg; } }
@media (prefers-reduced-motion: reduce) { .portrait-wrapper:hover::before, .portrait-wrapper:hover::after { animation: none; background: linear-gradient(135deg, #00e5ff, #0077ff); } }
.portrait-comparison { position: relative; display: block; width: 100%; aspect-ratio: 1; overflow: hidden; border: 1px solid var(--strong-border); border-radius: 5px; background: var(--secondary-background); }
.portrait-comparison img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; user-select: none; transition: transform 450ms cubic-bezier(.22,1,.36,1); }
.portrait-effect { transform: none; }
/* Madara Uchiha's Chakra Infused Kunai - https://www.cursors-4u.com/cursor/madara-uchihas-chakra-infused-kunai */
.portrait-comparison { cursor: url('/assets/cursors/madara-kunai-preview-32.webp') 16 15, url('https://cdn.cursors-4u.net/previews/sizenwse-72fe4e9c-preview-32.webp') 16 15, auto; touch-action: pan-y; }
@media (hover: hover) and (pointer: fine) {
  .portrait-comparison,
  .portrait-comparison.effect-hovered {
    cursor: url('/assets/cursors/madara-kunai-preview-32.webp') 16 15, url('https://cdn.cursors-4u.net/previews/sizenwse-72fe4e9c-preview-32.webp') 16 15, auto;
  }
}
.portrait-comparison.flame-cursor-active,
.portrait-comparison.flame-cursor-active * { cursor: none !important; }
.portrait-divider { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.portrait-divider line { stroke: var(--primary); stroke-opacity: .85; stroke-width: 1.5px; }
.portrait-handle { position: absolute; top: 50%; width: 38px; height: 38px; display: grid; place-items: center; transform: translate(-50%,-50%); border-radius: 50%; border: 1px solid var(--strong-border); background: var(--background); color: var(--primary); font-size: 23px; line-height: 1; pointer-events: none; }
.portrait-edge { position: absolute; top: 50%; transform: translateY(-50%); font-size: 26px; line-height: 1; color: var(--primary); pointer-events: none; user-select: none; }
.portrait-edge-left { left: 12px; }
.portrait-edge-right { right: 12px; }
.portrait-comparison:hover .portrait-handle, .portrait-comparison:focus-visible .portrait-handle { border-color: var(--secondary); }
.badge { width: 202px; max-width: 100%; justify-content: center; gap: 7px; font-size: 10px; border-radius: 4px !important; }
.normal-text, .hover-text { transition: opacity 250ms; }
.hover-text { opacity: 0; }
.badge:hover .normal-text { opacity: 0; }
.badge:hover .hover-text { opacity: 1; }
.about-copy h3 { font-weight: 600; color: var(--primary); }
.about-copy p { color: var(--secondary); opacity: 1; line-height: 1.65; }
.about-copy p + p { margin-top: 18px; }
@media (max-width: 900px) { .about-layout { grid-template-columns: minmax(0,1fr); gap: 30px; } .about-layout > div:first-child { align-items: flex-start; } }
@media (max-width: 767px) { .portrait-wrapper, .badge { width: 202px; } .badge { font-size: 11px; gap: 6px; } .about-copy { min-width: 0; } .about-copy h3 { font-size: 20px; } .about-copy p { font-size: 16px; } }
@media (pointer: coarse) { .portrait-handle { width: 44px; height: 44px; } }
@media (prefers-reduced-motion: reduce) { .portrait-comparison *, .portrait-effect { transition: none !important; } .portrait-comparison img { transform: none !important; } }
</style>
