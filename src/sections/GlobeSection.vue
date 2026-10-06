<template>
  <section
    ref="section"
    v-section-reveal
    id="selected-work"
    class="scroll-mt-12 sm:scroll-mt-16 md:scroll-mt-16 pt-20 md:pt-24 pb-16 border-t border-black/10 dark:border-white/10"
  >
    <!-- Section Wrapper Frame -->
    <div
      v-reveal="{ delay: 0 }"
      class="globe-card rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.015] dark:bg-white/[0.02] p-5 sm:p-8 md:p-10 relative overflow-hidden backdrop-blur-sm"
    >
      <!-- Atmosphere Background Subtle Illumination -->
      <div class="globe-atmosphere pointer-events-none absolute -right-20 -top-20 w-96 h-96 rounded-full bg-blue-500/[0.03] dark:bg-blue-400/[0.04] blur-3xl" aria-hidden="true"></div>

      <!-- Top Technical Badge Bar -->
      <div class="flex items-center justify-between pb-6 border-b border-black/10 dark:border-white/10">
        <div class="flex items-center gap-3">
          <span class="px-2 py-0.5 rounded border border-black/15 dark:border-white/15 font-mono text-[11px] font-semibold text-[var(--primary)]">
            {{ content.badge }}
          </span>
          <span class="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
            {{ content.badgeLabel }}
          </span>
        </div>
        <span class="font-mono text-[11px] tracking-wide text-[var(--secondary)] hidden sm:inline-block">
          {{ content.badgeSub }}
        </span>
      </div>

      <!-- 2-Column Responsive Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mt-8">
        <!-- Left Content -->
        <div class="lg:col-span-5 flex flex-col justify-center">
          <p v-reveal="{ delay: 60, kind: 'accent' }" class="font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--label)] mb-2">
            {{ content.number }} {{ content.eyebrow }}
          </p>

          <h2 v-reveal="{ delay: 120, kind: 'heading' }" class="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--primary)] leading-[1.12] mb-4">
            {{ content.title }}
          </h2>

          <p v-reveal="{ delay: 180 }" class="text-sm sm:text-base leading-relaxed text-[var(--secondary)] max-w-md mb-8">
            {{ content.description }}
          </p>

          <div v-reveal="{ delay: 240 }">
            <a :href="sectionHref('projects')" class="btn hero-primary w-fit inline-flex items-center gap-3">
              {{ content.exploreLabel }}
              <span aria-hidden="true">→</span>
            </a>
          </div>

          <!-- Technical Metrics / Core Pillars -->
          <div v-reveal="{ delay: 300, kind: 'accent' }" class="grid grid-cols-2 gap-y-3.5 gap-x-4 mt-10 pt-8 border-t border-black/10 dark:border-white/10">
            <div v-for="feat in content.features" :key="feat.num" class="flex items-baseline gap-2.5">
              <span class="font-mono text-[10px] text-[var(--muted)] font-medium">{{ feat.num }}</span>
              <span class="font-mono text-[10px] text-[var(--secondary)] tracking-wider uppercase font-medium">{{ feat.text }}</span>
            </div>
          </div>
        </div>

        <!-- Right 3D Globe -->
        <div v-reveal="{ delay: 180 }" class="lg:col-span-7 relative flex flex-col items-center justify-center">
          <GlobeScene
            @select="onSelectMarker"
            @hover="onHoverMarker"
          />

          <p class="text-center text-[10px] font-mono text-[var(--muted)] mt-2 tracking-wide select-none">
            {{ content.interactionHint }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue'
import { portfolioContent } from '@/content/portfolioContent'
import { sectionHref } from '@/composables/useTranslation'
import type { GlobeMarker } from '@/components/globe/globeData'

const GlobeScene = defineAsyncComponent(() => import('@/components/globe/GlobeScene.vue'))

const content = portfolioContent.globe
const hoveredId = ref<string | null>(null)

function onSelectMarker(marker: GlobeMarker) {
  // Navigate to projects section
  const projectsSection = document.getElementById('projects')
  if (projectsSection) {
    projectsSection.scrollIntoView({ behavior: 'smooth' })
  }
}

function onHoverMarker(id: string | null) {
  hoveredId.value = id
}
</script>

<style scoped>
.globe-card {
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
}
</style>
