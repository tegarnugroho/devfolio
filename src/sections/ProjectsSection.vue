<template>
  <section id="projects" class="py-20 border-t border-black/10 dark:border-white/10">
    <h2 v-reveal class="text-2xl font-semibold tracking-tight">Projects</h2>
    <div class="mt-8 grid sm:grid-cols-2 gap-6">
      <article v-for="(p, idx) in pagedProjects" :key="p.id" v-reveal="{ delay: idx * 80 }" class="card p-5 group relative">
        <button type="button" class="relative z-0 aspect-[16/9] w-full overflow-hidden rounded border border-black/10 dark:border-white/10 mb-4 text-left"
                @click="openLightbox(p)"
                :aria-label="`Open images for ${p.title}`">
          <img
            v-if="p.image"
            :src="p.image"
            :alt="`${p.title} screenshot`"
            loading="lazy"
            class="absolute inset-0 z-0 h-full w-full object-cover filter grayscale transition-transform duration-300 group-hover:scale-[1.02]"
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
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" stroke-width="1.6" fill="none"/>
                  <circle cx="12" cy="12" r="3" fill="currentColor"/>
                </svg>
              </div>
            </div>
          </div>
          <div class="absolute bottom-2 right-2 bg-black/60 text-white text-[11px] px-2 py-0.5 rounded"
               v-if="(p.images && p.images.length > 1)">
            {{ p.images.length }} images
          </div>
        </button>
        <h3 class="text-xl font-semibold">{{ p.title }}</h3>
        <p class="mt-2 opacity-80">{{ p.description }}</p>
        <ul class="mt-4 flex flex-wrap gap-2">
          <li v-for="t in p.tech" :key="t" class="chip">{{ t }}</li>
        </ul>
        <div class="mt-4 flex gap-4 text-sm items-center">
          <a v-if="p.link" :href="p.link" target="_blank" rel="noopener"
            class="inline-flex items-center gap-1 hover:opacity-80">
            Live
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
              class="transition-transform group-hover:translate-x-0.5">
              <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </a>
          <a v-if="p.repo" :href="p.repo" target="_blank" rel="noopener"
            class="inline-flex items-center gap-1 hover:opacity-80">
            Code
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
              class="transition-transform group-hover:translate-x-0.5">
              <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </a>
        </div>
      </article>
    </div>
    <div class="mt-8 flex items-center justify-between">
      <button
        class="btn btn-ghost disabled:opacity-40"
        @click="prevPage"
        :disabled="page === 1"
        aria-label="Previous page"
      >
        ‹ Prev
      </button>
      <div class="text-sm opacity-70">
        Page {{ page }} of {{ totalPages }}
      </div>
      <button
        class="btn btn-ghost disabled:opacity-40"
        @click="nextPage"
        :disabled="page === totalPages"
        aria-label="Next page"
      >
        Next ›
      </button>
    </div>
    <ImageLightbox v-model="lightboxOpen" :images="lightboxImages" :start-index="lightboxStart" />
  </section>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import type { Project } from '@/types'
import ImageLightbox from '@/components/ImageLightbox.vue'

const projects: Project[] = [
  {
    id: 'p1',
    title: 'VSCode Clone Personal Website',
    description:
      'Personal website built with Flutter Web, featuring Visual Studio Code-inspired interface with sidebar navigation, terminal panel, and dark mode theme for unique user experience.',
    tech: [
      "Flutter Web",
      "Dart",
      "Responsive Design",
      "Dark Mode",
      "Web Development",],
    link: 'https://tegar-nugroho.web.app/',
    repo: 'https://github.com/tegarnugroho',
    image: 'https://images.unsplash.com/photo-1641736494173-e7d5775121b2?q=80&w=1170&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1641736494173-e7d5775121b2?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1600&auto=format&fit=crop',
    ],
  },
  {
    id: 'p2',
    title: 'Danafix - Online Loan Application',
    description: 'Mobile app for seamless online loan applications, offering features like document upload, real-time status tracking, and secure data handling for a smooth user experience.',
    tech: [
      "Flutter",
      "Financial APIs",
      "KYC Integration",
      "Payment Gateway",
      "Security",],
    link: 'https://danafix.com/',
    repo: 'https://github.com/tegarnugroho',
    image: 'https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?q=80&w=1170&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1553729459-efe14ef6055d?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=1600&auto=format&fit=crop',
    ],
  },
  {
    id: 'p3',
    title: 'Tribelio - Brand & Influencer Platform',
    description: 'Platform for brands and influencers to build communities with exclusive content, membership management, engagement tracking, and audience monetization tools.',
    tech: [
      "Flutter",
      "Community Features",
      "Content Management",
      "Email Marketing",
      "Event Management",],
    link: 'https://tribelio.com/',
    repo: 'https://github.com/tegarnugroho',
    image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=1170&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1555421689-43cad7100751?q=80&w=1600&auto=format&fit=crop',
    ],
  },
  {
    id: 'p4',
    title: 'Cicle - Remote Team Tool',
    description: 'Platform for remote teams to collaborate with integrated tools for project management, communication, and file sharing.',
    tech: [
      "Flutter",
      "Real-time Communication",
      "Project Management",
      "Team Collaboration",
      "Analytics",],
    link: 'https://cicle.app/tentang/',
    repo: 'https://github.com/tegarnugroho',
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=400&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1529336953121-ad357a5e6f8b?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1600&auto=format&fit=crop',
    ],
  },
]

const page = ref(1)
const isSm = ref(false)
let mql: MediaQueryList | null = null
let onChange: ((this: MediaQueryList, ev: MediaQueryListEvent) => any) | null = null

onMounted(() => {
  mql = window.matchMedia('(min-width: 640px)')
  const update = () => { isSm.value = !!mql && mql.matches }
  update()
  onChange = () => update()
  if (mql.addEventListener) mql.addEventListener('change', onChange)
  else if ((mql as any).addListener) (mql as any).addListener(onChange)
})

onUnmounted(() => {
  if (mql && onChange) {
    if (mql.removeEventListener) mql.removeEventListener('change', onChange)
    else if ((mql as any).removeListener) (mql as any).removeListener(onChange)
  }
})

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
</script>

<style scoped></style>
