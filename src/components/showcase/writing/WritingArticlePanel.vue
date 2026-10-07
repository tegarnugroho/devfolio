<template>
  <Transition name="editorial-fade">
    <div
      v-if="article"
      class="writing-article-panel pointer-events-auto absolute bottom-[max(4.5rem,calc(env(safe-area-inset-bottom)+3.5rem))] sm:bottom-10 left-4 right-4 sm:left-auto sm:right-12 z-20 max-w-sm sm:w-88 p-3.5 sm:p-5 rounded-xl border border-white/10 bg-zinc-950/90 backdrop-blur-xl shadow-2xl space-y-2.5 sm:space-y-3.5 select-none"
      @click.stop
    >
      <!-- Panel Header -->
      <div class="space-y-1">
        <div class="flex items-center justify-between">
          <span class="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-300 font-semibold flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-pulse"></span>
            05 / WRITING · DISPATCH
          </span>
          <span class="font-mono text-[9px] text-zinc-400 tracking-wider">
            {{ article.date || article.year }}
          </span>
        </div>

        <h2 class="text-base sm:text-lg font-medium tracking-tight text-white leading-snug">
          {{ article.title }}
        </h2>
      </div>

      <!-- Excerpt -->
      <p class="text-[11.5px] text-zinc-400 leading-relaxed font-sans line-clamp-3 font-normal">
        {{ article.excerpt }}
      </p>

      <!-- Tags / Key Insights from API response -->
      <div v-if="article.tags && article.tags.length" class="space-y-1 pt-1 border-t border-white/5">
        <p class="font-mono text-[8.5px] uppercase tracking-widest text-zinc-400 font-semibold">
          TOPICS & TAGS
        </p>
        <div class="flex flex-wrap gap-1 pt-0.5">
          <span
            v-for="tag in article.tags"
            :key="tag"
            class="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-white/5 border border-white/10 text-zinc-300"
          >
            #{{ tag }}
          </span>
        </div>
      </div>

      <!-- Category & Progress -->
      <div class="flex items-center justify-between pt-1 text-[10px] font-mono border-t border-white/5">
        <span class="px-2 py-0.5 rounded text-[9px] uppercase bg-white/5 border border-white/10 text-zinc-300">
          {{ article.category }}
        </span>
        <span class="text-zinc-400">
          {{ currentIndex + 1 }} OF {{ totalCount }}
        </span>
      </div>

      <!-- Action Footer -->
      <div class="pt-2 border-t border-white/5 flex items-center justify-between">
        <div class="flex items-center gap-1.5">
          <button
            type="button"
            class="w-7 h-7 rounded border border-white/10 hover:border-white/25 hover:bg-white/5 flex items-center justify-center text-xs font-mono text-zinc-300 hover:text-white transition cursor-pointer"
            title="Previous article (Left Arrow)"
            @click="$emit('prev')"
          >
            ←
          </button>
          <button
            type="button"
            class="w-7 h-7 rounded border border-white/10 hover:border-white/25 hover:bg-white/5 flex items-center justify-center text-xs font-mono text-zinc-300 hover:text-white transition cursor-pointer"
            title="Next article (Right Arrow)"
            @click="$emit('next')"
          >
            →
          </button>
        </div>

        <a
          :href="article.url"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1 text-[10.5px] font-mono text-zinc-200 hover:text-white transition-colors font-medium tracking-wider uppercase cursor-pointer"
        >
          <span>READ FULL ARTICLE</span>
          <span>→</span>
        </a>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { KnowledgeArticle } from './knowledgeTypes'

defineProps<{
  article: KnowledgeArticle | null
  currentIndex: number
  totalCount: number
}>()

defineEmits<{
  (e: 'prev'): void
  (e: 'next'): void
}>()
</script>

<style scoped>
.editorial-fade-enter-active,
.editorial-fade-leave-active {
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
}

.editorial-fade-enter-from,
.editorial-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>

