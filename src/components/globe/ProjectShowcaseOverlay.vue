<template>
  <Teleport to="body">
    <Transition name="showcase-entrance">
      <div
        v-if="isShowcaseOpen"
        class="project-showcase-overlay fixed inset-0 z-[100] flex flex-col justify-between overflow-hidden select-none bg-[#010206] text-zinc-100 transition-colors duration-300"
        role="dialog"
        aria-modal="true"
        aria-label="3D Project Showcase"
        @keydown.esc="handleKeyEsc"
        @keydown.left="handlePrev"
        @keydown.right="handleNext"
        tabindex="-1"
        ref="overlayRef"
      >
        <!-- Deep Space Cosmic Ambient Glow Behind Globe -->
        <div
          class="pointer-events-none absolute inset-0 transition-opacity duration-500"
          :class="globeMode === 'tech' ? 'showcase-glow-dark' : 'showcase-glow-light'"
          aria-hidden="true"
        ></div>

        <!-- Technical Coordinate Grid (Only in Tech Globe Blueprint Mode) -->
        <div
          v-if="globeMode === 'tech'"
          class="pointer-events-none absolute inset-0 opacity-[0.035] showcase-grid-dark"
          aria-hidden="true"
        ></div>

        <!-- 3D Globe Viewport (Full Viewport Centerpiece) -->
        <div class="absolute inset-0 z-0 flex items-center justify-center showcase-globe-stage">
          <GlobeScene
            :active-id="activeMarker.id"
            :is-zoomed="isSatelliteZoomed"
            :active-cluster-id="activeClusterId"
            :fallback-text="content.fallbackNotice"
            :globe-mode="globeMode"
            @select="onSelectMarker"
            @zoom-cluster="onZoomCluster"
            @zoom-out="onZoomOut"
          />
        </div>

        <!-- Top Header Navigation Bar -->
        <header class="relative z-10 w-full px-5 py-5 sm:px-8 sm:py-6 flex items-center justify-between pointer-events-none">
          <div class="flex items-center gap-2.5 pointer-events-auto">
            <!-- Exit Showcase Button -->
            <button
              type="button"
              class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/15 bg-black/50 hover:bg-white/10 hover:border-white/30 active:scale-95 text-zinc-200 hover:text-white transition-all duration-200 cursor-pointer font-mono text-xs uppercase tracking-wider group focus:outline-none focus:ring-1 focus:ring-white/40 shadow-sm backdrop-blur-md"
              @click="handleClose"
              :aria-label="content.exitLabel"
            >
              <span class="px-1.5 py-0.5 rounded text-[10px] bg-white/10 border border-white/10 text-zinc-300 group-hover:text-white">
                {{ content.escHint }}
              </span>
              <span class="text-[11px] font-medium">{{ content.exitLabel }}</span>
            </button>

            <!-- Satellite Zoom Out Button (Visible when zoomed in) -->
            <Transition name="fade">
              <button
                v-if="isSatelliteZoomed"
                type="button"
                class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-400/40 bg-blue-500/20 hover:bg-blue-500/30 active:scale-95 text-blue-300 hover:text-white transition-all duration-200 cursor-pointer font-mono text-xs uppercase tracking-wider focus:outline-none shadow-sm backdrop-blur-md"
                @click="onZoomOut"
                title="Return to full global view"
              >
                <span>‹</span>
                <span class="text-[11px] font-medium">GLOBAL VIEW</span>
              </button>
            </Transition>

            <!-- Globe Visual Mode Switcher: REAL EARTH vs TECH GLOBE -->
            <div class="inline-flex items-center rounded-full border border-white/15 bg-black/60 p-0.5 backdrop-blur-md shadow-sm">
              <button
                type="button"
                class="flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[10px] uppercase tracking-wider transition-all duration-200 cursor-pointer"
                :class="globeMode === 'real'
                  ? 'bg-blue-500/30 border border-blue-400/70 text-white font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white border border-transparent'"
                @click="globeMode = 'real'"
                title="Real Earth (Photorealistic Blue Marble with clouds & atmosphere)"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-blue-400" v-if="globeMode === 'real'"></span>
                <span>REAL EARTH</span>
              </button>
              <button
                type="button"
                class="flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[10px] uppercase tracking-wider transition-all duration-200 cursor-pointer"
                :class="globeMode === 'tech'
                  ? 'bg-emerald-500/25 border border-emerald-400/70 text-white font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white border border-transparent'"
                @click="globeMode = 'tech'"
                title="Tech Globe (Technical Vector Blueprint & coordinates)"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400" v-if="globeMode === 'tech'"></span>
                <span>TECH GLOBE</span>
              </button>
            </div>
          </div>

          <!-- Status Indicator / Current Title -->
          <div class="hidden sm:flex items-center gap-3 font-mono text-[11px] tracking-widest uppercase">
            <template v-if="isSatelliteZoomed">
              <span class="w-2 h-2 rounded-full bg-blue-400 animate-ping" aria-hidden="true"></span>
              <span class="text-blue-300 font-semibold">SATELLITE VIEW · {{ activeCluster?.name }} ({{ clusterProjects.length }} PROJECTS)</span>
            </template>
            <template v-else>
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true"></span>
              <span class="text-zinc-400">GLOBAL ORBIT · {{ String(activeMarkerIndex + 1).padStart(2, '0') }} / {{ String(totalProjects).padStart(2, '0') }}</span>
            </template>
          </div>
        </header>

        <!-- Bottom Floating Project Detail & Navigation -->
        <footer class="relative z-10 w-full px-4 pb-6 sm:pb-8 flex flex-col items-center pointer-events-none">
          <!-- Floating Info Panel -->
          <div class="pointer-events-auto w-full max-w-xl rounded-2xl border border-white/15 bg-black/75 backdrop-blur-xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.7)] transition-all duration-300 text-white">
            <!-- Cluster Sub-Navigation Pills (when in Satellite Zoom or multi-project cluster) -->
            <div v-if="isSatelliteZoomed && clusterProjects.length > 1" class="flex items-center gap-1.5 overflow-x-auto pb-3 mb-3 border-b border-white/10 scrollbar-none">
              <span class="font-mono text-[9px] uppercase tracking-wider text-blue-400 font-semibold shrink-0 mr-1">
                CLUSTER SATELLITES:
              </span>
              <button
                v-for="p in clusterProjects"
                :key="p.id"
                type="button"
                class="px-2.5 py-1 rounded-full font-mono text-[10px] tracking-wide transition-all cursor-pointer shrink-0 border"
                :class="activeMarker.id === p.id
                  ? 'border-blue-400/80 bg-blue-500/25 text-white shadow-sm'
                  : 'border-white/10 bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10'"
                @click="onSelectMarker(p.id)"
              >
                {{ p.title }}
              </button>
            </div>

            <!-- Top Sub-Header & Navigation Controls -->
            <div class="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <div class="flex items-center gap-2">
                <span class="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-zinc-400 font-medium">
                  {{ activeMarker.subtitle }}
                </span>
                <!-- Satellite trigger button if in global view for multi-project cluster -->
                <button
                  v-if="!isSatelliteZoomed && isMultiClusterProject"
                  type="button"
                  class="px-2 py-0.5 rounded-full border border-blue-400/30 bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 font-mono text-[9px] tracking-wide cursor-pointer transition-colors"
                  @click="onZoomCluster(activeMarker.clusterId)"
                  title="Zoom in satellite view"
                >
                  ⊕ SATELLITE ({{ currentClusterCount }})
                </button>
              </div>

              <!-- Project Prev / Next Pagination -->
              <div class="flex items-center gap-3 font-mono text-xs text-zinc-300">
                <button
                  type="button"
                  class="px-2 py-0.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  @click="handlePrev"
                  :aria-label="content.prevLabel"
                >
                  ‹ {{ content.prevLabel }}
                </button>
                <span class="text-[11px] text-zinc-400 tracking-wider">
                  {{ String(activeMarkerIndex + 1).padStart(2, '0') }} / {{ String(totalProjects).padStart(2, '0') }}
                </span>
                <button
                  type="button"
                  class="px-2 py-0.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  @click="handleNext"
                  :aria-label="content.nextLabel"
                >
                  {{ content.nextLabel }} ›
                </button>
              </div>
            </div>

            <!-- Project Main Info with optional thumbnail -->
            <div class="flex items-start gap-4 mb-2">
              <div v-if="activeMarker.image" class="hidden sm:block shrink-0 w-14 h-14 rounded-lg overflow-hidden border border-white/15 bg-zinc-900">
                <img :src="activeMarker.image" :alt="activeMarker.fullTitle" class="w-full h-full object-cover" />
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1.5">
                  <h2 class="text-lg sm:text-xl font-bold tracking-tight text-white truncate">
                    {{ activeMarker.fullTitle }}
                  </h2>
                  <span class="font-mono text-[10px] tracking-wider uppercase text-zinc-400 shrink-0">
                    {{ activeMarker.category }}
                  </span>
                </div>

                <!-- Description -->
                <p class="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  {{ activeMarker.description }}
                </p>
              </div>
            </div>

            <!-- Bottom Row: Tech Stack Tags & Action Buttons -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 mt-1 border-t border-white/10">
              <div class="flex flex-wrap gap-1.5" aria-label="Tech stack">
                <span
                  v-for="tech in activeMarker.tech"
                  :key="tech"
                  class="px-2 py-0.5 rounded font-mono text-[10px] text-zinc-300 border border-white/10 bg-white/5"
                >
                  {{ tech }}
                </span>
              </div>

              <!-- Action CTAs -->
              <div class="shrink-0 flex items-center gap-2">
                <a
                  v-if="isValidUrl(activeMarker.link)"
                  :href="activeMarker.link"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="btn hero-primary !py-1.5 !px-3 !text-xs inline-flex items-center gap-1.5"
                >
                  <span>{{ content.viewProject }}</span>
                  <span aria-hidden="true">↗</span>
                </a>

                <a
                  v-if="isValidUrl(activeMarker.repo)"
                  :href="activeMarker.repo"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="px-2.5 py-1.5 rounded border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-mono text-zinc-300 hover:text-white inline-flex items-center gap-1 transition-colors"
                >
                  <span>Code</span>
                  <span aria-hidden="true">↗</span>
                </a>

                <button
                  type="button"
                  class="px-2.5 py-1.5 rounded border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-mono text-zinc-300 hover:text-white inline-flex items-center gap-1 cursor-pointer transition-colors"
                  @click="navigateToProjects"
                  title="View in portfolio list"
                >
                  <span>Portfolio</span>
                  <span aria-hidden="true">↓</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Interaction Hint -->
          <p class="mt-3 text-center font-mono text-[10px] text-zinc-500 dark:text-zinc-500 tracking-wider">
            <template v-if="isSatelliteZoomed">
              Satellite inspection mode · Click satellite node or arrows to inspect · Esc or button to zoom out
            </template>
            <template v-else>
              {{ content.interactionHint }} · Click cluster counter to zoom in
            </template>
          </p>
        </footer>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick, defineAsyncComponent, onMounted, onBeforeUnmount } from 'vue'
