<template>
  <Transition name="telemetry-fade">
    <div
      v-if="isTransitioning"
      class="showcase-transition-overlay absolute inset-0 z-40 flex flex-col items-center justify-between p-6 sm:p-10 bg-[#010206]/92 backdrop-blur-2xl select-none text-zinc-100 pointer-events-auto overflow-hidden"
      role="status"
      aria-live="polite"
      :aria-busy="transitionPhase !== 'ready' && transitionPhase !== 'error'"
    >
      <!-- Deep Cosmic Vignette & Subtle Coordinate Grid -->
      <div class="pointer-events-none absolute inset-0 cosmic-ambient-glow" aria-hidden="true"></div>
      <div class="pointer-events-none absolute inset-0 opacity-[0.04] telemetry-grid" aria-hidden="true"></div>

      <!-- Sparse Background Starfield (Lightweight SVG particles) -->
      <svg class="pointer-events-none absolute inset-0 w-full h-full opacity-35" aria-hidden="true">
        <circle cx="12%" cy="18%" r="1" fill="#38bdf8" />
        <circle cx="28%" cy="72%" r="1.2" fill="#ffffff" />
        <circle cx="45%" cy="25%" r="0.8" fill="#818cf8" />
        <circle cx="68%" cy="14%" r="1" fill="#ffffff" />
        <circle cx="82%" cy="65%" r="1.4" fill="#38bdf8" />
        <circle cx="91%" cy="33%" r="0.8" fill="#ffffff" />
        <circle cx="15%" cy="84%" r="1" fill="#06b6d4" />
        <circle cx="58%" cy="80%" r="0.8" fill="#ffffff" />
      </svg>

      <!-- 1. Top Metadata Header -->
      <div class="relative z-10 w-full flex items-center justify-between font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-zinc-400">
        <div class="flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: loadingMeta.accentColor, boxShadow: `0 0 8px ${loadingMeta.accentColor}` }"></span>
          <span class="text-zinc-200 font-semibold">PORTFOLIO SYSTEM // NAVIGATION</span>
        </div>

        <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
          <span class="text-zinc-500">SECTOR</span>
          <span class="font-bold text-white tracking-wider">{{ loadingMeta.code }}</span>
        </div>
      </div>

      <!-- 2. Central Visual & Telemetry Readout -->
      <div class="relative z-10 flex flex-col items-center justify-center my-auto max-w-sm sm:max-w-md w-full text-center space-y-6">
        <!-- Error State Layout -->
        <template v-if="transitionPhase === 'error'">
          <div class="w-16 h-16 rounded-full border border-red-500/40 bg-red-950/20 flex items-center justify-center text-red-400 font-mono text-xl shadow-[0_0_24px_rgba(239,68,68,0.25)]">
            !
          </div>

          <div class="space-y-1.5">
            <h2 class="font-mono text-sm sm:text-base font-bold uppercase tracking-wider text-red-400">
              NAVIGATION TIMEOUT // SECTOR UNRESPONSIVE
            </h2>
            <p class="font-mono text-[11px] text-zinc-400 max-w-xs mx-auto leading-relaxed">
              {{ transitionErrorMessage || 'Scene initialization timed out on this device. WebGL resources may be strained.' }}
            </p>
          </div>

          <div class="flex items-center gap-3 pt-2">
            <button
              type="button"
              class="px-4 py-2 rounded-xl border border-sky-400/50 bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 font-mono text-[10.5px] uppercase tracking-wider font-semibold transition active:scale-95 cursor-pointer shadow-lg"
              @click="handleRetry"
            >
              <span>RETRY INITIALIZATION ↺</span>
            </button>
            <button
              type="button"
              class="px-4 py-2 rounded-xl border border-white/15 bg-black/50 hover:bg-white/10 text-zinc-300 font-mono text-[10.5px] uppercase tracking-wider transition active:scale-95 cursor-pointer"
              @click="closeShowcase"
            >
              <span>EXIT</span>
            </button>
          </div>
        </template>

        <!-- Normal Mission Control Initialization Layout -->
        <template v-else>
          <!-- Aerospace Mission Control Telemetry Reticle -->
          <div class="relative w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center">
            <!-- Outer Fixed Compass Ring -->
            <div
              class="absolute inset-0 rounded-full border border-white/10"
              :style="{ borderColor: `${loadingMeta.accentColor}25` }"
            ></div>

            <!-- Rotating Coordinate Ring with Tick Marks -->
            <div
              class="telemetry-rotating-ring absolute inset-1.5 rounded-full border border-dashed border-white/20"
              :style="{ borderColor: `${loadingMeta.accentColor}40` }"
            ></div>

            <!-- Counter-rotating Inner Orbit -->
            <div
              class="telemetry-counter-ring absolute inset-5 rounded-full border border-dotted border-white/15"
            ></div>

            <!-- Precision Crosshairs -->
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span class="w-full h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent"></span>
            </div>
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span class="h-full w-[1px] bg-gradient-to-b from-transparent via-white/15 to-transparent"></span>
            </div>

            <!-- Orbiting Satellite Node -->
            <div class="telemetry-satellite-track absolute inset-2 rounded-full pointer-events-none">
              <span
                class="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
                :style="{
                  backgroundColor: loadingMeta.accentColor,
                  boxShadow: `0 0 10px ${loadingMeta.accentColor}`
                }"
              ></span>
            </div>

            <!-- Central Navigational Glowing Core Point -->
            <div class="relative flex items-center justify-center">
              <span
                class="w-4 h-4 rounded-full transition-transform duration-300"
                :style="{
                  backgroundColor: loadingMeta.accentColor,
                  boxShadow: `0 0 20px ${loadingMeta.accentColor}, 0 0 40px ${loadingMeta.accentColor}60`
                }"
              ></span>
              <span class="absolute w-7 h-7 rounded-full border border-white/30 animate-ping opacity-60"></span>
            </div>

            <!-- Corner Technical Brackets -->
            <span class="absolute -top-1 -left-1 font-mono text-[9px] text-zinc-600">┌</span>
            <span class="absolute -top-1 -right-1 font-mono text-[9px] text-zinc-600">┐</span>
            <span class="absolute -bottom-1 -left-1 font-mono text-[9px] text-zinc-600">└</span>
            <span class="absolute -bottom-1 -right-1 font-mono text-[9px] text-zinc-600">┘</span>
          </div>

          <!-- Section Identity & Destination Labels -->
          <div class="space-y-1.5 px-4">
            <h2 class="font-mono text-sm sm:text-base font-bold uppercase tracking-[0.18em] text-white">
              {{ loadingMeta.title }}
            </h2>
            <p class="font-mono text-[10.5px] sm:text-[11px] text-zinc-400 max-w-xs mx-auto leading-relaxed">
              {{ loadingMeta.subtitle }}
            </p>
          </div>

          <!-- Progress Indicator: Sleek Scanning Bar & Phase Text -->
          <div class="w-full flex flex-col items-center gap-2 pt-1">
            <div class="w-48 sm:w-56 h-[2px] bg-white/10 rounded-full overflow-hidden relative">
              <div
                class="h-full w-24 rounded-full scanning-beam"
                :style="{
                  background: `linear-gradient(90deg, transparent 0%, ${loadingMeta.accentColor} 50%, transparent 100%)`,
                  boxShadow: `0 0 12px ${loadingMeta.accentColor}`
                }"
              ></div>
            </div>

            <!-- Meaningful Real Phase State (No arbitrary percentages) -->
            <span class="font-mono text-[9.5px] uppercase tracking-widest text-zinc-400">
              {{ currentPhaseMessage }}
            </span>
          </div>
        </template>
      </div>

      <!-- 3. Bottom Status Bar -->
      <div class="relative z-10 w-full flex items-center justify-between font-mono text-[8.5px] sm:text-[9.5px] text-zinc-500 uppercase tracking-wider border-t border-white/5 pt-3">
        <span class="flex items-center gap-1.5 text-zinc-400">
          <span class="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{{ loadingMeta.status }}</span>
        </span>
        <span class="hidden sm:inline-block text-zinc-500">
          TELEMETRY // LATENCY &lt; 16MS
        </span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  isTransitioning,
  transitionPhase,
  transitionErrorMessage,
  currentLoadingIdentity,
  currentPhaseMessage,
  targetSection,
  startSectionTransition,
} from '@/composables/useShowcaseTransition'
import { closeShowcase, setSection } from '@/composables/useShowcase'

