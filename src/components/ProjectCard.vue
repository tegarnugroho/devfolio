<template>
  <article v-reveal="idx !== undefined ? { delay: idx * 80 } : undefined" class="card project-card">
    <button type="button" class="project-media" @pointerenter="prefetch" @focus="prefetch" @click="$emit('open')" :aria-label="content.projectDetailsLabel(project.title)" @contextmenu.prevent>
      <img v-if="project.image" :src="project.image" :alt="content.screenshotAlt(project.title)" loading="lazy" decoding="async" draggable="false" @dragstart.prevent />
      <span v-else class="media-placeholder">{{ content.detailsLabel }}</span>
      <span class="media-hint" aria-hidden="true">{{ content.detailsHint }}</span>
      <span v-if="project.images && project.images.length > 1" class="media-count"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="m3 17 6-6 4 4 4-5 4 7" /><circle cx="16" cy="7" r="1" /></svg>{{ content.imageCount(project.images.length) }}</span>
    </button>
    <h3><button class="project-title" @click="$emit('open')" :aria-label="content.projectDetailsLabel(project.title)"><span>{{ project.title }}</span><span class="details-indicator" aria-hidden="true">+</span></button></h3>
    <p class="project-description">{{ project.description }}</p>
    <ul class="project-tags"><li v-for="tech in project.tech" :key="tech">{{ tech }}</li></ul>
    <div v-if="isValid(project.link) || isValid(project.repo)" class="project-actions">
      <a v-if="isValid(project.link)" :href="project.link" target="_blank" rel="noopener noreferrer"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7 .1l3-3a5 5 0 0 0-7.1-7.1l-1.7 1.7M14 11a5 5 0 0 0-7-.1l-3 3a5 5 0 0 0 7.1 7.1l1.7-1.7" /></svg>{{ content.liveLabel }} <span aria-hidden="true">↗</span></a>
      <a v-if="isValid(project.repo)" :href="project.repo" target="_blank" rel="noopener noreferrer"><svg width="19" height="19" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8a8.01 8.01 0 0 0 5.47 7.59c.4.08.55-.17.55-.38v-1.49c-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.13 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.03 2.2-.82 2.2-.82.44 1.11.16 1.93.08 2.13.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.19c0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" /></svg>{{ content.codeLabel }} <span aria-hidden="true">↗</span></a>
    </div>
  </article>
</template>
<script setup lang="ts">
import { portfolioContent } from '@/content/portfolioContent'
import { loadGalleryImage } from '@/composables/galleryImages'
import type { Project } from '@/types'

const content = portfolioContent.projects

const props = defineProps<{ project: Project; idx?: number }>()
function prefetch() {
  const source = props.project.images?.[0] ?? props.project.image
  if (source) void loadGalleryImage(source, 'low').catch(() => {})
}
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
@media (hover: hover) and (pointer: fine) { .project-card:hover { border-color: var(--strong-border); background: var(--surface); } .project-media:hover img { transform: scale(1.02); filter: brightness(1.08); } .project-media:hover .media-hint, .project-media:focus-visible .media-hint { opacity: 1; } .project-actions a:hover { color: var(--primary); } .project-actions a:hover span { transform: translate(2px,-2px); } }
@media (max-width: 767px) { .project-card { padding: 16px; } .project-title { font-size: 19px; } .project-tags { gap: 6px; } .project-tags li { font-size: 12px; } .project-description { font-size: 15px; } }
@media (hover: none) { .media-hint { opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .project-card, .project-media img, .media-hint, .project-actions a span { transition: none; } .project-media:hover img, .project-actions a:hover span { transform: none; } }
</style>