import {
  isShowcaseOpen,
  activeMarker,
  activeMarkerIndex,
  isSatelliteZoomed,
  activeClusterId,
  activeCluster,
  clusterProjects,
  closeShowcase,
  zoomInToCluster,
  zoomOutToGlobal,
  nextProject,
  prevProject,
  setActiveProjectId,
} from '@/composables/useShowcase'
import { isDark, useTheme } from '@/composables/useTheme'
import { globeMarkers, globeClusters } from './globeData'
import { portfolioContent } from '@/content/portfolioContent'

const { toggle: toggleTheme } = useTheme()
const GlobeScene = defineAsyncComponent(() => import('./GlobeScene.vue'))
const content = portfolioContent.globe
const overlayRef = ref<HTMLElement | null>(null)
const globeMode = ref<'real' | 'tech'>('real')

const totalProjects = computed(() => globeMarkers.value.length)

const isMultiClusterProject = computed(() => {
  const cluster = globeClusters.value.find(c => c.id === activeMarker.value.clusterId)
  return cluster ? cluster.projectCount > 1 : false
})

const currentClusterCount = computed(() => {
  const cluster = globeClusters.value.find(c => c.id === activeMarker.value.clusterId)
  return cluster ? cluster.projectCount : 1
})

function isValidUrl(val?: string) {
  return !!val && /^https?:\/\//i.test(val)
}

