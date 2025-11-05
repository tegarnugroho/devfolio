<template>
  <section id="projects" class="py-20 border-t border-black/10 dark:border-white/10">
    <h2 v-reveal class="text-2xl font-semibold tracking-tight">Projects</h2>
    <div class="mt-8 grid sm:grid-cols-2 gap-6">
      <article
        v-for="(p, idx) in projects"
        :key="p.id"
        v-reveal="{delay: idx * 80}"
        class="card p-5 group relative"
      >
        <div class="pointer-events-none absolute right-4 top-4 opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="aspect-[16/9] w-full rounded border border-black/10 dark:border-white/10 bg-[linear-gradient(135deg,rgba(0,0,0,0.06)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.06)_50%,rgba(0,0,0,0.06)_75%,transparent_75%,transparent)] dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.12)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.12)_50%,rgba(255,255,255,0.12)_75%,transparent_75%,transparent)] bg-[size:14px_14px] mb-4" />
        <h3 class="text-xl font-semibold">{{ p.title }}</h3>
        <p class="mt-2 opacity-80">{{ p.description }}</p>
        <ul class="mt-4 flex flex-wrap gap-2">
          <li v-for="t in p.tech" :key="t" class="chip">{{ t }}</li>
        </ul>
        <div class="mt-4 flex gap-4 text-sm items-center">
          <a v-if="p.link" :href="p.link" target="_blank" rel="noopener" class="inline-flex items-center gap-1 hover:opacity-80">
            Live
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="transition-transform group-hover:translate-x-0.5">
              <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
          <a v-if="p.repo" :href="p.repo" target="_blank" rel="noopener" class="inline-flex items-center gap-1 hover:opacity-80">
            Code
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="transition-transform group-hover:translate-x-0.5">
              <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Project } from '@/types'

const projects: Project[] = [
  {
    id: 'p1',
    title: 'Minimal Blog Engine',
    description:
      'A fast, content-focused blog engine with Markdown and file-based routing.',
    tech: ['Vue 3', 'TypeScript', 'Vite'],
    link: '#',
    repo: '#',
  },
  {
    id: 'p2',
    title: 'Realtime Chat',
    description: 'Lightweight WebSocket chat with presence and typing indicators.',
    tech: ['Node.js', 'WebSocket', 'Tailwind'],
    link: '#',
    repo: '#',
  },
  {
    id: 'p3',
    title: 'Analytics Dashboard',
    description: 'Simple dashboard visualizing key metrics with minimal UI.',
    tech: ['Vue', 'TypeScript', 'D3'],
    link: '#',
    repo: '#',
  },
]
</script>

<style scoped>
</style>
