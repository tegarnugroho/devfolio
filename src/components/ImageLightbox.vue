<template>
  <teleport to="body">
    <transition name="showcase">
      <div v-if="modelValue" class="showcase-backdrop" @click.self="close" @keydown="onKey">
        <div ref="dialog" class="showcase-dialog" role="dialog" aria-modal="true" aria-labelledby="showcase-title" tabindex="-1">
          <header class="showcase-bar">
            <span class="counter" aria-live="polite">{{ pad(current + 1) }} / {{ pad(images.length) }}</span>
            <div class="showcase-controls"><template v-if="hasMany"><button @click="prev" aria-label="Previous image">←</button><button @click="next" aria-label="Next image">→</button><span class="control-divider" aria-hidden="true"></span></template><button ref="closeButton" class="close-button" @click="close" aria-label="Close project dialog">×</button></div>
          </header>
          <div class="showcase-body">
            <div class="showcase-gallery">
              <figure class="gallery-canvas" @touchstart.passive="onTouchStart" @touchend.passive="onTouchEnd" @contextmenu.prevent>
                <transition name="image-fade" mode="out-in"><img v-if="images.length" :key="images[current]" :src="images[current]" :alt="`${project?.title ?? 'Project'} screenshot ${current + 1} of ${images.length}`" decoding="async" draggable="false" @dragstart.prevent /></transition>
              </figure>
              <div v-if="hasMany" class="gallery-thumbnails" aria-label="Gallery images"><button v-for="(image, index) in images" :key="index" :class="{ selected: current === index }" :aria-label="`View image ${index + 1}`" :aria-pressed="current === index" @click="go(index)"><img :src="image" alt="" loading="lazy" draggable="false" /></button></div>
            </div>
            <div v-if="project" class="showcase-information">
              <p class="metadata">{{ project.tech[0] }}</p>
              <h2 id="showcase-title">{{ titleParts[0] }}</h2>
              <p v-if="titleParts[1]" class="subtitle">{{ titleParts[1] }}</p>
              <section class="description"><h3>Project description</h3><p>{{ project.description }}</p></section>
              <section class="stack"><h3>Tech stack</h3><ul><li v-for="tech in project.tech" :key="tech">{{ tech }}</li></ul></section>
              <div v-if="validUrl(project.link) || validUrl(project.repo)" class="showcase-actions"><a v-if="validUrl(project.link)" :href="project.link" target="_blank" rel="noopener noreferrer" class="primary-action">View Project <span aria-hidden="true">↗</span></a><a v-if="validUrl(project.repo)" :href="project.repo" target="_blank" rel="noopener noreferrer"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-14-2 16" stroke="currentColor" stroke-width="1.5" /></svg>View Code</a></div>
            </div>
            <h2 v-else id="showcase-title" class="sr-only">Project gallery</h2>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { onBeforeUnmount, watch, ref, computed, nextTick } from 'vue'
import type { Project } from '@/types'
const props = defineProps<{ modelValue: boolean; images: string[]; startIndex?: number; project?: Project | null }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>()
const current = ref(0)
const dialog = ref<HTMLElement | null>(null)
const closeButton = ref<HTMLButtonElement | null>(null)
const hasMany = computed(() => props.images.length > 1)
const titleParts = computed(() => {
  const title = props.project?.title ?? 'Project gallery'
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
  if (!open) { restorePage(); return }
  current.value = Math.max(0, Math.min(props.startIndex ?? 0, props.images.length - 1))
  previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
  previousOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  locked = true
  await nextTick()
  if (!props.modelValue) return
  inertElements = Array.from(document.body.children).filter((element): element is HTMLElement => element instanceof HTMLElement && !element.contains(dialog.value)).map(element => ({ element, inert: element.inert }))
  inertElements.forEach(({ element }) => { element.inert = true })
  closeButton.value?.focus({ preventScroll: true })
}, { immediate: true })
function close() { emit('update:modelValue', false) }
function next() { if (props.images.length) current.value = (current.value + 1) % props.images.length }
function prev() { if (props.images.length) current.value = (current.value - 1 + props.images.length) % props.images.length }
function go(index: number) { current.value = index }
function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape') { event.preventDefault(); close() }
  else if (event.key === 'ArrowRight') { event.preventDefault(); next() }
  else if (event.key === 'ArrowLeft') { event.preventDefault(); prev() }
  else if (event.key === 'Tab') {
    const controls = Array.from(dialog.value?.querySelectorAll<HTMLElement>('button, a[href]') ?? [])
    const first = controls[0], last = controls[controls.length - 1]
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
  }
}
let touchX = 0
let touchY = 0
function onTouchStart(event: TouchEvent) { touchX = event.changedTouches[0]?.clientX ?? 0; touchY = event.changedTouches[0]?.clientY ?? 0 }
function onTouchEnd(event: TouchEvent) {
  const dx = (event.changedTouches[0]?.clientX ?? 0) - touchX
  const dy = (event.changedTouches[0]?.clientY ?? 0) - touchY
  if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { if (dx < 0) next(); else prev() }
}
watch([current, () => props.images], () => {
  if (!props.modelValue || !props.images.length) return
  for (const offset of [-1, 1]) { const image = new Image(); image.src = props.images[(current.value + offset + props.images.length) % props.images.length] }
})
onBeforeUnmount(restorePage)
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
.gallery-canvas { height: clamp(260px,48vh,470px); background: var(--surface); border: 1px solid var(--border); border-radius: 4px; display: flex; align-items: center; justify-content: center; overflow: hidden; touch-action: pan-y; }
.gallery-canvas img { width: 100%; height: 100%; object-fit: contain; }
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
.showcase-enter-active, .showcase-leave-active { transition: opacity 220ms; }
.showcase-enter-active .showcase-dialog, .showcase-leave-active .showcase-dialog { transition: transform 220ms; }
.showcase-enter-from, .showcase-leave-to { opacity: 0; }
.showcase-enter-from .showcase-dialog, .showcase-leave-to .showcase-dialog { transform: scale(.98); }
.image-fade-enter-active, .image-fade-leave-active { transition: opacity 120ms; }
.image-fade-enter-from, .image-fade-leave-to { opacity: 0; }
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