function handleClose() {
  closeShowcase()
}

function handleKeyEsc() {
  if (isSatelliteZoomed.value) {
    zoomOutToGlobal()
  } else {
    closeShowcase()
  }
}

function handlePrev() {
  prevProject()
}

function handleNext() {
  nextProject()
}

function onSelectMarker(id: string) {
  setActiveProjectId(id)
}

function onZoomCluster(clusterId: string) {
  zoomInToCluster(clusterId)
}

function onZoomOut() {
  zoomOutToGlobal()
}

function navigateToProjects() {
  closeShowcase()
  nextTick(() => {
    const el = document.getElementById('projects')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  })
}

function onGlobalKeydown(e: KeyboardEvent) {
  if (!isShowcaseOpen.value) return
  if (e.key === 'Escape') {
    e.preventDefault()
    handleKeyEsc()
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault()
    handlePrev()
  } else if (e.key === 'ArrowRight') {
    e.preventDefault()
    handleNext()
  }
}

watch(isShowcaseOpen, open => {
  if (open) {
    window.addEventListener('keydown', onGlobalKeydown)
    nextTick(() => {
      overlayRef.value?.focus()
    })
  } else {
    window.removeEventListener('keydown', onGlobalKeydown)
  }
})

onMounted(() => {
  if (isShowcaseOpen.value) {
    window.addEventListener('keydown', onGlobalKeydown)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onGlobalKeydown)
})
</script>

