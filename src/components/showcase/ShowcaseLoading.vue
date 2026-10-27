<template>
  <div
    class="showcase-async-loading absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-[#010206] select-none text-zinc-100"
    role="status"
    aria-live="polite"
  >
    <!-- Central Telemetry Spinner & Destination Identity -->
    <div class="flex flex-col items-center justify-center max-w-sm text-center space-y-5">
      <!-- Aerospace Mission Control Telemetry Reticle -->
      <div class="relative w-28 h-28 flex items-center justify-center">
        <div
          class="absolute inset-0 rounded-full border border-white/10"
          :style="{ borderColor: `${loadingMeta.accentColor}30` }"
        ></div>
        <div
          class="telemetry-rotating-ring absolute inset-1.5 rounded-full border border-dashed"
          :style="{ borderColor: `${loadingMeta.accentColor}50` }"
        ></div>
        <div
          class="telemetry-counter-ring absolute inset-4 rounded-full border border-dotted border-white/20"
        ></div>

        <!-- Central Navigational Glowing Core Point -->
        <span
          class="w-3.5 h-3.5 rounded-full"
          :style="{
            backgroundColor: loadingMeta.accentColor,
            boxShadow: `0 0 16px ${loadingMeta.accentColor}, 0 0 32px ${loadingMeta.accentColor}60`
          }"
        ></span>
      </div>

      <div class="space-y-1">
        <div class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-white/10 bg-white/5 font-mono text-[9px] text-zinc-400 uppercase tracking-widest">
          <span class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: loadingMeta.accentColor }"></span>
          <span>SECTOR {{ loadingMeta.code }}</span>
        </div>
        <h3 class="font-mono text-sm font-bold uppercase tracking-wider text-white">
          {{ loadingMeta.title }}
        </h3>
        <p class="font-mono text-[10.5px] text-zinc-400">
          {{ loadingMeta.subtitle }}
        </p>
      </div>

      <!-- Linear Scanning Progress -->
      <div class="w-44 h-[2px] bg-white/10 rounded-full overflow-hidden relative">
        <div
          class="h-full w-20 rounded-full scanning-beam"
          :style="{
            background: `linear-gradient(90deg, transparent 0%, ${loadingMeta.accentColor} 50%, transparent 100%)`,
            boxShadow: `0 0 10px ${loadingMeta.accentColor}`
          }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { currentSection } from '@/composables/useShowcase'
import { SECTION_LOADING_IDENTITIES } from '@/composables/useShowcaseTransition'

const loadingMeta = computed(() => {
  return SECTION_LOADING_IDENTITIES[currentSection.value] || SECTION_LOADING_IDENTITIES.projects
})
</script>

<style scoped>
.telemetry-rotating-ring {
  animation: telemetry-spin 14s linear infinite;
}

.telemetry-counter-ring {
  animation: telemetry-spin-reverse 20s linear infinite;
}

@keyframes telemetry-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes telemetry-spin-reverse {
  from {
    transform: rotate(360deg);
  }
  to {
    transform: rotate(0deg);
  }
}

.scanning-beam {
  animation: scanning-sweep 1.8s ease-in-out infinite alternate;
}

@keyframes scanning-sweep {
  0% {
    transform: translateX(-30px);
  }
  100% {
    transform: translateX(140px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .telemetry-rotating-ring,
  .telemetry-counter-ring,
  .scanning-beam {
    animation: none !important;
  }
}
</style>
