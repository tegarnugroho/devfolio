<template>
  <section
    ref="section"
    v-section-reveal
    id="selected-work"
    class="scroll-mt-12 sm:scroll-mt-16 md:scroll-mt-16 pt-20 md:pt-24 pb-16 border-t border-black/10 dark:border-white/10"
  >
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-8">
      <div class="max-w-xl">
        <p v-reveal="{ delay: 0, kind: 'accent' }" class="font-mono text-[11px] tracking-[0.22em] uppercase text-[var(--label)] mb-3">
          {{ content.number }} / {{ content.eyebrow }}
        </p>

        <h2 v-reveal="{ delay: 60, kind: 'heading' }" class="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-[var(--primary)] leading-[1.14] mb-4">
          {{ content.title }}
        </h2>

        <p v-reveal="{ delay: 120 }" class="text-sm sm:text-base leading-relaxed text-[var(--secondary)]">
          {{ content.description }}
        </p>
      </div>

      <div v-reveal="{ delay: 180 }" class="shrink-0">
        <button
          type="button"
          class="btn hero-primary inline-flex items-center gap-3 cursor-pointer group"
          @click="handleStartShowcase"
        >
          <span class="tracking-wide">{{ content.startLabel }}</span>
          <span class="font-mono transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { portfolioContent } from '@/content/portfolioContent'
import { openShowcase } from '@/composables/useShowcase'

const content = portfolioContent.globe

function handleStartShowcase() {
  openShowcase()
}
</script>
