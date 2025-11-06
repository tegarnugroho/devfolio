<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="modelValue" class="fixed inset-0 z-50">
        <!-- Backdrop with subtle gradient -->
        <div class="absolute inset-0 bg-black/70" @click="close"></div>
        <div class="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_60%)]"></div>

        <div class="absolute inset-0 flex items-center justify-center p-4 select-none" @click.self="close">
          <!-- Prev button -->
          <button v-if="hasMany"
            class="nav-btn safe-left absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 grid place-items-center rounded-full bg-white/15 hover:bg-white/25 text-white shadow-lg backdrop-blur-md border border-white/20 pointer-events-auto"
            @click.stop="prev"
            aria-label="Previous image"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <!-- Image container with transition and swipe -->
          <figure
            class="relative max-w-[96vw] max-h-[85vh] w-full flex items-center justify-center select-none"
            @click.self="close"
            @touchstart.passive="onTouchStart"
            @touchend.passive="onTouchEnd"
            @contextmenu.prevent
          >
            <transition :name="transitionName" mode="out-in">
              <img
                v-if="images.length"
                :key="current"
                :src="images[current]"
                :alt="`Image ${current + 1} of ${images.length}`"
                decoding="async" draggable="false" @dragstart.prevent
                class="lightbox-img z-10 max-h-[85vh] max-w-full object-contain rounded-xl shadow-2xl border border-white/10 select-none no-save"
              />
            </transition>
          </figure>

          <!-- Next button -->
          <button v-if="hasMany"
            class="nav-btn safe-right absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 grid place-items-center rounded-full bg-white/15 hover:bg-white/25 text-white shadow-lg backdrop-blur-md border border-white/20 pointer-events-auto"
            @click.stop="next"
            aria-label="Next image"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <!-- Close button -->
          <button
            class="absolute top-3 right-3 z-20 p-2 rounded-lg bg-white/15 hover:bg-white/25 text-white shadow backdrop-blur-md border border-white/20 pointer-events-auto"
            @click.stop="close"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>

          <!-- Dots -->
          <div v-if="hasMany" class="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 pointer-events-auto">
            <button
              v-for="(img, i) in images"
              :key="i"
              class="h-2.5 w-2.5 rounded-full border border-white/50"
              :class="i === current ? 'bg-white' : 'bg-white/30 hover:bg-white/50'"
              @click.stop="go(i)"
              :aria-label="`Go to image ${i+1}`"
            />
          </div>

          <!-- Counter badge -->
          <div v-if="hasMany" class="absolute bottom-3 right-3 z-20 text-white text-xs bg-black/45 px-3 py-1.5 rounded-full pointer-events-none">
            {{ current + 1 }} / {{ images.length }}
          </div>
        </div>
      </div>
    </transition>
  </teleport>
  
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch, ref, computed } from 'vue'

const props = defineProps<{
  modelValue: boolean
  images: string[]
  startIndex?: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const current = ref(props.startIndex ?? 0)
const lastDirection = ref<'left' | 'right'>('left')
const transitionName = ref('slide-left')
const hasMany = computed(() => (props.images?.length ?? 0) > 1)

watch(() => props.modelValue, (open) => {
  if (open) current.value = props.startIndex ?? 0
})

function close() {
  emit('update:modelValue', false)
}

function next() {
  if (!props.images?.length) return
  lastDirection.value = 'left'
  transitionName.value = 'slide-left'
  current.value = (current.value + 1) % props.images.length
}

function prev() {
  if (!props.images?.length) return
  lastDirection.value = 'right'
  transitionName.value = 'slide-right'
  current.value = (current.value - 1 + props.images.length) % props.images.length
}

function go(i: number) {
  if (!props.images?.length) return
  if (i === current.value) return
  lastDirection.value = i > current.value ? 'left' : 'right'
  transitionName.value = lastDirection.value === 'left' ? 'slide-left' : 'slide-right'
  current.value = i
}

function onKey(e: KeyboardEvent) {
  if (!props.modelValue) return
  if (e.key === 'Escape') close()
  else if (e.key === 'ArrowRight') next()
  else if (e.key === 'ArrowLeft') prev()
}

onMounted(() => {
  window.addEventListener('keydown', onKey)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
})

// Basic swipe
let touchStartX = 0
function onTouchStart(e: TouchEvent) {
  touchStartX = e.changedTouches[0]?.clientX ?? 0
}
function onTouchEnd(e: TouchEvent) {
  const x = e.changedTouches[0]?.clientX ?? 0
  const dx = x - touchStartX
  if (Math.abs(dx) > 40) {
    if (dx < 0) next()
    else prev()
  }
}

// Preload adjacent images for smoother transitions
watch(current, (idx) => {
  const len = props.images?.length ?? 0
  if (!len) return
  const nextIdx = (idx + 1) % len
  const prevIdx = (idx - 1 + len) % len
  const preload = (url?: string) => {
    if (!url) return
    const img = new Image()
    img.src = url
  }
  preload(props.images?.[nextIdx])
  preload(props.images?.[prevIdx])
}, { immediate: true })
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Slide transitions */
.slide-left-enter-active, .slide-left-leave-active,
.slide-right-enter-active, .slide-right-leave-active {
  transition: opacity 220ms cubic-bezier(.22,.61,.36,1), transform 220ms cubic-bezier(.22,.61,.36,1);
}
.slide-left-enter-from { opacity: 0; transform: translateX(24px) scale(0.996); }
.slide-left-leave-to   { opacity: 0; transform: translateX(-24px) scale(0.996); }
.slide-right-enter-from{ opacity: 0; transform: translateX(-24px) scale(0.996); }
.slide-right-leave-to  { opacity: 0; transform: translateX(24px) scale(0.996); }

.lightbox-img { will-change: transform, opacity; backface-visibility: hidden; transform: translateZ(0); }

.no-save { user-select: none; -webkit-user-drag: none; -webkit-touch-callout: none; }

/* Safe area support for notches (iOS) */
@supports (padding: env(safe-area-inset-left)) {
  .safe-left { left: calc(0.75rem + env(safe-area-inset-left)); }
  .safe-right { right: calc(0.75rem + env(safe-area-inset-right)); }
}

/* Ensure consistent tap target and layering */
.nav-btn { -webkit-tap-highlight-color: transparent; }

@media (prefers-reduced-motion: reduce) {
  .slide-left-enter-active, .slide-left-leave-active,
  .slide-right-enter-active, .slide-right-leave-active { transition-duration: 0ms; }
}
</style>
