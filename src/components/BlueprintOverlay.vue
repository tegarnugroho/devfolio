<template>
  <Teleport to="body">
    <div data-blueprint-root class="blueprint-root">
      <Transition name="blueprint" @after-leave="finishExit">
        <div v-if="blueprintEnabled" class="blueprint-layer" aria-hidden="true">
          <svg class="blueprint-guides" width="100%" height="100%"><path :d="guides" /></svg>
          <div v-if="section" class="blueprint-section" :style="{ left: `${Math.max(12, section.x)}px`, top: `${Math.max(headerHeight + 8, section.y + 8)}px` }">{{ section.label }}</div>
          <div v-for="(node, index) in visibleNodes" :key="`${node.label}-${index}`" class="blueprint-bound" :class="{ emphasized: hovered === node.element }" :style="{ left: `${node.x}px`, top: `${node.y}px`, width: `${node.width}px`, height: `${node.height}px` }">
            <span v-if="index < (mobile ? 2 : 4)" class="blueprint-label">{{ node.label }}</span>
            <span v-if="index < 3" class="blueprint-dimension">{{ Math.round(node.width) }} × {{ Math.round(node.height) }}</span>
          </div>
          <div v-if="spacing" class="blueprint-spacing" :style="{ left: `${spacing.x}px`, top: `${spacing.y}px`, height: `${spacing.height}px` }"><span>{{ Math.round(spacing.height) }}px</span></div>
          <div v-if="inspection && !mobile" class="blueprint-inspection" :style="{ left: `${Math.max(12, Math.min(width - 225, inspection.x))}px`, top: `${Math.max(headerHeight + 36, Math.min(height - 130, inspection.y + inspection.height + 10))}px` }"><strong>{{ inspection.label }}</strong><span v-if="inspection.text">“{{ inspection.text }}”</span><span>{{ Math.round(inspection.width) }} × {{ Math.round(inspection.height) }}</span><span v-if="inspection.font">{{ inspection.font }}</span><span>X {{ Math.round(inspection.x) }} / Y {{ Math.round(inspection.y + scrollY) }}</span></div>
          <div class="blueprint-readout"><span>{{ content.viewportLabel }} <b>{{ width }} × {{ height }}</b></span><span>{{ content.breakpointLabel }} <b>{{ breakpoint }}</b></span><span v-if="!mobile">{{ content.scrollLabel }} <b>{{ scrollPercent }}%</b></span><span v-if="!mobile && grid">{{ content.gridLabel }} <b>{{ grid }}</b></span></div>
        </div>
      </Transition>
      <Transition name="blueprint-control">
        <button v-if="blueprintEnabled" data-blueprint-control class="blueprint-exit" :style="{ top: `${headerHeight + 10}px` }" :aria-label="content.exitLabel" @click="exit" @keydown.tab="onExitTab"><span>{{ content.title }} <small>{{ content.status }}</small></span><span aria-hidden="true">×</span></button>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { blueprintEnabled } from '@/composables/useBlueprint'
