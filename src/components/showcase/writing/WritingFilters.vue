<template>
  <div
    class="writing-filters-header pointer-events-none absolute top-[max(4.25rem,calc(env(safe-area-inset-top)+3.5rem))] sm:top-20 left-4 sm:left-12 right-4 sm:right-auto z-20 max-w-sm space-y-2.5 sm:space-y-3.5 select-none"
  >
    <!-- Section Identifier / Aerospace Header -->
    <div class="flex items-center gap-2">
      <span class="font-mono text-[10px] text-zinc-400 tracking-widest font-semibold">05</span>
      <span class="w-3.5 h-[1px] bg-zinc-600"></span>
      <span class="font-mono text-[10px] text-zinc-300 uppercase tracking-widest font-medium">WRITING · EDITORIAL ARCHIVE</span>
    </div>

    <!-- Title & Subtitle -->
    <div class="space-y-1">
      <h1 class="text-xl sm:text-3xl font-light tracking-tight text-white font-sans leading-tight">
        Editorial Archive
      </h1>
      <p class="hidden sm:block text-[11.5px] text-zinc-400 leading-relaxed font-sans max-w-[280px] font-normal">
        A curated spatial explorer of technical articles, software architecture, and engineering deep dives published on Codeary.
      </p>
    </div>

    <!-- Category Filters (Horizontally scrollable on mobile, wrapping on desktop) -->
    <div class="pt-1 pointer-events-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 max-w-[calc(100vw-2rem)] sm:max-w-[300px] sm:flex-wrap">
      <button
        v-for="cat in categories"
        :key="cat"
        type="button"
        class="shrink-0 px-2.5 py-1 rounded-md text-[9.5px] font-mono tracking-wider transition-all cursor-pointer border flex items-center gap-1.5 shadow-sm"
        :class="
          selectedCategory === cat
            ? 'bg-blue-500/20 text-white border-blue-400/50 shadow-[0_0_12px_rgba(59,130,246,0.3)] font-medium'
            : 'bg-black/60 text-zinc-400 hover:text-white border-white/10 hover:border-white/25 hover:bg-black/80'
        "
        @click="$emit('select-category', cat)"
      >
        <span
          v-if="selectedCategory === cat"
          class="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_6px_#38bdf8]"
        ></span>
        <span>{{ cat }}</span>
      </button>
    </div>

    <!-- Status Beacon / Telemetry Indicator -->
    <div class="pt-0.5 flex items-center gap-2 font-mono text-[8.5px] sm:text-[9px] text-zinc-400 tracking-wider">
      <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></span>
      <span class="uppercase">{{ count }} ARTICLES ARCHIVED · SWIPE OR USE ARROWS</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CategoryFilter } from './knowledgeTypes'

defineProps<{
  categories: readonly CategoryFilter[]
  selectedCategory: CategoryFilter
  count: number
}>()

defineEmits<{
  (e: 'select-category', category: CategoryFilter): void
}>()
</script>