<style scoped>
.showcase-glow-dark {
  background:
    radial-gradient(ellipse at 50% 50%, rgba(20, 32, 58, 0.45) 0%, rgba(4, 7, 16, 0.88) 60%, #010204 100%),
    radial-gradient(ellipse at 85% 15%, rgba(45, 27, 85, 0.22) 0%, transparent 45%);
}

.showcase-glow-light {
  background:
    radial-gradient(ellipse at 50% 50%, rgba(14, 38, 75, 0.48) 0%, rgba(2, 6, 23, 0.92) 60%, #010206 100%),
    radial-gradient(ellipse at 20% 80%, rgba(30, 58, 138, 0.22) 0%, transparent 45%),
    radial-gradient(ellipse at 85% 20%, rgba(24, 24, 60, 0.2) 0%, transparent 40%);
}

.showcase-grid-dark {
  background-size: 40px 40px;
  background-image:
    linear-gradient(to right, rgba(255, 255, 255, 0.15) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.15) 1px, transparent 1px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 250ms ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 600-900ms Entrance & Exit Transition */
.showcase-entrance-enter-active {
  transition: opacity 700ms cubic-bezier(0.16, 1, 0.3, 1);
}

.showcase-entrance-enter-active .showcase-globe-stage {
  transition: transform 750ms cubic-bezier(0.16, 1, 0.3, 1), opacity 700ms ease-out;
}

.showcase-entrance-leave-active {
  transition: opacity 450ms cubic-bezier(0.4, 0, 0.2, 1);
}

.showcase-entrance-leave-active .showcase-globe-stage {
  transition: transform 450ms cubic-bezier(0.4, 0, 0.2, 1), opacity 400ms ease-in;
}

.showcase-entrance-enter-from {
  opacity: 0;
}

.showcase-entrance-enter-from .showcase-globe-stage {
  opacity: 0;
  transform: scale(0.92);
}

.showcase-entrance-leave-to {
  opacity: 0;
}

.showcase-entrance-leave-to .showcase-globe-stage {
  opacity: 0;
  transform: scale(0.95);
}

@media (prefers-reduced-motion: reduce) {
  .showcase-entrance-enter-active,
  .showcase-entrance-leave-active,
  .showcase-entrance-enter-active .showcase-globe-stage,
  .showcase-entrance-leave-active .showcase-globe-stage {
    transition: opacity 200ms ease !important;
    transform: none !important;
  }
}
</style>
