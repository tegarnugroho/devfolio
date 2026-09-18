<template>
  <section id="skills" class="scroll-mt-12 sm:scroll-mt-16 md:scroll-mt-16 pt-24 md:pt-28 pb-20 border-t border-black/10 dark:border-white/10">
    <div class="mb-8">
      <span v-reveal class="text-[11px] tracking-[0.18em] uppercase opacity-60">{{ content.eyebrow }}</span>
      <h2 v-reveal="{ delay: 60 }" class="mt-1 text-2xl font-semibold tracking-tight">{{ content.title }}</h2>
      <p v-reveal="{ delay: 120 }" class="mt-3 opacity-75">{{ content.description }}</p>
    </div>
    <ul class="capability-list">
      <li v-for="(row, i) in matrix" :key="row.label" data-blueprint="SKILL_GROUP" class="capability-row">
        <div class="capability-icon" aria-hidden="true"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path :d="icons[row.icon]" /></svg></div>
        <div class="capability-copy"><h3>{{ row.label }}</h3><p>{{ row.description }}</p></div>
        <ul class="capability-tags"><li v-for="name in row.items" :key="name">{{ name }}</li></ul>
        <span class="capability-index" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { portfolioContent } from '@/content/portfolioContent'

const content = portfolioContent.skills

const matrix = content.groups
const icons = {
  "platforms": "M3 4h18v13H3zM8 21h8m-4-4v4",
  "frameworks": "m12 3 10 6-10 6L2 9zM2 15l10 6 10-6",
  "networking": "M7 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm15-7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm0 14a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM7 11l9-5M7 13l9 5",
  "storage": "M21 5c0 2-4 3-9 3S3 7 3 5s4-3 9-3 9 1 9 3ZM3 5v14c0 2 4 3 9 3s9-1 9-3V5M3 12c0 2 4 3 9 3s9-1 9-3",
  "tooling": "M14 6a6 6 0 0 0-7 7l-5 5a3 3 0 0 0 4 4l5-5a6 6 0 0 0 7-7l-4 4-4-4 4-4Z"
}
</script>

<style scoped>
:global(html:not(.dark) #skills) {
  --secondary-background: #f7f8fa; --surface: #f0f3f6;
  --primary: #10161f; --secondary: #626c7a; --label: #788291;
  --border: #d9dde4; --strong-border: #cfd5df;
}
:global(html:not(.dark) #skills .capability-tags li) { background: #f4f6f8; }

#skills { position: relative; isolation: isolate; padding-bottom: 56px; }
#skills::before { content: ''; position: absolute; inset: 0; z-index: -1; pointer-events: none; background-image: linear-gradient(to right,var(--grid) 1px,transparent 1px),linear-gradient(to bottom,var(--grid) 1px,transparent 1px); background-size: 40px 40px; opacity: .45; mask-image: radial-gradient(ellipse at 55% 45%,black,transparent 70%); }
#skills > div > span { font-family: ui-monospace,monospace; color: var(--secondary); opacity: 1; }
#skills > div > p { color: var(--secondary); opacity: 1; line-height: 1.65; }
.capability-list { display: grid; gap: 12px; margin-top: 28px; }
.capability-row { display: grid; grid-template-columns: 52px minmax(180px,240px) minmax(0,1fr) 22px; gap: 26px; align-items: center; padding: 18px 20px; border: 1px solid var(--border); border-radius: 6px; background: var(--secondary-background); transition: background-color 220ms,border-color 220ms; }
.capability-icon { width: 52px; height: 52px; display: grid; place-items: center; border: 1px solid var(--border); border-radius: 5px; background: var(--surface); transition: border-color 220ms; }
.capability-copy { min-width: 0; }
.capability-copy h3 { font-family: ui-monospace,monospace; text-transform: uppercase; font-size: 10px; letter-spacing: .16em; color: var(--primary); overflow-wrap: anywhere; }
.capability-copy p { margin-top: 9px; color: var(--secondary); font-size: 12px; line-height: 1.5; }
#skills .capability-tags { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; padding-left: 26px; border-left: 1px solid var(--border); min-width: 0; min-height: 56px; }
.capability-tags li { padding: 6px 11px; font-size: 11px; line-height: 1.5; border: 1px solid var(--strong-border); border-radius: 4px; color: var(--secondary); max-width: 100%; overflow-wrap: anywhere; transition: color 220ms; }
.capability-index { font-family: ui-monospace,monospace; font-size: 10px; color: var(--muted); text-align: right; }
@media (hover: hover) and (pointer: fine) { .capability-row:hover { border-color: var(--strong-border); background: var(--surface); } .capability-row:hover .capability-icon { border-color: var(--strong-border); } .capability-row:hover .capability-tags li { color: var(--primary); } }
@media (max-width: 1100px) { .capability-row { grid-template-columns: 48px minmax(0,1fr) 22px; gap: 16px 20px; } .capability-icon { width: 48px; height: 48px; } #skills .capability-tags { grid-column: 2; padding-left: 0; border-left: 0; min-height: 0; } .capability-index { grid-column: 3; grid-row: 1; } }
@media (max-width: 767px) { .capability-row { padding: 16px; grid-template-columns: minmax(0,1fr) 22px; gap: 16px; } .capability-icon { grid-column: 1; } .capability-index { grid-column: 2; } .capability-copy, #skills .capability-tags { grid-column: 1 / -1; } .capability-copy h3 { font-size: 11px; } .capability-copy p { font-size: 14px; } .capability-tags li { padding: 6px 10px; font-size: 12px; } .capability-list { gap: 10px; } }
@media (prefers-reduced-motion: reduce) { .capability-row, .capability-icon, .capability-tags li { transition: none; } }
</style>
