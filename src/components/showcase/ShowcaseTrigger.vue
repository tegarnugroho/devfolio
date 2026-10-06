<template>
  <div
    class="showcase-trigger fixed right-6 top-1/2 -translate-y-1/2 z-40 flex items-center justify-center pointer-events-auto"
  >
    <div v-reveal="{ delay: 360, kind: 'accent' }" class="relative flex items-center">
      <!-- 1. Ambient Cosmic Ripple Waves -->
      <span class="cosmic-ripple-1 absolute -inset-2 rounded-full border border-blue-500/30 dark:border-blue-400/40 pointer-events-none"></span>
      <span class="cosmic-ripple-2 absolute -inset-3.5 rounded-full border border-cyan-400/20 dark:border-cyan-300/30 pointer-events-none"></span>

      <!-- 2. Circular Interactive Trigger Button -->
      <button
        type="button"
        @click="handleClick"
        @mouseenter="onHover"
        :aria-label="`${sectionMeta.actionLabel} - 3D ${sectionMeta.label} Showcase`"
        class="group relative h-11 w-11 grid place-items-center rounded-full border border-blue-500/30 dark:border-blue-400/35 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md hover:bg-white dark:hover:bg-black active:scale-95 hover:scale-110 transition-all duration-300 shadow-[0_8px_20px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.6)] hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-[0_0_24px_rgba(59,130,246,0.45)] cursor-pointer"
      >
        <!-- Rotating Holographic Orbit Ring -->
        <span class="orbit-glow-ring absolute -inset-[2px] rounded-full pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-300"></span>

        <!-- Dynamic Icon based on Active Section -->
        <div class="relative z-10 w-6 h-6 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
          <!-- Projects: Mini 3D Rotating Canvas Globe -->
          <MiniGlobeWidget v-if="activeSection === 'projects'" class="w-6 h-6 shrink-0" />

          <!-- Hero: Orbital Observatory Icon -->
          <svg v-else-if="activeSection === 'hero'" class="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
            <circle cx="12" cy="12" r="3" fill="currentColor" fill-opacity="0.3" />
            <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(-30 12 12)" />
            <circle cx="19" cy="8" r="1.5" fill="currentColor" />
          </svg>

          <!-- About: Journey Timeline Icon -->
          <svg v-else-if="activeSection === 'about'" class="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
            <path d="M4 12h3l3-6 4 12 3-6h3" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="10" cy="6" r="1.5" fill="currentColor" />
            <circle cx="14" cy="18" r="1.5" fill="currentColor" />
          </svg>

          <!-- Skills: Tech Constellation Icon -->
          <svg v-else-if="activeSection === 'skills'" class="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
            <circle cx="12" cy="12" r="2.5" fill="currentColor" />
            <circle cx="6" cy="7" r="1.5" fill="currentColor" />
            <circle cx="18" cy="7" r="1.5" fill="currentColor" />
            <circle cx="8" cy="18" r="1.5" fill="currentColor" />
            <circle cx="16" cy="18" r="1.5" fill="currentColor" />
            <line x1="12" y1="12" x2="6" y2="7" stroke-opacity="0.6" />
            <line x1="12" y1="12" x2="18" y2="7" stroke-opacity="0.6" />
            <line x1="12" y1="12" x2="8" y2="18" stroke-opacity="0.6" />
            <line x1="12" y1="12" x2="16" y2="18" stroke-opacity="0.6" />
          </svg>

          <!-- Writing: Digital Archive Icon -->
          <svg v-else-if="activeSection === 'writing'" class="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
            <path d="M4 6h16M4 12h16M4 18h10" stroke-linecap="round" />
            <circle cx="18" cy="18" r="2" fill="currentColor" fill-opacity="0.4" />
          </svg>

          <!-- Contact: Satellite Uplink Icon -->
          <svg v-else-if="activeSection === 'contact'" class="w-5 h-5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
            <path d="M4.93 4.93a10 10 0 0 1 14.14 0" stroke-linecap="round" />
            <path d="M7.76 7.76a6 6 0 0 1 8.48 0" stroke-linecap="round" />
            <circle cx="12" cy="12" r="2" fill="currentColor" />
            <line x1="12" y1="14" x2="12" y2="21" stroke-linecap="round" />
          </svg>
        </div>

        <!-- Live Pulse Indicator Dot -->
        <span class="absolute top-1 right-1 flex h-2 w-2 z-20 pointer-events-none">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
        </span>

        <!-- 3. Dynamic Section-Aware Teaser Pill & Tooltip -->
        <div
          class="teaser-pill absolute right-full mr-3.5 top-1/2 -translate-y-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-950/92 dark:bg-black/95 text-white border border-blue-400/40 backdrop-blur-xl shadow-[0_12px_28px_rgba(0,0,0,0.5)] transition-all duration-300 whitespace-nowrap opacity-0 translate-x-3 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto group-focus-visible:opacity-100 group-focus-visible:translate-x-0"
          :class="{ 'teaser-active': isTeasing }"
        >
          <!-- Glowing pulse status beacon -->
          <span class="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_#38bdf8] animate-pulse"></span>

          <!-- Dynamic Action Label for current section -->
          <span class="font-mono text-[10.5px] font-bold tracking-wider uppercase text-blue-400 flex items-center gap-1">
            <span>{{ sectionMeta.actionLabel }}</span>
          </span>

          <span class="font-mono text-[9px] uppercase tracking-wider text-zinc-400 border-l border-white/20 pl-2">
            {{ sectionMeta.label }}
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { openShowcase } from '@/composables/useShowcase'
import { activePageShowcaseSection, getSectionMeta } from '@/composables/useShowcaseNavigation'
import MiniGlobeWidget from '@/components/globe/MiniGlobeWidget.vue'

const activeSection = computed(() => activePageShowcaseSection.value)
const sectionMeta = computed(() => getSectionMeta(activeSection.value))

const isTeasing = ref(false)
let teaseTimer: ReturnType<typeof setTimeout> | null = null
let dismissTimer: ReturnType<typeof setTimeout> | null = null

function handleClick() {
  isTeasing.value = false
  if (teaseTimer) clearTimeout(teaseTimer)
  if (dismissTimer) clearTimeout(dismissTimer)
  openShowcase(activeSection.value)
}

function onHover() {
  isTeasing.value = false
}

onMounted(() => {
  const hasTeased = sessionStorage.getItem('devfolio_showcase_teased')
  if (!hasTeased) {
    teaseTimer = setTimeout(() => {
      isTeasing.value = true
      sessionStorage.setItem('devfolio_showcase_teased', 'true')
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
  .showcase-trigger {
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

