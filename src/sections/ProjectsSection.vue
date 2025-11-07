<template>
  <section id="projects" class="scroll-mt-16 sm:scroll-mt-20 md:scroll-mt-24 pt-24 md:pt-28 pb-20 border-t border-black/5 dark:border-white/5">
    <h2 v-reveal class="text-2xl font-semibold tracking-tight">Projects</h2>
    <div class="mt-8 grid sm:grid-cols-2 gap-6">
      <ProjectCard
        v-for="(p, idx) in pagedProjects"
        :key="p.id"
        :project="p"
        :idx="idx"
        @open="openLightbox(p)"
      />
    </div>
    <div class="mt-8 flex items-center justify-between">
      <button class="btn btn-ghost disabled:opacity-40" @click="prevPage" :disabled="page === 1"
        aria-label="Previous page">
        ‹ Prev
      </button>
      <div class="text-sm opacity-70">
        Page {{ page }} of {{ totalPages }}
      </div>
      <button class="btn btn-ghost disabled:opacity-40" @click="nextPage" :disabled="page === totalPages"
        aria-label="Next page">
        Next ›
      </button>
    </div>
    <ImageLightbox v-model="lightboxOpen" :images="lightboxImages" :start-index="lightboxStart" />
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Project } from '@/types'
import ImageLightbox from '@/components/ImageLightbox.vue'
import ProjectCard from '@/components/ProjectCard.vue'
import { sourceProjects } from '@/data/projects'
import { useMediaQuery } from '@/composables/useMediaQuery'

// data now lives in src/data/projects.ts

// Generate unique, stable IDs from title + index
function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

const projects: Project[] = sourceProjects.map((p: Omit<Project, 'id'>, idx: number) => ({
  ...p,
  id: `${slugify(p.title) || 'project'}-${idx}`,
}))

const page = ref(1)
const isSm = useMediaQuery('(min-width: 640px)')

const pageSize = computed(() => (isSm.value ? 2 : 1))
const totalPages = computed(() => Math.max(1, Math.ceil(projects.length / pageSize.value)))
const pagedProjects = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return projects.slice(start, start + pageSize.value)
})

watch(totalPages, (tp) => {
  if (page.value > tp) page.value = tp
})

function nextPage() {
  if (page.value < totalPages.value) page.value += 1
}
function prevPage() {
  if (page.value > 1) page.value -= 1
}

// Lightbox state
const lightboxOpen = ref(false)
const lightboxImages = ref<string[]>([])
const lightboxStart = ref(0)

function openLightbox(p: Project) {
  const imgs = p.images && p.images.length ? p.images : (p.image ? [p.image] : [])
  if (!imgs.length) return
  lightboxImages.value = imgs
  lightboxStart.value = 0
  lightboxOpen.value = true
}

// helpers moved into ProjectCard
</script>

<style scoped>
</style>
