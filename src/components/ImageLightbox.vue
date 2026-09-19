<template>
  <teleport to="body">
    <transition name="showcase" @after-enter="onShowcaseEntered" @after-leave="notifyBlueprintLayout">
      <div v-if="modelValue" class="showcase-backdrop" @click.self="close" @keydown="onKey">
        <div data-blueprint="MODAL" ref="dialog" class="showcase-dialog" role="dialog" aria-modal="true" aria-labelledby="showcase-title" tabindex="-1" @scroll.passive="refreshZoomBounds">
          <header class="showcase-bar">
            <span class="counter" aria-live="polite">{{ pad(current + 1) }} / {{ pad(images.length) }}</span>
            <div class="showcase-controls"><template v-if="hasMany"><button @click="prev" :aria-label="content.previousImageLabel">←</button><button @click="next" :aria-label="content.nextImageLabel">→</button><span class="control-divider" aria-hidden="true"></span></template><button ref="closeButton" class="close-button" @click="close" :aria-label="content.closeLabel">×</button></div>
          </header>
          <div class="showcase-body">
            <div class="showcase-gallery">
              <figure data-blueprint="GALLERY_VIEWPORT" ref="galleryCanvas" class="gallery-canvas" @pointerenter="onZoomEnter" @pointermove="onZoomMove" @pointerleave="onZoomLeave" @touchstart="onTouchStart" @touchmove.prevent="onTouchMove" @touchend="onTouchEnd" @touchcancel="cancelTouch" @contextmenu.prevent>
                <transition :name="imageDirection > 0 ? 'image-next' : 'image-prev'" @after-enter="cacheImageBounds">
                  <div v-if="displayedSource" :key="displayedSource" class="gallery-image-layer">
                    <img ref="mainImage" @load="cacheImageBounds" :src="displayedSource" :alt="content.screenshotAlt(project?.title ?? content.fallbackProject, displayedIndex + 1, images.length)" loading="eager" fetchpriority="high" decoding="async" draggable="false" @dragstart.prevent />
                  </div>
                </transition>
              <p v-if="imageError" class="image-error" role="status">{{ content.unavailableLabel }} <button @click="go(current)">{{ content.retryLabel }}</button></p>
              </figure>
              <div class="gallery-zoom-controls" role="group" :aria-label="content.zoomLabel">
                <button :disabled="touchScale <= 1 || !displayedSource" :aria-label="content.zoomOutLabel" @click="changeTouchZoom(-0.5)">−</button>
                <button class="zoom-reset" :disabled="!displayedSource" :aria-label="content.resetZoomLabel" @click="resetZoom">{{ Math.round(touchScale * 100) }}%</button>
                <button :disabled="touchScale >= 4 || !displayedSource" :aria-label="content.zoomInLabel" @click="changeTouchZoom(0.5)">+</button>
                <span>{{ content.zoomHint }}</span>
              </div>
              <div v-if="hasMany" data-blueprint="THUMBNAILS" class="gallery-thumbnails" :aria-label="content.galleryLabel"><button v-for="(image, index) in images" :key="index" :class="{ selected: current === index }" :aria-label="content.imageLabel(index + 1)" :aria-pressed="current === index" @click="go(index)"><img :src="image" alt="" loading="lazy" fetchpriority="low" decoding="async" draggable="false" /></button></div>
            </div>
            <div v-if="project" data-blueprint="PROJECT_INFO" class="showcase-information">
              <p class="metadata">{{ project.tech[0] }}</p>
              <h2 id="showcase-title">{{ titleParts[0] }}</h2>
              <p v-if="titleParts[1]" class="subtitle">{{ titleParts[1] }}</p>
              <section class="description"><h3>{{ content.descriptionLabel }}</h3><p>{{ project.description }}</p></section>
              <section class="stack"><h3>{{ content.stackLabel }}</h3><ul><li v-for="tech in project.tech" :key="tech">{{ tech }}</li></ul></section>
              <div v-if="validUrl(project.link) || validUrl(project.repo)" class="showcase-actions"><a v-if="validUrl(project.link)" :href="project.link" target="_blank" rel="noopener noreferrer" class="primary-action">{{ content.projectLabel }} <span aria-hidden="true">↗</span></a><a v-if="validUrl(project.repo)" :href="project.repo" target="_blank" rel="noopener noreferrer"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-14-2 16" stroke="currentColor" stroke-width="1.5" /></svg>{{ content.codeLabel }}</a></div>
            </div>
            <h2 v-else id="showcase-title" class="sr-only">{{ content.fallbackTitle }}</h2>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { portfolioContent } from '@/content/portfolioContent'