import { portfolioContent } from '@/content/portfolioContent'
const content = portfolioContent.blueprint
interface Bounds { element: HTMLElement; label: string; x: number; y: number; width: number; height: number; fixed: boolean; font: string; text: string }
const nodes = shallowRef<Bounds[]>([])
const sectionNodes = shallowRef<Bounds[]>([])
const hovered = shallowRef<HTMLElement | null>(null)
const width = ref(0), height = ref(0), scrollY = ref(0), scrollPercent = ref(0), headerHeight = ref(80), grid = ref('')
let observer: ResizeObserver | undefined
const observed = new Set<HTMLElement>()
let frame = 0
let exitTimer: ReturnType<typeof setTimeout> | undefined
const mobile = computed(() => width.value < 768)
const breakpoint = computed(() => mobile.value ? 'MOBILE' : width.value < 1024 ? 'TABLET' : 'DESKTOP')
const positioned = computed(() => nodes.value.map(node => ({ ...node, y: node.y - (node.fixed ? 0 : scrollY.value) })))
const visibleNodes = computed(() => {
  const modal = positioned.value.some(node => node.label === 'MODAL')
  return positioned.value.filter(node => (modal ? node.fixed : true) && (node.label === 'NAVIGATION' || node.y + node.height > headerHeight.value) && node.y < height.value - 75).slice(0, mobile.value ? 3 : 5)
})
const section = computed(() => {
  if (positioned.value.some(node => node.label === 'MODAL')) return null
  if (scrollPercent.value >= 99 && scrollY.value > 0) {
    const last = sectionNodes.value[sectionNodes.value.length - 1]
    if (last) return { ...last, y: last.y - scrollY.value }
  }
  return sectionNodes.value.map(node => ({ ...node, y: node.y - scrollY.value })).filter(node => node.y + node.height > headerHeight.value + 20 && node.y < height.value).sort((a, b) => visibleHeight(b) - visibleHeight(a))[0]
})
function visibleHeight(node: Bounds) { return Math.max(0, Math.min(height.value, node.y + node.height) - Math.max(headerHeight.value, node.y)) }
const inspection = computed(() => positioned.value.find(node => node.element === hovered.value))
const guides = computed(() => section.value ? `M ${section.value.x} ${headerHeight.value} V ${height.value} M ${section.value.x + section.value.width} ${headerHeight.value} V ${height.value}` : '')
const spacing = computed(() => {
  const title = positioned.value.find(node => node.label === 'HERO_TITLE')
  const description = positioned.value.find(node => node.label === 'HERO_DESCRIPTION')
  if (!title || !description || title.y < headerHeight.value || description.y > height.value) return null
  const gap = description.y - title.y - title.height
  return gap > 0 ? { x: mobile.value ? Math.min(width.value - 55, title.x + title.width + 8) : title.x + title.width + 8, y: title.y + title.height, height: gap } : null
})
function bounds(element: HTMLElement, label: string): Bounds {
  const rect = element.getBoundingClientRect()
  const fixed = !!element.closest('.showcase-backdrop') || element.matches('.nav-inner')
  return { element, label, x: rect.left, y: rect.top + (fixed ? 0 : window.scrollY), width: rect.width, height: rect.height, fixed, text: element.matches('h1,h2') ? (element.textContent?.trim() ?? '') : '', font: element.matches('h1,h2') ? `font-weight ${getComputedStyle(element).fontWeight}` : '' }
}
function measure() {
  frame = 0
  if (!blueprintEnabled.value) return
  width.value = window.innerWidth; height.value = window.innerHeight
  headerHeight.value = document.querySelector('header.graphite-navbar')?.getBoundingClientRect().height ?? 80
  nodes.value = Array.from(document.querySelectorAll<HTMLElement>('[data-blueprint]')).filter(element => element.getClientRects().length && !element.closest('[inert]')).map(element => bounds(element, element.dataset.blueprint!))
  sectionNodes.value = Array.from(document.querySelectorAll<HTMLElement>('main > section[id]')).map((element, index) => bounds(element, `${String(index + 1).padStart(2, '0')} / ${element.id.toUpperCase()}`))
  const elements = new Set([...nodes.value, ...sectionNodes.value].map(node => node.element))
  observed.forEach(element => { if (!elements.has(element)) { observer?.unobserve(element); observed.delete(element) } })
  elements.forEach(element => { if (!observed.has(element)) { observer?.observe(element); observed.add(element) } })
  const gridElement = document.querySelector('.hero-atmosphere')
  grid.value = gridElement ? getComputedStyle(gridElement, '::before').backgroundSize.split(' ')[0] : ''
  updateScroll()
}
function scheduleMeasure() { if (blueprintEnabled.value && !frame) frame = requestAnimationFrame(measure) }
let scrollFrame = 0
function updateScroll() {
  scrollY.value = window.scrollY
  scrollPercent.value = Math.round(window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight) * 100)
}
function onScroll() { if (blueprintEnabled.value && !scrollFrame) scrollFrame = requestAnimationFrame(() => { scrollFrame = 0; updateScroll() }) }
function onPointer(event: PointerEvent) {
  if (!blueprintEnabled.value || mobile.value || event.pointerType !== 'mouse') return
  const target = (event.target as Element).closest<HTMLElement>('[data-blueprint]')
  if (hovered.value !== target) hovered.value = target
}
function onKey(event: KeyboardEvent) {
  if (event.repeat || event.isComposing || event.ctrlKey || event.metaKey || event.altKey || (event.target instanceof Element && event.target.closest('input,textarea,select,[contenteditable]:not([contenteditable="false"])'))) return
  if (event.key.toLowerCase() === 'b' || (event.key === 'Escape' && blueprintEnabled.value)) {
    event.preventDefault(); event.stopImmediatePropagation()
    blueprintEnabled.value = event.key === 'Escape' ? false : !blueprintEnabled.value
  }
}
function exit() { blueprintEnabled.value = false; (document.querySelector<HTMLElement>('.showcase-dialog .close-button') ?? document.querySelector<HTMLElement>('.theme-sky'))?.focus({ preventScroll: true }) }
function finishExit() { if (!blueprintEnabled.value) document.documentElement.classList.remove('blueprint-active') }
function onExitTab(event: KeyboardEvent) {
  const dialog = document.querySelector('.showcase-dialog')
  if (!dialog) return
  const controls = dialog.querySelectorAll<HTMLElement>('button,a[href]')
  event.preventDefault(); (event.shiftKey ? controls[controls.length - 1] : controls[0])?.focus()
}
watch(blueprintEnabled, async enabled => {
  clearTimeout(exitTimer)
  if (enabled) {
    document.documentElement.classList.add('blueprint-active')
    await nextTick(); scheduleMeasure()
  } else {
    observer?.disconnect(); observed.clear(); hovered.value = null
    exitTimer = setTimeout(finishExit, 450)
  }
})
onMounted(() => {
  observer = new ResizeObserver(scheduleMeasure)
  window.addEventListener('keydown', onKey, true)
  window.addEventListener('resize', scheduleMeasure)
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('blueprint-layout', scheduleMeasure)
  window.addEventListener('pointerover', onPointer)
})
onBeforeUnmount(() => {
  observer?.disconnect(); cancelAnimationFrame(frame); cancelAnimationFrame(scrollFrame); clearTimeout(exitTimer)
  document.documentElement.classList.remove('blueprint-active')
  window.removeEventListener('keydown', onKey, true); window.removeEventListener('resize', scheduleMeasure); window.removeEventListener('scroll', onScroll); window.removeEventListener('blueprint-layout', scheduleMeasure); window.removeEventListener('pointerover', onPointer)
})
</script>

