<template>
  <div
    class="writing-filters-header pointer-events-none absolute top-16 sm:top-20 left-6 sm:left-12 z-20 max-w-xs space-y-3 select-none"
  >
    <!-- Section Identifier -->
    <div class="flex items-center gap-2">
      <span class="font-mono text-[10px] text-zinc-400 tracking-widest font-semibold">05</span>
      <span class="w-3.5 h-[1px] bg-zinc-600"></span>
      <span class="font-mono text-[10px] text-zinc-300 uppercase tracking-widest font-medium">WRITING</span>
    </div>

    <!-- Title & Subtitle -->
    <h1 class="text-2xl sm:text-3xl font-light tracking-tight text-zinc-100 font-sans leading-tight">
      Knowledge Field
    </h1>

    <p class="text-[11.5px] text-zinc-400 leading-relaxed font-sans max-w-[270px] font-normal">
      A spatial field of technical ideas, engineering notes, and architectural experiments. Select a document slab to inspect.
    </p>

    <!-- Category Filters -->
    <div class="pt-2 pointer-events-auto flex flex-wrap gap-1.5 max-w-[280px]">
      <button
        v-for="cat in categories"
        :key="cat"
        type="button"
        class="px-2.5 py-1 rounded text-[9.5px] font-mono tracking-wider transition-colors cursor-pointer border"
        :class="
          selectedCategory === cat
            ? 'bg-white/15 text-white border-white/30 font-medium'
            : 'bg-black/40 text-zinc-400 hover:text-white border-white/10 hover:border-white/20'
        "
        @click="$emit('select-category', cat)"
      >
        {{ cat }}
      </button>
    </div>

    <!-- Status Beacon / Interactive Hint -->
    <div class="pt-1 flex items-center gap-2 font-mono text-[9px] text-zinc-400 tracking-wider">
      <span class="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)] animate-pulse"></span>
      <span>{{ count }} ARTICLES · DRAG TO ROTATE FIELD</span>
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
