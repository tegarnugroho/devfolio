<template>
  <section id="writing" data-blueprint="WRITING_SECTION" class="writing-section scroll-mt-12 sm:scroll-mt-16 md:scroll-mt-16 pt-24 md:pt-28 pb-20 border-t border-black/10 dark:border-white/10">
    <header class="writing-header">
      <div><p v-reveal class="writing-eyebrow">{{ content.eyebrow }}</p><h2 v-reveal="{ delay: 60 }">{{ content.title }}</h2><p v-reveal="{ delay: 120 }" class="writing-intro">{{ content.description }}</p></div>
      <a :href="content.blogUrl" target="_blank" rel="noopener noreferrer" class="writing-source">{{ content.sourceLabel }} <span aria-hidden="true">↗</span></a>
    </header>
    <div class="writing-list" :aria-busy="loading">
      <div v-if="loading" class="writing-skeleton" role="status" :aria-label="content.loadingLabel"><div v-for="index in 2" :key="index" class="writing-skeleton-row" aria-hidden="true"><span></span><div><i></i><i></i><i></i></div></div></div>
      <ul v-else-if="posts.length">
        <li v-for="(post, index) in posts" :key="post.slug">
          <article><a data-blueprint="ARTICLE_ROW" class="writing-row" :href="articleUrl(post.slug)" :aria-label="content.articleLabel(post.title)" target="_blank" rel="noopener noreferrer">
            <span class="writing-index" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>
            <div class="writing-copy"><p v-if="post.tags.length" class="writing-tags">{{ post.tags.slice(0, 3).join(' · ') }}</p><h3>{{ post.title }}</h3><p v-if="post.excerpt" class="writing-excerpt">{{ post.excerpt }}</p></div>
            <time v-if="post.date" class="writing-date" :datetime="post.date">{{ post.dateLabel }}</time><span class="writing-arrow" aria-hidden="true">↗</span>
          </a></article>
        </li>
      </ul>
      <p v-else class="writing-message" role="status">{{ failed ? content.errorLabel : content.emptyLabel }}</p>
    </div>
    <a data-blueprint="CODEARY_LINK" class="writing-all" :href="content.blogUrl" target="_blank" rel="noopener noreferrer"><span>{{ content.viewAllLabel }}</span><span aria-hidden="true">↗</span></a>
  </section>
</template>

<script setup lang="ts">
import { nextTick, watch } from 'vue'
import { portfolioContent } from '@/content/portfolioContent'
import { useWritingPosts } from '@/composables/useWritingPosts'
const content = portfolioContent.writing
const { posts, loading, failed } = useWritingPosts()
// Codeary's production article index links directly to /{slug}.
function articleUrl(slug: string) { return new URL(`/${encodeURIComponent(slug)}`, content.blogUrl).href }
watch(loading, async () => { await nextTick(); window.dispatchEvent(new Event('blueprint-layout')) })
</script>

<style scoped>
.writing-section { padding-bottom: 64px; }
.writing-header { display: flex; justify-content: space-between; align-items: center; gap: 32px; margin-bottom: 32px; }
.writing-eyebrow { font: 10px ui-monospace,monospace; text-transform: uppercase; letter-spacing: .18em; color: var(--label); }
.writing-header h2 { margin-top: 12px; font-size: clamp(32px,3vw,44px); max-width: 420px; line-height: 1.14; font-weight: 600; letter-spacing: -.035em; }
.writing-intro { margin-top: 18px; max-width: 530px; font-size: 14px; line-height: 1.65; color: var(--secondary); }
.writing-source { display: inline-flex; align-items: center; gap: 10px; min-height: 44px; font: 10px ui-monospace,monospace; text-transform: uppercase; letter-spacing: .12em; color: var(--secondary); white-space: nowrap; }
.writing-list { min-height: 360px; border-top: 1px solid var(--border); }
.writing-row { display: grid; grid-template-columns: 38px minmax(0,1fr) 100px 24px; align-items: start; gap: 24px; padding-block: 32px; min-height: 180px; border-bottom: 1px solid var(--border); transition: border-color 220ms,color 220ms; }
.writing-index,.writing-date { font: 10px ui-monospace,monospace; color: var(--label); letter-spacing: .06em; line-height: 1.6; padding-top: 2px; }
.writing-copy { min-width: 0; }
.writing-tags { font: 9px ui-monospace,monospace; line-height: 1.6; text-transform: uppercase; letter-spacing: .12em; color: var(--label); overflow-wrap: anywhere; margin-bottom: 10px; }
.writing-copy h3 { font-size: clamp(19px,1.8vw,25px); line-height: 1.35; letter-spacing: -.02em; font-weight: 500; color: var(--primary); transition: transform 220ms; overflow-wrap: anywhere; }
.writing-excerpt { margin-top: 12px; color: var(--secondary); font-size: 13px; line-height: 1.7; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; overflow: hidden; }
.writing-arrow { margin-left: auto; font-size: 21px; line-height: 1; color: var(--secondary); transition: transform 220ms,color 220ms; }
.writing-all { display: flex; justify-content: space-between; align-items: center; gap: 24px; min-height: 60px; color: var(--secondary); font-size: 12px; }
.writing-message { padding-block: 64px; color: var(--secondary); font-size: 14px; }
.writing-skeleton-row { display: flex; gap: 24px; padding-block: 34px; min-height: 180px; border-bottom: 1px solid var(--border); }
.writing-skeleton-row > span { width: 38px; height: 10px; background: var(--surface); }
.writing-skeleton-row > div { width: min(75%,550px); }
.writing-skeleton i { display: block; background: var(--surface); margin-bottom: 16px; height: 12px; animation: writing-pulse 1600ms ease-in-out infinite alternate; }
.writing-skeleton i:first-child { width: 25%; height: 8px; }
.writing-skeleton i:nth-child(2) { width: 95%; height: 24px; }
.writing-skeleton i:last-child { width: 75%; }
@keyframes writing-pulse { to { opacity: .4; } }
@media (hover: hover) and (pointer: fine) { .writing-row:hover { border-color: var(--strong-border); } .writing-row:hover h3 { transform: translateX(4px); } .writing-row:hover .writing-arrow { transform: translate(3px,-3px); color: var(--primary); } .writing-row:hover .writing-index { color: var(--secondary); } .writing-all:hover,.writing-source:hover { color: var(--primary); } }
@media (max-width: 767px) {
  .writing-header { display: block; margin-bottom: 26px; }
  .writing-source { margin-top: 16px; }
  .writing-row { grid-template-columns: 25px minmax(0,1fr) 24px; gap: 12px; padding-block: 28px; }
  .writing-copy { display: contents; }
  .writing-index { grid-column: 1; grid-row: 1; }
  .writing-tags { grid-column: 2 / -1; grid-row: 1; margin: 0; }
  .writing-copy h3,.writing-excerpt { grid-column: 1 / -1; }
  .writing-excerpt { margin-top: 0; font-size: 14px; -webkit-line-clamp: 4; }
  .writing-date { grid-column: 1 / 3; margin-top: 4px; }
  .writing-arrow { grid-column: 3; grid-row: auto; margin-top: 4px; }
  .writing-list { min-height: 420px; }
  .writing-skeleton-row { min-height: 210px; }
}
@media (prefers-reduced-motion: reduce) { .writing-skeleton i { animation: none; } .writing-copy h3,.writing-arrow { transform: none !important; transition: none; } }
</style>
