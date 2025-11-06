<template>
  <article
    v-reveal="idx !== undefined ? { delay: idx * 80 } : undefined"
    class="card p-5 group relative"
  >
    <button
      type="button"
      class="relative z-0 aspect-[16/9] w-full overflow-hidden rounded border border-black/10 dark:border-white/10 mb-4 text-left select-none"
      @click="$emit('open')"
      @contextmenu.prevent
      :aria-label="`Open images for ${project.title}`"
    >
      <img
        v-if="project.image"
        :src="project.image"
        :alt="`${project.title} screenshot`"
        loading="lazy"
        draggable="false"
        @dragstart.prevent
        class="absolute inset-0 z-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] no-save select-none"
      />
      <div
        v-else
        class="absolute inset-0 z-0 bg-[linear-gradient(135deg,rgba(0,0,0,0.06)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.06)_50%,rgba(0,0,0,0.06)_75%,transparent_75%,transparent)] dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.12)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.12)_50%,rgba(255,255,255,0.12)_75%,transparent_75%,transparent)] bg-[size:14px_14px]"
      />

      <!-- Hover overlay with eye icon -->
      <div class="absolute inset-0 z-10 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
        <div class="opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all">
          <div class="rounded-full bg-white/80 dark:bg-white/70 text-black p-2 shadow-md">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" stroke-width="1.6" fill="none" />
              <circle cx="12" cy="12" r="3" fill="currentColor" />
            </svg>
          </div>
        </div>
      </div>

      <div
        class="absolute bottom-2 right-2 bg-black/60 text-white text-[11px] px-2 py-0.5 rounded"
        v-if="project.images && project.images.length > 1"
      >
        {{ project.images.length }} images
      </div>
    </button>

    <h3 class="text-xl font-semibold">{{ project.title }}</h3>
    <p class="mt-2 opacity-80">{{ project.description }}</p>

    <ul class="mt-4 flex flex-wrap gap-2">
      <li v-for="t in project.tech" :key="t" class="chip">{{ t }}</li>
    </ul>

    <div class="mt-4 flex gap-4 text-sm items-center">
      <a
        :href="isValid(project.link) ? project.link : undefined"
        target="_blank"
        rel="noopener"
        :aria-disabled="!isValid(project.link)"
        :tabindex="isValid(project.link) ? 0 : -1"
        :title="!isValid(project.link) ? 'Live unavailable' : undefined"
        :class="[
          'inline-flex items-center gap-1',
          isValid(project.link) ? 'hover:opacity-80' : 'opacity-40 cursor-not-allowed'
        ]"
      >
        Live
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="transition-transform group-hover:translate-x-0.5">
          <path d="M14 4h6v6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M20 4L10 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M5 8v9a2 2 0 0 0 2 2h9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </a>
      <a
        :href="isValid(project.repo) ? project.repo : undefined"
        target="_blank"
        rel="noopener"
        :aria-disabled="!isValid(project.repo)"
        :tabindex="isValid(project.repo) ? 0 : -1"
        :title="!isValid(project.repo) ? 'Code unavailable' : undefined"
        :class="[
          'inline-flex items-center gap-1',
          isValid(project.repo) ? 'hover:opacity-80' : 'opacity-40 cursor-not-allowed'
        ]"
      >
        Code
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="transition-transform group-hover:translate-x-0.5">
          <path d="M8 6l-6 6 6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M16 6l6 6-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </a>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Project } from '@/types'

defineProps<{
  project: Project
  idx?: number
}>()

defineEmits<{
  (e: 'open'): void
}>()

function isValid(v?: string) {
  return !!v && v !== '#'
}
</script>

<style scoped>
.no-save {
  user-select: none;
  -webkit-user-drag: none;
  -webkit-touch-callout: none;
}
</style>

