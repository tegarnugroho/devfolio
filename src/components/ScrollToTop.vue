<template>
  <button
    v-show="visible"
    @click="toTop"
    aria-label="Scroll to top"
    class="fixed bottom-6 right-6 z-50 h-11 w-11 grid place-items-center rounded-full border border-black/20 dark:border-white/20 bg-white/70 dark:bg-black/70 backdrop-blur hover:bg-white/90 dark:hover:bg-black/90 active:scale-95 transition-colors"
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 15l6-6 6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'

const visible = ref(false)

function onScroll() {
  visible.value = window.scrollY > 280
}

function toTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
</style>

