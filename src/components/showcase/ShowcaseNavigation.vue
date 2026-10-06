<template>
  <nav
    class="showcase-nav flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-white/15 bg-black/60 backdrop-blur-xl shadow-lg pointer-events-auto max-w-full overflow-x-auto no-scrollbar"
    aria-label="3D Showcase Section Navigation"
  >
    <button
      v-for="s in SHOWCASE_SECTIONS"
      :key="s.id"
      type="button"
      @click="setSection(s.id)"
      class="group relative flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[10px] tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap focus:outline-none focus:ring-1 focus:ring-blue-400"
      :class="currentSection === s.id
        ? 'bg-white/15 text-white font-semibold shadow-sm'
        : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'"
      :aria-current="currentSection === s.id ? 'page' : undefined"
    >
      <!-- Active Section Indicator Dot -->
      <span
        v-if="currentSection === s.id"
        class="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_#38bdf8]"
      ></span>
      <span class="opacity-60 text-[9px]">{{ s.number }}</span>
      <span class="tracking-widest">{{ s.label }}</span>
    </button>
  </nav>
</template>

<script setup lang="ts">
import { currentSection, setSection } from '@/composables/useShowcase'
import { SHOWCASE_SECTIONS } from '@/composables/useShowcaseNavigation'
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>

