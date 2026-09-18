<template>
  <nav ref="markers" class="hero-markers" :aria-label="portfolioContent.navigation.shortcutsLabel">
    <a v-for="(section, index) in sections" :key="section.id" :href="sectionHref(section.id)"
      :aria-label="section.label" :aria-current="active === section.id ? 'location' : undefined">
      {{ String(index + 1).padStart(2, '0') }}
    </a>
    <i class="hero-index-indicator" :style="indicator" aria-hidden="true"></i>
  </nav>
</template>

<script setup lang="ts">
import { portfolioContent } from '@/content/portfolioContent'
import { sectionHref } from '@/composables/useTranslation'
import { navigationTarget } from '@/composables/useSectionNavigation'
import { onMounted, onBeforeUnmount, ref, watch, nextTick, computed } from 'vue'

const sections = computed(() => [portfolioContent.navigation.home,
  ...portfolioContent.navigation.items.map(item => ({ id: item.href.slice(1), label: item.label })),
])
const active = ref('hero')
const markers = ref<HTMLElement | null>(null)
const indicator = ref({ transform: 'translateY(34px)', opacity: 0 })
function measureIndicator() {
  const container = markers.value
  const link = container?.querySelector<HTMLElement>('a')
  if (!container || !link || !container.getClientRects().length) return
  const gap = parseFloat(getComputedStyle(container).rowGap) || 0
  const index = sections.value.findIndex(section => section.id === active.value)
  indicator.value = { transform: `translateY(${index * (link.offsetHeight + gap) + 34}px)`, opacity: 1 }
}
watch(active, () => { void nextTick(measureIndicator) })
watch(navigationTarget, target => { if (target) active.value = target; else updateActive() })
let elements: HTMLElement[] = []
let frame = 0

function updateActive() {
  frame = 0
  if (navigationTarget.value) return
  const atBottom = window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2
  active.value = atBottom ? 'contact' : [...elements].reverse().find(section => section.getBoundingClientRect().top <= window.innerHeight * 0.4)?.id ?? 'hero'
}
function scheduleUpdate() {
  if (!frame) frame = window.requestAnimationFrame(updateActive)
}
function onResize() { scheduleUpdate(); measureIndicator() }
onMounted(() => {
  elements = sections.value.map(section => document.getElementById(section.id)).filter((element): element is HTMLElement => element !== null)
  updateActive()
  measureIndicator()
  window.addEventListener('scroll', scheduleUpdate, { passive: true })
  window.addEventListener('resize', onResize)
})
onBeforeUnmount(() => {
  window.cancelAnimationFrame(frame)
  window.removeEventListener('scroll', scheduleUpdate)
  window.removeEventListener('resize', onResize)
})
</script>
