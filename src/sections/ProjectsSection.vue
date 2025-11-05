<template>
  <section id="projects" class="py-20 border-t border-black/10 dark:border-white/10">
    <h2 v-reveal class="text-2xl font-semibold tracking-tight">Projects</h2>
    <div class="mt-8 grid sm:grid-cols-2 gap-6">
      <article v-for="(p, idx) in pagedProjects" :key="p.id" v-reveal="{ delay: idx * 80 }" class="card p-5 group relative">
        <div class="relative z-0 aspect-[16/9] w-full overflow-hidden rounded border border-black/10 dark:border-white/10 mb-4">
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
        </div>
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
  </section>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import type { Project } from '@/types'

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
</script>

<style scoped></style>
