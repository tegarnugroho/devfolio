<template>
  <div class="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
    <!-- Top: only Next -->
    <button
      v-if="atTop && hasNext"
      @click="goNext"
      aria-label="Go to next section"
      class="h-11 w-11 grid place-items-center rounded-full border border-black/20 dark:border-white/20 bg-white/70 dark:bg-black/70 backdrop-blur hover:bg-white/90 dark:hover:bg-black/90 active:scale-95 transition"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <!-- Middle: Prev + Next -->
    <template v-else-if="!atBottom">
      <button
        v-if="hasPrev"
        @click="goPrev"
        aria-label="Go to previous section"
        class="h-11 w-11 grid place-items-center rounded-full border border-black/20 dark:border-white/20 bg-white/70 dark:bg-black/70 backdrop-blur hover:bg-white/90 dark:hover:bg-black/90 active:scale-95 transition"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 15l6-6 6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <button
        v-if="hasNext"
        @click="goNext"
        aria-label="Go to next section"
        class="h-11 w-11 grid place-items-center rounded-full border border-black/20 dark:border-white/20 bg-white/70 dark:bg-black/70 backdrop-blur hover:bg-white/90 dark:hover:bg-black/90 active:scale-95 transition"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </template>

    <!-- Bottom: Prev + Top -->
    <template v-else>
      <button
        v-if="hasPrev"
        @click="goPrev"
        aria-label="Go to previous section"
        class="h-11 w-11 grid place-items-center rounded-full border border-black/20 dark:border-white/20 bg-white/70 dark:bg-black/70 backdrop-blur hover:bg-white/90 dark:hover:bg-black/90 active:scale-95 transition"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 15l6-6 6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <button
        @click="goTop"
        aria-label="Scroll to top"
        class="h-11 w-11 grid place-items-center rounded-full border border-black/20 dark:border-white/20 bg-white/70 dark:bg-black/70 backdrop-blur hover:bg-white/90 dark:hover:bg-black/90 active:scale-95 transition"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, computed } from 'vue'

type SectionEl = HTMLElement & { id: string }

const sections = ref<SectionEl[]>([])
const currentIndex = ref(0)
const scrollY = ref(0)
const innerH = ref(0)
const docH = ref(0)

const atTop = computed(() => scrollY.value <= 2)
const atBottom = computed(() => scrollY.value + innerH.value >= docH.value - 2)
const hasPrev = computed(() => currentIndex.value > 0)
const hasNext = computed(() => currentIndex.value < sections.value.length - 1)

function refreshSections() {
  sections.value = Array.from(document.querySelectorAll<SectionEl>('main section[id]'))
}

function updateSizes() {
  scrollY.value = window.scrollY || window.pageYOffset
  innerH.value = window.innerHeight
  docH.value = Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.offsetHeight,
    document.documentElement.clientHeight
  )
}

function getAnchorOffset(): number {
  const first = sections.value[0]
  if (!first) return 64
  const cs = getComputedStyle(first)
  const v = parseFloat(cs.scrollMarginTop || '0')
  return Number.isFinite(v) && v > 0 ? v : 64
}

function updateCurrentIndex() {
  // Anchor reference offset from top (align with sticky header spacing)
  const anchorOffset = getAnchorOffset()
  let bestIdx = 0
  let bestScore = Number.POSITIVE_INFINITY
  for (let i = 0; i < sections.value.length; i++) {
    const rect = sections.value[i].getBoundingClientRect()
    const score = Math.abs(rect.top - anchorOffset)
    if (score < bestScore) {
      bestScore = score
      bestIdx = i
    }
  }
  currentIndex.value = bestIdx
}

function onScroll() {
  updateSizes()
  updateCurrentIndex()
}

function onResize() {
  updateSizes()
  updateCurrentIndex()
}

function scrollToIndex(idx: number) {
  const el = sections.value[idx]
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function goPrev() {
  if (hasPrev.value) scrollToIndex(currentIndex.value - 1)
}
function goNext() {
  if (hasNext.value) scrollToIndex(currentIndex.value + 1)
}
function goTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  refreshSections()
  updateSizes()
  updateCurrentIndex()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)
})
</script>

<style scoped>
</style>
