<template>
  <div class="projects-globe-scene relative w-full h-full select-none overflow-hidden">
    <!-- Deep Space Cosmic Ambient Glow -->
    <div
      class="pointer-events-none absolute inset-0 transition-opacity duration-500"
      :class="globeMode === 'tech' ? 'showcase-glow-dark' : 'showcase-glow-light'"
      aria-hidden="true"
    ></div>

    <!-- Technical Coordinate Grid (Tech Globe Blueprint Mode) -->
    <div
      v-if="globeMode === 'tech'"
      class="pointer-events-none absolute inset-0 opacity-[0.035] showcase-grid-dark"
      aria-hidden="true"
    ></div>

    <!-- 3D Globe Stage -->
    <div class="absolute inset-0 z-0 flex items-center justify-center">
      <GlobeScene
        :active-id="activeMarker.id"
        :is-zoomed="isSatelliteZoomed"
        :active-cluster-id="activeClusterId"
        :fallback-text="globeFallbackText"
        :globe-mode="globeMode"
        @select="onSelectMarker"
        @zoom-cluster="onZoomCluster"
        @zoom-out="onZoomOut"
      />
    </div>

    <!-- HUD Sub-controls: Mode Switcher & Cluster Zoom Out -->
    <div class="absolute top-[max(4.25rem,calc(env(safe-area-inset-top)+3.5rem))] sm:top-24 left-4 sm:left-8 z-10 flex items-center gap-2 pointer-events-auto">
      <!-- Satellite Zoom Out Button -->
      <Transition name="fade">
        <button
          v-if="isSatelliteZoomed"
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-400/40 bg-blue-500/20 hover:bg-blue-500/30 active:scale-95 text-blue-300 hover:text-white transition-all duration-200 cursor-pointer font-mono text-[11px] uppercase tracking-wider focus:outline-none shadow-sm backdrop-blur-md"
          @click="onZoomOut"
          title="Return to full global view"
        >
          <span>‹</span>
          <span>GLOBAL VIEW</span>
        </button>
      </Transition>

      <!-- Globe Visual Mode Switcher -->
      <div class="inline-flex items-center rounded-full border border-white/15 bg-black/60 p-0.5 backdrop-blur-md shadow-sm">
        <button
          type="button"
          class="flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[10px] uppercase tracking-wider transition-all duration-200 cursor-pointer"
          :class="globeMode === 'real'
            ? 'bg-blue-500/30 border border-blue-400/70 text-white font-semibold shadow-sm'
            : 'text-zinc-400 hover:text-white border border-transparent'"
          @click="globeMode = 'real'"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-blue-400" v-if="globeMode === 'real'"></span>
          <span>REAL EARTH</span>
        </button>
        <button
          type="button"
          class="flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[10px] uppercase tracking-wider transition-all duration-200 cursor-pointer"
          :class="globeMode === 'tech'
            ? 'bg-emerald-500/25 border border-emerald-400/70 text-white font-semibold shadow-sm'
            : 'text-zinc-400 hover:text-white border border-transparent'"
          @click="globeMode = 'tech'"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400" v-if="globeMode === 'tech'"></span>
          <span>TECH GLOBE</span>
        </button>
      </div>
    </div>

    <!-- Active Project Details Card (Bottom Overlay) -->
    <div
      v-if="activeMarker"
      class="absolute bottom-[max(4.5rem,calc(env(safe-area-inset-bottom)+3.5rem))] sm:bottom-8 left-4 right-4 sm:left-8 sm:right-auto z-10 max-w-sm sm:max-w-md pointer-events-auto"
    >
      <div class="p-4 sm:p-5 rounded-2xl border border-white/15 bg-black/80 backdrop-blur-xl shadow-2xl space-y-3">
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-2.5 min-w-0">
            <img
              v-if="activeMarker.image"
              :src="activeMarker.image"
              alt=""
              class="w-8 h-8 rounded-lg object-cover border border-white/20 shrink-0"
            />
            <div class="min-w-0">
              <span class="font-mono text-[9px] uppercase tracking-widest text-blue-400">
                {{ activeMarker.clusterName }}
              </span>
              <h3 class="text-sm font-bold text-white tracking-tight truncate">
                {{ activeMarker.title }}
              </h3>
            </div>
          </div>

          <div class="flex items-center gap-1 shrink-0">
            <button
              type="button"
              class="w-7 h-7 rounded-full border border-white/15 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-white/10 active:scale-95 transition cursor-pointer text-xs"
              @click="prevProject"
              title="Previous project (←)"
            >
              ‹
            </button>
            <button
              type="button"
              class="w-7 h-7 rounded-full border border-white/15 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-white/10 active:scale-95 transition cursor-pointer text-xs"
              @click="nextProject"
              title="Next project (→)"
            >
              ›
            </button>
          </div>
        </div>

        <p class="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
          {{ activeMarker.description }}
        </p>

        <!-- Tech tags -->
        <div class="flex flex-wrap gap-1.5 pt-1">
          <span
            v-for="tag in activeMarker.tech.slice(0, 4)"
            :key="tag"
            class="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-mono text-zinc-300"
          >
            {{ tag }}
          </span>
        </div>

        <!-- Action Links -->
        <div class="flex items-center justify-between pt-2 border-t border-white/10">
          <span class="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
            {{ activeMarkerIndex + 1 }} / {{ globeMarkers.length }}
          </span>
          <div class="flex items-center gap-2">
            <a
              v-if="activeMarker.link && activeMarker.link !== '#'"
              :href="activeMarker.link"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500 hover:bg-blue-400 text-white font-mono text-[10px] uppercase tracking-wider font-semibold transition cursor-pointer"
            >
              <span>VISIT</span>
              <span>↗</span>
            </a>
            <a
              v-if="activeMarker.repo && activeMarker.repo !== '#'"
              :href="activeMarker.repo"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white font-mono text-[10px] uppercase tracking-wider transition cursor-pointer"
            >
              <span>CODE</span>
              <span>↗</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import GlobeScene from '@/components/globe/GlobeScene.vue'
import {
  activeMarker,
  activeClusterId,
  isSatelliteZoomed,
  activeMarkerIndex,
  zoomInToCluster,
  zoomOutToGlobal,
  nextProject,
  prevProject,
  setActiveProjectId,
  registerContentNavigator,
} from '@/composables/useShowcase'
import { globeMarkers } from '@/components/globe/globeData'
import { portfolioContent } from '@/content/portfolioContent'

const globeMode = ref<'real' | 'tech'>('real')
const globeFallbackText = portfolioContent.globe.fallbackNotice
let unregisterNav: (() => void) | null = null

function onSelectMarker(id: string) {
  setActiveProjectId(id)
}

function onZoomCluster(clusterId: string) {
  zoomInToCluster(clusterId)
}

function onZoomOut() {
  zoomOutToGlobal()
}

onMounted(() => {
  unregisterNav = registerContentNavigator((dir) => {
    if (dir === 'next') nextProject()
    else prevProject()
  })
})

onBeforeUnmount(() => {
  unregisterNav?.()
})
</script>

<style scoped>
.showcase-glow-light {
  background: radial-gradient(circle at 50% 50%, rgba(20, 35, 65, 0.45) 0%, rgba(1, 2, 6, 0.95) 70%, #010206 100%);
}

.showcase-glow-dark {
  background: radial-gradient(circle at 50% 50%, rgba(10, 25, 45, 0.4) 0%, rgba(1, 2, 6, 0.95) 75%, #010206 100%);
}

.showcase-grid-dark {
  background-image:
    linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px);
  background-size: 48px 48px;
}
</style>
