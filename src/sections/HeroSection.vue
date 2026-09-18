<template>
  <section ref="hero" id="hero" class="graphite-hero">
    <div class="hero-atmosphere" aria-hidden="true"></div>

    <div data-blueprint="HERO_CONTENT" class="hero-copy">
      <p v-reveal class="hero-eyebrow">{{ content.eyebrow }}</p>
      <h1 data-blueprint="HERO_TITLE" ref="heading" @pointerenter="launchPlane" @click="launchPlane" v-reveal="{ delay: 60 }">{{ portfolioContent.site.name }}<span ref="period">{{ portfolioContent.site.brandPeriod }}</span></h1>
      <p v-reveal="{ delay: 120 }" data-blueprint="HERO_DESCRIPTION" class="hero-intro">{{ content.description }}</p>
      <div v-reveal="{ delay: 180 }" data-blueprint="PRIMARY_CTA" class="hero-actions"><a :href="content.projectsTarget" class="btn hero-primary">{{ content.projectsLabel }} <span aria-hidden="true">→</span></a><a :href="content.contactTarget" class="hero-contact">{{ content.contactLabel }}</a></div>
    </div>
    <div v-if="flying" class="hero-flight" :style="{ '--flight-path': flightPathStyle }" aria-hidden="true">
      <svg class="hero-trail" width="100%" height="100%" fill="none">
        <defs><mask id="hero-flight-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%"><path class="hero-trail-reveal" :d="path" pathLength="1" stroke="white" stroke-width="4" stroke-dasharray="1" stroke-dashoffset="1" /></mask></defs>
        <path :d="path" stroke="currentColor" stroke-width="2" stroke-dasharray="5 5" stroke-linecap="round" mask="url(#hero-flight-mask)" />
      </svg>
      <svg class="hero-plane" width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="m3 10 18-7-7 18-3-8-8-3Zm8 3 10-10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
    </div>
    <p class="hero-motto" aria-hidden="true">{{ content.motto[0] }}<br />{{ content.motto[1] }}<br />{{ content.motto[2] }}</p>
    <p class="hero-location">{{ content.location[0] }}<br />{{ content.location[1] }}</p>
  </section>
</template>

<script setup lang="ts">
import { useFirstVisibleFlight } from '@/composables/useFirstVisibleFlight'
import { portfolioContent } from '@/content/portfolioContent'
import { ref, computed, onBeforeUnmount } from 'vue'

const content = portfolioContent.hero

const hero = ref<HTMLElement | null>(null)
const heading = ref<HTMLElement | null>(null)
const period = ref<HTMLElement | null>(null)
const flying = ref(false)
const path = ref('')
const flightPathStyle = computed(() => `path("${path.value}")`)
useFirstVisibleFlight(heading, () => launchPlane())
let timer: ReturnType<typeof setTimeout> | undefined
function launchPlane(event?: PointerEvent | MouseEvent) {
  const touchLayout = matchMedia('(hover: none), (pointer: coarse)').matches
  if (flying.value || matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (event && (event.type === 'click' ? !touchLayout : touchLayout || !('pointerType' in event) || event.pointerType !== 'mouse')) return
  if (!hero.value || !heading.value || !period.value) return
  const bounds = hero.value.getBoundingClientRect(), word = heading.value.getBoundingClientRect(), dot = period.value.getBoundingClientRect()
  const x = dot.left + dot.width / 2 - bounds.left, y = dot.top + dot.height / 2 - bounds.top
  const left = Math.max(20, word.left - bounds.left - 30)
  const middle = (x + left) / 2, radiusX = (x - left) / 2
  const radiusY = Math.min(word.height / 2 + 26, y - 24, bounds.height - y - 24)
  const top = y - radiusY, bottom = y + radiusY, bend = .5522847498
  const end = bounds.width - 28, remaining = end - middle
  if (remaining < 100) return
  // Connected handwriting lets the plane draw Dev without lifting off its trail.
  const base = touchLayout ? 24 : Math.min(x + 48, end - 340)
  const scale = Math.min(1.6, (end - base - 28) / 240)
  const writingTop = touchLayout ? y + radiusY + 16 : Math.max(24, y - 46 * scale)
  const point = (horizontal: number, vertical: number) => `${base + horizontal * scale} ${writingTop + vertical * scale}`
  path.value = `M ${x} ${y}
    C ${x} ${y + bend * radiusY}, ${middle + bend * radiusX} ${bottom}, ${middle} ${bottom}
    C ${middle - bend * radiusX} ${bottom}, ${left} ${y + bend * radiusY}, ${left} ${y}
    C ${left} ${y - bend * radiusY}, ${middle - bend * radiusX} ${top}, ${middle} ${top}
    C ${middle + radiusX} ${top}, ${point(-30, 95)}, ${point(0, 80)}
    C ${point(4, 60)}, ${point(-4, 18)}, ${point(12, 0)}
    C ${point(82, -12)}, ${point(94, 80)}, ${point(4, 80)}
    C ${point(24, 94)}, ${point(70, 74)}, ${point(96, 48)}
    C ${point(120, 22)}, ${point(152, 38)}, ${point(128, 54)}
    C ${point(106, 66)}, ${point(88, 45)}, ${point(100, 62)}
    C ${point(116, 87)}, ${point(143, 82)}, ${point(159, 47)}
    C ${point(167, 31)}, ${point(163, 72)}, ${point(179, 82)}
    C ${point(194, 95)}, ${point(212, 35)}, ${point(231, 42)}
    C ${point(244, 46)}, ${end - 16} ${writingTop + 60 * scale}, ${end} ${writingTop + 32 * scale}`.replace(/\s+/g, ' ').trim()
  flying.value = true
  timer = setTimeout(() => { flying.value = false }, 6200)
}
onBeforeUnmount(() => clearTimeout(timer))
</script>
<style scoped>
.hero-flight { position: absolute; inset: 0; overflow: hidden; pointer-events: none; color: var(--primary); z-index: 2; }
.hero-trail { position: absolute; inset: 0; animation: hero-trail-fade 6200ms linear both; }
.hero-trail-reveal { animation: hero-trail-draw 5200ms cubic-bezier(.45,0,.75,.65) both; }
.hero-plane { position: absolute; left: 0; top: 0; offset-path: var(--flight-path); offset-rotate: auto 45deg; animation: hero-flight-travel 5200ms cubic-bezier(.45,0,.75,.65) both, hero-plane-fade 6200ms linear both; }
@keyframes hero-flight-travel { from { offset-distance: 0%; } to { offset-distance: 100%; } }
@keyframes hero-trail-draw { to { stroke-dashoffset: 0; } }
@keyframes hero-plane-fade { 0% { opacity: 0; transform: scale(.65); } 8%,86% { opacity: .85; transform: scale(1); } 100% { opacity: 0; transform: scale(1); } }
@keyframes hero-trail-fade { 0% { opacity: 0; } 8%,86% { opacity: .32; } 100% { opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .hero-flight { display: none; } }
</style>