import { onBeforeUnmount, watch, ref, computed, nextTick } from 'vue'
import { loadGalleryImage } from '@/composables/galleryImages'
import type { Project } from '@/types'

const content = portfolioContent.showcase

const props = defineProps<{ modelValue: boolean; images: string[]; startIndex?: number; project?: Project | null }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>()
const current = ref(0)
const displayedSource = ref('')
const displayedIndex = ref(0)
const imageDirection = ref(1)
const imageError = ref(false)
let selectionVersion = 0
let preloadVersion = 0
let idleHandle = 0
let idleTimer: ReturnType<typeof setTimeout> | undefined
function cancelPreload() {
  preloadVersion++
  clearTimeout(idleTimer)
  if (idleHandle) window.cancelIdleCallback?.(idleHandle)
  idleHandle = 0
}
async function preloadGallery(index: number) {
  cancelPreload()
  const version = preloadVersion
  const sources = props.images.slice()
  if (!sources.length) return
  const conservative = window.matchMedia('(pointer: coarse)').matches ||
    !!(navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection?.saveData ||
    /(^2g$|slow-2g)/.test((navigator as Navigator & { connection?: { effectiveType?: string } }).connection?.effectiveType ?? '')
  const adjacent = [(index + 1) % sources.length]
  if (!conservative) adjacent.push((index - 1 + sources.length) % sources.length)
  await Promise.allSettled([...new Set(adjacent)].filter(i => i !== index).map(i => loadGalleryImage(sources[i])))
  if (version !== preloadVersion || !props.modelValue || conservative) return
  // Spread lower-priority work across idle-sized turns, never fetch other projects.
  const remaining = sources.filter((_, i) => i !== index && !adjacent.includes(i))
  const schedule = () => {
    if (window.requestIdleCallback) idleHandle = window.requestIdleCallback(warmNext, { timeout: 1000 })
    else idleTimer = setTimeout(warmNext, 150)
  }
  const warmNext = () => {
    idleHandle = 0
    if (version !== preloadVersion || !props.modelValue) return
    const source = remaining.shift()
    if (source) void loadGalleryImage(source, 'low').catch(() => {}).finally(() => {
      if (version === preloadVersion && props.modelValue) schedule()
    })
  }
  schedule()
}
const dialog = ref<HTMLElement | null>(null)
const closeButton = ref<HTMLButtonElement | null>(null)
// Update only the image DOM layer while tracking the pointer.
const galleryCanvas = ref<HTMLElement | null>(null)
const mainImage = ref<HTMLImageElement | null>(null)
let zoomFrame = 0
let zoomBounds: { left: number; top: number; width: number; height: number; offsetX: number; offsetY: number } | null = null
let zoomPointer = { x: 0, y: 0 }
let zoomObserver: ResizeObserver | null = null
const touchScale = ref(1)
let touchPan = { x: 0, y: 0 }
function cacheImageBounds() {
  const canvas = galleryCanvas.value, image = mainImage.value
  zoomBounds = null
  if (!canvas || !image?.naturalWidth || !image.naturalHeight) return
  const rect = canvas.getBoundingClientRect()
  const ratio = Math.min(canvas.clientWidth / image.naturalWidth, canvas.clientHeight / image.naturalHeight)
  const width = image.naturalWidth * ratio, height = image.naturalHeight * ratio
  const offsetX = (canvas.clientWidth - width) / 2, offsetY = (canvas.clientHeight - height) / 2
  zoomBounds = { left: rect.left + canvas.clientLeft + offsetX, top: rect.top + canvas.clientTop + offsetY, width, height, offsetX, offsetY }
}
function resetZoom() {
  touchScale.value = 1
  touchPan = { x: 0, y: 0 }
  cancelTouch()
  cancelAnimationFrame(zoomFrame)
  zoomFrame = 0
  if (mainImage.value) {
    mainImage.value.style.transform = 'scale(1)'
    mainImage.value.style.transformOrigin = '50% 50%'
  }
  if (galleryCanvas.value) galleryCanvas.value.style.cursor = ''
}
function onZoomEnter(event: PointerEvent) { if (event.pointerType === 'mouse') { cacheImageBounds(); onZoomMove(event) } }
function onZoomLeave(event: PointerEvent) { if (event.pointerType === 'mouse') resetZoom() }
function onZoomMove(event: PointerEvent) {
  if (event.pointerType !== 'mouse' || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
  zoomPointer = { x: event.clientX, y: event.clientY }
  if (zoomFrame) return
  zoomFrame = requestAnimationFrame(() => {
    zoomFrame = 0
    const bounds = zoomBounds, image = mainImage.value
    if (!bounds || !image || zoomPointer.x < bounds.left || zoomPointer.x > bounds.left + bounds.width || zoomPointer.y < bounds.top || zoomPointer.y > bounds.top + bounds.height) { resetZoom(); return }
    const x = Math.max(0, Math.min(1, (zoomPointer.x - bounds.left) / bounds.width))
    const y = Math.max(0, Math.min(1, (zoomPointer.y - bounds.top) / bounds.height))
    // The element includes contain letterboxing, so add that offset to the focal point.
    image.style.transformOrigin = `${bounds.offsetX + x * bounds.width}px ${bounds.offsetY + y * bounds.height}px`
    image.style.transform = 'scale(2.2)'
    galleryCanvas.value!.style.cursor = 'zoom-in'
  })
}
function notifyBlueprintLayout() { window.dispatchEvent(new Event('blueprint-layout')) }
function onShowcaseEntered() { refreshZoomBounds(); notifyBlueprintLayout() }
function refreshZoomBounds() { resetZoom(); cacheImageBounds() }
watch(galleryCanvas, canvas => {
  zoomObserver?.disconnect()
  if (canvas) { zoomObserver = new ResizeObserver(refreshZoomBounds); zoomObserver.observe(canvas) }
}, { flush: 'post' })
watch(mainImage, refreshZoomBounds, { flush: 'post' })
watch(current, () => { resetZoom(); zoomBounds = null }, { flush: 'sync' })
watch(() => props.modelValue, open => { if (!open) { resetZoom(); zoomBounds = null } })
const hasMany = computed(() => props.images.length > 1)
const titleParts = computed(() => {
  const title = props.project?.title ?? content.fallbackTitle
  const separator = title.indexOf(' - ')
  return separator < 0 ? [title, ''] : [title.slice(0, separator), title.slice(separator + 3)]
})
const pad = (value: number) => String(value).padStart(2, '0')
const validUrl = (value?: string) => !!value && /^https?:\/\//i.test(value)
let previousFocus: HTMLElement | null = null
let previousOverflow = ''
let inertElements: { element: HTMLElement; inert: boolean }[] = []
let locked = false
function restorePage() {
  if (!locked) return
  document.body.style.overflow = previousOverflow
  inertElements.forEach(({ element, inert }) => { element.inert = inert })
  inertElements = []
  locked = false
  previousFocus?.focus({ preventScroll: true })
}
watch(() => props.modelValue, async open => {
  if (!open) { selectionVersion++; cancelPreload(); imageError.value = false; restorePage(); return }
  current.value = Math.max(0, Math.min(props.startIndex ?? 0, props.images.length - 1))
  selectionVersion++
  imageError.value = false
  displayedIndex.value = current.value
  displayedSource.value = props.images[current.value] ?? ''
  const openingVersion = selectionVersion
  if (displayedSource.value) void loadGalleryImage(displayedSource.value).catch(() => {
    if (openingVersion === selectionVersion && props.modelValue) imageError.value = true
  })
  void preloadGallery(current.value)
  previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
  previousOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  locked = true
  await nextTick()
  if (!props.modelValue) return
  inertElements = Array.from(document.body.children).filter((element): element is HTMLElement => element instanceof HTMLElement && !element.contains(dialog.value) && !element.hasAttribute('data-blueprint-root')).map(element => ({ element, inert: element.inert }))
  inertElements.forEach(({ element }) => { element.inert = true })
  closeButton.value?.focus({ preventScroll: true })
}, { immediate: true })
watch(() => props.modelValue, async () => { await nextTick(); window.dispatchEvent(new Event('blueprint-layout')) }, { flush: 'post' })
function close() { emit('update:modelValue', false) }
function next() { if (props.images.length) void go((current.value + 1) % props.images.length, 1) }
function prev() { if (props.images.length) void go((current.value - 1 + props.images.length) % props.images.length, -1) }
async function go(index: number, direction = index >= current.value ? 1 : -1) {
  const source = props.images[index]
  if (!source || !props.modelValue) return
  const version = ++selectionVersion
  current.value = index
  imageError.value = false
  const ready = loadGalleryImage(source)
  void preloadGallery(index)
  try {
    await ready
    if (version !== selectionVersion || !props.modelValue || props.images[index] !== source) return
    resetZoom()
    imageDirection.value = direction
    displayedIndex.value = index
    displayedSource.value = source
    await nextTick()
    refreshZoomBounds()
  } catch {
    if (version === selectionVersion && props.modelValue) imageError.value = true
  }
}
function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape') { event.preventDefault(); close() }
  else if (event.key === 'ArrowRight') { event.preventDefault(); next() }
  else if (event.key === 'ArrowLeft') { event.preventDefault(); prev() }
  else if (event.key === 'Tab') {
    const controls = Array.from(dialog.value?.querySelectorAll<HTMLElement>('button, a[href]') ?? [])
    const blueprintExit = document.querySelector<HTMLElement>('[data-blueprint-control]')
    if (blueprintExit) controls.push(blueprintExit)
    const first = controls[0], last = controls[controls.length - 1]
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
  }
}
type TouchGesture = { x: number; y: number; distance: number; scale: number; panX: number; panY: number }
let touchGesture: TouchGesture | null = null
let swipeStart: { x: number; y: number } | null = null
function cancelTouch() { touchGesture = null; swipeStart = null }
function touchPosition(touches: TouchList) {
  const first = touches[0]!, second = touches[1]
  return second
    ? { x: (first.clientX + second.clientX) / 2, y: (first.clientY + second.clientY) / 2, distance: Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY) }
    : { x: first.clientX, y: first.clientY, distance: 0 }
}
function applyTouchZoom() {
  const canvas = galleryCanvas.value, image = mainImage.value, bounds = zoomBounds
  if (!canvas || !image || !bounds) return
  const maxX = Math.max(0, (bounds.width * touchScale.value - canvas.clientWidth) / 2)
  const maxY = Math.max(0, (bounds.height * touchScale.value - canvas.clientHeight) / 2)
  touchPan.x = Math.max(-maxX, Math.min(maxX, touchPan.x))
  touchPan.y = Math.max(-maxY, Math.min(maxY, touchPan.y))
  image.style.transformOrigin = '50% 50%'
  image.style.transform = `translate(${touchPan.x}px, ${touchPan.y}px) scale(${touchScale.value})`
}
function changeTouchZoom(delta: number) {
  cacheImageBounds()
  touchScale.value = Math.max(1, Math.min(4, touchScale.value + delta))
  applyTouchZoom()
}
function onTouchStart(event: TouchEvent) {
  cacheImageBounds()
  if (!event.touches.length) return
  const position = touchPosition(event.touches)
  touchGesture = { ...position, scale: touchScale.value, panX: touchPan.x, panY: touchPan.y }
  swipeStart = event.touches.length === 1 && touchScale.value === 1 ? { x: position.x, y: position.y } : null
}
function onTouchMove(event: TouchEvent) {
  const gesture = touchGesture, canvas = galleryCanvas.value
  if (!gesture || !canvas || !event.touches.length) return
  const position = touchPosition(event.touches)
  if (position.distance > 0 && gesture.distance > 0) {
    swipeStart = null
    const rect = canvas.getBoundingClientRect()
    touchScale.value = Math.max(1, Math.min(4, gesture.scale * position.distance / gesture.distance))
    const ratio = touchScale.value / gesture.scale
    touchPan = {
      x: position.x - rect.left - rect.width / 2 - (gesture.x - rect.left - rect.width / 2 - gesture.panX) * ratio,
      y: position.y - rect.top - rect.height / 2 - (gesture.y - rect.top - rect.height / 2 - gesture.panY) * ratio,
    }
  } else if (touchScale.value > 1) {
    swipeStart = null
    touchPan = { x: gesture.panX + position.x - gesture.x, y: gesture.panY + position.y - gesture.y }
  }
  applyTouchZoom()
}
function onTouchEnd(event: TouchEvent) {
  if (event.touches.length) {
    const position = touchPosition(event.touches)
    touchGesture = { ...position, scale: touchScale.value, panX: touchPan.x, panY: touchPan.y }
    swipeStart = null
    return
  }
  const start = swipeStart, end = event.changedTouches[0]
  cancelTouch()
  if (!start || !end || touchScale.value > 1) return
  const dx = end.clientX - start.x, dy = end.clientY - start.y
  if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { if (dx < 0) next(); else prev() }
}
onBeforeUnmount(() => { selectionVersion++; cancelPreload(); resetZoom(); zoomObserver?.disconnect(); restorePage() })
</script>

