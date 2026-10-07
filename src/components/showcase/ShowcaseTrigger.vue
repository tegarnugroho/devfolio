<template>
  <div
    class="showcase-trigger fixed right-6 top-1/2 -translate-y-1/2 z-40 flex items-center justify-center pointer-events-auto select-none"
  >
    <div v-reveal="{ delay: 360, kind: 'accent' }" class="relative flex items-center justify-center">
      <!-- 1. Ambient Siri Waveform Pulses (Subtle localized atmosphere) -->
      <span class="siri-glow-pulse absolute -inset-2 rounded-full pointer-events-none"></span>

      <!-- 2. Siri-Inspired 3D Glass Orb Button -->
      <button
        type="button"
        @click="handleClick"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
        :aria-label="`${sectionMeta.actionLabel} - 3D ${sectionMeta.label} Showcase`"
        class="group relative h-11 w-11 grid place-items-center rounded-full p-0 bg-transparent border-0 cursor-pointer transition-transform duration-300 focus:outline-none"
      >
        <!-- 3D Siri Glass Orb Canvas -->
        <div class="relative z-10 w-full h-full flex items-center justify-center">
          <TechnologyOrb
            :is-hovered="isHovering"
            :is-clicking="isClicking"
            class="w-full h-full"
          />
        </div>

        <!-- 3. Dynamic Section-Aware Teaser Pill -->
        <div
          class="teaser-pill absolute right-full mr-3.5 top-1/2 -translate-y-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-950/95 text-white border border-white/15 backdrop-blur-xl shadow-[0_12px_28px_rgba(0,0,0,0.7)] transition-all duration-300 whitespace-nowrap opacity-0 translate-x-3 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto group-focus-visible:opacity-100 group-focus-visible:translate-x-0"
          :class="{ 'teaser-active': isTeasing }"
        >
          <!-- Glowing pulse status beacon -->
          <span class="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.85)] animate-pulse"></span>

          <!-- Dynamic Action Label for current section -->
          <span class="font-mono text-[10.5px] font-bold tracking-wider uppercase text-zinc-100 flex items-center gap-1">
            <span>{{ sectionMeta.actionLabel }}</span>
          </span>

          <span class="font-mono text-[9px] uppercase tracking-wider text-zinc-400 border-l border-white/20 pl-2">
            {{ sectionMeta.label }}
          </span>

          <span class="text-zinc-400 group-hover:text-white font-mono text-[11px] group-hover:translate-x-0.5 transition-all" aria-hidden="true">
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
import { activePageShowcaseSection, getSectionMeta, detectCurrentPageSection, isValidShowcaseSection } from '@/composables/useShowcaseNavigation'
import { activeScrollSection } from '@/composables/useScrollHash'
import TechnologyOrb from './TechnologyOrb.vue'

const activeSection = computed(() => activePageShowcaseSection.value)
const sectionMeta = computed(() => getSectionMeta(activeSection.value))

const isHovering = ref(false)
const isClicking = ref(false)
const isTeasing = ref(false)

let teaseTimer: ReturnType<typeof setTimeout> | null = null
let dismissTimer: ReturnType<typeof setTimeout> | null = null
let clickTimer: ReturnType<typeof setTimeout> | null = null

function handleClick() {
  isTeasing.value = false
  if (teaseTimer) clearTimeout(teaseTimer)
  if (dismissTimer) clearTimeout(dismissTimer)

  // Spring compression/expansion burst
  isClicking.value = true
  if (clickTimer) clearTimeout(clickTimer)
  clickTimer = setTimeout(() => {
    isClicking.value = false
  }, 260)

  const target = detectCurrentPageSection()
  if (isValidShowcaseSection(target)) {
    activeScrollSection.value = target
  }
  openShowcase(target)
}

function onMouseEnter() {
  const target = detectCurrentPageSection()
  if (isValidShowcaseSection(target)) {
    activeScrollSection.value = target
  }
  isHovering.value = true
  isTeasing.value = false
}

function onMouseLeave() {
  isHovering.value = false
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
  if (clickTimer) clearTimeout(clickTimer)
})
</script>

<style scoped>
.siri-glow-pulse {
  background: radial-gradient(circle, rgba(255, 255, 255, 0.12) 0%, rgba(200, 220, 255, 0.04) 45%, transparent 70%);
  filter: blur(8px);
  animation: siri-ambient 4s ease-in-out infinite alternate;
}

@keyframes siri-ambient {
  0% {
    transform: scale(0.9);
    opacity: 0.5;
  }
  100% {
    transform: scale(1.15);
    opacity: 0.9;
  }
}

.teaser-active {
  opacity: 1 !important;
  transform: translateX(0) !important;
  pointer-events: auto !important;
}
</style>
