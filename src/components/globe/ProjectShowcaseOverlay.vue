<template>
  <Teleport to="body">
    <Transition name="showcase-entrance">
      <div
        v-if="isShowcaseOpen"
        class="project-showcase-overlay fixed inset-0 z-[100] flex flex-col justify-between overflow-hidden select-none bg-[#05070a] text-zinc-100"
        role="dialog"
        aria-modal="true"
        aria-label="3D Project Showcase"
        @keydown.esc="handleClose"
        @keydown.left="handlePrev"
        @keydown.right="handleNext"
        tabindex="-1"
        ref="overlayRef"
      >
        <!-- Subtle Ambient Radial Glow Behind Globe -->
        <div class="pointer-events-none absolute inset-0 showcase-radial-glow" aria-hidden="true"></div>

        <!-- Very Subtle Grid Texture -->
        <div class="pointer-events-none absolute inset-0 opacity-[0.035] showcase-grid" aria-hidden="true"></div>

        <!-- 3D Globe Viewport (Full Viewport Centerpiece) -->
        <div class="absolute inset-0 z-0 flex items-center justify-center showcase-globe-stage">
          <GlobeScene
            :active-id="activeMarker.id"
            :fallback-text="content.fallbackNotice"
            @select="onSelectMarker"
          />
        </div>

        <!-- Top Header Navigation Bar -->
        <header class="relative z-10 w-full px-5 py-5 sm:px-8 sm:py-6 flex items-center justify-between pointer-events-none">
          <!-- Exit Showcase Button -->
          <button
            type="button"
            class="pointer-events-auto inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-white/15 bg-black/40 hover:bg-white/10 hover:border-white/35 active:scale-95 text-zinc-300 hover:text-white transition-all duration-200 cursor-pointer font-mono text-xs uppercase tracking-wider group focus:outline-none focus:ring-1 focus:ring-white/40"
            @click="handleClose"
            :aria-label="content.exitLabel"
          >
            <span class="px-1.5 py-0.5 rounded text-[10px] bg-white/10 border border-white/10 text-zinc-400 group-hover:text-zinc-200">
              {{ content.escHint }}
            </span>
            <span class="text-[11px] font-medium">{{ content.exitLabel }}</span>
          </button>

          <!-- Status Indicator / Current Title -->
          <div class="hidden sm:flex items-center gap-3 font-mono text-[11px] tracking-widest text-zinc-400 uppercase">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true"></span>
            <span>SHOWCASE MODE · {{ String(activeMarkerIndex + 1).padStart(2, '0') }} / {{ String(totalProjects).padStart(2, '0') }}</span>
          </div>
        </header>

        <!-- Bottom Floating Project Detail & Navigation -->
        <footer class="relative z-10 w-full px-4 pb-6 sm:pb-8 flex flex-col items-center pointer-events-none">
          <!-- Floating Info Panel -->
          <div class="pointer-events-auto w-full max-w-xl rounded-2xl border border-white/10 bg-black/65 backdrop-blur-xl p-5 sm:p-6 shadow-2xl transition-all duration-300">
            <!-- Top Sub-Header & Navigation Controls -->
            <div class="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <span class="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-zinc-400 font-medium">
                {{ activeMarker.subtitle }}
              </span>

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
              <div v-if="activeMarker.image" class="hidden sm:block shrink-0 w-14 h-14 rounded-lg overflow-hidden border border-white/10 bg-zinc-900">
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
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 mt-1 border-t border-white/5">
              <div class="flex flex-wrap gap-1.5" aria-label="Tech stack">
                <span
                  v-for="tech in activeMarker.tech"
                  :key="tech"
                  class="px-2 py-0.5 rounded font-mono text-[10px] text-zinc-400 border border-white/10 bg-white/5"
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
                  class="px-2.5 py-1.5 rounded border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-mono text-zinc-300 inline-flex items-center gap-1"
                >
                  <span>Code</span>
                  <span aria-hidden="true">↗</span>
                </a>

                <button
                  type="button"
                  class="px-2.5 py-1.5 rounded border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-mono text-zinc-300 inline-flex items-center gap-1 cursor-pointer"
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
          <p class="mt-3 text-center font-mono text-[10px] text-zinc-500 tracking-wider">
            {{ content.interactionHint }}
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
  closeShowcase,
  nextProject,
  prevProject,
  setActiveProjectId,
} from '@/composables/useShowcase'
import { globeMarkers } from './globeData'
import { portfolioContent } from '@/content/portfolioContent'

const GlobeScene = defineAsyncComponent(() => import('./GlobeScene.vue'))
const content = portfolioContent.globe
const overlayRef = ref<HTMLElement | null>(null)

const totalProjects = computed(() => globeMarkers.value.length)

function isValidUrl(val?: string) {
  return !!val && /^https?:\/\//i.test(val)
}

function handleClose() {
  closeShowcase()
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
    handleClose()
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
.showcase-radial-glow {
  background: radial-gradient(circle at 50% 50%, rgba(30, 41, 59, 0.3) 0%, rgba(6, 9, 15, 0.8) 55%, #05070a 100%);
}

.showcase-grid {
  background-size: 40px 40px;
  background-image:
    linear-gradient(to right, rgba(255, 255, 255, 0.15) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.15) 1px, transparent 1px);
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