<style scoped>
.showcase-backdrop { position: fixed; inset: 0; z-index: 100; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,.72); padding: 40px; }
.showcase-dialog { width: min(1120px,100%); max-height: calc(100dvh - 80px); overflow: auto; background: var(--secondary-background); color: var(--primary); border: 1px solid var(--strong-border); border-radius: 7px; box-shadow: 0 16px 48px rgba(0,0,0,.2); overscroll-behavior: contain; }
.showcase-bar { position: sticky; top: 0; z-index: 2; display: flex; justify-content: space-between; align-items: center; gap: 20px; padding: 22px 28px; background: var(--secondary-background); }
.counter { font-family: ui-monospace,monospace; font-size: 12px; color: var(--secondary); letter-spacing: .06em; }
.showcase-controls { display: flex; align-items: center; gap: 12px; }
.showcase-controls button { display: grid; place-items: center; width: 48px; height: 38px; border: 1px solid var(--strong-border); border-radius: 4px; font-size: 21px; background: transparent; }
.showcase-controls button:hover { border-color: var(--secondary); }
.control-divider { height: 24px; width: 1px; background: var(--strong-border); margin-inline: 10px; }
.showcase-controls .close-button { border-color: transparent; width: 36px; font-size: 28px; }
.showcase-body { display: grid; grid-template-columns: minmax(0,1.8fr) minmax(0,1fr); gap: 40px; padding: 0 28px 36px; }
.showcase-gallery, .showcase-information { min-width: 0; }
.gallery-canvas { position: relative; height: clamp(260px,48vh,470px); background: var(--surface); border: 1px solid var(--border); border-radius: 4px; display: flex; align-items: center; justify-content: center; overflow: hidden; touch-action: none; }
.gallery-image-layer { position: absolute; inset: 0; }
.gallery-canvas img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; image-rendering: auto; transform-origin: 50% 50%; transition: transform 220ms ease; }
.gallery-zoom-controls { display: none; align-items: center; gap: 8px; margin-top: 10px; }
.gallery-zoom-controls button { min-width: 44px; min-height: 44px; border: 1px solid var(--strong-border); border-radius: 4px; background: var(--surface); font-size: 20px; }
.gallery-zoom-controls .zoom-reset { min-width: 64px; font-size: 12px; }
.gallery-zoom-controls button:disabled { opacity: .4; }
.gallery-zoom-controls span { color: var(--secondary); font-size: 11px; }
@media (hover: none), (pointer: coarse), (max-width: 767px) {
  .gallery-zoom-controls { display: flex; }
}
@media (any-pointer: coarse) { .gallery-canvas img { transition: none; } }
.gallery-thumbnails { display: flex; gap: 12px; overflow-x: auto; padding-block: 22px 4px; }
.gallery-thumbnails button { flex: 0 0 116px; height: 82px; border: 1px solid var(--border); border-radius: 4px; background: var(--surface); overflow: hidden; opacity: .6; transition: opacity 220ms,border-color 220ms; }
.gallery-thumbnails button.selected { border-color: var(--primary); opacity: 1; }
.gallery-thumbnails button:hover { opacity: 1; }
.gallery-thumbnails img { width: 100%; height: 100%; object-fit: contain; }
.metadata, .showcase-information h3 { font-family: ui-monospace,monospace; text-transform: uppercase; letter-spacing: .15em; font-size: 10px; color: var(--secondary); }
.showcase-information h2 { font-size: 30px; line-height: 1.2; font-weight: 500; margin-top: 12px; overflow-wrap: anywhere; }
.subtitle { color: var(--secondary); font-size: 15px; margin-top: 10px; }
.description { margin-top: 26px; }
.description p { font-size: 14px; line-height: 1.65; color: var(--secondary); margin-top: 12px; }
.stack { padding-top: 20px; margin-top: 24px; border-top: 1px solid var(--border); }
.stack ul { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
.stack li { font-size: 11px; color: var(--secondary); border: 1px solid var(--strong-border); border-radius: 3px; padding: 3px 9px; }
.showcase-actions { display: flex; flex-wrap: wrap; gap: 12px; border-top: 1px solid var(--border); padding-top: 18px; margin-top: 24px; }
.showcase-actions a { display: inline-flex; align-items: center; justify-content: center; gap: 12px; flex: 1 1 130px; border: 1px solid var(--strong-border); border-radius: 4px; padding: 12px 16px; font-size: 12px; }
.showcase-actions a:hover { border-color: var(--secondary); }
.showcase-actions .primary-action { background: var(--button); color: var(--button-text); }
.showcase-actions .primary-action:hover { background: var(--button-hover); }
.showcase-enter-active { transition: opacity 700ms cubic-bezier(.22,.61,.36,1); }
.showcase-enter-active .showcase-dialog { transition: opacity 620ms ease, transform 700ms cubic-bezier(.22,.61,.36,1); }
.showcase-enter-active .showcase-gallery { transition: opacity 560ms ease 80ms, transform 620ms cubic-bezier(.22,.61,.36,1) 80ms; }
.showcase-enter-active .showcase-information > * { transition: opacity 500ms ease, transform 500ms cubic-bezier(.22,.61,.36,1); transition-delay: 80ms; }
.showcase-enter-active .showcase-information h2 { transition-delay: 110ms; }
.showcase-enter-active .subtitle { transition-delay: 140ms; }
.showcase-enter-active .description { transition-delay: 160ms; }
.showcase-enter-active .stack { transition-delay: 180ms; }
.showcase-enter-active .showcase-actions { transition-delay: 200ms; }
.showcase-leave-active { pointer-events: none; transition: opacity 300ms ease; }
.showcase-leave-active .showcase-dialog { transition: opacity 300ms ease, transform 300ms cubic-bezier(.4,0,1,1); }
.showcase-enter-from, .showcase-leave-to { opacity: 0; }
.showcase-enter-from .showcase-dialog { opacity: 0; transform: translateY(28px); }
.showcase-enter-from .showcase-gallery, .showcase-enter-from .showcase-information > * { opacity: 0; transform: translateY(14px); }
.showcase-leave-to .showcase-dialog { opacity: 0; transform: translateY(12px); }
.image-next-enter-active, .image-next-leave-active, .image-prev-enter-active, .image-prev-leave-active { transition: opacity 540ms ease, transform 540ms cubic-bezier(.22,.61,.36,1); will-change: opacity, transform; }
.image-next-enter-active, .image-prev-enter-active { z-index: 1; }
.image-next-leave-active, .image-prev-leave-active { pointer-events: none; }
.image-next-enter-from, .image-prev-leave-to { opacity: 0; transform: translateX(36px); }
.image-prev-enter-from, .image-next-leave-to { opacity: 0; transform: translateX(-36px); }
.image-error { position: absolute; bottom: 12px; z-index: 1; padding: 5px 8px; background: var(--secondary-background); color: var(--secondary); font-size: 12px; }
.image-error button { text-decoration: underline; margin-left: 6px; }
@media (max-width: 960px) {
  .showcase-backdrop { padding: 12px; }
  .showcase-dialog { max-height: calc(100dvh - 24px); }
  .showcase-bar { padding: 16px 18px; }
  .showcase-body { grid-template-columns: 1fr; gap: 26px; padding: 0 18px 26px; }
  .gallery-canvas { height: clamp(220px,42dvh,420px); }
  .gallery-thumbnails { padding-top: 14px; }
  .gallery-thumbnails button { flex-basis: 92px; height: 64px; }
}
@media (max-width: 400px) { .showcase-actions { flex-direction: column; } .showcase-actions a { flex: auto; } .showcase-controls { gap: 6px; } .control-divider { display: none; } }
@media (max-width: 767px) {
  .showcase-backdrop { padding: max(8px,env(safe-area-inset-top)) max(8px,env(safe-area-inset-right)) max(8px,env(safe-area-inset-bottom)) max(8px,env(safe-area-inset-left)); }
  .showcase-dialog { max-height: calc(100dvh - max(8px,env(safe-area-inset-top)) - max(8px,env(safe-area-inset-bottom))); }
  .showcase-bar { padding: 12px 14px; gap: 8px; }
  .showcase-controls { gap: 6px; }
  .showcase-controls button, .showcase-controls .close-button { width: 44px; height: 44px; }
  .control-divider { display: none; }
  .showcase-body { padding: 0 14px 24px; }
  .gallery-canvas { height: min(45dvh,420px); min-height: 160px; }
  .showcase-actions a { min-height: 44px; font-size: 13px; }
  .stack li { font-size: 12px; max-width: 100%; overflow-wrap: anywhere; }
}
@media (pointer: coarse) { .showcase-controls button, .showcase-controls .close-button { min-width: 44px; min-height: 44px; } }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition: none !important; } }
</style>
