<template>
  <div class="showcase-loading absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none select-none">
    <div class="flex flex-col items-center gap-3 text-center px-4">
      <!-- Minimalist Technical Pulse Indicator -->
      <div class="relative flex items-center justify-center w-12 h-12">
        <span class="absolute inset-0 rounded-full border border-blue-400/40 animate-ping opacity-60"></span>
        <span class="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_12px_#38bdf8]"></span>
      </div>

      <div class="space-y-1">
        <p class="font-mono text-xs uppercase tracking-[0.25em] text-zinc-300">
          INITIALIZING EXPERIENCE
        </p>
        <p class="font-mono text-[10px] tracking-widest text-zinc-500">
          COMPUTING 3D ASSETS · {{ sectionNumber }}
        </p>
      </div>

      <!-- Subtle Progress Bar Line -->
      <div class="w-36 h-[2px] bg-white/10 rounded-full overflow-hidden mt-2">
        <div class="h-full bg-blue-400/80 rounded-full loading-line"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { currentSection } from '@/composables/useShowcase'
import { getSectionMeta } from '@/composables/useShowcaseNavigation'

const sectionNumber = computed(() => getSectionMeta(currentSection.value).number)
</script>

<style scoped>
.loading-line {
  animation: loading-slide 1.4s ease-in-out infinite;
  width: 40%;
}

@keyframes loading-slide {
  0% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(180%);
  }
  100% {
    transform: translateX(350%);
  }
}
</style>

