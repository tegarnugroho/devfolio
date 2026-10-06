<template>
  <Teleport to="body">
    <Transition name="showcase-fade">
      <div
        v-if="isOpen"
        ref="overlayRef"
        class="showcase-overlay fixed inset-0 z-[100] flex flex-col justify-between overflow-hidden select-none bg-[#010206] text-zinc-100 outline-none"
        role="dialog"
        aria-modal="true"
        aria-label="Interactive 3D Portfolio Showcase"
        tabindex="-1"
        @keydown.esc.prevent="closeShowcase"
        @keydown.up.prevent="prevSection"
        @keydown.down.prevent="nextSection"
        @keydown.left.prevent="handleKeyLeft"
        @keydown.right.prevent="handleKeyRight"
      >
        <!-- 1. Ambient Background Layer -->
        <div class="pointer-events-none absolute inset-0 showcase-ambient-glow" aria-hidden="true"></div>

        <!-- 2. Dynamic 3D Scene Stage -->
        <div class="absolute inset-0 z-0 flex items-center justify-center showcase-stage">
          <Transition name="scene-crossfade" mode="out-in">
            <component :is="currentSceneComponent" :key="currentSection" />
          </Transition>
        </div>

        <!-- 3. Top Header: Exit Button, Section HUD, and Shortcuts -->
        <header class="relative z-20 w-full px-5 py-4 sm:px-8 sm:py-6 flex items-center justify-between pointer-events-none">
          <!-- Left: Exit Showcase Button -->
          <div class="pointer-events-auto flex items-center gap-2">
            <button
              type="button"
              class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/15 bg-black/60 hover:bg-white/10 hover:border-white/30 active:scale-95 text-zinc-200 hover:text-white transition-all duration-200 cursor-pointer font-mono text-xs uppercase tracking-wider group focus:outline-none focus:ring-1 focus:ring-white/40 shadow-sm backdrop-blur-md"
              @click="closeShowcase"
              :aria-label="globeContent.exitLabel || 'Exit Showcase'"
            >
              <span class="px-1.5 py-0.5 rounded text-[10px] bg-white/10 border border-white/10 text-zinc-300 group-hover:text-white">
                ESC
              </span>
              <span class="text-[11px] font-medium">{{ globeContent.exitLabel || 'EXIT' }}</span>
            </button>
          </div>

          <!-- Center: Subtle Section Navigation Switcher -->
          <div class="pointer-events-auto hidden md:block">
            <ShowcaseNavigation />
          </div>

          <!-- Right: Up/Down Arrow Section Navigation Shortcuts (Matches Normal Mode) -->
          <div class="pointer-events-auto flex items-center gap-1.5 font-mono text-xs text-zinc-400">
            <button
              type="button"
              class="w-8 h-8 rounded-full border border-white/15 bg-black/60 hover:bg-white/15 flex items-center justify-center text-zinc-300 hover:text-white active:scale-95 transition cursor-pointer"
              @click="prevSection"
              title="Previous section (↑)"
              aria-label="Previous showcase section"
            >
              ↑
            </button>
            <button
              type="button"
              class="w-8 h-8 rounded-full border border-white/15 bg-black/60 hover:bg-white/15 flex items-center justify-center text-zinc-300 hover:text-white active:scale-95 transition cursor-pointer"
              @click="nextSection"
              title="Next section (↓)"
              aria-label="Next showcase section"
            >
              ↓
            </button>
          </div>
        </header>

        <!-- Mobile Bottom Section Navigation Bar -->
        <footer class="relative z-20 w-full px-4 pb-4 md:hidden pointer-events-none flex justify-center">
          <div class="pointer-events-auto w-full max-w-sm">
            <ShowcaseNavigation />
          </div>
        </footer>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, defineAsyncComponent, type Component } from 'vue'
import {
  useShowcase,
  isSatelliteZoomed,
} from '@/composables/useShowcase'
import type { ShowcaseSection } from '@/types/showcase'
import ShowcaseNavigation from './ShowcaseNavigation.vue'
import ShowcaseLoading from './ShowcaseLoading.vue'
import ShowcaseError from './ShowcaseError.vue'
import { portfolioContent } from '@/content/portfolioContent'

