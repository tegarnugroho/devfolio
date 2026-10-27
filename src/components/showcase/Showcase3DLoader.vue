<template>
  <div
    class="showcase-mission-loader absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-[#010206]/85 backdrop-blur-md select-none text-zinc-100 pointer-events-none"
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
    <div class="flex flex-col items-center justify-center max-w-sm text-center space-y-4">
      <!-- Aerospace Mission Control Telemetry Reticle -->
      <div class="relative w-28 h-28 flex items-center justify-center">
        <div class="absolute inset-0 rounded-full border border-sky-400/25"></div>
        <div class="telemetry-rotating-ring absolute inset-1.5 rounded-full border border-dashed border-sky-400/40"></div>
        <div class="telemetry-counter-ring absolute inset-4 rounded-full border border-dotted border-white/20"></div>

        <!-- Central Navigational Glowing Core Point -->
        <span
          class="w-3.5 h-3.5 rounded-full bg-sky-400 shadow-[0_0_16px_#38bdf8,0_0_32px_rgba(56,189,248,0.5)]"
        ></span>
      </div>

      <div class="space-y-1">
        <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-sky-400/20 bg-sky-950/30 font-mono text-[9px] text-sky-300 uppercase tracking-widest">
          <span class="w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_6px_#38bdf8] animate-pulse"></span>
          <span>{{ badgeText || 'STREAMING DATA API' }}</span>
        </div>
        <h3 class="font-mono text-sm font-bold uppercase tracking-wider text-white">
          {{ title || 'INITIALIZING ARCHIVE DISPATCH' }}
        </h3>
        <p class="font-mono text-[10.5px] text-zinc-400">
          {{ subtitle || 'SYNCHRONIZING KNOWLEDGE METADATA' }}
        </p>
      </div>

      <!-- Linear Scanning Progress -->
      <div class="w-44 h-[2px] bg-white/10 rounded-full overflow-hidden relative">
        <div class="h-full w-20 rounded-full bg-gradient-to-r from-transparent via-sky-400 to-transparent shadow-[0_0_10px_#38bdf8] scanning-beam"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  subtitle?: string
  badgeText?: string
}

withDefaults(defineProps<Props>(), {
  title: 'INITIALIZING ARCHIVE DISPATCH',
  subtitle: 'SYNCHRONIZING KNOWLEDGE METADATA',
  badgeText: 'STREAMING DATA API',
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
