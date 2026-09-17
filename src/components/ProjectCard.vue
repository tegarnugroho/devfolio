<template>
  <article v-reveal="idx !== undefined ? { delay: idx * 80 } : undefined" class="card project-card">
    <button type="button" class="project-media" @click="$emit('open')" :aria-label="`View ${project.title} project details`" @contextmenu.prevent>
      <img v-if="project.image" :src="project.image" :alt="`${project.title} screenshot`" loading="lazy" decoding="async" draggable="false" @dragstart.prevent />
      <span v-else class="media-placeholder">View project details</span>
      <span class="media-hint" aria-hidden="true">View details +</span>
      <span v-if="project.images && project.images.length > 1" class="media-count"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="m3 17 6-6 4 4 4-5 4 7" /><circle cx="16" cy="7" r="1" /></svg>{{ project.images.length }} images</span>
    </button>
    <h3><button class="project-title" @click="$emit('open')" :aria-label="`View ${project.title} project details`"><span>{{ project.title }}</span><span class="details-indicator" aria-hidden="true">+</span></button></h3>
    <p class="project-description">{{ project.description }}</p>
    <ul class="project-tags"><li v-for="tech in project.tech" :key="tech">{{ tech }}</li></ul>
    <div v-if="isValid(project.link) || isValid(project.repo)" class="project-actions">
      <a v-if="isValid(project.link)" :href="project.link" target="_blank" rel="noopener noreferrer"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m10 13 4-4m-6 7-2 2a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0m2 1 2-2a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0" /></svg>Live <span aria-hidden="true">↗</span></a>
      <a v-if="isValid(project.repo)" :href="project.repo" target="_blank" rel="noopener noreferrer"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-14-2 16" /></svg>Code <span aria-hidden="true">↗</span></a>
    </div>
  </article>
</template>
<script setup lang="ts">
import type { Project } from '@/types'
defineProps<{ project: Project; idx?: number }>()
defineEmits<{ (e: 'open'): void }>()
function isValid(value?: string) { return !!value && /^https?:\/\//i.test(value) }
</script>
<style scoped>
:global(html:not(.dark) .project-card) { background: var(--background); border-color: var(--border); }
:global(html:not(.dark) .project-media img) { filter: none; }
:global(html:not(.dark) .media-count) , :global(html:not(.dark) .media-hint) { background: rgba(247,248,250,.94); font-size: 11px; }
:global(html:not(.dark) .project-tags li) { background: var(--secondary-background); font-size: 12px; }
:global(html:not(.dark) .project-actions a) { color: var(--primary); }
@media (hover: hover) and (pointer: fine) {
  :global(html:not(.dark) .project-card:hover) { background: var(--secondary-background); }
  :global(html:not(.dark) .project-media:hover img) { filter: brightness(1.025); }
}

.project-card { display: flex; flex-direction: column; padding: 20px; min-width: 0; border-radius: 5px; transition: border-color 250ms,background-color 250ms; }
.project-media { position: relative; display: block; width: 100%; aspect-ratio: 16 / 9; border: 1px solid var(--border); border-radius: 4px; overflow: hidden; background: var(--surface); }
.project-media img { width: 100%; height: 100%; object-fit: contain; transition: transform 350ms cubic-bezier(.22,1,.36,1),filter 350ms; }
.media-placeholder { color: var(--secondary); font-size: 13px; }
.media-count, .media-hint { position: absolute; right: 10px; display: inline-flex; align-items: center; gap: 6px; color: var(--primary); background: var(--secondary-background); border: 1px solid var(--strong-border); border-radius: 4px; padding: 4px 8px; font-size: 10px; }
.media-count { bottom: 10px; }
.media-hint { top: 10px; opacity: 0; transition: opacity 250ms; }
.project-title { display: flex; width: 100%; text-align: left; justify-content: space-between; align-items: start; gap: 16px; font-size: 20px; font-weight: 600; line-height: 1.35; margin-top: 20px; }
.project-title > span:first-child { min-width: 0; overflow-wrap: anywhere; }
.details-indicator { color: var(--secondary); font-weight: 400; flex-shrink: 0; }
.project-description { color: var(--secondary); font-size: 14px; line-height: 1.6; margin-top: 12px; }
.project-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 20px; padding-bottom: 20px; }
.project-tags li { color: var(--secondary); border: 1px solid var(--strong-border); padding: 5px 10px; font-size: 11px; border-radius: 4px; max-width: 100%; overflow-wrap: anywhere; }
.project-actions { display: flex; flex-wrap: wrap; gap: 26px; margin-top: auto; border-top: 1px solid var(--border); padding-top: 12px; }
.project-actions a { display: inline-flex; align-items: center; gap: 8px; min-height: 44px; color: var(--secondary); font-size: 12px; }
.project-actions a span { transition: transform 250ms; }
@media (hover: hover) and (pointer: fine) { .project-card:hover { border-color: var(--strong-border); background: var(--surface); } .project-media:hover img { transform: scale(1.02); filter: grayscale(1) brightness(1.08); } .project-media:hover .media-hint, .project-media:focus-visible .media-hint { opacity: 1; } .project-actions a:hover { color: var(--primary); } .project-actions a:hover span { transform: translate(2px,-2px); } }
@media (max-width: 767px) { .project-card { padding: 16px; } .project-title { font-size: 19px; } .project-tags { gap: 6px; } .project-tags li { font-size: 12px; } .project-description { font-size: 15px; } }
@media (hover: none) { .media-hint { opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .project-card, .project-media img, .media-hint, .project-actions a span { transition: none; } .project-media:hover img, .project-actions a:hover span { transform: none; } }
</style>
