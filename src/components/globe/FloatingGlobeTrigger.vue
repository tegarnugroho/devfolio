<template>
  <div
    class="floating-globe-trigger fixed right-6 top-1/2 -translate-y-1/2 z-40 flex items-center justify-center pointer-events-auto"
  >
    <div v-reveal="{ delay: 360, kind: 'accent' }">
      <!-- Circular Trigger Button matching navigation button style -->
      <button
        type="button"
        @click="openShowcase()"
        :aria-label="portfolioContent.projects.showcaseButtonLabel ?? '3D Project Showcase'"
        class="group relative h-11 w-11 grid place-items-center rounded-full border border-black/20 dark:border-white/20 bg-white/70 dark:bg-black/70 backdrop-blur hover:bg-white/90 dark:hover:bg-black/90 active:scale-95 transition shadow-sm hover:shadow-md cursor-pointer hover:border-blue-500/50 dark:hover:border-blue-400/50"
      >
        <!-- Mini 3D Rotating Globe Widget -->
        <MiniGlobeWidget class="w-6 h-6 shrink-0" />

        <!-- Subtle Live Pulse Beacon Dot -->
        <span class="absolute top-1 right-1 flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-60"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
        </span>

        <!-- Tooltip / Label on Hover & Focus -->
        <div
          class="pointer-events-none absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-full bg-black/90 dark:bg-zinc-900/95 text-white border border-white/15 backdrop-blur-md shadow-xl opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0 transition-all duration-200 whitespace-nowrap flex items-center gap-1.5 font-mono text-[10px] tracking-wider uppercase font-semibold"
          aria-hidden="true"
        >
          <span class="text-blue-400">3D</span>
          <span>SHOWCASE</span>
          <span class="text-zinc-400">→</span>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { portfolioContent } from '@/content/portfolioContent'
import MiniGlobeWidget from './MiniGlobeWidget.vue'
import { openShowcase } from '@/composables/useShowcase'
</script>

<style scoped>
@media (max-width: 639px) {
  .floating-globe-trigger {
    right: 1.5rem;
  }
}
</style>