const globeContent = portfolioContent.globe
const { isOpen, currentSection, closeShowcase, nextSection, prevSection, navigateContent } = useShowcase()

const overlayRef = ref<HTMLElement | null>(null)

// Focus management
watch(isOpen, async (open) => {
  if (open) {
    await nextTick()
    overlayRef.value?.focus()
  }
})

// Arrow key navigation: Left/Right navigates within the 3D scene content
function handleKeyLeft() {
  navigateContent('prev')
}

function handleKeyRight() {
  navigateContent('next')
}

// Lazy-loaded 3D Scene Components with Async Component wrappers
const sceneComponents: Record<ShowcaseSection, Component> = {
  hero: defineAsyncComponent({
    loader: () => import('./scenes/HeroSpaceScene.vue'),
    loadingComponent: ShowcaseLoading,
    errorComponent: ShowcaseError,
    timeout: 10000,
  }),
  about: defineAsyncComponent({
    loader: () => import('./scenes/AboutJourneyScene.vue'),
    loadingComponent: ShowcaseLoading,
    errorComponent: ShowcaseError,
    timeout: 10000,
  }),
  skills: defineAsyncComponent({
    loader: () => import('./scenes/SkillsTechTreeScene.vue'),
    loadingComponent: ShowcaseLoading,
    errorComponent: ShowcaseError,
    timeout: 10000,
  }),
  projects: defineAsyncComponent({
    loader: () => import('./scenes/ProjectsGlobeScene.vue'),
    loadingComponent: ShowcaseLoading,
    errorComponent: ShowcaseError,
    timeout: 10000,
  }),
  writing: defineAsyncComponent({
    loader: () => import('./scenes/WritingArchiveScene.vue'),
    loadingComponent: ShowcaseLoading,
    errorComponent: ShowcaseError,
    timeout: 10000,
  }),
  contact: defineAsyncComponent({
    loader: () => import('./scenes/ContactUplinkScene.vue'),
    loadingComponent: ShowcaseLoading,
    errorComponent: ShowcaseError,
    timeout: 10000,
  }),
}

const currentSceneComponent = computed(() => {
  return sceneComponents[currentSection.value] || sceneComponents.projects
})
</script>

<style scoped>
/* Subtle Cosmic Glow behind active scene */
.showcase-ambient-glow {
  background: radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.45) 0%, rgba(1, 2, 6, 0.95) 75%, #010206 100%);
}

/* Immersive Entrance and Exit Animation */
.showcase-fade-enter-active {
  transition: opacity 650ms cubic-bezier(0.16, 1, 0.3, 1);
}

.showcase-fade-leave-active {
  transition: opacity 400ms cubic-bezier(0.16, 1, 0.3, 1);
}

.showcase-fade-enter-from,
.showcase-fade-leave-to {
  opacity: 0;
}

.showcase-fade-enter-active .showcase-stage {
  transition: transform 650ms cubic-bezier(0.16, 1, 0.3, 1), filter 650ms ease;
}

.showcase-fade-enter-from .showcase-stage {
  transform: scale(0.96);
  filter: blur(4px);
}

/* Crossfade between 3D Scenes */
.scene-crossfade-enter-active {
  transition: opacity 350ms ease-out, transform 350ms cubic-bezier(0.16, 1, 0.3, 1);
}

.scene-crossfade-leave-active {
  transition: opacity 250ms ease-in;
}

.scene-crossfade-enter-from {
  opacity: 0;
  transform: scale(0.98);
}

.scene-crossfade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .showcase-fade-enter-active,
  .showcase-fade-leave-active,
  .scene-crossfade-enter-active,
  .scene-crossfade-leave-active {
    transition: opacity 200ms ease !important;
  }
  .showcase-fade-enter-from .showcase-stage,
  .scene-crossfade-enter-from {
    transform: none !important;
    filter: none !important;
  }
}
</style>

