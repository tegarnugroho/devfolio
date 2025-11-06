<template>
  <section id="projects" class="py-20 border-t border-black/10 dark:border-white/10">
    <h2 v-reveal class="text-2xl font-semibold tracking-tight">Projects</h2>
    <div class="mt-8 grid sm:grid-cols-2 gap-6">
      <article v-for="(p, idx) in pagedProjects" :key="p.id" v-reveal="{ delay: idx * 80 }"
        class="card p-5 group relative">
        <button type="button"
          class="relative z-0 aspect-[16/9] w-full overflow-hidden rounded border border-black/10 dark:border-white/10 mb-4 text-left select-none"
          @click="openLightbox(p)" @contextmenu.prevent :aria-label="`Open images for ${p.title}`">
          <img v-if="p.image" :src="p.image" :alt="`${p.title} screenshot`" loading="lazy" draggable="false"
            @dragstart.prevent
            class="absolute inset-0 z-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] no-save select-none" />
          <div v-else
            class="absolute inset-0 z-0 bg-[linear-gradient(135deg,rgba(0,0,0,0.06)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.06)_50%,rgba(0,0,0,0.06)_75%,transparent_75%,transparent)] dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.12)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.12)_50%,rgba(255,255,255,0.12)_75%,transparent_75%,transparent)] bg-[size:14px_14px]" />
          <!-- Hover overlay with eye icon -->
          <div
            class="absolute inset-0 z-10 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
            <div class="opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all">
              <div class="rounded-full bg-white/80 dark:bg-white/70 text-black p-2 shadow-md">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" stroke-width="1.6"
                    fill="none" />
                  <circle cx="12" cy="12" r="3" fill="currentColor" />
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
          <a :href="isValid(p.link) ? p.link : undefined" target="_blank" rel="noopener"
            :aria-disabled="!isValid(p.link)" :tabindex="isValid(p.link) ? 0 : -1"
            :title="!isValid(p.link) ? 'Live unavailable' : undefined" :class="[
              'inline-flex items-center gap-1',
              isValid(p.link) ? 'hover:opacity-80' : 'opacity-40 cursor-not-allowed'
            ]">
            Live
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true" class="transition-transform group-hover:translate-x-0.5">
              <path d="M14 4h6v6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                stroke-linejoin="round" />
              <path d="M20 4L10 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                stroke-linejoin="round" />
              <path d="M5 8v9a2 2 0 0 0 2 2h9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </a>
          <a :href="isValid(p.repo) ? p.repo : undefined" target="_blank" rel="noopener"
            :aria-disabled="!isValid(p.repo)" :tabindex="isValid(p.repo) ? 0 : -1"
            :title="!isValid(p.repo) ? 'Code unavailable' : undefined" :class="[
              'inline-flex items-center gap-1',
              isValid(p.repo) ? 'hover:opacity-80' : 'opacity-40 cursor-not-allowed'
            ]">
            Code
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true" class="transition-transform group-hover:translate-x-0.5">
              <path d="M8 6l-6 6 6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                stroke-linejoin="round" />
              <path d="M16 6l6 6-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </a>
        </div>
      </article>
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
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import type { Project } from '@/types'
import ImageLightbox from '@/components/ImageLightbox.vue'

