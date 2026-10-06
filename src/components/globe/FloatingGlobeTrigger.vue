<template>
  <div
    class="floating-globe-trigger fixed right-6 top-1/2 -translate-y-1/2 z-40 flex items-center justify-center pointer-events-auto"
  >
    <div v-reveal="{ delay: 360, kind: 'accent' }" class="relative flex items-center">
      <!-- 1. Ambient Cosmic Ripple Waves (Radiates subtle curiosity outwards) -->
      <span class="cosmic-ripple-1 absolute -inset-2 rounded-full border border-blue-500/30 dark:border-blue-400/40 pointer-events-none"></span>
      <span class="cosmic-ripple-2 absolute -inset-3.5 rounded-full border border-cyan-400/20 dark:border-cyan-300/30 pointer-events-none"></span>

      <!-- 2. Circular Interactive Trigger Button -->
      <button
        type="button"
        @click="handleClick"
        @mouseenter="onHover"
        :aria-label="portfolioContent.projects.showcaseButtonLabel ?? '3D Project Showcase'"
        class="group relative h-11 w-11 grid place-items-center rounded-full border border-blue-500/30 dark:border-blue-400/35 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md hover:bg-white dark:hover:bg-black active:scale-95 hover:scale-110 transition-all duration-300 shadow-[0_8px_20px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.6)] hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-[0_0_24px_rgba(59,130,246,0.45)] cursor-pointer"
      >
        <!-- Rotating Holographic Orbit Ring -->
        <span class="orbit-glow-ring absolute -inset-[2px] rounded-full pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-300"></span>

        <!-- Mini 3D Rotating Globe Widget -->
        <MiniGlobeWidget class="w-6 h-6 shrink-0 relative z-10" />

        <!-- Live Pulse Indicator Dot -->
        <span class="absolute top-1 right-1 flex h-2 w-2 z-20 pointer-events-none">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
        </span>

        <!-- 3. Teaser Peek Pill & Tooltip (Auto-peeks on first visit, or on hover/focus) -->
        <div
          class="teaser-pill absolute right-full mr-3.5 top-1/2 -translate-y-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-950/92 dark:bg-black/95 text-white border border-blue-400/40 backdrop-blur-xl shadow-[0_12px_28px_rgba(0,0,0,0.5)] transition-all duration-300 whitespace-nowrap opacity-0 translate-x-3 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto group-focus-visible:opacity-100 group-focus-visible:translate-x-0"
          :class="{ 'teaser-active': isTeasing }"
        >
          <!-- Glowing pulse status beacon -->
          <span class="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_#38bdf8] animate-pulse"></span>

          <span class="font-mono text-[10.5px] font-bold tracking-wider uppercase text-blue-400 flex items-center gap-1">
            <span>EXPLORE IN 3D</span>
          </span>

          <span class="font-mono text-[9px] uppercase tracking-wider text-zinc-400 border-l border-white/20 pl-2">
            GLOBE
          </span>

          <span class="text-blue-400 font-mono text-[11px] group-hover:translate-x-0.5 transition-transform" aria-hidden="true">
            ↗
          </span>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { portfolioContent } from '@/content/portfolioContent'
import MiniGlobeWidget from './MiniGlobeWidget.vue'
import { openShowcase } from '@/composables/useShowcase'

const isTeasing = ref(false)
let teaseTimer: ReturnType<typeof setTimeout> | null = null
let dismissTimer: ReturnType<typeof setTimeout> | null = null

function handleClick() {
  isTeasing.value = false
  if (teaseTimer) clearTimeout(teaseTimer)
  if (dismissTimer) clearTimeout(dismissTimer)
  openShowcase()
}

function onHover() {
  // If user actively hovers during tease, dismiss tease state so standard group-hover controls it seamlessly
  isTeasing.value = false
}

onMounted(() => {
  // Auto-peek teaser once per session after 2.4s to invite curiosity
  const hasTeased = sessionStorage.getItem('devfolio_globe_teased')
  if (!hasTeased) {
    teaseTimer = setTimeout(() => {
      isTeasing.value = true
      sessionStorage.setItem('devfolio_globe_teased', 'true')

      // Stay expanded for 4.8s then smoothly tuck away into compact circle
      dismissTimer = setTimeout(() => {
        isTeasing.value = false
      }, 4800)
    }, 2400)
  }
})

onBeforeUnmount(() => {
  if (teaseTimer) clearTimeout(teaseTimer)
  if (dismissTimer) clearTimeout(dismissTimer)
})
</script>

<style scoped>
/* Cosmic Ripple Waves */
.cosmic-ripple-1 {
  animation: cosmic-pulse 4.5s cubic-bezier(0.22, 1, 0.36, 1) infinite;
}

.cosmic-ripple-2 {
  animation: cosmic-pulse 4.5s cubic-bezier(0.22, 1, 0.36, 1) 0.8s infinite;
}

@keyframes cosmic-pulse {
  0% {
    transform: scale(0.9);
    opacity: 0.85;
  }
  50% {
    transform: scale(1.35);
    opacity: 0;
  }
  100% {
    transform: scale(1.35);
    opacity: 0;
  }
}

/* Holographic Rotating Orbit Glow Ring */
.orbit-glow-ring {
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    rgba(56, 189, 248, 0.6) 120deg,
    rgba(59, 130, 246, 0.9) 220deg,
    transparent 360deg
  );
  animation: orbit-rotate 7s linear infinite;
  mask: radial-gradient(circle, transparent 58%, black 62%);
  -webkit-mask: radial-gradient(circle, transparent 58%, black 62%);
}

@keyframes orbit-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Teaser Active State */
.teaser-pill.teaser-active {
  opacity: 1 !important;
  transform: translateY(-50%) translateX(0) !important;
  pointer-events: auto !important;
}

@media (max-width: 639px) {
  .floating-globe-trigger {
    right: 1.5rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cosmic-ripple-1,
  .cosmic-ripple-2,
  .orbit-glow-ring {
    animation: none !important;
  }
}
</style>