<style scoped>
.blueprint-root { position: relative; z-index: 140; pointer-events: none; --technical: rgba(0,0,0,.18); --measurement: rgba(0,0,0,.48); --annotation: rgba(0,0,0,.6); }
:global(html.dark .blueprint-root) { --technical: rgba(255,255,255,.18); --measurement: rgba(255,255,255,.48); --annotation: rgba(255,255,255,.6); }
.blueprint-layer { position: fixed; inset: 0; pointer-events: none; font: 9px ui-monospace,monospace; color: var(--annotation); letter-spacing: .12em; }
.blueprint-guides { position: absolute; inset: 0; }
.blueprint-guides path { fill: none; stroke: var(--technical); stroke-dasharray: 3 7; }
.blueprint-bound { position: absolute; border: 1px solid var(--technical); transition: border-color 150ms; }
.blueprint-bound.emphasized { border-color: var(--measurement); }
.blueprint-label { position: absolute; left: 0; top: -16px; font-size: 8px; white-space: nowrap; background: var(--background); padding: 2px 5px; }
.blueprint-dimension { position: absolute; right: 4px; bottom: -17px; white-space: nowrap; color: var(--measurement); background: var(--background); padding: 2px 4px; }
.blueprint-section { position: absolute; background: var(--background); padding: 3px 6px; }
.blueprint-spacing { position: absolute; border-left: 1px solid var(--measurement); }
.blueprint-spacing::before,.blueprint-spacing::after { content: ''; position: absolute; left: -3px; width: 5px; border-top: 1px solid var(--measurement); }
.blueprint-spacing::after { bottom: 0; }
.blueprint-spacing span { position: absolute; left: 7px; top: 40%; white-space: nowrap; }
.blueprint-readout { position: absolute; left: 16px; bottom: calc(14px + env(safe-area-inset-bottom)); display: grid; gap: 5px; background: var(--background); border-left: 1px solid var(--technical); padding: 8px 12px; text-transform: uppercase; }
.blueprint-readout span { display: flex; gap: 16px; justify-content: space-between; }
.blueprint-readout b { font-weight: 400; }
.blueprint-inspection { position: absolute; display: grid; gap: 6px; padding: 10px; background: var(--background); border: 1px solid var(--technical); max-width: 220px; }
.blueprint-inspection strong { font-weight: 400; }
.blueprint-exit { position: fixed; right: 14px; display: flex; align-items: center; gap: 16px; border: 1px solid var(--strong-border); border-radius: 4px; padding: 8px 12px; min-height: 44px; background: var(--background); color: var(--secondary); pointer-events: auto; font: 10px ui-monospace,monospace; text-transform: uppercase; letter-spacing: .1em; }
.blueprint-exit small { display: block; margin-top: 4px; font-size: 8px; }
.blueprint-exit > span:last-child { font-size: 20px; }
.blueprint-enter-active .blueprint-guides { animation: blueprint-reveal 250ms 100ms both; }
.blueprint-enter-active .blueprint-bound { animation: blueprint-reveal 250ms 180ms both; }
.blueprint-enter-active .blueprint-label,.blueprint-enter-active .blueprint-dimension,.blueprint-enter-active .blueprint-section,.blueprint-enter-active .blueprint-readout { animation: blueprint-reveal 250ms 250ms both; }
.blueprint-enter-active { transition: opacity 500ms; }
.blueprint-leave-active { transition: opacity 400ms; }
.blueprint-leave-active .blueprint-label,.blueprint-leave-active .blueprint-dimension,.blueprint-leave-active .blueprint-readout,.blueprint-leave-active .blueprint-inspection { transition: opacity 120ms; opacity: 0; }
.blueprint-leave-active .blueprint-bound { transition: opacity 200ms 100ms; opacity: 0; }
.blueprint-leave-to { opacity: 0; }
.blueprint-control-enter-active,.blueprint-control-leave-active { transition: opacity 200ms; }
.blueprint-control-enter-from,.blueprint-control-leave-to { opacity: 0; }
@keyframes blueprint-reveal { from { opacity: 0; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .blueprint-enter-active,.blueprint-leave-active { transition-duration: 1ms; } .blueprint-layer * { animation: none !important; transition: none !important; } }
</style>