const sourceProjects: Omit<Project, 'id'>[] = [
  {
    title: 'ANKER Store App — Flexible Retail Commerce Solution',
    description:
      'A scalable retail store app with seamless backend integration and headless architecture. Runs on any device including mobile, tablets, checkout, and self-checkout terminals.',
    tech: [
      "Flutter",
      "Headless Architecture",
      "Cloud Deployment",
      "POS Integration",
    ],
    link: '#',
    repo: '#',
    image: '/assets/anker/anker-1.png',
    images: [
      '/assets/anker/anker-1.png',
      '/assets/anker/anker-2.png',
      '/assets/anker/anker-3.png',
    ],
  },
  {
    title: 'Excel Translator — Excel to Localization Files(Flutter Package)',
    description:
      'Convert Excel translation sheets into localization files for Flutter apps automatically. Simple, fast, and consistent.',
    tech: [
      "Dart",
      "Flutter",
      "Localization",
      "Excel Parser",
    ],
    link: 'https://pub.dev/packages/excel_translator',
    repo: 'https://github.com/tegarnugroho/excel_translator',
    image: '/assets/excel-translator/image.png',
    images: [
      '/assets/excel-translator/image.png',
    ],
  },
  {
    title: 'Table Parser - Flutter Package',
    description:
      'Parse structured data from table formats into usable models for Dart & Flutter. Efficient and reliable.',
    tech: [
      "Dart",
      "Flutter",
      "Data Parsing",
      "Table Parser",
    ],
    link: 'https://pub.dev/packages/table_parser',
    repo: 'https://github.com/tegarnugroho/table_parser',
    image: '/assets/table-parser/image.png',
    images: [
      '/assets/table-parser/image.png',
    ],
  },
  {
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
    repo: '#',
    image: '/assets/vscode/vscode-banner.png',
    images: [
      'assets/vscode/vscode-banner.png',
    ],
  },
  {
    title: 'Danafix - Online Loan Application',
    description: 'Mobile app for seamless online loan applications, offering features like document upload, real-time status tracking, and secure data handling for a smooth user experience.',
    tech: [
      "Flutter",
      "Financial APIs",
      "KYC Integration",
      "Payment Gateway",
      "Security",],
    link: '#',
    repo: '#',
    image: '/assets/danafix/danafix-banner.png',
    images: [
      '/assets/danafix/danafix.png',
      '/assets/danafix/danafix-2.png',
    ],
  },
  {
    title: 'Tribelio - Brand & Influencer Platform',
    description: 'Platform for brands and influencers to build communities with exclusive content, membership management, engagement tracking, and audience monetization tools.',
    tech: [
      "Flutter",
      "Community Features",
      "Content Management",
      "Email Marketing",
      "Event Management",],
    link: 'https://tribelio.com/',
    repo: '#',
    image: 'assets/tribelio/tribelio-banner.jpeg',
    images: [
      'assets/tribelio/tribelio-1.webp',
      'assets/tribelio/tribelio-2.webp',
      'assets/tribelio/tribelio-3.webp',
      'assets/tribelio/tribelio-4.webp',
    ],
  },
  {
    title: 'Cicle - Remote Team Tool',
    description: 'Platform for remote teams to collaborate with integrated tools for project management, communication, and file sharing.',
    tech: [
      "Flutter",
      "Real-time Communication",
      "Project Management",
      "Team Collaboration",
      "Analytics",],
    link: 'https://cicle.app/tentang/',
    repo: '#',
    image: '/assets/cicle/cicle-banner.png',
    images: [
      '/assets/cicle/cicle-1.webp',
      '/assets/cicle/cicle-2.webp',
      '/assets/cicle/cicle-3.webp',
      '/assets/cicle/cicle-4.webp',
    ],
  },
  {
    title: 'IZILOH - Innovative Laundry App',
    description: 'A laundry service app offering scheduling, real-time tracking, and secure payments for a seamless user experience.',
    tech: [
      "Flutter",
      "Real-time Tracking",
      "Push Notifications",
      "Payment Integration",
      "Booking System",],
    link: 'https://iziloh.com/',
    repo: '#',
    image: '/assets/iziloh/iziloh-banner.jpg',
    images: [
      '/assets/iziloh/iziloh-1.webp',
      '/assets/iziloh/iziloh-2.webp',
      '/assets/iziloh/iziloh-3.webp',
      '/assets/iziloh/iziloh-4.webp',
    ],
  },
  {
    title: 'Waroong Retjeh - Restaurant App',
    description: 'A restaurant app offering online ordering, table reservation, and menu management for a seamless dining experience.',
    tech: [
      "Flutter",
      "Real-time Tracking",
      "Push Notifications",
      "Payment Integration",
      "Booking System",],
    link: 'http://waroongretjeh.dev.ittron.co.id/',
    repo: '#',
    image: '/assets/waroong-retjeh/waroong-retjeh-banner.png',
    images: [
      '/assets/waroong-retjeh/waroong-retjeh-1.png',
      '/assets/waroong-retjeh/waroong-retjeh-2.png',
      '/assets/waroong-retjeh/waroong-retjeh-3.png',
    ],
  },
  {
    title: 'Flambe - Food Delivery App',
    description: 'A food delivery app offering online ordering, real-time tracking, and secure payments for a seamless user experience.',
    tech: [
      "Flutter",
      "Real-time Tracking",
      "Push Notifications",
      "Payment Integration",
      "Booking System",],
    link: '#',
    repo: '#',
    image: '/assets/flambe/flambe-1.png',
    images: [
      '/assets/flambe/flambe-1.png',
      '/assets/flambe/flambe-2.png',
    ],
  },
  {
    title: 'NU Card - Electronic Wallet App',
    description: 'A digital wallet app offering secure payments, transaction tracking, and financial management tools for users.',
    tech: [
      "Flutter",
      "KYC Integration",
      "Push Notifications",
      "Payment Integration",
      "Booking System",],
    link: '#',
    repo: '#',
    image: '/assets/nucard/nucard-1.png',
    images: [
      '/assets/nucard/nucard-1.png',
      '/assets/nucard/nucard-2.png',
    ],
  },
]

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

// helpers
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
