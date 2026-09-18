<template>
  <section id="projects" class="scroll-mt-12 sm:scroll-mt-16 md:scroll-mt-16 pt-24 md:pt-28 pb-20 border-t border-black/10 dark:border-white/10">
    <div class="projects-header"><div><p v-reveal class="projects-eyebrow">{{ content.eyebrow }}</p><h2 v-reveal class="projects-heading">{{ content.title }}</h2><p class="projects-intro">{{ content.description }}</p></div><p class="projects-note">{{ content.note[0] }}<br />{{ content.note[1] }}</p></div>
    <div class="projects-grid">
      <ProjectCard
        v-for="(p, idx) in pagedProjects"
        :key="p.id"
        :project="p"
        :idx="idx"
        @open="openLightbox(p)"
      />
    </div>
    <div class="projects-pagination">
      <button class="btn btn-ghost disabled:opacity-40" @click="prevPage" :disabled="page === 1"
        :aria-label="content.previousPageLabel">
        {{ content.previousLabel }}
      </button>
      <div class="page-count">
        <span class="page-long">{{ content.pageLabel(page, totalPages) }}</span><span class="page-short">{{ page }} / {{ totalPages }}</span>
      </div>
      <button class="btn btn-ghost disabled:opacity-40" @click="nextPage" :disabled="page === totalPages"
        :aria-label="content.nextPageLabel">
        {{ content.nextLabel }}
      </button>
    </div>
    <ImageLightbox v-model="lightboxOpen" :project="selectedProject" :images="lightboxImages" :start-index="lightboxStart" />
  </section>
</template>

<script setup lang="ts">
import { portfolioContent } from '@/content/portfolioContent'
import { publishedProjects } from '@/content/projectsContent'
import { computed, ref, watch, onMounted, nextTick } from 'vue'
import type { Project } from '@/types'
import ImageLightbox from '@/components/ImageLightbox.vue'
import ProjectCard from '@/components/ProjectCard.vue'
import { useMediaQuery } from '@/composables/useMediaQuery'

const content = portfolioContent.projects

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const projects: Project[] = [...publishedProjects]

// Shuffle projects on component mount
onMounted(() => {
  const shuffledProjects = shuffleArray(projects)
  projects.splice(0, projects.length, ...shuffledProjects)
})

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

watch(pagedProjects, async () => { await nextTick(); window.dispatchEvent(new Event('blueprint-layout')) })

// Lightbox state
const selectedProject = ref<Project | null>(null)
const lightboxOpen = ref(false)
const lightboxImages = ref<string[]>([])
const lightboxStart = ref(0)

function openLightbox(p: Project) {
  const imgs = p.images && p.images.length ? p.images : (p.image ? [p.image] : [])
  if (!imgs.length) return
  selectedProject.value = p
  lightboxImages.value = imgs
  lightboxStart.value = 0
  lightboxOpen.value = true
}

// helpers moved into ProjectCard
</script>

<style scoped>
:global(html:not(.dark) #projects) {
  --background: #f7f8fa; --secondary-background: #f4f6f8; --surface: #edf0f4;
  --primary: #10161f; --secondary: #626c7a; --label: #788291;
  --border: #d9dde4; --strong-border: #cfd5df; --grid: rgba(98,108,122,.045);
  color: var(--primary);
}
:global(html:not(.dark) .projects-heading) { font-size: clamp(32px,3.2vw,48px); }
:global(html:not(.dark) .projects-pagination button) { color: var(--secondary); }
:global(html:not(.dark) .projects-pagination button:last-child) { background: #505966; border-color: #505966; color: #f7f8fa; }
:global(html:not(.dark) .projects-pagination button:last-child:hover:enabled) { background: #39434f; border-color: #39434f; }

#projects { position: relative; isolation: isolate; }
#projects::before { content: ''; position: absolute; inset: 0; z-index: -1; pointer-events: none; background-image: linear-gradient(to right,var(--grid) 1px,transparent 1px),linear-gradient(to bottom,var(--grid) 1px,transparent 1px); background-size: 40px 40px; opacity: .45; mask-image: radial-gradient(ellipse at 55% 30%,black,transparent 70%); }
.projects-header { display: flex; align-items: center; justify-content: space-between; gap: 36px; margin-bottom: 28px; }
.projects-eyebrow { font-family: ui-monospace,monospace; font-size: 10px; letter-spacing: .18em; text-transform: uppercase; color: var(--label); }
.projects-heading { margin-top: 10px; font-size: clamp(32px,3vw,44px); font-weight: 600; line-height: 1.2; letter-spacing: -.035em; }
.projects-intro { color: var(--secondary); margin-top: 12px; max-width: 680px; font-size: 14px; line-height: 1.6; }
.projects-note { color: var(--secondary); font-size: 12px; line-height: 1.6; flex-shrink: 0; }
.projects-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 22px; }
.projects-pagination { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-top: 32px; }
.projects-pagination button { min-height: 44px; }
.projects-pagination button:disabled { pointer-events: none; cursor: default; }
.page-count { color: var(--secondary); font-size: 12px; }
.page-short { display: none; }
@media (max-width: 1200px) { .projects-note { display: none; } }
@media (max-width: 900px) { .projects-grid { grid-template-columns: minmax(0,1fr); } }
@media (max-width: 639px) { .projects-grid { gap: 18px; } .projects-pagination button { padding-inline: 14px; } .page-long { display: none; } .page-short { display: inline; } }
</style>