const loadingMeta = computed(() => currentLoadingIdentity.value)

function handleRetry() {
  setSection(targetSection.value, true)
}
</script>

<style scoped>
.cosmic-ambient-glow {
  background: radial-gradient(
    circle at 50% 50%,
    rgba(14, 165, 233, 0.08) 0%,
    rgba(2, 6, 23, 0.4) 45%,
    rgba(1, 2, 6, 0.98) 80%
  );
}

.telemetry-grid {
  background-image:
    linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px);
  background-size: 40px 40px;
}

/* Telemetry Reticle Rotations */
.telemetry-rotating-ring {
  animation: telemetry-spin 16s linear infinite;
}

.telemetry-counter-ring {
  animation: telemetry-spin-reverse 24s linear infinite;
}

.telemetry-satellite-track {
  animation: telemetry-spin 4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
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

/* Linear Scanning Beam Animation */
.scanning-beam {
  animation: scanning-sweep 1.8s ease-in-out infinite alternate;
}

@keyframes scanning-sweep {
  0% {
    transform: translateX(-40px);
  }
  100% {
    transform: translateX(180px);
  }
}

/* Smooth Fade Transitions */
.telemetry-fade-enter-active {
  transition: opacity 250ms ease-out;
}

.telemetry-fade-leave-active {
  transition: opacity 280ms cubic-bezier(0.4, 0, 0.2, 1);
}

.telemetry-fade-enter-from,
.telemetry-fade-leave-to {
  opacity: 0;
}

/* Reduced Motion Mode */
@media (prefers-reduced-motion: reduce) {
  .telemetry-rotating-ring,
  .telemetry-counter-ring,
  .telemetry-satellite-track,
  .scanning-beam {
    animation: none !important;
  }
  .telemetry-fade-enter-active,
  .telemetry-fade-leave-active {
    transition: opacity 120ms ease !important;
  }
}
</style>

